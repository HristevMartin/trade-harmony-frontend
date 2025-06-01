import { useParams } from "react-router-dom";
import { Star, Calendar, User, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

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

const mockProjects: Record<number, Project> = {
  1: {
    id: 1,
    title: "Modern Living Room Transformation",
    description: "Complete interior painting with custom color matching and accent wall design. This project showcased our expertise in modern design implementation while maintaining the room's natural character. We used premium paints and innovative techniques to achieve a perfect finish.",
    images: [
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=2070&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=2187&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600573472591-ee6c563aabc0?q=80&w=2187&auto=format&fit=crop"
    ],
    date: "January 2024",
    providerId: 1,
    providerName: "John Smith",
    averageRating: 4.8,
    comments: [
      {
        id: 1,
        user: "Sarah Johnson",
        text: "Absolutely amazing work! The attention to detail is impressive.",
        rating: 5,
        date: "2024-02-15"
      },
      {
        id: 2,
        user: "Mike Thompson",
        text: "Very professional service and excellent results.",
        rating: 4,
        date: "2024-02-10"
      }
    ]
  },
  7: {
    id: 7,
    title: "Complete Room Renovation",
    description: "This room renovation project included custom wall texturing with decorative finishes, premium wooden flooring installation, and modern ceiling design with recessed lighting. We transformed a basic space into a stylish and functional room with careful attention to every detail.",
    images: [
      "/lovable-uploads/c35fa72c-a45a-4c7b-9587-f0a045db9c09.png",
      "/lovable-uploads/50d7664d-cb5a-4d65-be0b-95cdbb52e68f.png",
      "/lovable-uploads/bd1b1888-3ba8-4625-a267-145da03ff5c5.png"
    ],
    date: "March 2024",
    providerId: 7,
    providerName: "Nasko Yanev",
    averageRating: 4.9,
    comments: [
      {
        id: 3,
        user: "Elena Petrova",
        text: "Nasko did an incredible job with our room renovation. The wall texturing is absolutely beautiful and the floor installation is perfect.",
        rating: 5,
        date: "2024-04-15"
      },
      {
        id: 4,
        user: "Alex Martinez",
        text: "Outstanding work quality and attention to detail. The transformation is amazing!",
        rating: 5,
        date: "2024-04-10"
      }
    ]
  }
};

const ProjectDetail = () => {
  const { id } = useParams();
  const projectId = id ? parseInt(id) : 1;
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const project = mockProjects[projectId] || mockProjects[1];

  const RatingStars = ({ rating, interactive = false, onRatingChange = (r: number) => {} }: { 
    rating: number;
    interactive?: boolean;
    onRatingChange?: (rating: number) => void;
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
        <span className="text-sm text-gray-600 ml-2">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const handleSubmitComment = () => {
    // In a real app, this would make an API call
    console.log("Submitting comment:", { comment: newComment, rating: newRating });
    setNewComment("");
    setNewRating(5);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-20">
        <Link 
          to={`/service-provider/${project.providerId}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to {project.providerName}'s Profile
        </Link>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <motion.img
              key={activeImageIndex}
              src={project.images[activeImageIndex]}
              alt={`Project image ${activeImageIndex + 1}`}
              className="w-full h-96 object-cover rounded-lg shadow-md mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            <div className="grid grid-cols-3 gap-4">
              {project.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className={`w-full h-24 object-cover rounded cursor-pointer 
                    ${index === activeImageIndex ? 'ring-2 ring-blue-600' : ''}`}
                  onClick={() => setActiveImageIndex(index)}
                />
              ))}
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-4">{project.title}</h1>
            <div className="flex items-center gap-4 mb-4">
              <Calendar className="text-blue-600" />
              <span className="text-gray-600">{project.date}</span>
            </div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Overall Rating</h2>
              <RatingStars rating={project.averageRating} />
            </div>
            <p className="text-gray-600 mb-8">{project.description}</p>
          </div>
        </div>

        {/* Comments Section */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Comments & Reviews</h2>
          
          {/* Add Comment Form */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Add Your Review</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
              <RatingStars 
                rating={newRating} 
                interactive={true}
                onRatingChange={setNewRating}
              />
            </div>
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your experience..."
              className="mb-4"
            />
            <Button onClick={handleSubmitComment} className="bg-blue-600 hover:bg-blue-700">Submit Review</Button>
          </div>

          {/* Existing Comments */}
          <div className="space-y-6">
            {project.comments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-6 h-6 text-gray-400" />
                    <span className="font-semibold">{comment.user}</span>
                  </div>
                  <RatingStars rating={comment.rating} />
                </div>
                <p className="text-gray-600 mb-2">{comment.text}</p>
                <span className="text-sm text-gray-400">{comment.date}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProjectDetail;
