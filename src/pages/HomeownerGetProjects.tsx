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
import { RefreshCw } from "lucide-react";

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
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-10 w-full">
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            {/* Spinner */}
            <div className="flex items-center justify-center">
              <RefreshCw className="h-8 w-8 text-trust-blue animate-spin" />
            </div>
            
            {/* Loading text */}
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-slate-900">Loading Your Jobs</h2>
            </div>
            
            {/* Optional skeleton preview */}
            <div className="w-full max-w-4xl">
              <div className="animate-pulse space-y-6">
                <div className="h-6 bg-gray-200 rounded w-1/4 mx-auto"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-48 bg-gray-200 rounded-2xl"></div>
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-10 w-full">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-md mx-auto">
              <CardContent className="p-6 text-center">
                <h2 className="text-lg font-semibold text-red-600 mb-2">Error</h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
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
    <div className="min-h-screen bg-slate-50">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 text-green-600">✓</div>
            <span className="text-green-800 font-medium">{successMessage}</span>
          </div>
        </div>
      )}
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2">
            My Jobs
          </h1>
          <p className="text-slate-600">
            Manage your posted jobs and track their progress
          </p>
        </div>
        
        {/* Desktop button */}
        <Button
          onClick={() => navigate('/post-job')}
          className="hidden sm:flex mt-4 sm:mt-0 bg-trust-blue hover:bg-trust-blue/90 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <HiPlus className="w-5 h-5 mr-2" />
          Post New Job
        </Button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <HiPhoto className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-4">
              Get started by posting your first job
            </p>
            <Button
              onClick={() => navigate('/post-job')}
              className="bg-trust-blue hover:bg-trust-blue/90 text-white"
            >
              Post Your First Job
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card 
              key={project.id} 
              className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 hover:shadow-md transition-shadow overflow-hidden"
            >
              <CardHeader className="p-5 pb-3">
                <div className="flex items-start justify-between mb-3">
                  <Badge className={`${getStatusColor(project.status)} border-0`}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    Job: {project.project_id.split('-')[0]}
                  </span>
                </div>
                
                <CardTitle className="text-lg font-semibold text-slate-900 line-clamp-2">
                  {project.job_title}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-5 pt-0">
                <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                  {project.job_description}
                </p>

                {/* Project Image */}
                <div className="mb-4">
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-slate-100">
                    {project.image_urls && project.image_urls.length > 0 ? (
                      <img
                        src={project.image_urls[0]}
                        alt="Project"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                        <HiPhoto className="w-8 h-8 text-slate-400" />
                      </div>
                    )}
                    {project.image_count > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
                        +{project.image_count - 1} more
                      </div>
                    )}
                  </div>
                </div>

                {/* Project Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <HiMapPin className="w-4 h-4" />
                    <span>
                      {project.additional_data?.location}, {project.additional_data?.country}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <HiCurrencyPound className="w-4 h-4" />
                    <span>{formatBudget(project.budget)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <HiClock className="w-4 h-4" />
                    <span>{formatUrgency(project.urgency)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <HiCalendarDays className="w-4 h-4" />
                    <span>Posted {formatDate(project.created_at)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {/* View and Edit buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => navigate(`/jobs/${project.project_id}`)}
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                    >
                      <HiEye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    
                    <Button
                      onClick={() => navigate(`/edit-job/${project?.project_id}`)}
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                    >
                      <HiPencilSquare className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>

                  {/* Status Action buttons */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => handleMarkComplete(project)}
                      className="px-3 py-1 text-sm rounded-md bg-green-100 text-green-700 hover:bg-green-200 transition-colors flex-1"
                      aria-label="Mark job as complete"
                    >
                      Mark as Complete
                    </button>
                    
                    <button
                      onClick={() => handleCloseJob(project)}
                      className="px-3 py-1 text-sm rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition-colors flex-1"
                      aria-label="Delete job"
                    >
                      Delete Job
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Mobile button - fixed to bottom of screen */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 z-50">
        <Button
          onClick={() => navigate('/post-job')}
          className="w-full bg-trust-blue hover:bg-trust-blue/90 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <HiPlus className="w-5 h-5 mr-2" />
          Post New Job
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