import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Clock, 
  Search, 
  Filter, 
  PoundSterling,
  Eye,
  Send,
  RefreshCw,
  Briefcase,
  TrendingUp,
  Users,
  Calendar,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Zap,
  Building2,
  Hammer,
  Wrench,
  Paintbrush,
  ChevronDown,
  Menu
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
  nuts?: string;
  additional_data?: {
    nuts?: string;
    serviceCategory?: string;
    [key: string]: any;
  };
}

const TradesPersonJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filters, setFilters] = useState<{
    categories: string[];
    locations: string[];
    urgency?: string;
  }>({ categories: [], locations: [] });
  const [sortBy, setSortBy] = useState<'newest' | 'budget' | 'nearest'>('newest');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { toast } = useToast();

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

  // Filter and sort jobs
  const visibleJobs = useMemo(() => {
    let filtered = jobs.filter(job => {
      if (job.status && job.status.toLowerCase() === 'completed') return false;
      
      if (filters.categories.length > 0 && !filters.categories.includes(job.additional_data?.serviceCategory || job.service_category)) return false;
      if (filters.locations.length > 0 && !filters.locations.some(filterLocation => {
        const jobNuts = job.additional_data?.nuts || job.nuts;
        const jobLocation = jobNuts || job.location;
        return jobLocation?.toLowerCase().trim() === filterLocation.toLowerCase().trim();
      })) return false;
      if (filters.urgency && formatUrgency(job.urgency) !== filters.urgency) return false;
      return true;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'budget':
          const budgetOrder = { 'over-1000': 4, '500-1000': 3, '200-500': 2, 'under-200': 1, 'flexible': 0 };
          return (budgetOrder[b.budget as keyof typeof budgetOrder] || 0) - (budgetOrder[a.budget as keyof typeof budgetOrder] || 0);
        case 'nearest':
          return a.location.localeCompare(b.location);
        default:
          return 0;
      }
    });

    return filtered;
  }, [jobs, filters, sortBy]);

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const activeJobs = jobs.filter(job => !(job.status && job.status.toLowerCase() === 'completed'));
    
    const categories = [...new Set(activeJobs.map(job => job.additional_data?.serviceCategory || job.service_category).filter(Boolean))];
    const locations = [...new Set(activeJobs.map(job => {
      const jobNuts = job.additional_data?.nuts || job.nuts;
      return jobNuts || job.location;
    }).filter(Boolean))];
    const urgencies = [...new Set(activeJobs.map(job => formatUrgency(job.urgency)).filter(Boolean))];
    
    return { categories, locations, urgencies };
  }, [jobs]);

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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return '1d ago';
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setLoadingMore(false);
    }, 1000);
  };

  const getCategoryIcon = (category: string) => {
    const categoryIcons: { [key: string]: any } = {
      'plumbing': Wrench,
      'electrical': Zap,
      'painting': Paintbrush,
      'construction': Hammer,
      'general': Building2,
      'default': Briefcase
    };
    const IconComponent = categoryIcons[category?.toLowerCase()] || categoryIcons.default;
    return <IconComponent className="h-12 w-12 text-blue-600" />;
  };

  if (loading) {
    return (
      <TooltipProvider>
        <div className="min-h-screen bg-slate-50">
          {/* Compact Header */}
          <div className="bg-white border-b border-slate-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-slate-900">JobHub</h1>
              <button className="p-2 rounded-lg hover:bg-slate-100">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="px-4 py-6">
            {/* Compact KPI Section */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <Briefcase className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Active Jobs</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  <RefreshCw className="h-5 w-5 text-slate-400 animate-spin" />
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-emerald-100 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Success Rate</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">95%</div>
              </div>
            </div>

            {/* Loading Cards */}
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <Skeleton className="w-full h-48" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-10 w-full rounded-xl mt-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </TooltipProvider>
    );
  }

  if (error) {
    return (
      <TooltipProvider>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Something went wrong</h2>
              <p className="text-slate-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-50 pb-safe">
        {/* Compact Header */}
        <div className="bg-white border-b border-slate-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-900">JobHub</h1>
            <button className="p-2 rounded-lg hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Compact KPI Section */}
        <div className="px-4 py-4">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <Briefcase className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-xs text-slate-500 font-medium">Active Jobs</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">{visibleJobs.length}</div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-emerald-100 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                </div>
                <span className="text-xs text-slate-500 font-medium">Success Rate</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">95%</div>
            </motion.div>
          </div>
        </div>

        {/* Sticky Filter Bar */}
        <div className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMobileFilters(true)}
              className="flex items-center gap-2 min-h-[44px] rounded-full"
            >
              <Filter className="h-4 w-4" />
              Filters
              {(filters.categories.length > 0 || filters.locations.length > 0 || filters.urgency) && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-600 rounded-full">
                  {filters.categories.length + filters.locations.length + (filters.urgency ? 1 : 0)}
                </span>
              )}
            </Button>
            
            <div className="flex-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="w-full min-h-[44px] px-3 py-2 text-sm border border-slate-200 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="budget">Highest Budget</option>
                <option value="nearest">Nearest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="px-4 py-4">
          {visibleJobs.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-3">No Jobs Available</h3>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">Check back soon for new opportunities or adjust your filters.</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium min-h-[44px]"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Jobs
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <AnimatePresence>
                  {visibleJobs.map((job, index) => (
                    <motion.div
                      key={job.project_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -2, transition: { duration: 0.2, ease: 'easeOut' } }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card className="bg-white border border-slate-200/60 shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden">
                        {/* Job Image with 16:9 Aspect Ratio */}
                        <div className="relative w-full aspect-video bg-gradient-to-br from-slate-50 to-slate-100">
                          {job.image_urls && job.image_urls.length > 0 ? (
                            <img 
                              src={job.image_urls[0]} 
                              alt={job.job_title}
                              className="h-full w-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          {/* Trade Icon Placeholder */}
                          <div 
                            className={`absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center ${
                              job.image_urls && job.image_urls.length > 0 ? 'hidden' : 'flex'
                            }`}
                          >
                            <div className="p-8 bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20">
                              {getCategoryIcon(job.service_category)}
                            </div>
                          </div>
                          
                          {/* Overlay Pills */}
                          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                            {/* Budget Badge */}
                            <div className="bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-sm text-slate-700 text-xs font-semibold px-3 py-2 rounded-full shadow-sm border border-white/30">
                              £{formatBudget(job.budget).replace('£', '')}
                            </div>
                            
                            {/* Urgency Badge */}
                            <div className={`text-xs font-semibold px-3 py-2 rounded-full shadow-sm backdrop-blur-sm border ${
                              formatUrgency(job.urgency) === 'ASAP' 
                                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-400/30' 
                                : formatUrgency(job.urgency) === 'This week'
                                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-400/30'
                                  : formatUrgency(job.urgency) === 'Flexible'
                                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-emerald-400/30'
                                    : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-400/30'
                            }`}>
                              {formatUrgency(job.urgency)}
                            </div>
                          </div>
                        </div>
                        
                        {/* Card Content */}
                        <div className="p-5">
                          {/* Category + Time Row */}
                          <div className="flex items-center justify-between mb-3">
                            <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1.5 rounded-lg">
                              {job.additional_data?.serviceCategory || job.service_category}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                              {formatTimeAgo(job.created_at)}
                            </span>
                          </div>
                          
                          {/* Job Title - Prominent */}
                          <h3 className="text-xl font-bold text-slate-900 line-clamp-2 leading-tight mb-4">
                            {job.job_title}
                          </h3>
                          
                          {/* Location */}
                          <div className="flex items-center gap-2 mb-4">
                            <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
                            <span className="text-sm text-slate-600 font-medium truncate">
                              {job.additional_data?.nuts || job.nuts || job.location}
                            </span>
                          </div>
                          
                          {/* Description - 2 lines max */}
                          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-6">
                            {job.job_description}
                          </p>
                          
                          {/* Single Primary Action */}
                          <Button 
                            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 rounded-xl transition-colors duration-200 shadow-sm hover:shadow-md min-h-[44px]"
                            onClick={() => navigate(`/jobs/${job.project_id}`)}
                          >
                            <Eye className="h-5 w-5 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Load More Button with safe area */}
              <div className="py-6 pb-8">
                <Button 
                  onClick={handleLoadMore} 
                  disabled={loadingMore}
                  variant="outline"
                  className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 min-h-[44px]"
                >
                  {loadingMore ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  ) : (
                    <ArrowRight className="h-5 w-5" />
                  )}
                  {loadingMore ? 'Loading...' : 'Load More Jobs'}
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Mobile Filter Bottom Sheet */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowMobileFilters(false)}>
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-6"></div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Filter Jobs</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Categories</h4>
                  <div className="space-y-2">
                    {filterOptions.categories.map((category) => (
                      <label key={category} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer min-h-[44px]">
                        <input
                          type="checkbox"
                          checked={filters.categories.includes(category)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters(prev => ({ ...prev, categories: [...prev.categories, category] }));
                            } else {
                              setFilters(prev => ({ ...prev, categories: prev.categories.filter(c => c !== category) }));
                            }
                          }}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-700">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Locations</h4>
                  <div className="space-y-2">
                    {filterOptions.locations.map((location) => (
                      <label key={location} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer min-h-[44px]">
                        <input
                          type="checkbox"
                          checked={filters.locations.includes(location)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters(prev => ({ ...prev, locations: [...prev.locations, location] }));
                            } else {
                              setFilters(prev => ({ ...prev, locations: prev.locations.filter(l => l !== location) }));
                            }
                          }}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-700">{location}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setShowMobileFilters(false)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white min-h-[44px]"
                  >
                    Apply Filters
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFilters({ categories: [], locations: [] });
                      setShowMobileFilters(false);
                    }}
                    className="flex-1 min-h-[44px]"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default TradesPersonJobs;