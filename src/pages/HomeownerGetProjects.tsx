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
  HiPlus
} from "react-icons/hi2";
import { RefreshCw, CheckCircle, Trash2, Edit } from "lucide-react";

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
    onConfirm: () => {},
    confirmText: '',
    confirmStyle: '',
    isLoading: false
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

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
  const apiUrl = import.meta.env.VITE_API_URL;

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
        const response = await fetch(`${apiUrl}/travel/save-client-project?user_id=${userId}`);
        
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
    switch (status) {
      case 'pending': return 'bg-accent-orange/10 text-accent-orange border border-accent-orange/20';
      case 'active': return 'bg-trust-blue/10 text-trust-blue border border-trust-blue/20';
      case 'completed': return 'bg-trust-green/10 text-trust-green border border-trust-green/20';
      case 'cancelled': return 'bg-muted text-muted-foreground border border-border';
      default: return 'bg-muted text-muted-foreground border border-border';
    }
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

  const handleCloseJob = (project: Project) => {
    openConfirmModal(
      "Delete Job",
      "Are you sure you want to delete this job? This action cannot be undone.",
      async () => {
        try {
          // Set loading state
          setConfirmModal(prev => ({ ...prev, isLoading: true }));
          
          const response = await fetch(`${apiUrl}/travel/edit-client-project/${project.project_id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          const data = await response.json();
          
          if (data.success) {
            // Remove the deleted project from the list
            const updatedProjects = projects.filter(p => p.id !== project.id);
            setProjects(updatedProjects);
            setSuccessMessage('Job deleted successfully!');
            setShowSuccess(true);
            closeConfirmModal();
            
            // Hide success message after 3 seconds
            setTimeout(() => {
              setShowSuccess(false);
            }, 3000);
          } else {
            throw new Error(data.message || 'Failed to delete job');
          }
          
        } catch (error) {
          console.error('Error deleting job:', error);
          setError('Failed to delete job. Please try again.');
          setConfirmModal(prev => ({ ...prev, isLoading: false }));
        }
      },
      "Delete Job",
      "bg-red-600 hover:bg-red-700 text-white"
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-10 w-full">
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
            {/* Spinner */}
            <div className="flex items-center justify-center">
              <RefreshCw className="h-10 w-10 text-trust-blue animate-spin" />
            </div>
            
            {/* Loading text */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold text-foreground">Loading Your Jobs</h2>
              <p className="text-muted-foreground">Please wait while we fetch your projects...</p>
            </div>
            
            {/* Skeleton cards */}
            <div className="w-full max-w-5xl">
              <div className="animate-pulse space-y-8">
                <div className="h-8 bg-muted rounded-md w-1/3 mx-auto"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="shadow-sm">
                      <CardContent className="p-6 space-y-4">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                        <div className="h-32 bg-muted rounded-lg"></div>
                        <div className="space-y-2">
                          <div className="h-3 bg-muted rounded w-full"></div>
                          <div className="h-3 bg-muted rounded w-2/3"></div>
                        </div>
                        <div className="flex gap-2">
                          <div className="h-8 bg-muted rounded flex-1"></div>
                          <div className="h-8 bg-muted rounded flex-1"></div>
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-10 w-full">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-md mx-auto shadow-lg border-destructive/20">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
                  <HiPhoto className="w-8 h-8 text-destructive" />
                </div>
                <h2 className="text-xl font-semibold text-destructive mb-3">Something went wrong</h2>
                <p className="text-muted-foreground mb-6">{error}</p>
                <Button 
                  onClick={() => window.location.reload()}
                  className="bg-trust-blue hover:bg-trust-blue/90 text-trust-blue-foreground"
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
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            My Jobs
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Manage your posted jobs and track their progress
          </p>
          
          {/* Post New Job Button */}
          <Button
            onClick={() => navigate('/post-job')}
            className="bg-trust-blue hover:bg-trust-blue/90 text-trust-blue-foreground px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            size="lg"
          >
            <HiPlus className="w-5 h-5 mr-2" />
            Post New Job
          </Button>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <Card className="max-w-lg mx-auto shadow-lg bg-gradient-to-br from-card via-card to-card/80">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-trust-blue/10 rounded-full flex items-center justify-center">
                <HiPhoto className="w-10 h-10 text-trust-blue" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-foreground">No projects yet</h3>
              <p className="text-muted-foreground mb-8 text-lg">
                Ready to find skilled tradespeople? Post your first job and get quotes from professionals in your area.
              </p>
              <Button
                onClick={() => navigate('/post-job')}
                className="bg-trust-blue hover:bg-trust-blue/90 text-trust-blue-foreground px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                size="lg"
              >
                <HiPlus className="w-5 h-5 mr-2" />
                Post Your First Job
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <Card 
                key={project.id} 
                className="group rounded-2xl bg-gradient-to-br from-card via-card to-card/80 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-border/50 hover:border-trust-blue/30"
              >
                <CardHeader className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <Badge className={`${getStatusColor(project.status)} font-medium px-3 py-1 rounded-full text-xs`}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </Badge>
                    <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                      #{project.project_id.split('-')[0]}
                    </span>
                  </div>
                  
                  <CardTitle className="text-xl font-bold text-foreground line-clamp-2 group-hover:text-trust-blue transition-colors">
                    {project.job_title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-6 pt-0">
                  <p className="text-muted-foreground line-clamp-3 mb-6 leading-relaxed">
                    {project.job_description}
                  </p>

                  {/* Project Image */}
                  <div className="mb-6">
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted/30 ring-1 ring-border/50">
                      {project.image_urls && project.image_urls.length > 0 ? (
                        <img
                          src={project.image_urls[0]}
                          alt="Project"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted/80">
                          <HiPhoto className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                      {project.image_count > 1 && (
                        <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                          +{project.image_count - 1} more
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="w-8 h-8 rounded-full bg-trust-blue/10 flex items-center justify-center">
                        <HiMapPin className="w-4 h-4 text-trust-blue" />
                      </div>
                      <span className="font-medium">
                        {project.additional_data?.location}, {project.additional_data?.country}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="w-8 h-8 rounded-full bg-trust-green/10 flex items-center justify-center">
                        <HiCurrencyPound className="w-4 h-4 text-trust-green" />
                      </div>
                      <span className="font-medium">{formatBudget(project.budget)}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="w-8 h-8 rounded-full bg-accent-orange/10 flex items-center justify-center">
                        <HiClock className="w-4 h-4 text-accent-orange" />
                      </div>
                      <span className="font-medium">{formatUrgency(project.urgency)}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <HiCalendarDays className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <span>Posted {formatDate(project.created_at)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {/* Primary Actions */}
                    <div className="flex gap-3">
                      <Button
                        onClick={() => navigate(`/jobs/${project.project_id}`)}
                        variant="outline"
                        size="sm"
                        className="flex-1 border-trust-blue/20 text-trust-blue hover:bg-trust-blue/10 hover:border-trust-blue/40"
                      >
                        <HiEye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      
                      <Button
                        onClick={() => navigate(`/edit-job/${project?.project_id}`)}
                        variant="outline"
                        size="sm"
                        className="flex-1 border-border hover:bg-muted/50"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                    
                    {/* Secondary Actions */}
                    <div className="flex gap-3">
                      {project.status !== 'completed' && (
                        <Button
                          onClick={() => handleMarkComplete(project)}
                          size="sm"
                          className="flex-1 bg-trust-green hover:bg-trust-green/90 text-trust-green-foreground"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Complete
                        </Button>
                      )}
                      
                      <Button
                        onClick={() => handleCloseJob(project)}
                        variant="outline"
                        size="sm"
                        className={`border-destructive/20 text-destructive hover:bg-destructive/10 hover:border-destructive/40 ${project.status !== 'completed' ? 'flex-1' : 'w-full'}`}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Mobile FAB */}
        <div className="fixed bottom-8 right-8 sm:hidden">
          <Button
            onClick={() => navigate('/post-job')}
            size="lg"
            className="rounded-full h-16 w-16 shadow-xl bg-trust-blue hover:bg-trust-blue/90 text-trust-blue-foreground hover:shadow-2xl transition-all transform hover:scale-110"
          >
            <HiPlus className="w-7 h-7" />
          </Button>
        </div>
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
    </div>
  );
};

export default HomeownerGetProjects;