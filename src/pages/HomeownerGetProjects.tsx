import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  HiCalendarDays,
  HiMapPin,
  HiCurrencyPound,
  HiClock,
  HiEye,
  HiPencilSquare,
  HiPhoto,
  HiPlus,
  HiUserGroup,
  HiArrowPath
} from "react-icons/hi2";
import { RefreshCw, CheckCircle, Trash2, Edit, Users, Clock, Star, X, Loader2, MessageCircle, Briefcase } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";

interface Project {
  id: string;
  project_id: string;
  job_title: string;
  job_description: string;
  budget: string;
  urgency: string;
  image_urls: string[];
  image_count: number;
  created_at: string;
  updated_at: string;
  status: string;
  additional_data: {
    location: string;
    serviceCategory: string;
    country: string;
  };
}

interface TraderDetails {
  name: string;
  primaryTrade: string;
  city: string;
  email: string;
  phone: string | null;
}

interface JobDetails {
  job_title: string;
  job_description: string;
  budget: string;
  urgency: string;
  location: string;
}

interface LastMessage {
  body: string;
  sender_id: string;
  created_at: string;
}

interface TraderConversation {
  conversation_id: string;
  job_id: string;
  trader_id: string;
  status: string;
  message_count: string;
  last_message_at: string;
  created_at: string;
  trader_details: TraderDetails;
  job_details: JobDetails;
  last_message: LastMessage;
}

const HomeownerGetProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText: string;
    confirmStyle: string;
    isLoading: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    confirmText: '',
    confirmStyle: '',
    isLoading: false
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showStatusProjects, setShowStatusProjects] = useState([]);
  const [homeownerStats, setHomeownerStats] = useState<{
    completed_jobs: number;
    in_progress_jobs: number;
    total_posted: number;
    total_cancelled: number;
  } | null>(null);

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [traders, setTraders] = useState<TraderConversation[]>([]);
  const [loadingTraders, setLoadingTraders] = useState(false);
  const [selectedTrader, setSelectedTrader] = useState<TraderConversation | null>(null);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  const getUserId = () => {
    try {
      const userData = localStorage.getItem('auth_user');
      if (!userData) return null;

      const parsedUserData = JSON.parse(userData);
      return parsedUserData.id; // Direct access to id, not .id.id
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  };

  const userId = getUserId();

  useEffect(() => {
    const requestApi = async () => {
      try {
        console.log('Fetching homeowner stats from:', `${apiUrl}/travel/get-all-client-status-projects`);
        let response = await fetch(`${apiUrl}/travel/get-all-client-status-projects`, {
          credentials: 'include',
        });

        if (!response.ok) {
          console.error('API response not ok:', response.status, response.statusText);
          return;
        }

        const data = await response.json();
        console.log('Homeowner stats API response:', data);
        setShowStatusProjects(data.projects);

        if (data.success) {
          const stats = {
            completed_jobs: data.completed_jobs || 0,
            in_progress_jobs: data.in_progress_jobs || 0,
            total_posted: data.total_posted || 0,
            total_cancelled: data.total_cancelled || 0
          };
          console.log('Setting homeowner stats:', stats);
          setHomeownerStats(stats);
        } else {
          console.error('API returned success: false', data);
        }
      } catch (error) {
        console.error('Error fetching homeowner stats:', error);
      }
    }
    requestApi();
  }, [apiUrl]);

  useEffect(() => {
    const apiFetchRequest = async () => {
      try {

        const response = await fetch(`${apiUrl}/travel/get-trader-completed-job`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Trader completed jobs:', data);

      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    }
    apiFetchRequest();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!userId) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Use the correct endpoint that expects user_id as query param
        const response = await fetch(`${apiUrl}/travel/save-client-project?user_id=${userId}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          setProjects(data.projects || []);
        } else {
          setError(data.error || 'Failed to fetch projects');
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        setError('Failed to load projects. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [userId, apiUrl]);



  const formatBudget = (budget: string) => {
    const budgetMap: { [key: string]: string } = {
      'under-200': 'Under £200',
      '200-500': '£200-£500',
      '500-1000': '£500-£1,000',
      'over-1000': 'Over £1,000',
      'flexible': 'Flexible'
    };
    return budgetMap[budget] || budget;
  };

  const formatUrgency = (urgency: string) => {
    const urgencyMap: { [key: string]: string } = {
      'asap': 'ASAP',
      'this_week': 'This week',
      'this_month': 'This month',
      'flexible': 'Flexible'
    };
    return urgencyMap[urgency] || urgency;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'active': return 'bg-green-50 text-green-700 border border-green-200';
      case 'completed': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'cancelled':
      case 'closed': return 'bg-gray-50 text-gray-600 border border-gray-200';
      default: return 'bg-gray-50 text-gray-600 border border-gray-200';
    }
  };

  const getNextActionHint = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return "We're reviewing and notifying local tradespeople.";
      case 'active': return "You'll receive applications here. Check your Chats to respond.";
      case 'completed': return "Marked complete. Thank you!";
      case 'cancelled':
      case 'closed': return "This job is closed.";
      default: return "Project status updated.";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return 'just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
  };

  const openConfirmModal = (title: string, message: string, onConfirm: () => void, confirmText: string, confirmStyle: string) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      confirmText,
      confirmStyle,
      isLoading: false
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleMarkComplete = (project: Project) => {
    openConfirmModal(
      "Mark Job as Complete",
      "Are you sure you want to mark this job as complete? This action will update the job status.",
      async () => {
        try {
          // Set loading state
          setConfirmModal(prev => ({ ...prev, isLoading: true }));

          // Prepare FormData similar to EditJobs.tsx
          const formDataToSend = new FormData();

          // Add all existing job data
          formDataToSend.append('job_title', project.job_title);
          formDataToSend.append('job_description', project.job_description);
          formDataToSend.append('location', project.additional_data?.location || '');
          formDataToSend.append('budget', project.budget);
          formDataToSend.append('urgency', project.urgency);
          formDataToSend.append('status', 'completed'); // Mark as completed

          // Add contact and additional information
          formDataToSend.append('first_name', ''); // These might not be available in the project data
          formDataToSend.append('email', '');
          formDataToSend.append('phone', '');
          formDataToSend.append('country', project.additional_data?.country || '');
          formDataToSend.append('service_category', project.additional_data?.serviceCategory || '');

          // Add existing image URLs
          if (project.image_urls && project.image_urls.length > 0) {
            project.image_urls.forEach((imageUrl) => {
              formDataToSend.append('existing_images', imageUrl);
            });
          }

          // Add userId from auth data
          const authUser = localStorage.getItem('auth_user');
          if (authUser) {
            const userData = JSON.parse(authUser);
            formDataToSend.append('userId', userData.id);
          }

          const response = await fetch(`${apiUrl}/travel/edit-client-project/${project.project_id}`, {
            method: 'PUT',
            credentials: 'include',
            body: formDataToSend
          });

          const data = await response.json();

          if (data.success) {
            // Refresh the projects list to show updated status
            const updatedProjects = projects.map(p =>
              p.id === project.id ? { ...p, status: 'completed' } : p
            );
            setProjects(updatedProjects);
            setSuccessMessage('Job marked as complete!');
            setShowSuccess(true);
            closeConfirmModal();

            // Hide success message after 3 seconds
            setTimeout(() => {
              setShowSuccess(false);
            }, 3000);
          } else {
            throw new Error(data.message || 'Failed to mark job as complete');
          }

        } catch (error) {
          console.error('Error marking job as complete:', error);
          setError('Failed to mark job as complete. Please try again.');
          setConfirmModal(prev => ({ ...prev, isLoading: false }));
        }
      },
      "Mark Complete",
      "bg-green-600 hover:bg-green-700 text-white"
    );
  };

  const handleDeleteProject = async (project: Project) => {
    try {
      console.log('deleting project', {
        project_id: project.project_id,
        job_title: project.job_title,
        status: project.status
      });

      const response = await fetch(`${apiUrl}/travel/delete-client-project/${project.project_id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (data.success) {
        const updatedProjects = projects.filter(p => p.id !== project.id);
        setProjects(updatedProjects);
        setSuccessMessage('Job deleted successfully!');
        setShowSuccess(true);

        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
      } else {
        throw new Error(data.message || 'Failed to delete job');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      setError('Failed to delete job. Please try again.');
    }
  };

  const handleCancelJob = async (project: Project) => {
    try {
      setConfirmModal(prev => ({ ...prev, isLoading: true }));

      const response = await fetch(`${apiUrl}/travel/edit-client-project/${project.project_id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        const updatedProjects = projects.filter(p => p.id !== project.id);
        setProjects(updatedProjects);
        setSuccessMessage('Job cancelled successfully!');
        setShowSuccess(true);
        closeConfirmModal();

        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
      } else {
        throw new Error(data.message || 'Failed to cancel job');
      }
    } catch (error) {
      console.error('Error cancelling job:', error);
      setError('Failed to cancel job. Please try again.');
      setConfirmModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleCloseJob = (project: Project) => {
    const isCompleted = project.status === 'completed';
    openConfirmModal(
      isCompleted ? "Delete Job" : "Cancel Job",
      isCompleted
        ? "Are you sure you want to delete this job? This action cannot be undone."
        : "Are you sure you want to cancel this job? This will close the job and stop receiving applications.",
      () => {
        if (isCompleted) {
          handleDeleteProject(project);
          closeConfirmModal();
        } else {
          handleCancelJob(project);
        }
      },
      isCompleted ? "Delete Job" : "Cancel Job",
      "bg-red-600 hover:bg-red-700 text-white"
    );
  };

  const handleOpenRatingModal = async (project: Project) => {
    setSelectedProject(project);
    setShowRatingModal(true);
    setLoadingTraders(true);

    try {
      console.log('Fetching traders for project:', project.project_id);
      console.log('API URL:', `${apiUrl}/travel/get-trader-completed-job`);

      const response = await fetch(`${apiUrl}/travel/get-trader-completed-job`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Trader completed jobs response:', data);

      if (data.success && Array.isArray(data.chats)) {
        const filteredTraders = data.chats.filter(
          (chat: TraderConversation) => chat.job_id === project.project_id
        );

        const uniqueTraders = filteredTraders.reduce((acc: TraderConversation[], current: TraderConversation) => {
          const existingTrader = acc.find(trader => trader.trader_id === current.trader_id);

          if (!existingTrader) {
            acc.push(current);
          } else {
            const currentMessages = parseInt(current.message_count) || 0;
            const existingMessages = parseInt(existingTrader.message_count) || 0;

            if (currentMessages > existingMessages) {
              const index = acc.indexOf(existingTrader);
              acc[index] = current;
            }
          }

          return acc;
        }, []);

        console.log(`Found ${filteredTraders.length} conversations, deduplicated to ${uniqueTraders.length} unique traders for this job`);
        setTraders(uniqueTraders);

        if (uniqueTraders.length === 1) {
          setSelectedTrader(uniqueTraders[0]);
        }
      } else {
        console.error('Invalid response format:', data);
        setTraders([]);
      }

    } catch (err) {
      console.error("Error fetching traders:", err);
      setTraders([]);
    } finally {
      setLoadingTraders(false);
    }
  };

  const handleCloseRatingModal = () => {
    setShowRatingModal(false);
    setSelectedProject(null);
    setTraders([]);
    setSelectedTrader(null);
    setRating(0);
    setHoveredRating(0);
    setComment("");
  };

  const handleSelectTrader = (trader: TraderConversation) => {
    setSelectedTrader(trader);
  };

  const handleBackToTraderList = () => {
    setSelectedTrader(null);
    setRating(0);
    setHoveredRating(0);
    setComment("");
  };

  const handleSubmitRating = async () => {
    if (!selectedTrader || rating === 0) return;

    setSubmitting(true);

    const ratingPayload = {
      userId: selectedTrader.trader_id,
      homeownerId: userId,
      jobId: selectedTrader.job_id,
      rating: rating,
      comment: comment.trim() || null,
    };


    try {
      const response = await fetch(`${apiUrl}/travel/get-trader-completed-job`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ratingPayload),
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (response.ok && data.success) {
        setSubmitting(false);
        handleCloseRatingModal();
        setSuccessMessage(`Successfully rated ${selectedTrader.trader_details.name}!`);
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
      } else {
        throw new Error(data.message || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      setSubmitting(false);
      setError('Failed to submit rating. Please try again.');
    }
  };

  const formatTimeAgoForMessage = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return "just now";
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10 w-full">
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 sm:space-y-8">
            {/* Spinner */}
            <div className="flex items-center justify-center">
              <RefreshCw className="h-8 w-8 sm:h-10 sm:w-10 text-trust-blue animate-spin" />
            </div>

            {/* Loading text */}
            <div className="text-center space-y-2 px-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Loading Your Jobs</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Please wait while we fetch your projects...</p>
            </div>

            {/* Skeleton cards */}
            <div className="w-full max-w-6xl px-4">
              <div className="animate-pulse space-y-8">
                <div className="h-8 bg-muted rounded-md w-1/3 mx-auto"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="rounded-xl border border-border">
                      <CardHeader className="p-6 pb-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="h-6 bg-muted rounded-lg w-20"></div>
                          <div className="h-4 bg-muted rounded w-16"></div>
                        </div>
                        <div className="h-6 bg-muted rounded w-3/4 mb-3"></div>
                        <div className="h-4 bg-muted rounded w-full mb-2"></div>
                        <div className="h-4 bg-muted rounded w-2/3 mb-4"></div>
                        <div className="h-12 bg-muted rounded-lg"></div>
                      </CardHeader>
                      <CardContent className="p-6 pt-0">
                        <div className="h-32 bg-muted rounded-lg mb-6"></div>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="space-y-3">
                            <div className="h-4 bg-muted rounded w-full"></div>
                            <div className="h-4 bg-muted rounded w-3/4"></div>
                          </div>
                          <div className="space-y-3">
                            <div className="h-4 bg-muted rounded w-full"></div>
                            <div className="h-4 bg-muted rounded w-3/4"></div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="h-11 bg-muted rounded-xl"></div>
                            <div className="h-11 bg-muted rounded-xl"></div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="h-11 bg-muted rounded-xl"></div>
                            <div className="h-11 bg-muted rounded-xl"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10 w-full">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md mx-auto shadow-lg border-destructive/20">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
                  <HiPhoto className="w-6 h-6 sm:w-8 sm:h-8 text-destructive" />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-destructive mb-2 sm:mb-3">Something went wrong</h2>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-trust-blue hover:bg-trust-blue/90 text-trust-blue-foreground w-full sm:w-auto"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Header - Sticky */}
      <div className="sm:hidden sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center h-14 px-4">
          {/* Back Arrow - 44px tap target */}
          <button
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/');
              }
            }}
            className="flex items-center justify-center w-11 h-11 -ml-2 mr-3 rounded-lg hover:bg-muted transition-colors touch-manipulation"
            style={{ minWidth: '44px', minHeight: '44px' }}
            aria-label="Go back"
          >
            <svg
              className="w-5 h-5 text-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Single Title */}
          <h1 className="text-lg font-semibold text-foreground">My Projects</h1>
        </div>
      </div>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        {/* Success Toast */}
        {showSuccess && (
          <div className="fixed top-6 right-6 z-50 bg-trust-green/10 border border-trust-green/20 rounded-xl p-4 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-trust-green" />
              <span className="text-trust-green font-medium">{successMessage}</span>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
          {/* Header Section - Desktop Only */}
          <div className="text-center mb-8 sm:mb-12 hidden sm:block">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-3 sm:mb-4">
              My Projects
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto px-4">
              Here are your projects. Edit details, mark complete, or delete anytime.
            </p>
            <p className="text-sm text-muted-foreground/80 mb-6 sm:mb-8 max-w-xl mx-auto px-4">
              Track applications, communicate with tradespeople, and manage your home improvement journey.
            </p>

            {/* Post New Job Button - Hidden on mobile, shown on larger screens */}
            <div className="hidden sm:block">
              <Button
                onClick={() => navigate('/post-job')}
                className="bg-trust-blue hover:bg-trust-blue/90 text-trust-blue-foreground px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                size="lg"
              >
                <HiPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Post New Job
              </Button>
            </div>
          </div>

          {/* Homeowner Statistics */}
          {homeownerStats && (
            <div className="mb-8">
              <Card className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-4 md:p-5">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Your Job Activity</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="text-center p-3 bg-green-50 rounded-xl border border-green-200">
                    <div className="text-2xl font-bold text-green-700">{homeownerStats.completed_jobs}</div>
                    <div className="text-xs text-green-600 font-medium mt-1">Completed</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="text-2xl font-bold text-blue-700">{homeownerStats.in_progress_jobs}</div>
                    <div className="text-xs text-blue-600 font-medium mt-1">In Progress</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-xl border border-red-200">
                    <div className="text-2xl font-bold text-red-700">{homeownerStats.total_cancelled}</div>
                    <div className="text-xs text-red-600 font-medium mt-1">Cancelled</div>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-2xl font-bold text-slate-700">{homeownerStats.total_posted}</div>
                    <div className="text-xs text-slate-600 font-medium mt-1">Total Posted</div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-3 text-center">
                  Overview of your job activity on our platform
                </p>
                <p className="text-xs text-slate-600 mt-2 text-center font-medium">
                  Tip: Complete or close jobs to improve your reliability rating.
                </p>
              </Card>
            </div>
          )}

          {/* Projects Grid */}
          {projects.length === 0 ? (
            <div className="flex justify-center px-4">
              <Card className="w-full max-w-lg shadow-lg border border-border/50 bg-gradient-to-br from-card via-card to-card/80">
                <CardContent className="p-8 sm:p-12 text-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center">
                    <HiPhoto className="w-10 h-10 sm:w-12 sm:h-12 text-primary/70" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold mb-3 text-foreground">No projects yet</h3>
                  <p className="text-muted-foreground mb-8 text-base leading-relaxed max-w-sm mx-auto">
                    Post your first job and connect with trusted tradespeople in your area.
                  </p>
                  <Button
                    onClick={() => navigate('/post-job')}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 w-full sm:w-auto"
                    size="lg"
                  >
                    <HiPlus className="w-5 h-5 mr-2" />
                    Post New Job
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="group rounded-xl bg-card border border-border shadow-sm hover:border-border/60 hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <CardHeader className="p-6 pb-4">
                    {/* Status and ID Row */}
                    <div className="flex items-center justify-between mb-4">
                      <Badge
                        className={`${getStatusColor(project.status)} font-medium px-3 py-1.5 rounded-lg text-sm`}
                        aria-live="polite"
                      >
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </Badge>
                      <span className="text-xs text-muted-foreground/70 font-mono bg-muted/30 px-2 py-1 rounded">
                        #{project.project_id.slice(-8)}
                      </span>
                    </div>

                    {/* Title */}
                    <CardTitle className="text-xl font-bold text-foreground line-clamp-2 leading-tight mb-3">
                      {project.job_title}
                    </CardTitle>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                      {project.job_description}
                    </p>

                    {/* Next Action Hint */}
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground/80 italic bg-muted/30 rounded-lg px-3 py-2">
                        {getNextActionHint(project.status)}
                      </p>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 pt-0">
                    {/* Project Image */}
                    {project.image_urls && project.image_urls.length > 0 && (
                      <div className="mb-6">
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted/30">
                          <img
                            src={project.image_urls[0]}
                            alt="Project"
                            className="w-full h-full object-cover transition-all duration-300 group-hover:opacity-80 group-hover:scale-105"
                            loading="lazy"
                          />
                          {project.image_count > 1 && (
                            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                              +{project.image_count - 1} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Key Metadata Row */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {/* Left Column */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <HiMapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground truncate">
                            {project.additional_data?.location}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <HiCurrencyPound className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium text-foreground">
                            {formatBudget(project.budget)}
                          </span>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <HiClock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground">
                            {formatUrgency(project.urgency)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <HiCalendarDays className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground">
                            {formatDate(project.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Optional chips */}
                    <div className="flex items-center justify-between mb-6 text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>Updated {formatTimeAgo(project.updated_at)}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      {/* Primary Actions Row */}
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          onClick={() => navigate(`/jobs/${project.project_id}`)}
                          variant="outline"
                          className="h-11 px-4 rounded-xl border-border hover:bg-muted/50 text-sm font-medium transition-all"
                          aria-label={`View details for ${project.job_title}`}
                        >
                          <HiEye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>

                        {project.status !== 'completed' && (
                          <Button
                            onClick={() => navigate(`/edit-job/${project?.project_id}`)}
                            variant="outline"
                            className="h-11 px-4 rounded-xl border-border hover:bg-muted/50 text-sm font-medium transition-all"
                            aria-label={`Edit ${project.job_title}`}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Job
                          </Button>
                        )}

                        {project.status === 'completed' && (
                          <Button
                            onClick={() => handleOpenRatingModal(project)}
                            className="h-11 px-4 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-xl transition-all"
                            aria-label={`Rate trader for ${project.job_title}`}
                          >
                            <Star className="w-4 h-4 mr-2" />
                            Rate Trader
                          </Button>
                        )}
                      </div>

                      {/* Secondary Actions Row */}
                      <div className="grid grid-cols-2 gap-3">
                        {project.status !== 'completed' && (
                          <Button
                            onClick={() => handleMarkComplete(project)}
                            className="h-11 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-all"
                            aria-label={`Mark ${project.job_title} as complete`}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark Complete
                          </Button>
                        )}

                        <Button
                          onClick={() => handleCloseJob(project)}
                          variant="outline"
                          className="h-11 px-4 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 text-sm font-medium rounded-xl transition-all"
                          aria-label={project.status === 'completed' ? `Delete ${project.job_title}` : `Cancel ${project.job_title}`}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {project.status === 'completed' ? 'Delete Job' : 'Cancel Job'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Mobile FAB with bottom safe area */}
          <div className="fixed bottom-6 right-4 sm:hidden z-50">
            <Button
              onClick={() => navigate('/post-job')}
              size="lg"
              className="rounded-full h-14 w-14 sm:h-16 sm:w-16 shadow-xl bg-trust-blue hover:bg-trust-blue/90 text-trust-blue-foreground hover:shadow-2xl transition-all duration-200 transform hover:scale-110 active:scale-95 active:shadow-lg mb-safe"
            >
              <HiPlus className="w-6 h-6 sm:w-7 sm:h-7" />
            </Button>
          </div>

          {/* Bottom padding for mobile to account for FAB */}
          <div className="h-20 sm:hidden"></div>
        </div>

        {/* Confirmation Modal */}
        {confirmModal.isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 animate-in fade-in-0 zoom-in-95 duration-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {confirmModal.title}
                </h3>
                <p className="text-slate-600 mb-6">
                  {confirmModal.message}
                </p>

                <div className="flex gap-3 justify-end">
                  <Button
                    onClick={closeConfirmModal}
                    variant="outline"
                    className="px-4 py-2"
                  >
                    Cancel
                  </Button>
                  <button
                    onClick={confirmModal.onConfirm}
                    disabled={confirmModal.isLoading}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${confirmModal.confirmStyle} disabled:opacity-50`}
                  >
                    {confirmModal.isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block" />
                        Processing...
                      </>
                    ) : (
                      confirmModal.confirmText
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rating Modal */}
        {showRatingModal && (
          <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in-0 duration-200"
            onClick={handleCloseRatingModal}
          >
            <div
              className="bg-background rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-background p-6 border-b border-border z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-foreground">
                    {selectedTrader ? "Rate Your Experience" : "Select Trader to Rate"}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCloseRatingModal}
                    className="h-8 w-8 p-0 hover:bg-muted rounded-full"
                    aria-label="Close modal"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {loadingTraders ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                    <p className="text-muted-foreground">Loading traders...</p>
                  </div>
                ) : traders.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No traders to rate</h3>
                    <p className="text-muted-foreground mb-6">
                      You haven't had any conversations with traders for this job yet.
                    </p>
                    <Button onClick={handleCloseRatingModal} variant="outline">
                      Close
                    </Button>
                  </div>
                ) : selectedTrader ? (
                  <div className="space-y-6">
                    {/* Back Button */}
                    {traders.length > 1 && (
                      <Button
                        variant="ghost"
                        onClick={handleBackToTraderList}
                        className="mb-4 -ml-2"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to trader list
                      </Button>
                    )}

                    {/* Trader Info */}
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl">
                      <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-xl font-bold">
                          {selectedTrader.trader_details.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">
                          {selectedTrader.trader_details.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedTrader.trader_details.primaryTrade} • {selectedTrader.trader_details.city}
                        </p>
                      </div>
                    </div>

                    {/* Job Title */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Job completed:</p>
                      <p className="font-medium text-foreground">{selectedTrader.job_details.job_title}</p>
                    </div>

                    {/* Star Rating */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-3">
                        Your Rating <span className="text-destructive">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full p-1"
                            aria-label={`Rate ${star} stars`}
                          >
                            <Star
                              className={`w-10 h-10 transition-colors ${star <= (hoveredRating || rating)
                                  ? "text-[#FACC15] fill-[#FACC15]"
                                  : "text-muted-foreground"
                                }`}
                            />
                          </button>
                        ))}
                      </div>
                      {rating > 0 && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {rating === 5 && "Excellent! ⭐"}
                          {rating === 4 && "Very Good! 👍"}
                          {rating === 3 && "Good"}
                          {rating === 2 && "Fair"}
                          {rating === 1 && "Poor"}
                        </p>
                      )}
                    </div>

                    {/* Comment */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Comment (Optional)
                      </label>
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience with this trader..."
                        className="min-h-[100px] resize-none"
                        maxLength={500}
                      />
                      <p className="text-xs text-muted-foreground mt-1 text-right">
                        {comment.length}/500
                      </p>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3 justify-end pt-4 border-t border-border">
                      <Button variant="outline" onClick={handleCloseRatingModal} disabled={submitting}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmitRating}
                        disabled={rating === 0 || submitting}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px]"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Submit Rating
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Header Section */}
                    <div className="text-center pb-4 border-b border-border">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-full flex items-center justify-center">
                        <Star className="w-8 h-8 text-amber-600" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        Who completed this job?
                      </h3>
                    </div>

                    {/* Job Context Card */}
                    {selectedProject && (
                      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                        <CardContent className="p-4">
                          <p className="text-xs text-muted-foreground mb-1">Rating for:</p>
                          <h4 className="font-semibold text-foreground">{selectedProject.job_title}</h4>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <HiMapPin className="w-3 h-3" />
                            <span>{selectedProject.additional_data?.location}</span>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Traders List */}
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-foreground mb-3">
                        Select a tradesperson:
                      </p>
                      {traders.map((trader, index) => (
                        <Card
                          key={trader.conversation_id}
                          className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-2 border-border hover:border-primary/50 hover:bg-primary/5"
                          onClick={() => handleSelectTrader(trader)}
                        >
                          <CardContent className="p-5">
                            <div className="flex items-start gap-4">
                              <div className="relative">
                                <Avatar className="h-14 w-14 border-2 border-background shadow-sm">
                                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-lg font-bold">
                                    {trader.trader_details.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold border-2 border-background">
                                  {index + 1}
                                </div>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                  <div className="flex-1">
                                    <h3 className="font-bold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
                                      {trader.trader_details.name}
                                    </h3>
                                    <div className="flex items-center gap-2 flex-wrap mb-2">
                                      <Badge variant="secondary" className="text-xs font-medium">
                                        <Briefcase className="w-3 h-3 mr-1" />
                                        {trader.trader_details.primaryTrade}
                                      </Badge>
                                      <span className="text-sm text-muted-foreground flex items-center">
                                        <HiMapPin className="w-3 h-3 mr-1" />
                                        {trader.trader_details.city}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex flex-col items-end gap-2">
                                    <div className="flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                                      <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
                                      <span className="text-xs font-semibold text-blue-700">
                                        {trader.message_count} messages
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectTrader(trader);
                                  }}
                                  className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground group-hover:shadow-md transition-all"
                                >
                                  <Star className="w-4 h-4 mr-2" />
                                  Rate {trader.trader_details.name}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default HomeownerGetProjects;