import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  MapPin, 
  Clock, 
  Search, 
  Filter, 
  Star, 
  Calendar,
  Info,
  X,
  PoundSterling,
  User,
  Mail,
  Phone
} from 'lucide-react';

interface Project {
  id: string;
  project_id: string;
  user_id: string;
  first_name: string;
  email: string;
  phone: string;
  contact_method: string;
  job_title: string;
  job_description: string;
  location: string;
  budget: string;
  urgency: string;
  country: string;
  service_category: string;
  image_urls: string[];
  image_count: number;
  created_at: string;
  updated_at: string;
  status: string;
  gdpr_consent: boolean;
  additional_data: {
    country: string;
    location: string;
    serviceCategory: string;
    jobTitle: string;
    jobDescription: string;
    budget: string;
    urgency: string;
    firstName: string;
    email: string;
    phone: string;
    contactMethod: string;
    gdprConsent: string;
    userId: string;
    project_id: string;
    user_id: string;
    created_at: string;
    image_urls: string[];
  };
}

const TradesPersonJobs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showTooltip, setShowTooltip] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Show one-time tooltip
  useEffect(() => {
    const hasSeenTooltip = localStorage.getItem('jobs_tooltip_seen');
    if (hasSeenTooltip) {
      setShowTooltip(false);
    }
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        
        // Get JWT token from localStorage
        const token = localStorage.getItem('access_token');
        
        const response = await fetch(`${import.meta.env.VITE_API_URL}/travel/get-all-client-projects`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('show me the jobs', data);
        
        if (data.success && data.projects) {
          setProjects(data.projects);
        } else {
          setError('Failed to fetch projects');
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setError('Failed to load jobs. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, []);

  const dismissTooltip = () => {
    setShowTooltip(false);
    localStorage.setItem('jobs_tooltip_seen', 'true');
  };

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
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInHours < 48) return '1 day ago';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.job_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.first_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || 
                           project.service_category === selectedCategory || 
                           project.additional_data?.serviceCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(projects.map(project => 
    project.service_category || project.additional_data?.serviceCategory
  ).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-6">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Available Jobs
            </h1>
            <p className="text-muted-foreground">
              Find jobs that match your skills and location
            </p>
          </div>
          
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background py-6">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Available Jobs
            </h1>
            <p className="text-muted-foreground">
              Find jobs that match your skills and location
            </p>
          </div>
          
          <Card>
            <CardContent className="py-12 text-center">
              <h2 className="text-lg font-semibold text-red-600 mb-2">Error</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-6">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Available Jobs
          </h1>
          <p className="text-muted-foreground">
            Find jobs that match your skills and location
          </p>
        </div>

        {/* One-time Tooltip */}
        {showTooltip && (
          <Card className="mb-6 border-primary bg-primary/5 animate-fade-in">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Welcome to your job dashboard!
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Use the search and filters below to find jobs that match your skills. 
                      Click on any job to view details and apply.
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={dismissTooltip}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs by title, description, location, or client name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === '' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('')}
                  className="flex items-center gap-1"
                >
                  <Filter className="h-3 w-3" />
                  All Categories
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jobs List */}
        <div className="space-y-4">
          {filteredProjects.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No jobs found matching your criteria. Try adjusting your search or filters.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer hover-scale">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{project.job_title}</CardTitle>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {project.location}, {project.country}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(project.created_at)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatUrgency(project.urgency)}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={`${getStatusColor(project.status)} border text-xs`}>
                        {getStatusText(project.status)}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-mono">
                        #{project.project_id.split('-')[0]}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-foreground mb-4 line-clamp-2">
                    {project.job_description}
                  </p>

                  {/* Project Image */}
                  {project.image_urls && project.image_urls.length > 0 && (
                    <div className="mb-4">
                      <img
                        src={project.image_urls[0]}
                        alt="Project"
                        className="w-full h-32 object-cover rounded-lg ring-1 ring-slate-100"
                        loading="lazy"
                      />
                      {project.image_count > 1 && (
                        <p className="text-xs text-slate-500 mt-2 text-center">
                          +{project.image_count - 1} more photo{project.image_count > 2 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Client Info */}
                  <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-900">
                        {project.first_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {project.email}
                      </div>
                      {project.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {project.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-primary flex items-center gap-1">
                        <PoundSterling className="h-4 w-4" />
                        {formatBudget(project.budget)}
                      </span>
                      {project.service_category && (
                        <Badge variant="outline" className="text-xs">
                          {project.service_category}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button size="sm" className="bg-primary hover:bg-primary/90">
                        Apply Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Empty State Enhancement */}
        {filteredProjects.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Showing {filteredProjects.length} of {projects.length} available jobs
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradesPersonJobs;