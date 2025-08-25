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
  const navigate = useNavigate();

  // Get the user id from the local storage - fix extraction
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

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-10">
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
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2">
            My Projects
          </h1>
          <p className="text-slate-600">
            Manage your posted jobs and track their progress
          </p>
        </div>
        
        <Button
          onClick={() => navigate('/post-job')}
          className="mt-4 sm:mt-0 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
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
              className="bg-orange-500 hover:bg-orange-600 text-white"
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
                    #{project.project_id.split('-')[0]}
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
                {project.image_urls && project.image_urls.length > 0 && (
                  <div className="mb-4">
                    <img
                      src={project.image_urls[0]}
                      alt="Project"
                      className="w-full h-32 object-cover rounded-lg"
                      loading="lazy"
                    />
                    {project.image_count > 1 && (
                      <p className="text-xs text-slate-500 mt-1">
                        +{project.image_count - 1} more photo{project.image_count > 2 ? 's' : ''}
                      </p>
                    )}
                  </div>
                )}

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
                <div className="flex gap-2">
                  <Button
                    onClick={() => navigate(`/jobs/${project.id}`)}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                  >
                    <HiEye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  
                  <Button
                    onClick={() => navigate(`/jobs/${project.id}`)}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                  >
                    <HiPencilSquare className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomeownerGetProjects;