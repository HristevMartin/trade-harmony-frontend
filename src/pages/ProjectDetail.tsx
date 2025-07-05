import { useParams } from "react-router-dom";
import { Star, Calendar, User, ChevronLeft, X, CheckCircle, AlertCircle, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useEffect } from "react";

interface Comment {
  id: number;
  user: string;
  text: string;
  rating: number;
  date: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  images: string[];
  date: string;
  providerId: number;
  providerName: string;
  averageRating: number;
  comments: Comment[];
}

interface Toast {
  id: number;
  type: 'success' | 'error' | 'warning';
  message: string;
}

const ProjectDetail = () => {
  const { id } = useParams();
  const projectId = id ? parseInt(id) : 1;
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [projectDetails, setProjectDetails] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showNamePopup, setShowNamePopup] = useState(false);
  const [userName, setUserName] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Toast functions
  const showToast = (type: 'success' | 'error' | 'warning', message: string) => {
    const newToast: Toast = {
      id: Date.now(),
      type,
      message
    };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      removeToast(newToast.id);
    }, 4000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Toast Component
  const ToastNotification = ({ toast }: { toast: Toast }) => {
    const getIcon = () => {
      switch (toast.type) {
        case 'success':
          return <CheckCircle className="w-5 h-5 text-green-600" />;
        case 'error':
          return <AlertCircle className="w-5 h-5 text-red-600" />;
        case 'warning':
          return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
        default:
          return <CheckCircle className="w-5 h-5 text-green-600" />;
      }
    };

    const getBgColor = () => {
      switch (toast.type) {
        case 'success':
          return 'bg-green-50 border-green-200';
        case 'error':
          return 'bg-red-50 border-red-200';
        case 'warning':
          return 'bg-yellow-50 border-yellow-200';
        default:
          return 'bg-green-50 border-green-200';
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, x: 300, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 300, scale: 0.8 }}
        transition={{ type: "spring", duration: 0.4 }}
        className={`${getBgColor()} border rounded-lg p-4 shadow-lg max-w-sm w-full`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 break-words">
              {toast.message}
            </p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    );
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_TRAVEL_SECURITY}/travel/get-project-by-id/${id}`);
        const data = await response.json();
        console.log('show me the projects', data)
        setProjectDetails(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    }

    fetchProjects();
  }, [id]);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoadingComments(true);
        const response = await fetch(`${import.meta.env.VITE_TRAVEL_SECURITY}/travel/get-comments/${id}`);
        
        if (response.ok) {
          const commentsData = await response.json();
          console.log('Fetched comments:', commentsData);
          
          // Access the comments array from the response
          const commentsArray = commentsData.comments || [];
          
          // Transform API data to match our Comment interface
          const transformedComments = commentsArray.map((comment: any) => ({
            id: comment.id,
            user: comment.user,
            text: comment.comment,
            rating: 5, // Default rating since API doesn't provide it
            date: comment.date
          }));
          
          setComments(transformedComments);
        } else {
          console.error('Failed to fetch comments');
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setIsLoadingComments(false);
      }
    };

    if (id) {
      fetchComments();
    }
  }, [id]);

  const RatingStars = ({ rating, interactive = false, onRatingChange = (r: number) => {}, showRatingText = true }: { 
    rating: number;
    interactive?: boolean;
    onRatingChange?: (rating: number) => void;
    showRatingText?: boolean;
  }) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`w-5 h-5 ${
              index < Math.floor(rating)
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            } ${interactive ? "cursor-pointer" : ""}`}
            onClick={() => interactive && onRatingChange(index + 1)}
          />
        ))}
        {showRatingText && <span className="text-sm text-gray-600 ml-2">{rating.toFixed(1)}</span>}
      </div>
    );
  };

  const handleSubmitComment = async () => {
    if (!userName.trim()) {
      setShowNamePopup(true);
      return;
    }

    if (!newComment.trim()) {
      showToast('warning', 'Please enter a comment before submitting');
      return;
    }

    // Prepare comment for API submission
    const commentData = {
      projectId: id,
      user: userName.trim(),
      comment: newComment.trim(),
      rating: newRating,
      date: new Date().toLocaleDateString()
    };

    try {
      const response = await fetch('http://localhost:8080/travel/save-comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentData)
      });

      if (!response.ok) {
        throw new Error('Failed to save comment');
      }

      const savedComment = await response.json();

      // Add to local state after successful API call
      const newCommentObj: Comment = {
        id: savedComment.id || Date.now(),
        user: userName.trim(),
        text: newComment.trim(),
        rating: newRating,
        date: new Date().toLocaleDateString()
      };

      setComments(prev => [newCommentObj, ...prev]);
      
      // Reset form
      setNewComment("");
      setNewRating(5);
      
      showToast('success', 'Comment saved successfully!');
    } catch (error) {
      console.error('Error saving comment:', error);
      showToast('error', 'Failed to save comment. Please try again.');
    }
  };

  const handleNameSubmit = () => {
    if (!userName.trim()) {
      showToast('warning', 'Please enter your name to continue');
      return;
    }
    setShowNamePopup(false);
    handleSubmitComment();
  };

  // Loading state
  if (!projectDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <ToastNotification key={toast.id} toast={toast} />
        ))}
      </div>

      <div className="container mx-auto px-4 py-16 md:py-20">
        <Link 
          to={`/service-provider/${projectDetails.userId}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 md:mb-8"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Provider Profile
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
          <div className="order-2 lg:order-1">
            {projectDetails.projectImages && projectDetails.projectImages.length > 0 && (
              <>
                <motion.img
                  key={activeImageIndex}
                  src={projectDetails.projectImages[activeImageIndex]}
                  alt={`${projectDetails.title} - Image ${activeImageIndex + 1}`}
                  className="w-full h-64 sm:h-80 md:h-96 object-cover rounded-lg shadow-md mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-4">
                  {projectDetails.projectImages.map((image: string, index: number) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className={`w-full h-16 sm:h-20 md:h-24 object-cover rounded cursor-pointer transition-all duration-200
                        ${index === activeImageIndex ? 'ring-2 ring-blue-600 shadow-md' : 'hover:opacity-80'}`}
                      onClick={() => setActiveImageIndex(index)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="order-1 lg:order-2">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 md:gap-4 mb-4 md:mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{projectDetails.title}</h1>
              <div className="flex items-center gap-2 flex-shrink-0">
                <RatingStars rating={4.8} showRatingText={true} />
                <span className="text-sm text-gray-500 whitespace-nowrap">(12 reviews)</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
              <Calendar className="text-blue-600 w-4 h-4 md:w-5 md:h-5" />
              <span className="text-gray-600 text-sm md:text-base">{projectDetails.projectDate}</span>
            </div>
            
            {/* Project Specifications */}
            {projectDetails.specifications && projectDetails.specifications.length > 0 && (
              <div className="mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">Project Specifications</h2>
                <div className="flex flex-wrap gap-2">
                  {projectDetails.specifications.map((spec: string, index: number) => (
                    <span 
                      key={index}
                      className="px-2 py-1 md:px-3 md:py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-xs md:text-sm font-medium shadow-sm"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-semibold mb-2">Project Description</h2>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">{projectDetails.description}</p>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <Card className="p-4 md:p-6 mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Comments & Reviews</h2>
          
          {/* Add Comment Form */}
          <div className="mb-6 md:mb-8">
            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Add Your Review</h3>
            
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your experience..."
              className="mb-3 md:mb-4 text-sm md:text-base"
              rows={3}
            />
            <Button 
              onClick={handleSubmitComment} 
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-sm md:text-base px-4 md:px-6 py-2 md:py-3"
            >
              Submit Review
            </Button>
          </div>

          {/* Comments List */}
          <div className="space-y-4 md:space-y-6">
            {isLoadingComments ? (
              <div className="text-center py-6 md:py-8">
                <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-blue-600 mx-auto mb-3 md:mb-4"></div>
                <p className="text-gray-500 text-sm md:text-base">Loading comments...</p>
              </div>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-200 pb-4 md:pb-6 last:border-0">
                  <div className="flex items-start gap-3 mb-2">
                    <User className="w-5 h-5 md:w-6 md:h-6 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-sm md:text-base text-gray-900 block">{comment.user}</span>
                      <p className="text-gray-600 text-sm md:text-base leading-relaxed mt-1 md:mt-2 break-words">{comment.text}</p>
                      <span className="text-xs md:text-sm text-gray-400 mt-1 md:mt-2 block">{comment.date}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 md:py-8 text-gray-500">
                <p className="text-sm md:text-base">No reviews yet. Be the first to leave a review!</p>
              </div>
            )}
          </div>
        </Card>
      </div>
      
      {/* Name Input Popup */}
      {showNamePopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowNamePopup(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white rounded-2xl p-4 md:p-6 lg:p-8 shadow-2xl w-full max-w-sm mx-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowNamePopup(false)}
              className="absolute top-3 right-3 md:top-4 md:right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Content */}
            <div className="text-center mb-4 md:mb-6">
              <div className="bg-blue-100 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <User className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1 md:mb-2">Enter Your Name</h3>
              <p className="text-gray-600 text-sm md:text-base">Please provide your name to submit the review</p>
            </div>

            {/* Name Input */}
            <div className="mb-4 md:mb-6">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
                autoFocus
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
              <Button
                onClick={() => setShowNamePopup(false)}
                variant="outline"
                className="flex-1 text-sm md:text-base py-2 md:py-3"
              >
                Cancel
              </Button>
              <Button
                onClick={handleNameSubmit}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm md:text-base py-2 md:py-3"
              >
                Continue
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <Footer />
    </div>
  );
};

export default ProjectDetail;
