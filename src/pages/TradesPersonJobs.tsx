import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Clock, 
  Search, 
  Filter, 
  PoundSterling,
  Eye,
  Send,
  RefreshCw
} from 'lucide-react';

interface Job {
  project_id: string;
  job_title: string;
  job_description: string;
  location: string;
  budget: string;
  urgency: string;
  country: string;
  service_category: string;
  image_urls: string[];
  created_at: string;
  status: string;
}

const TradesPersonJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
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
        
        if (data.success && data.projects) {
          setJobs(data.projects);
        } else {
          setError('Failed to fetch jobs');
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setError('Failed to load jobs. Please try again.');
        toast({
          title: "Error",
          description: "Failed to load jobs. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, [toast]);

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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return '1d ago';
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'secondary';
      case 'active':
        return 'default';
      case 'completed':
        return 'outline';
      case 'closed':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const truncateDescription = (text: string, maxLength: number = 140) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const handleRetry = () => {
    setError(null);
    window.location.reload();
  };

  const handleLoadMore = () => {
    setLoadingMore(true);
    // Simulate loading more - in real app this would fetch next page
    setTimeout(() => {
      setLoadingMore(false);
    }, 1000);
  };

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <div className="relative">
            <Skeleton className="w-full h-48" />
            <div className="absolute top-3 right-3">
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
          <CardContent className="p-4">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <div className="flex items-center gap-4 mb-3">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-10" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-4" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-20" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-6">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Jobs</h1>
            <p className="text-muted-foreground">Browse all available jobs. Filters coming soon.</p>
          </div>

          {/* Placeholder Filter Bar */}
          <Card className="mb-8">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search jobs..." className="pl-10" disabled />
                </div>
                <div className="flex flex-wrap gap-2 lg:flex-nowrap">
                  <Button variant="outline" size="sm" disabled className="flex items-center gap-1">
                    <Filter className="h-4 w-4" />
                    Category
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Radius
                  </Button>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="opacity-50">ASAP</Badge>
                    <Badge variant="outline" className="opacity-50">This week</Badge>
                    <Badge variant="outline" className="opacity-50">Flexible</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background py-6">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Jobs</h1>
            <p className="text-muted-foreground">Browse all available jobs. Filters coming soon.</p>
          </div>
          
          <Card className="max-w-md mx-auto">
            <CardContent className="py-12 text-center">
              <h2 className="text-lg font-semibold text-destructive mb-2">Something went wrong</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={handleRetry} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
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
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Jobs</h1>
          <p className="text-muted-foreground">Browse all available jobs. Filters coming soon.</p>
        </div>

        {/* Placeholder Filter Bar */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search jobs..." className="pl-10" disabled />
              </div>
              <div className="flex flex-wrap gap-2 lg:flex-nowrap">
                <Button variant="outline" size="sm" disabled className="flex items-center gap-1">
                  <Filter className="h-4 w-4" />
                  Category
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Radius
                </Button>
                <div className="flex gap-1 overflow-x-auto">
                  <Badge variant="outline" className="opacity-50 whitespace-nowrap">ASAP</Badge>
                  <Badge variant="outline" className="opacity-50 whitespace-nowrap">This week</Badge>
                  <Badge variant="outline" className="opacity-50 whitespace-nowrap">Flexible</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jobs Grid */}
        {jobs.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="py-12 text-center">
              <h2 className="text-lg font-semibold mb-2">No jobs yet</h2>
              <p className="text-muted-foreground mb-4">Check back soon for new opportunities.</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <Card 
                  key={job.project_id} 
                  className="overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group"
                  onClick={() => window.location.href = `/tradesperson/jobs/${job.project_id}`}
                >
                  <div className="relative">
                    {/* Job Image */}
                    {job.image_urls && job.image_urls.length > 0 ? (
                      <img
                        src={job.image_urls[0]}
                        alt={job.job_title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-48 bg-muted flex items-center justify-center">
                        <div className="text-muted-foreground text-sm">No image</div>
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <Badge className={`${getStatusColor(job.status)} border text-xs font-medium`}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    {/* Job Title */}
                    <h3 className="font-semibold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                      {job.job_title}
                    </h3>

                    {/* Meta Row */}
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3 flex-wrap">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <PoundSterling className="h-3 w-3" />
                        <span>{formatBudget(job.budget)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatUrgency(job.urgency)}</span>
                      </div>
                      <span>{formatTimeAgo(job.created_at)}</span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {truncateDescription(job.job_description)}
                    </p>

                    {/* Service Category */}
                    {job.service_category && (
                      <Badge variant="outline" className="mb-4 text-xs">
                        {job.service_category}
                      </Badge>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 flex items-center gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `/tradesperson/jobs/${job.project_id}`;
                        }}
                      >
                        <Eye className="h-3 w-3" />
                        View Job
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 flex items-center gap-1"
                        disabled
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Send className="h-3 w-3" />
                        Apply
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="flex justify-center mt-8">
              <Button 
                onClick={handleLoadMore} 
                variant="outline"
                disabled={loadingMore}
                className="flex items-center gap-2"
              >
                {loadingMore && <RefreshCw className="h-4 w-4 animate-spin" />}
                Load More
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TradesPersonJobs;