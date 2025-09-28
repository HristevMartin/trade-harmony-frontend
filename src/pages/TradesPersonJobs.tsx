import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileHeader from '@/components/MobileHeader';
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
  ChevronDown
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
    [key: string]: any;
  };
}

const TradesPersonJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [displayedJobsCount, setDisplayedJobsCount] = useState(6);
  const [filters, setFilters] = useState<{
    categories: string[];
    locations: string[];
    urgency?: string;
    radius?: number;
  }>({ categories: [], locations: [] });
  const [sortBy, setSortBy] = useState<'newest' | 'budget' | 'nearest'>('newest');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [openPopovers, setOpenPopovers] = useState<{ category: boolean; location: boolean }>({
    category: false,
    location: false
  });
  const [mobileRadiusOpen, setMobileRadiusOpen] = useState(false);
  const [showStickyFilter, setShowStickyFilter] = useState(false);
  const [userPostcode, setUserPostcode] = useState<string>('');
  const { toast } = useToast();

  // Convert km to the nearest supported miles option used by the dropdown
  // Supported options: 5, 10, 25, 50, 100 miles
  const kmToNearestMilesOption = (km: number) => {
    const miles = Math.round(km * 0.621371);
    const options = [5, 10, 25, 50, 100];
    let nearest = options[0];
    let minDiff = Math.abs(miles - nearest);
    for (let i = 1; i < options.length; i++) {
      const diff = Math.abs(miles - options[i]);
      if (diff < minDiff) {
        nearest = options[i];
        minDiff = diff;
      }
    }
    return nearest;
  };

  // Close popovers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-popover]')) {
        setOpenPopovers({ category: false, location: false });
      }
      // Close mobile radius dropdown when clicking outside
      if (!target.closest('[data-mobile-radius]')) {
        setMobileRadiusOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const apiRequest = async () => {
      try {
        const request = await fetch(`${import.meta.env.VITE_API_URL}/travel/get-user-data`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          credentials: 'include'
        });

        const response = await request.json();
        console.log('jjjj response:', response);

        // Extract postcode and preferred radius from user data
        if (response) {
          if (response.postcode) {
            setUserPostcode(response.postcode);
            console.log('User postcode set to:', response.postcode);
          }

          // Prefer API provided radiusKm if available; map to nearest miles option for the dropdown
          if (response.radiusKm != null && response.radiusKm !== '') {
            const radiusKmNumber = Number(response.radiusKm);
            if (!Number.isNaN(radiusKmNumber) && radiusKmNumber > 0) {
              const nearestMiles = kmToNearestMilesOption(radiusKmNumber);
              setFilters(prev => ({ ...prev, radius: nearestMiles }));
            } else {
              // Fallback to default 25 miles if radiusKm is not a valid number
              setFilters(prev => ({ ...prev, radius: 25 }));
            }
          } else {
            // If no radius provided by API, keep or default to 25 miles
            setFilters(prev => ({ ...prev, radius: prev.radius ?? 25 }));
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }

    apiRequest();
  }, []);

  // Function to handle radius changes
  const handleRadiusChange = (newRadius: number) => {
    // Log the radius change with detailed information
    logRadiusChange(newRadius);

    setFilters(prev => ({
      ...prev,
      radius: newRadius
    }));
  };

  // Function to log radius changes for analytics/debugging
  const logRadiusChange = (newRadius: number) => {
    const logData = {
      radiusKm: newRadius,
    };

    console.log('show me the log', logData);

    const requestApi = async () => {
      try {
        const request = await fetch(`${import.meta.env.VITE_API_URL}/travel/post-user-radius-km`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(logData),
          credentials: 'include'
        });

        if (!request.ok) {
          throw new Error('Network response was not ok');
        }

        if (request.status === 200) {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/travel/get-all-client-projects`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
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
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }

    requestApi();

    console.log('🎯 Radius Selection Changed:', logData);
  };

  useEffect(() => {
    if (!showMobileFilters) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowMobileFilters(false);
      }
    };

    // Focus trap
    const sheet = document.getElementById('filters-sheet');
    if (sheet) {
      const focusableElements = sheet.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTabKey = (event: KeyboardEvent) => {
        if (event.key === 'Tab') {
          if (event.shiftKey) {
            if (document.activeElement === firstElement) {
              event.preventDefault();
              lastElement?.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              event.preventDefault();
              firstElement?.focus();
            }
          }
        }
      };

      // Focus first element when sheet opens
      firstElement?.focus();

      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keydown', handleTabKey);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keydown', handleTabKey);
      };
    }
  }, [showMobileFilters]);

  // Handle scroll to show/hide sticky filter
  useEffect(() => {
    const handleScroll = () => {
      // Find the desktop filter element
      const desktopFilter = document.querySelector('.desktop-filter-bar');
      if (desktopFilter) {
        const rect = desktopFilter.getBoundingClientRect();
        // Show sticky filter when the desktop filter is completely out of view
        setShowStickyFilter(rect.bottom < 0);
      } else {
        // Fallback: show after scrolling down significantly
        const scrollY = window.scrollY;
        setShowStickyFilter(scrollY > 400);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initialize filters from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const initialFilters: typeof filters = { categories: [], locations: [] };

    const categories = urlParams.get('categories')?.split(',').filter(Boolean) || [];
    const locations = urlParams.get('locations')?.split(',').filter(Boolean) || [];
    const urgency = urlParams.get('urgency');
    const sort = urlParams.get('sort') as 'newest' | 'budget' | 'nearest';

    initialFilters.categories = categories;
    initialFilters.locations = locations;
    if (urgency) initialFilters.urgency = urgency;

    setFilters(initialFilters);
    if (sort) setSortBy(sort);
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const urlParams = new URLSearchParams();

    if (filters.categories.length > 0) urlParams.set('categories', filters.categories.join(','));
    if (filters.locations.length > 0) urlParams.set('locations', filters.locations.join(','));
    if (filters.urgency) urlParams.set('urgency', filters.urgency);
    if (sortBy !== 'newest') urlParams.set('sort', sortBy);

    const newUrl = urlParams.toString() ? `${window.location.pathname}?${urlParams.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [filters, sortBy]);

  // Reset pagination when filters or sort changes
  useEffect(() => {
    setDisplayedJobsCount(6);
  }, [filters, sortBy]);

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

  const extractPriceOnly = (budget: string) => {
    const formatted = formatBudget(budget);
    // Extract only the price part, removing "Custom" or other non-price text
    const priceMatch = formatted.match(/£[\d,.-]+(?:\s*-\s*£[\d,.-]+)?|Under £[\d,.-]+|Over £[\d,.-]+|Flexible/);
    return priceMatch ? priceMatch[0] : formatted.replace(/^Custom\s*/i, '').trim();
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
  const allFilteredJobs = useMemo(() => {
    let filtered = jobs.filter(job => {
      // Exclude completed jobs from being displayed
      if (job.status && job.status.toLowerCase() === 'completed') return false;

      if (filters.categories.length > 0 && !filters.categories.includes(job.additional_data?.serviceCategory || job.service_category)) return false;
      if (filters.locations.length > 0 && !filters.locations.some(filterLocation => {
        // Use nuts field for filtering, fallback to location if nuts is not available
        const jobNuts = job.additional_data?.nuts || job.nuts;
        const jobLocation = jobNuts || job.location;
        return jobLocation?.toLowerCase().trim() === filterLocation.toLowerCase().trim();
      })) return false;
      if (filters.urgency && formatUrgency(job.urgency) !== filters.urgency) return false;
      return true;
    });

    // Sort jobs
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

  // Get currently displayed jobs based on pagination
  const visibleJobs = useMemo(() => {
    return allFilteredJobs.slice(0, displayedJobsCount);
  }, [allFilteredJobs, displayedJobsCount]);

  // Get unique values for filter options (excluding completed jobs)
  const filterOptions = useMemo(() => {
    // First filter out completed jobs before generating filter options
    const activeJobs = jobs.filter(job => !(job.status && job.status.toLowerCase() === 'completed'));

    const categories = [...new Set(activeJobs.map(job => job.additional_data?.serviceCategory || job.service_category).filter(Boolean))];
    // Use nuts field for location options, fallback to location if nuts is not available
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

        const response = await fetch(`${import.meta.env.VITE_API_URL}/travel/get-all-client-projects`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
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




  const handleRetry = () => {
    setError(null);
    window.location.reload();
  };

  const handleLoadMore = () => {
    setLoadingMore(true);
    // Simulate loading delay for better UX
    setTimeout(() => {
      setDisplayedJobsCount(prev => prev + 6);
      setLoadingMore(false);
    }, 800);
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
    return <IconComponent className="h-10 w-10 text-blue-600" />;
  };

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Card className="overflow-hidden border border-slate-200 hover:shadow-md transition-shadow">
            <div className="relative">
              <Skeleton className="w-full h-48" />
              <div className="absolute top-3 right-3">
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
            <CardContent className="p-4">
              <Skeleton className="h-6 w-3/4 mb-3" />
              <div className="flex items-center gap-3 mb-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-10" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-9 w-full rounded-lg" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );


  if (loading) {
    return (
      <TooltipProvider>
        <div className="min-h-screen bg-slate-50">
          <div className="container mx-auto px-4 max-w-7xl py-8">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                  Available Jobs
                </h1>
                <p className="text-lg text-slate-600">Your next opportunity is waiting nearby</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm"
                >
                  <div className="flex items-center justify-center mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Briefcase className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <RefreshCw className="h-6 w-6 text-slate-400 animate-spin" />
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-slate-900">{visibleJobs.length}</div>
                  )}
                  <div className="text-sm text-slate-500">Active Jobs</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm"
                >
                  <div className="flex items-center justify-center mb-2">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    </div>
                  </div>
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <RefreshCw className="h-6 w-6 text-slate-400 animate-spin" />
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-slate-900">95%</div>
                  )}
                  <div className="text-sm text-slate-500">Success Rate</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm"
                >
                  <div className="flex items-center justify-center mb-2">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                  </div>
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <RefreshCw className="h-6 w-6 text-slate-400 animate-spin" />
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-slate-900">24h</div>
                  )}
                  <div className="text-sm text-slate-500">Avg Response</div>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-0 p-8"
            >
              <LoadingSkeleton />
            </motion.div>
          </div>
        </div>
      </TooltipProvider>
    );
  }

  if (error) {
    return (
      <TooltipProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/20 to-orange-50/20">
          <div className="container mx-auto px-4 max-w-7xl py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12 text-center"
            >
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl shadow-lg">
                  <RefreshCw className="h-8 w-8 text-white" />
                </div>
                <div className="text-left">
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-red-700 to-orange-700 bg-clip-text text-transparent mb-2">
                    Oops! Something went wrong
                  </h1>
                  <p className="text-lg text-slate-600 font-medium">We're having trouble loading the jobs</p>
                </div>
              </div>
            </motion.div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border-0 p-8">
              <Card className="max-w-md mx-auto border-0 shadow-none bg-transparent">
                <CardContent className="py-12 text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <RefreshCw className="h-8 w-8 text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mb-3">Connection Error</h2>
                  <p className="text-slate-600 mb-6 leading-relaxed">{error}</p>
                  <Button
                    onClick={handleRetry}
                    className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 mx-auto"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <MobileHeader
        title="Available Jobs"
        subtitle={`${allFilteredJobs.length} opportunities waiting`}
        rightContent={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMobileFilters(true)}
            className="text-xs"
          >
            <Filter className="w-4 h-4 mr-1" />
            Filter
          </Button>
        }
      />

      {/* Sticky Filter Bar - Shows on Scroll */}
      <AnimatePresence>
        {showStickyFilter && (
          <motion.div
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -60 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200/60 shadow-lg"
          >
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="font-semibold text-slate-900">Filter Jobs</h2>
                  <div className="flex items-center gap-2">
                    {filters.categories.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {filters.categories.length} Categories
                      </Badge>
                    )}
                    {filters.locations.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {filters.locations.length} Locations
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMobileFilters(true)}
                  className="text-xs"
                >
                  <Filter className="w-4 h-4 mr-1" />
                  Filter
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-background">
        <div className="container mx-auto px-4 max-w-6xl py-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12 sm:block hidden"
          >
            <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 rounded-3xl p-8 mb-8 border border-border/5">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-3xl scale-110 -z-10"></div>
              <div className="relative">

                <h3 className="text-xl text-muted-foreground max-w-2xl mx-auto">Your next opportunity is waiting nearby</h3>
              </div>
            </div>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-card to-card/80 rounded-2xl p-6 border-0 shadow-xl"
              >
                <div className="flex items-center justify-center mb-3">
                  <div className="p-3 bg-gradient-to-r from-primary to-primary/80 rounded-2xl shadow-lg">
                    <Briefcase className="h-6 w-6 text-primary-foreground" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{allFilteredJobs.length}</div>
                <div className="text-sm text-muted-foreground font-medium">Active Jobs</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-card to-card/80 rounded-2xl p-6 border-0 shadow-xl"
              >
                <div className="flex items-center justify-center mb-3">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">95%</div>
                <div className="text-sm text-muted-foreground font-medium">Success Rate</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-card to-card/80 rounded-2xl p-6 border-0 shadow-xl"
              >
                <div className="flex items-center justify-center mb-3">
                  <div className="p-3 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl shadow-lg">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">24h</div>
                <div className="text-sm text-muted-foreground font-medium">Avg Response</div>
              </motion.div>
            </div>
          </motion.div>

          {/* Enhanced Desktop Sticky Filter Bar */}
          <div className="desktop-filter-bar sticky top-16 sm:top-4 z-40 mb-8 w-full">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="hidden md:block bg-card/80 backdrop-blur-sm border border-border/20 shadow-xl rounded-2xl px-6 py-5 w-full min-h-[80px]"
              style={{ 
                position: 'relative',
                willChange: 'transform'
              }}
            >
              {/* Desktop Filters */}
              <div className="flex flex-wrap gap-3 items-center min-h-[48px] w-full">
                {/* Category Chip Popover */}
                <div className="relative" data-popover>
                  <button
                    onClick={() => setOpenPopovers(prev => ({ ...prev, category: !prev.category }))}
                    className="inline-flex items-center gap-2 rounded-xl px-4 h-10 bg-background hover:bg-muted/50 border border-border/20 text-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary shadow-sm hover:shadow-md flex-shrink-0"
                    aria-expanded={openPopovers.category}
                  >
                    <Building2 className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {filters.categories.length === 0
                        ? 'Category'
                        : filters.categories.length === 1
                          ? filters.categories[0]
                          : filters.categories.length === 2
                            ? `${filters.categories[0]}, ${filters.categories[1]}`
                            : `${filters.categories[0]}, ${filters.categories[1]} +${filters.categories.length - 2}`
                      }
                    </span>
                    {filters.categories.length > 0 && (
                      <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-primary-foreground bg-primary rounded-full">
                        {filters.categories.length}
                      </span>
                    )}
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openPopovers.category ? 'rotate-180' : ''}`} />
                  </button>

                  {openPopovers.category && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-card rounded-2xl border border-border/20 shadow-2xl z-50 backdrop-blur-sm">
                      <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                        {filterOptions.categories.map((category, index) => (
                          <div key={category}>
                            <label className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
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
                            {index < filterOptions.categories.length - 1 && <div className="h-px bg-slate-100 my-1" />}
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-slate-100 p-3 flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setOpenPopovers(prev => ({ ...prev, category: false }))}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Apply
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setFilters(prev => ({ ...prev, categories: [] }));
                            setOpenPopovers(prev => ({ ...prev, category: false }));
                          }}
                          className="flex-1"
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Location Chip Popover */}
                <div className="relative" data-popover>
                  <button
                    onClick={() => setOpenPopovers(prev => ({ ...prev, location: !prev.location }))}
                    className="inline-flex items-center gap-2 rounded-full px-3 h-9 bg-white hover:bg-slate-50 ring-1 ring-slate-200 text-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 flex-shrink-0"
                    aria-expanded={openPopovers.location}
                  >
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {filters.locations.length === 0
                        ? 'Location'
                        : filters.locations.length === 1
                          ? filters.locations[0]
                          : filters.locations.length === 2
                            ? `${filters.locations[0]}, ${filters.locations[1]}`
                            : `${filters.locations[0]}, ${filters.locations[1]} +${filters.locations.length - 2}`
                      }
                    </span>
                    {filters.locations.length > 0 && (
                      <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-500 rounded-full">
                        {filters.locations.length}
                      </span>
                    )}
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openPopovers.location ? 'rotate-180' : ''}`} />
                  </button>

                  {openPopovers.location && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl border border-slate-200 shadow-lg z-50">
                      <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                        {filterOptions.locations.map((location, index) => (
                          <div key={location}>
                            <label className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
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
                            {index < filterOptions.locations.length - 1 && <div className="h-px bg-slate-100 my-1" />}
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-slate-100 p-3 flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setOpenPopovers(prev => ({ ...prev, location: false }))}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Apply
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setFilters(prev => ({ ...prev, locations: [] }));
                            setOpenPopovers(prev => ({ ...prev, location: false }));
                          }}
                          className="flex-1"
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Urgency Toggle Chips */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    {filterOptions.urgencies.map((urgency) => {
                      const getUrgencyIcon = (urgencyLabel: string) => {
                        if (urgencyLabel === 'ASAP') return AlertCircle;
                        if (urgencyLabel === 'This week') return Calendar;
                        return Clock;
                      };

                      const Icon = getUrgencyIcon(urgency);
                      const isPressed = filters.urgency === urgency;
                      return (
                        <button
                          key={urgency}
                          onClick={() => setFilters(prev => ({
                            ...prev,
                            urgency: prev.urgency === urgency ? undefined : urgency
                          }))}
                          className={`inline-flex items-center gap-2 rounded-full px-3 h-9 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 flex-shrink-0 ${isPressed
                              ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
                              : 'bg-white hover:bg-slate-50 ring-1 ring-slate-200 text-slate-700'
                            }`}
                          aria-pressed={isPressed}
                          aria-label={`Filter by ${urgency} urgency`}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="text-sm font-medium">{urgency}</span>
                        </button>
                      );
                    })}
                  </div>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-slate-400 hover:text-slate-600 transition-colors ml-1">
                        <AlertCircle className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg z-[60]">
                      <p>Filter jobs by start time</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Professional Radius Filter */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full px-5 py-2.5 ring-1 ring-blue-200/50 shadow-sm border border-blue-100/50 min-w-fit">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-blue-100 rounded-full">
                        <MapPin className="h-3 w-3 text-blue-600" />
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={filters.radius || 25}
                          onChange={(e) => handleRadiusChange(Number(e.target.value))}
                          className="text-sm font-semibold bg-transparent border-none outline-none cursor-pointer text-blue-900 appearance-none pr-1"
                        >
                          <option value={5} className="bg-white text-slate-800 font-semibold py-3 px-4 border-b border-slate-100">Within 5 miles</option>
                          <option value={10} className="bg-white text-slate-800 font-semibold py-3 px-4 border-b border-slate-100">Within 10 miles</option>
                          <option value={25} className="bg-blue-50 text-blue-900 font-bold py-3 px-4 border-b border-blue-100">Within 25 miles</option>
                          <option value={50} className="bg-white text-slate-800 font-semibold py-3 px-4 border-b border-slate-100">Within 50 miles</option>
                          <option value={100} className="bg-white text-slate-800 font-semibold py-3 px-4">Within 100 miles</option>
                        </select>
                        <ChevronDown className="h-3 w-3 text-blue-600 pointer-events-none" />
                      </div>
                    </div>
                    {userPostcode && (
                      <div className="flex items-center gap-1.5 pl-2 border-l border-blue-200">
                        <span className="text-xs text-blue-700 font-medium">from</span>
                        <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md">
                          {userPostcode}
                        </span>
                      </div>
                    )}
                  </div>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-blue-400 hover:text-blue-600 transition-colors p-1">
                        <AlertCircle className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg z-[60]">
                      <p>Search radius from your postcode location</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

              </div>

            </motion.div>

            {/* Active Filters Pills */}
            {(filters.categories.length > 0 || filters.locations.length > 0 || filters.urgency || (filters.radius && filters.radius !== 25)) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-12 flex flex-wrap gap-2 items-center"
              >
                <span className="text-sm text-slate-600 font-medium">Active filters:</span>

                {filters.categories.map(category => (
                  <Badge
                    key={`cat-${category}`}
                    variant="secondary"
                    className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                  >
                    <Building2 className="h-3 w-3" />
                    {category}
                    <button
                      onClick={() => setFilters(prev => ({
                        ...prev,
                        categories: prev.categories.filter(c => c !== category)
                      }))}
                      className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                      aria-label={`Remove ${category} filter`}
                    >
                      ×
                    </button>
                  </Badge>
                ))}

                {filters.locations.map(location => (
                  <Badge
                    key={`loc-${location}`}
                    variant="secondary"
                    className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                  >
                    <MapPin className="h-3 w-3" />
                    {location}
                    <button
                      onClick={() => setFilters(prev => ({
                        ...prev,
                        locations: prev.locations.filter(l => l !== location)
                      }))}
                      className="ml-1 hover:bg-emerald-200 rounded-full p-0.5"
                      aria-label={`Remove ${location} filter`}
                    >
                      ×
                    </button>
                  </Badge>
                ))}

                {filters.urgency && (
                  <Badge
                    variant="secondary"
                    className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                  >
                    <Clock className="h-3 w-3" />
                    {filters.urgency}
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, urgency: undefined }))}
                      className="ml-1 hover:bg-amber-200 rounded-full p-0.5"
                      aria-label={`Remove ${filters.urgency} urgency filter`}
                    >
                      ×
                    </button>
                  </Badge>
                )}

                {filters.radius && filters.radius !== 25 && (
                  <Badge
                    variant="secondary"
                    className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 border-blue-200 hover:from-blue-100 hover:to-indigo-100 shadow-sm"
                  >
                    <div className="p-0.5 bg-blue-100 rounded-full">
                      <MapPin className="h-2.5 w-2.5 text-blue-600" />
                    </div>
                    <span className="font-semibold">{filters.radius} miles</span>
                    {userPostcode && (
                      <span className="text-xs text-blue-600 font-medium">from {userPostcode}</span>
                    )}
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, radius: 25 }))}
                      className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                      aria-label="Reset radius to default (25 miles)"
                    >
                      ×
                    </button>
                  </Badge>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilters({ categories: [], locations: [] })}
                  className="text-slate-600 hover:text-slate-900 h-7 px-2"
                >
                  Clear all
                </Button>
              </motion.div>
            )}
          </div>

          {/* Mobile FAB */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="sm:hidden fixed right-4 bottom-[calc(env(safe-area-inset-bottom)+1rem)] z-50 inline-flex h-11 items-center gap-2 rounded-full px-4 bg-indigo-600 text-white shadow-lg ring-1 ring-indigo-500/20 active:scale-[0.98] transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-haspopup="dialog"
            aria-controls="filters-sheet"
            aria-expanded={showMobileFilters}
          >
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">
              Filters ({filters.categories.length + filters.locations.length + (filters.urgency ? 1 : 0)})
            </span>
          </button>

          {/* Mobile Filter Bottom Sheet */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 sm:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-black/50"
                onClick={() => setShowMobileFilters(false)}
                aria-hidden="true"
              />
              <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto"
                id="filters-sheet"
                role="dialog"
                aria-labelledby="filters-title"
                aria-modal="true"
                style={{ 
                  paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)',
                  transform: 'translateZ(0)',
                  willChange: 'transform'
                }}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 id="filters-title" className="text-lg font-semibold text-slate-900">Filters</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFilters({ categories: [], locations: [] });
                        setSortBy('newest');
                      }}
                      className="text-slate-600 hover:text-slate-900"
                    >
                      Clear all
                    </Button>
                  </div>

                  {/* Mobile Category Filter */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-slate-700 mb-3">Categories</h4>
                    <div className="space-y-2">
                      {filterOptions.categories.map(category => (
                        <label key={category} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer">
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

                  {/* Mobile Location Filter */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-slate-700 mb-3">Location</h4>
                    <div className="space-y-2">
                      {filterOptions.locations.map(location => (
                        <label key={location} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer">
                          <input
                            type="radio"
                            name="location"
                            checked={filters.locations.includes(location)}
                            onChange={() => {
                              setFilters(prev => ({ ...prev, locations: [location] }));
                            }}
                            className="border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm text-slate-700">{location}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Mobile Urgency Filter */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-slate-700 mb-3">Urgency</h4>
                    <div className="flex flex-wrap gap-2">
                      {filterOptions.urgencies.map((urgency) => {
                        const getUrgencyIcon = (urgencyLabel: string) => {
                          if (urgencyLabel === 'ASAP') return AlertCircle;
                          if (urgencyLabel === 'This week') return Calendar;
                          return Clock;
                        };

                        const Icon = getUrgencyIcon(urgency);
                        const isPressed = filters.urgency === urgency;
                        return (
                          <button
                            key={urgency}
                            onClick={() => setFilters(prev => ({
                              ...prev,
                              urgency: prev.urgency === urgency ? undefined : urgency
                            }))}
                            className={`inline-flex items-center gap-2 rounded-full px-4 h-10 transition-all ${isPressed
                                ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            aria-pressed={isPressed}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="text-sm font-medium">{urgency}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Professional Mobile Radius Filter */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <div className="p-1.5 bg-blue-100 rounded-full">
                        <MapPin className="h-3.5 w-3.5 text-blue-600" />
                      </div>
                      Search Radius
                    </h4>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-blue-700 font-medium">Current radius:</span>
                          <span className="text-sm font-bold text-blue-900 bg-blue-100 px-2.5 py-1 rounded-lg">
                            {filters.radius || 25} miles
                          </span>
                        </div>
                        {userPostcode && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-blue-600 font-medium">from</span>
                            <span className="text-xs font-bold text-blue-800 bg-white px-2 py-1 rounded-md shadow-sm">
                              {userPostcode}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="relative" data-mobile-radius>
                        <button
                          onClick={() => setMobileRadiusOpen(!mobileRadiusOpen)}
                          className="w-full p-4 border-2 border-blue-200 rounded-xl text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-blue-900 shadow-sm flex items-center justify-between"
                        >
                          <span>Within {filters.radius || 25} miles{(filters.radius || 25) === 25 ? '' : ''}</span>
                          <ChevronDown className={`h-4 w-4 text-blue-600 transition-transform duration-200 ${mobileRadiusOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {mobileRadiusOpen && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-blue-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                            {[5, 10, 25, 50, 100].map((radius) => (
                              <button
                                key={radius}
                                onClick={() => {
                                  handleRadiusChange(radius);
                                  setMobileRadiusOpen(false);
                                }}
                                className={`w-full p-4 text-left text-sm font-semibold border-b border-slate-100 last:border-b-0 transition-colors ${
                                  (filters.radius || 25) === radius
                                    ? 'bg-blue-50 text-blue-900 font-bold'
                                    : 'bg-white text-slate-800 hover:bg-slate-50'
                                }`}
                              >
                                Within {radius} miles{radius === 25 ? '' : ''}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Jobs within your selected radius will be shown
                      </p>
                    </div>
                  </div>

                  {/* Mobile Sort Control */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-slate-700 mb-3">Sort by</h4>
                    <div className="space-y-2">
                      {[
                        { key: 'newest', label: 'Newest' },
                        { key: 'budget', label: 'Highest Budget' },
                      ].map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => setSortBy(key as typeof sortBy)}
                          className={`w-full text-left p-3 rounded-lg transition-all ${sortBy === key
                              ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                              : 'hover:bg-slate-50 text-slate-700'
                            }`}
                        >
                          <span className="text-sm font-medium">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={() => setShowMobileFilters(false)}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 rounded-xl font-medium"
                    >
                      Apply
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowMobileFilters(false)}
                      className="w-full h-12 rounded-xl font-medium border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Jobs Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {visibleJobs.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Briefcase className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-3">No Jobs Available</h3>
                <p className="text-slate-600 mb-8 max-w-md mx-auto">We're constantly adding new opportunities. Check back soon or subscribe to get notified when jobs matching your skills are posted.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => window.location.reload()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Jobs
                  </Button>
                  {/* <Button 
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 px-6 py-3 rounded-lg font-medium"
                  >
                    Set Job Alerts
                  </Button> */}
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  <AnimatePresence>
                    {visibleJobs.map((job, index) => (
                      <motion.div
                        key={job.project_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -2, transition: { duration: 0.2, ease: 'easeOut' } }}
                      >
                        <Card className="bg-white border border-slate-200/60 shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col h-[440px] rounded-2xl overflow-hidden">
                          {/* Job Image Section */}
                          <div className="relative h-48 w-full bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
                            {job.image_urls && job.image_urls.length > 0 ? (
                              <img
                                src={job.image_urls[0]}
                                alt={job.job_title}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const fallback = target.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            {/* Placeholder when no image */}
                            <div
                              className={`absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center ${job.image_urls && job.image_urls.length > 0 ? 'hidden' : 'flex'
                                }`}
                            >
                              <div className="p-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg">
                                {getCategoryIcon(job.service_category)}
                              </div>
                            </div>

                            {/* Overlay Badges */}
                            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                              {/* Budget Badge */}
                              <div className="bg-white/95 backdrop-blur-sm text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm border border-white/50">
                                {extractPriceOnly(job.budget)}
                              </div>

                              {/* Urgency Badge */}
                              <div className={`text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm border ${formatUrgency(job.urgency) === 'ASAP'
                                  ? 'bg-red-500 text-white border-red-400/50'
                                  : formatUrgency(job.urgency) === 'This week'
                                    ? 'bg-amber-500 text-white border-amber-400/50'
                                    : 'bg-blue-500 text-white border-blue-400/50'
                                }`}>
                                {formatUrgency(job.urgency)}
                              </div>
                            </div>
                          </div>

                          {/* Card Content */}
                          <div className="flex-1 p-5 flex flex-col">
                            {/* Header - Category & Time */}
                            <div className="flex items-center justify-between mb-3">
                              <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-lg">
                                {job.additional_data?.serviceCategory || job.service_category}
                              </span>
                              <span className="text-xs text-slate-500 font-medium">
                                {formatTimeAgo(job.created_at)}
                              </span>
                            </div>

                            {/* Job Title */}
                            <h3 className="text-lg font-bold text-slate-900 line-clamp-2 leading-tight mb-3 min-h-[3.5rem]">
                              {job.job_title}
                            </h3>

                            {/* Location */}
                            <div className="flex items-center gap-2 mb-3">
                              <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
                              <span className="text-sm text-slate-600 font-medium truncate">
                                {job.additional_data?.nuts || job.nuts || job.location}
                              </span>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4 flex-1">
                              {job.job_description}
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="p-5 pt-0 space-y-2.5">
                            <Button
                              variant="outline"
                              className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 font-medium py-2.5 rounded-xl transition-colors duration-200"
                              size="sm"
                              onClick={() => navigate(`/jobs/${job.project_id}`)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Load More Button - Only show if there are more jobs to load */}
                {displayedJobsCount < allFilteredJobs.length && (
                  <div className="flex flex-col items-center mt-12 space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-slate-600 mb-2">
                        Showing {visibleJobs.length} of {allFilteredJobs.length} jobs
                      </p>
                      <div className="w-full bg-slate-200 rounded-full h-2 max-w-xs mx-auto">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(visibleJobs.length / allFilteredJobs.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <Button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      variant="outline"
                      className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      {loadingMore ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <ArrowRight className="h-4 w-4" />
                      )}
                      {loadingMore ? 'Loading...' : 'Load More Jobs'}
                    </Button>
                  </div>
                )}

                {/* Show completion message when all jobs are loaded */}
                {displayedJobsCount >= allFilteredJobs.length && allFilteredJobs.length > 6 && (
                  <div className="flex justify-center mt-12">
                    <div className="text-center py-6 px-8 bg-slate-50 rounded-xl border border-slate-200">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
                      <p className="text-slate-700 font-medium">You've seen all available jobs!</p>
                      <p className="text-sm text-slate-500 mt-1">
                        {allFilteredJobs.length} jobs total
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default TradesPersonJobs;