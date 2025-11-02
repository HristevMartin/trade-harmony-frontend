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
  ChevronDown,
  Globe
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
    showPaidOnly?: boolean;
  }>({ categories: [], locations: [] });
  const [sortBy, setSortBy] = useState<'budget_high' | 'budget_low'>('budget_high');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [openPopovers, setOpenPopovers] = useState<{ category: boolean; location: boolean; radius: boolean; sort: boolean }>({
    category: false,
    location: false,
    radius: false,
    sort: false
  });
  const [mobileRadiusOpen, setMobileRadiusOpen] = useState(false);
  const [showStickyFilter, setShowStickyFilter] = useState(false);
  const [userPostcode, setUserPostcode] = useState<string>('');
  const [loadingPostcode, setLoadingPostcode] = useState(false);
  const [searchTerms, setSearchTerms] = useState({ category: '', location: '' });
  const [effectiveRadius, setEffectiveRadius] = useState<number | null>(null);
  const [requestedRadius, setRequestedRadius] = useState<number | null>(null);
  const [radiusAttempts, setRadiusAttempts] = useState(0);
  const [ipFilterEnabled, setIpFilterEnabled] = useState(false);
  const [paymentStatuses, setPaymentStatuses] = useState<Record<string, string>>({});
  const [userId, setUserId] = useState<string>('');
  const [loadingPaymentStatuses, setLoadingPaymentStatuses] = useState(false);
  const { toast } = useToast();

  // List of statuses that indicate a job has been paid for
  // Based on JobDetail.tsx implementation - only 'paid' status indicates payment
  const PAID_STATUSES = ['paid'];

  // Helper function to get count of paid jobs (excluding completed jobs)
  const getPaidJobsCount = () => {
    // Count only jobs that are paid AND not completed (matching the filter logic)
    return jobs.filter(job => {
      // Exclude completed jobs
      if (job.status && job.status.toLowerCase() === 'completed') return false;
      
      // Check if payment status is 'paid'
      const paymentStatus = paymentStatuses[job.project_id];
      return paymentStatus && paymentStatus !== 'not found' && PAID_STATUSES.includes(paymentStatus.toLowerCase());
    }).length;
  };

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
        setOpenPopovers({ category: false, location: false, radius: false, sort: false });
        // Clear search terms when closing popovers
        setSearchTerms({ category: '', location: '' });
      }
      // Close mobile radius dropdown when clicking outside
      if (!target.closest('[data-mobile-radius]')) {
        setMobileRadiusOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load user ID from localStorage - matching JobDetail.tsx implementation
  useEffect(() => {
    const authUser = localStorage.getItem('auth_user');
    if (authUser) {
      try {
        const userData = JSON.parse(authUser);
        if (userData?.id) {
          setUserId(userData.id);
          console.log('👤 User ID loaded from localStorage:', userData.id);
        }
      } catch (err) {
        console.error('Error parsing auth user:', err);
      }
    }
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
          // Store user ID for payment status checks (fallback if not in localStorage)
          if (!userId && (response.user_id || response.id || response._id)) {
            const extractedUserId = response.user_id || response.id || response._id;
            setUserId(extractedUserId);
            console.log('👤 User ID set from API:', extractedUserId);
          }

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
  }, [userId]);

  // Calculate progressive radius increments based on attempts
  const getProgressiveRadiusIncrements = (currentRadius: number, attempts: number) => {
    const baseIncrements = [
      [5, 10, 20],    // First attempt: +5, +10, +20
      [10, 20, 30],   // Second attempt: +10, +20, +30  
      [25, 50, 100]   // Third+ attempt: +25, +50, +100
    ];
    
    const incrementIndex = Math.min(attempts, baseIncrements.length - 1);
    return baseIncrements[incrementIndex];
  };

  // Function to handle radius changes
  const handleRadiusChange = (newRadius: number, fromEmptyState = false) => {
    // Log the radius change with detailed information
    logRadiusChange(newRadius);

    setFilters(prev => ({
      ...prev,
      radius: newRadius
    }));

    // If this is from empty state, increment attempts counter
    if (fromEmptyState) {
      setRadiusAttempts(prev => prev + 1);
    } else {
      // Reset attempts when user manually changes radius through filter bar
      setRadiusAttempts(0);
    }
  };

  // Function to log radius changes for analytics/debugging
  const logRadiusChange = (newRadius: number) => {
    const logData = {
      radiusKm: newRadius,
    };

    console.log('show me the log', logData);

    const requestApi = async () => {
      try {
        setLoadingPostcode(true);
        
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
          const toggleParam = ipFilterEnabled ? 'on' : 'off';
          const response = await fetch(`${import.meta.env.VITE_API_URL}/travel/get-all-client-projects?toggle=${toggleParam}`, {
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
            
            // Reset radius attempts when jobs are found
            if (data.projects.length > 0) {
              setRadiusAttempts(0);
            }
            
            // Handle effective radius from backend if provided
            if (data.filtersApplied?.effectiveRadiusKm && data.filtersApplied?.requestedRadiusKm) {
              setEffectiveRadius(data.filtersApplied.effectiveRadiusKm);
              setRequestedRadius(data.filtersApplied.requestedRadiusKm);
            } else {
              setEffectiveRadius(null);
              setRequestedRadius(null);
            }
          } else {
            setError('Failed to fetch jobs');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: "Error",
          description: "Failed to update location. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoadingPostcode(false);
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
    const sort = urlParams.get('sort') as 'budget_high' | 'budget_low';

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
    if (sortBy !== 'budget_high') urlParams.set('sort', sortBy);

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
      
      // Filter by paid status if enabled
      if (filters.showPaidOnly) {
        const paymentStatus = paymentStatuses[job.project_id];
        // Only show jobs where payment has been completed (status indicates payment made)
        if (!paymentStatus || paymentStatus === 'not found' || !PAID_STATUSES.includes(paymentStatus.toLowerCase())) {
          return false;
        }
      }
      
      return true;
    });

    // Sort jobs by budget
    filtered.sort((a, b) => {
      // Helper function to get numeric value for sorting
      const getBudgetValue = (budget: string) => {
        // Check if it's a concrete price (contains £ symbol or is just a number)
        const concretePriceMatch = budget.match(/£[\d,]+/);
        const customPriceMatch = budget.match(/Custom:\s*£[\d,]+/);
        const plainNumberMatch = budget.match(/^\d+$/);
        
        if (concretePriceMatch) {
          // Extract numeric value from concrete price like "£150"
          const numericValue = parseInt(concretePriceMatch[0].replace(/[£,]/g, ''));
          return numericValue;
        } else if (customPriceMatch) {
          // Extract numeric value from custom price like "Custom: £150"
          const numericValue = parseInt(customPriceMatch[0].replace(/[Custom:\s£,]/g, ''));
          return numericValue;
        } else if (plainNumberMatch) {
          // Handle plain numbers like "150"
          return parseInt(plainNumberMatch[0]);
        }
        
        // Handle range-based budgets
        const budgetOrder = { 'over-1000': 1000, '500-1000': 750, '200-500': 350, 'under-200': 200, 'flexible': 0 };
        return budgetOrder[budget as keyof typeof budgetOrder] || 0;
      };

      const aBudgetValue = getBudgetValue(a.budget);
      const bBudgetValue = getBudgetValue(b.budget);
      
      // Check if either has a concrete price (including plain numbers)
      const aIsConcrete = /£[\d,]+/.test(a.budget) || /Custom:\s*£[\d,]+/.test(a.budget) || /^\d+$/.test(a.budget);
      const bIsConcrete = /£[\d,]+/.test(b.budget) || /Custom:\s*£[\d,]+/.test(b.budget) || /^\d+$/.test(b.budget);
      
      switch (sortBy) {
        case 'budget_high':
          // Concrete prices first, then by value (highest to lowest)
          if (aIsConcrete && !bIsConcrete) return -1;
          if (!aIsConcrete && bIsConcrete) return 1;
          return bBudgetValue - aBudgetValue;
        case 'budget_low':
          // Concrete prices first, then by value (lowest to highest)
          if (aIsConcrete && !bIsConcrete) return -1;
          if (!aIsConcrete && bIsConcrete) return 1;
          return aBudgetValue - bBudgetValue;
        default:
          // Default to highest first with concrete prices prioritized
          if (aIsConcrete && !bIsConcrete) return -1;
          if (!aIsConcrete && bIsConcrete) return 1;
          return bBudgetValue - aBudgetValue;
      }
    });

    return filtered;
  }, [jobs, filters, sortBy]);

  // Get currently displayed jobs based on pagination
  const visibleJobs = useMemo(() => {
    return allFilteredJobs.slice(0, displayedJobsCount);
  }, [allFilteredJobs, displayedJobsCount]);

  // Get unique values for filter options (excluding completed jobs)
  // Function to check payment status for all jobs
  const checkPaymentStatuses = async (jobsList: Job[], currentUserId: string) => {
    if (!currentUserId || jobsList.length === 0) {
      console.log('⚠️ Skipping payment status check - no user ID or jobs', { currentUserId, jobsCount: jobsList.length });
      setLoadingPaymentStatuses(false);
      return;
    }

    setLoadingPaymentStatuses(true);
    console.log('💳 Starting payment status check for', jobsList.length, 'jobs with user ID:', currentUserId);
    
    const statusPromises = jobsList.map(async (job) => {
      try {
        const url = `${import.meta.env.VITE_API_URL}/api/payments/check-payment-status/${currentUserId}/${job.project_id}`;
        console.log('🔍 Checking payment for job:', job.project_id, 'URL:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          console.warn(`❌ Failed to check payment for job ${job.project_id}. Status:`, response.status);
          return { jobId: job.project_id, status: 'not found' };
        }

        const data = await response.json();
        console.log(`✅ Payment check result for job ${job.project_id}:`, data);
        return { jobId: job.project_id, status: data.status || 'not found' };
      } catch (error) {
        console.error(`💥 Error checking payment for job ${job.project_id}:`, error);
        return { jobId: job.project_id, status: 'not found' };
      }
    });

    try {
      const results = await Promise.all(statusPromises);
      const statusMap: Record<string, string> = {};
      
      results.forEach(({ jobId, status }) => {
        statusMap[jobId] = status;
      });

      const paidJobsCount = Object.values(statusMap).filter(status => 
        status !== 'not found' && PAID_STATUSES.includes(status.toLowerCase())
      ).length;
      setPaymentStatuses(statusMap);
      console.log('✨ Payment statuses updated:', statusMap);
      console.log('💰 Total paid jobs found:', paidJobsCount);
      console.log('📊 Status breakdown:', Object.entries(statusMap).reduce((acc, [jobId, status]) => {
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>));
    } catch (error) {
      console.error('💥 Error checking payment statuses:', error);
    } finally {
      setLoadingPaymentStatuses(false);
    }
  };

  const filterOptions = useMemo(() => {
    // First filter out completed jobs before generating filter options
    const activeJobs = jobs.filter(job => !(job.status && job.status.toLowerCase() === 'completed'));

    const allCategories = [...new Set(activeJobs.map(job => job.additional_data?.serviceCategory || job.service_category).filter(Boolean))];
    // Use nuts field for location options, fallback to location if nuts is not available
    const allLocations = [...new Set(activeJobs.map(job => {
      const jobNuts = job.additional_data?.nuts || job.nuts;
      return jobNuts || job.location;
    }).filter(Boolean))];
    const urgencies = [...new Set(activeJobs.map(job => formatUrgency(job.urgency)).filter(Boolean))];

    // Filter categories and locations based on search terms
    const categories = allCategories.filter(category => 
      category.toLowerCase().includes(searchTerms.category.toLowerCase())
    );
    const locations = allLocations.filter(location => 
      location.toLowerCase().includes(searchTerms.location.toLowerCase())
    );

    return { categories, locations, urgencies, allCategories, allLocations };
  }, [jobs, searchTerms]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);

        const toggleParam = ipFilterEnabled ? 'on' : 'off';
        const response = await fetch(`${import.meta.env.VITE_API_URL}/travel/get-all-client-projects?toggle=${toggleParam}`, {
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
          
          // Reset radius attempts when jobs are found
          if (data.projects.length > 0) {
            setRadiusAttempts(0);
          }
          
          // Handle effective radius from backend if provided
          if (data.filtersApplied?.effectiveRadiusKm && data.filtersApplied?.requestedRadiusKm) {
            setEffectiveRadius(data.filtersApplied.effectiveRadiusKm);
            setRequestedRadius(data.filtersApplied.requestedRadiusKm);
          } else {
            setEffectiveRadius(null);
            setRequestedRadius(null);
          }

          // Check payment statuses for all jobs if userId is available
          if (userId && data.projects.length > 0) {
            checkPaymentStatuses(data.projects, userId);
          }
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
  }, [toast, ipFilterEnabled, userId]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return '1d ago';
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  // Check if job was created within the last 72 hours
  const isNewJob = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    return diffInHours <= 72;
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

  const getCategoryIcon = (category: string, size: 'sm' | 'md' | 'lg' = 'md') => {
    const categoryIcons: { [key: string]: any } = {
      'plumbing': Wrench,
      'electrical': Zap,
      'painting': Paintbrush,
      'construction': Hammer,
      'carpentry': Hammer,
      'general': Building2,
      'default': Briefcase
    };
    const IconComponent = categoryIcons[category?.toLowerCase()] || categoryIcons.default;
    const sizeClasses = {
      'sm': 'h-5 w-5',
      'md': 'h-8 w-8',
      'lg': 'h-12 w-12'
    };
    return <IconComponent className={`${sizeClasses[size]} text-slate-500`} />;
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

      {/* Desktop Filter Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
        className="desktop-filter-bar hidden md:block bg-white/95 backdrop-blur-sm border-b border-gray-200/60 shadow-sm sticky top-14 z-40 transition-shadow duration-200"
        style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}
      >
        <div className="container mx-auto px-4 max-w-6xl py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left side - Filter chips */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Category Filter */}
              <div className="relative" data-popover>
                <button
                  onClick={() => setOpenPopovers(prev => ({ ...prev, category: !prev.category }))}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium transition-all duration-200 ${
                    filters.categories.length > 0 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md hover:bg-blue-700 hover:shadow-lg' 
                      : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 shadow-sm'
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  <span className="text-sm">
                    {filters.categories.length === 0 ? 'Category' : 
                     filters.categories.length === 1 ? filters.categories[0] : 
                     `${filters.categories.length} Categories`}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${openPopovers.category ? 'rotate-180' : ''}`} />
                  {filters.categories.length > 0 && (
                    <Badge variant="secondary" className="bg-white/20 text-white text-xs px-2 py-0.5 h-5 ml-1 font-semibold">
                      {filters.categories.length}
                    </Badge>
                  )}
                </button>
                
                {/* Category Dropdown */}
                <AnimatePresence>
                  {openPopovers.category && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 bg-white border border-gray-200/60 rounded-xl shadow-xl z-50 min-w-72 max-h-80 ring-1 ring-gray-100"
                    >
                      <div className="p-4">
                        {/* Search Input */}
                        <div className="mb-3">
                          <Input
                            placeholder="Search categories..."
                            value={searchTerms.category}
                            onChange={(e) => setSearchTerms(prev => ({ ...prev, category: e.target.value }))}
                            className="h-9 text-sm border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            autoFocus
                          />
                        </div>
                        
                        {/* Categories Grid */}
                        <div className="max-h-48 overflow-y-auto">
                          {filterOptions.categories.length > 0 ? (
                            <div className="grid grid-cols-2 gap-2">
                              {filterOptions.categories.map(category => (
                                <button
                                  key={category}
                                  onClick={() => {
                                    if (filters.categories.includes(category)) {
                                      setFilters(prev => ({
                                        ...prev,
                                        categories: prev.categories.filter(c => c !== category)
                                      }));
                                    } else {
                                      setFilters(prev => ({
                                        ...prev,
                                        categories: [...prev.categories, category]
                                      }));
                                    }
                                  }}
                                  className={`p-3 rounded-lg text-sm font-medium text-left transition-all duration-200 ${
                                    filters.categories.includes(category)
                                      ? 'bg-blue-600 text-white shadow-sm'
                                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                                  }`}
                                >
                                  {category}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-sm text-muted-foreground">No categories found</p>
                              {searchTerms.category && (
                                <button
                                  onClick={() => setSearchTerms(prev => ({ ...prev, category: '' }))}
                                  className="text-xs text-primary hover:underline mt-1"
                                >
                                  Clear search
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Location Filter */}
              <div className="relative" data-popover>
                <button
                  onClick={() => setOpenPopovers(prev => ({ ...prev, location: !prev.location }))}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium transition-all duration-200 ${
                    filters.locations.length > 0 
                      ? 'bg-green-600 text-white border-green-600 shadow-md hover:bg-green-700 hover:shadow-lg' 
                      : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 shadow-sm'
                  }`}
                >
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">
                    {filters.locations.length === 0 ? 'Location' : 
                     filters.locations.length === 1 ? filters.locations[0] : 
                     `${filters.locations.length} Locations`}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${openPopovers.location ? 'rotate-180' : ''}`} />
                  {filters.locations.length > 0 && (
                    <Badge variant="secondary" className="bg-white/20 text-white text-xs px-2 py-0.5 h-5 ml-1 font-semibold">
                      {filters.locations.length}
                    </Badge>
                  )}
                </button>
                
                {/* Location Dropdown */}
                <AnimatePresence>
                  {openPopovers.location && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 bg-white border border-gray-200/60 rounded-xl shadow-xl z-50 min-w-64 max-h-80 ring-1 ring-gray-100"
                    >
                      <div className="p-4">
                        {/* Search Input */}
                        <div className="mb-3">
                          <Input
                            placeholder="Search locations..."
                            value={searchTerms.location}
                            onChange={(e) => setSearchTerms(prev => ({ ...prev, location: e.target.value }))}
                            className="h-9 text-sm border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            autoFocus
                          />
                        </div>
                        
                        {/* Locations List */}
                        <div className="max-h-48 overflow-y-auto">
                          {filterOptions.locations.length > 0 ? (
                            <div className="space-y-2">
                              {filterOptions.locations.map(location => (
                                <button
                                  key={location}
                                  onClick={() => {
                                    if (filters.locations.includes(location)) {
                                      setFilters(prev => ({
                                        ...prev,
                                        locations: prev.locations.filter(l => l !== location)
                                      }));
                                    } else {
                                      setFilters(prev => ({
                                        ...prev,
                                        locations: [location]
                                      }));
                                    }
                                    setOpenPopovers(prev => ({ ...prev, location: false }));
                                  }}
                                  className={`w-full p-3 rounded-lg text-sm font-medium text-left transition-all duration-200 ${
                                    filters.locations.includes(location)
                                      ? 'bg-green-600 text-white shadow-sm'
                                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                                  }`}
                                >
                                  {location}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-sm text-muted-foreground">No locations found</p>
                              {searchTerms.location && (
                                <button
                                  onClick={() => setSearchTerms(prev => ({ ...prev, location: '' }))}
                                  className="text-xs text-primary hover:underline mt-1"
                                >
                                  Clear search
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Radius Filter */}
              <div className="relative" data-popover>
                <button
                  onClick={() => ipFilterEnabled && setOpenPopovers(prev => ({ ...prev, radius: !prev.radius }))}
                  disabled={!ipFilterEnabled}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium transition-all duration-200 ${
                    !ipFilterEnabled
                      ? 'bg-gray-100 text-gray-400 border-gray-200 opacity-60 cursor-not-allowed'
                      : filters.radius && filters.radius !== 25
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md hover:bg-indigo-700 hover:shadow-lg' 
                      : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 shadow-sm'
                  }`}
                  title={!ipFilterEnabled ? 'Enable IP Filter to adjust radius' : ''}
                >
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">
                    Within {filters.radius || 25} miles
                    {userPostcode && (
                      <span className={`ml-1 ${filters.radius && filters.radius !== 25 ? 'text-white/70' : 'text-gray-500'}`}>from {userPostcode}</span>
                    )}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${openPopovers.radius ? 'rotate-180' : ''}`} />
                  {filters.radius && filters.radius !== 25 && ipFilterEnabled && (
                    <Badge variant="secondary" className="bg-white/20 text-white text-xs px-2 py-0.5 h-5 ml-1 font-semibold">
                      {filters.radius}mi
                    </Badge>
                  )}
                </button>
                
                {/* Radius Dropdown */}
                <AnimatePresence>
                  {openPopovers.radius && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 bg-white border border-gray-200/60 rounded-xl shadow-xl z-50 min-w-64 ring-1 ring-gray-100"
                    >
                      <div className="p-4">
                        <div className="space-y-2">
                          {[5, 10, 25, 50, 100].map((radius) => (
                            <button
                              key={radius}
                              onClick={() => {
                                handleRadiusChange(radius);
                                setOpenPopovers(prev => ({ ...prev, radius: false }));
                              }}
                              className={`w-full p-3 text-left text-sm font-medium rounded-lg transition-all duration-200 ${
                                (filters.radius || 25) === radius
                                  ? 'bg-indigo-600 text-white shadow-sm'
                                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                              }`}
                              disabled={loadingPostcode}
                            >
                              Within {radius} miles
                              {(filters.radius || 25) === radius && userPostcode && (
                                <span className="text-white/70 ml-1">from {userPostcode}</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* IP Filter Toggle */}
              <button
                onClick={() => setIpFilterEnabled(prev => !prev)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium transition-all duration-200 ${
                  ipFilterEnabled
                    ? 'bg-purple-600 text-white border-purple-600 shadow-md hover:bg-purple-700 hover:shadow-lg' 
                    : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 shadow-sm'
                }`}
                title={ipFilterEnabled ? 'IP Filtration: ON' : 'IP Filtration: OFF'}
              >
                <Globe className="h-4 w-4" />
                <span className="text-sm">Distance Filter</span>
                <Badge 
                  variant="secondary" 
                  className={`text-xs px-2 py-0.5 h-5 ml-1 font-semibold ${
                    ipFilterEnabled 
                      ? 'bg-white/20 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {ipFilterEnabled ? 'ON' : 'OFF'}
                </Badge>
              </button>

              {/* My Paid Jobs Filter */}
              <button
                onClick={() => setFilters(prev => ({ ...prev, showPaidOnly: !prev.showPaidOnly }))}
                disabled={loadingPaymentStatuses}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium transition-all duration-200 ${
                  filters.showPaidOnly
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md hover:bg-emerald-700 hover:shadow-lg' 
                    : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 shadow-sm'
                } ${loadingPaymentStatuses ? 'opacity-70 cursor-wait' : ''}`}
                title={loadingPaymentStatuses ? 'Checking payment status...' : 'Show only jobs you\'ve paid for'}
              >
                <PoundSterling className="h-4 w-4" />
                <span className="text-sm">My Paid Jobs</span>
                <Badge 
                  variant="secondary" 
                  className={`text-xs px-2 py-0.5 h-5 ml-1 font-semibold ${
                    filters.showPaidOnly 
                      ? 'bg-white/20 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {loadingPaymentStatuses ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    getPaidJobsCount()
                  )}
                </Badge>
              </button>

              {/* Urgency Filter Chips */}
              {filterOptions.urgencies.map((urgency) => {
                const getUrgencyIcon = (urgencyLabel: string) => {
                  if (urgencyLabel === 'ASAP') return Zap;
                  if (urgencyLabel === 'This week') return Calendar;
                  if (urgencyLabel === 'This month') return Calendar;
                  return Clock;
                };

                const getUrgencyColor = (urgencyLabel: string) => {
                  if (urgencyLabel === 'ASAP') return 'bg-red-500 text-white border-red-500 shadow-md hover:bg-red-600 hover:shadow-lg';
                  if (urgencyLabel === 'This week') return 'bg-amber-500 text-white border-amber-500 shadow-md hover:bg-amber-600 hover:shadow-lg';
                  return 'bg-blue-500 text-white border-blue-500 shadow-md hover:bg-blue-600 hover:shadow-lg';
                };

                const Icon = getUrgencyIcon(urgency);
                const isActive = filters.urgency === urgency;
                
                return (
                  <motion.button
                    key={urgency}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setFilters(prev => ({ 
                      ...prev, 
                      urgency: prev.urgency === urgency ? undefined : urgency 
                    }))}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full border font-medium transition-all duration-150 ${
                      isActive 
                        ? getUrgencyColor(urgency)
                        : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 shadow-sm text-gray-700 active:scale-[0.97]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{urgency}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Right side - Sort and Clear */}
            <div className="flex items-center gap-3">
              {/* Sort Dropdown */}
              <div className="relative" data-popover>
                <button
                  onClick={() => setOpenPopovers(prev => ({ ...prev, sort: !prev.sort }))}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium transition-all duration-200 bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 shadow-sm min-w-[180px]"
                >
                  <PoundSterling className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm whitespace-nowrap flex-1 text-left">
                    {sortBy === 'budget_high' ? 'Highest Budget First' : 'Lowest Budget First'}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform flex-shrink-0 ${openPopovers.sort ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Sort Dropdown */}
                <AnimatePresence>
                  {openPopovers.sort && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-2 bg-card border border-border/20 rounded-xl shadow-lg z-50 min-w-64"
                    >
                      <div className="p-4">
                        <div className="space-y-2">
                          {[
                            { key: 'budget_high', label: 'Highest Budget First' },
                            { key: 'budget_low', label: 'Lowest Budget First' },
                          ].map(({ key, label }) => (
                            <button
                              key={key}
                              onClick={() => {
                                setSortBy(key as typeof sortBy);
                                setOpenPopovers(prev => ({ ...prev, sort: false }));
                              }}
                              className={`w-full p-3 text-left text-sm font-medium rounded-lg transition-all ${
                                sortBy === key
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Clear All Button */}
              {(filters.categories.length > 0 || filters.locations.length > 0 || filters.urgency || (filters.radius && filters.radius !== 25) || filters.showPaidOnly) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilters({ categories: [], locations: [], radius: 25, showPaidOnly: false });
                  }}
                  className="text-destructive border-destructive/20 hover:bg-destructive/10"
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sticky Filter Bar - Shows when scrolling */}
      {showStickyFilter && (
        <div className="sticky top-16 z-40 bg-background border-b border-border/20 shadow-sm">
          <div className="px-4 py-3">
            <div className="flex justify-center">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide max-w-full">
                {/* Category Filter Chip */}
                <button
                  onClick={() => setOpenPopovers(prev => ({ ...prev, category: !prev.category }))}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full border whitespace-nowrap text-sm font-medium transition-all ${
                    filters.categories.length > 0 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-background hover:bg-muted border-border'
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  {filters.categories.length === 0 ? 'Category' : 
                   filters.categories.length === 1 ? filters.categories[0] : 
                   `${filters.categories.length} Categories`}
                  {filters.categories.length > 0 && (
                    <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground text-xs px-1.5 py-0.5 h-5">
                      {filters.categories.length}
                    </Badge>
                  )}
                </button>

                {/* Location Filter Chip */}
                <button
                  onClick={() => setOpenPopovers(prev => ({ ...prev, location: !prev.location }))}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full border whitespace-nowrap text-sm font-medium transition-all ${
                    filters.locations.length > 0 
                      ? 'bg-trust-green text-trust-green-foreground border-trust-green' 
                      : 'bg-background hover:bg-muted border-border'
                  }`}
                >
                  <MapPin className="h-4 w-4" />
                  {filters.locations.length === 0 ? 'Location' : 
                   filters.locations.length === 1 ? filters.locations[0] : 
                   `${filters.locations.length} Locations`}
                  {filters.locations.length > 0 && (
                    <Badge variant="secondary" className="bg-trust-green-foreground/20 text-trust-green-foreground text-xs px-1.5 py-0.5 h-5">
                      {filters.locations.length}
                    </Badge>
                  )}
                </button>

                {/* Available Urgency Filter Chips - only show if available from API */}
                {filterOptions.urgencies.map((urgency) => {
                  const getUrgencyIcon = (urgencyLabel: string) => {
                    if (urgencyLabel === 'ASAP') return Zap;
                    if (urgencyLabel === 'This week') return Calendar;
                    if (urgencyLabel === 'This month') return Calendar;
                    return Clock;
                  };

                  const getUrgencyColor = (urgencyLabel: string) => {
                    if (urgencyLabel === 'ASAP') return 'bg-accent-orange text-accent-orange-foreground border-accent-orange';
                    return 'bg-trust-blue text-trust-blue-foreground border-trust-blue';
                  };

                  const Icon = getUrgencyIcon(urgency);
                  const isActive = filters.urgency === urgency;
                  
                  return (
                    <button
                      key={urgency}
                      onClick={() => setFilters(prev => ({ 
                        ...prev, 
                        urgency: prev.urgency === urgency ? undefined : urgency 
                      }))}
                      className={`flex items-center gap-2 px-3 py-2 rounded-full border whitespace-nowrap text-sm font-medium transition-all ${
                        isActive 
                          ? getUrgencyColor(urgency)
                          : 'bg-background hover:bg-muted border-border'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {urgency}
                    </button>
                  );
                })}


                {/* Advanced Filters Chip */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full border whitespace-nowrap text-sm font-medium bg-background hover:bg-muted border-border transition-all"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {(filters.categories.length + filters.locations.length + (filters.urgency ? 1 : 0) + (filters.radius && filters.radius !== 25 ? 1 : 0) + (filters.showPaidOnly ? 1 : 0)) > 0 && (
                    <Badge variant="default" className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 h-5">
                      {filters.categories.length + filters.locations.length + (filters.urgency ? 1 : 0) + (filters.radius && filters.radius !== 25 ? 1 : 0) + (filters.showPaidOnly ? 1 : 0)}
                    </Badge>
                  )}
                </button>

                {/* Clear All Action */}
                {(filters.categories.length > 0 || filters.locations.length > 0 || filters.urgency || (filters.radius && filters.radius !== 25) || filters.showPaidOnly) && (
                  <button
                    onClick={() => {
                      setFilters({ categories: [], locations: [], radius: 25, showPaidOnly: false });
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-full border whitespace-nowrap text-sm font-medium bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20 transition-all"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile-First Sticky Filter Bar - Only for mobile when not using the main sticky filter */}
      <div className={`md:hidden sticky top-16 z-40 bg-background border-b border-border/20 shadow-sm ${showStickyFilter ? 'hidden' : ''}`}>
        <div className="px-4 py-3">
          <div className="flex justify-center">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide max-w-full">
              {/* Category Filter Chip */}
              <button
                onClick={() => setOpenPopovers(prev => ({ ...prev, category: !prev.category }))}
                className={`flex items-center gap-2 px-3 py-2 rounded-full border whitespace-nowrap text-sm font-medium transition-all ${
                  filters.categories.length > 0 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-background hover:bg-muted border-border'
                }`}
              >
                <Building2 className="h-4 w-4" />
                {filters.categories.length === 0 ? 'Category' : 
                 filters.categories.length === 1 ? filters.categories[0] : 
                 `${filters.categories.length} Categories`}
                {filters.categories.length > 0 && (
                  <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground text-xs px-1.5 py-0.5 h-5">
                    {filters.categories.length}
                  </Badge>
                )}
              </button>

              {/* Location Filter Chip */}
              <button
                onClick={() => setOpenPopovers(prev => ({ ...prev, location: !prev.location }))}
                className={`flex items-center gap-2 px-3 py-2 rounded-full border whitespace-nowrap text-sm font-medium transition-all ${
                  filters.locations.length > 0 
                    ? 'bg-trust-green text-trust-green-foreground border-trust-green' 
                    : 'bg-background hover:bg-muted border-border'
                }`}
              >
                <MapPin className="h-4 w-4" />
                {filters.locations.length === 0 ? 'Location' : 
                 filters.locations.length === 1 ? filters.locations[0] : 
                 `${filters.locations.length} Locations`}
                {filters.locations.length > 0 && (
                  <Badge variant="secondary" className="bg-trust-green-foreground/20 text-trust-green-foreground text-xs px-1.5 py-0.5 h-5">
                    {filters.locations.length}
                  </Badge>
                )}
              </button>

              {/* Available Urgency Filter Chips - only show if available from API */}
              {filterOptions.urgencies.map((urgency) => {
                const getUrgencyIcon = (urgencyLabel: string) => {
                  if (urgencyLabel === 'ASAP') return Zap;
                  if (urgencyLabel === 'This week') return Calendar;
                  if (urgencyLabel === 'This month') return Calendar;
                  return Clock;
                };

                const getUrgencyColor = (urgencyLabel: string) => {
                  if (urgencyLabel === 'ASAP') return 'bg-accent-orange text-accent-orange-foreground border-accent-orange';
                  return 'bg-trust-blue text-trust-blue-foreground border-trust-blue';
                };

                const Icon = getUrgencyIcon(urgency);
                const isActive = filters.urgency === urgency;
                
                return (
                  <button
                    key={urgency}
                    onClick={() => setFilters(prev => ({ 
                      ...prev, 
                      urgency: prev.urgency === urgency ? undefined : urgency 
                    }))}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full border whitespace-nowrap text-sm font-medium transition-all ${
                      isActive 
                        ? getUrgencyColor(urgency)
                        : 'bg-background hover:bg-muted border-border'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {urgency}
                  </button>
                );
              })}



              {/* Advanced Filters Chip */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-full border whitespace-nowrap text-sm font-medium bg-background hover:bg-muted border-border transition-all"
              >
                <Filter className="h-4 w-4" />
                Filters
                {(filters.categories.length + filters.locations.length + (filters.urgency ? 1 : 0) + (filters.radius && filters.radius !== 25 ? 1 : 0) + (filters.showPaidOnly ? 1 : 0)) > 0 && (
                  <Badge variant="default" className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 h-5">
                    {filters.categories.length + filters.locations.length + (filters.urgency ? 1 : 0) + (filters.radius && filters.radius !== 25 ? 1 : 0) + (filters.showPaidOnly ? 1 : 0)}
                  </Badge>
                )}
              </button>

              {/* Clear All Action */}
              {(filters.categories.length > 0 || filters.locations.length > 0 || filters.urgency || (filters.radius && filters.radius !== 25) || filters.showPaidOnly) && (
                <button
                  onClick={() => {
                    setFilters({ categories: [], locations: [], radius: 25, showPaidOnly: false });
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-full border whitespace-nowrap text-sm font-medium bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20 transition-all"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Popover */}
        <AnimatePresence>
          {openPopovers.category && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 bg-card border-x border-b border-border/20 shadow-lg z-50"
              data-popover
            >
              <div className="p-4">
                {/* Search Input */}
                <div className="mb-3">
                  <Input
                    placeholder="Search categories..."
                    value={searchTerms.category}
                    onChange={(e) => setSearchTerms(prev => ({ ...prev, category: e.target.value }))}
                    className="h-9 text-sm border-border/40 focus:border-primary"
                  />
                </div>
                
                {/* Categories Grid */}
                <div className="max-h-48 overflow-y-auto">
                  {filterOptions.categories.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {filterOptions.categories.map(category => (
                        <button
                          key={category}
                          onClick={() => {
                            if (filters.categories.includes(category)) {
                              setFilters(prev => ({
                                ...prev,
                                categories: prev.categories.filter(c => c !== category)
                              }));
                            } else {
                              setFilters(prev => ({
                                ...prev,
                                categories: [...prev.categories, category]
                              }));
                            }
                          }}
                          className={`p-3 rounded-lg text-sm font-medium text-left transition-all ${
                            filters.categories.includes(category)
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">No categories found</p>
                      {searchTerms.category && (
                        <button
                          onClick={() => setSearchTerms(prev => ({ ...prev, category: '' }))}
                          className="text-xs text-primary hover:underline mt-1"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Location Popover */}
        <AnimatePresence>
          {openPopovers.location && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 bg-card border-x border-b border-border/20 shadow-lg z-50"
              data-popover
            >
              <div className="p-4">
                {/* Search Input */}
                <div className="mb-3">
                  <Input
                    placeholder="Search locations..."
                    value={searchTerms.location}
                    onChange={(e) => setSearchTerms(prev => ({ ...prev, location: e.target.value }))}
                    className="h-9 text-sm border-border/40 focus:border-primary"
                  />
                </div>
                
                {/* Locations Grid */}
                <div className="max-h-48 overflow-y-auto">
                  {filterOptions.locations.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {filterOptions.locations.map(location => (
                        <button
                          key={location}
                          onClick={() => {
                            if (filters.locations.includes(location)) {
                              setFilters(prev => ({
                                ...prev,
                                locations: prev.locations.filter(l => l !== location)
                              }));
                            } else {
                              setFilters(prev => ({
                                ...prev,
                                locations: [location]
                              }));
                            }
                            setOpenPopovers(prev => ({ ...prev, location: false }));
                          }}
                          className={`p-3 rounded-lg text-sm font-medium text-left transition-all ${
                            filters.locations.includes(location)
                              ? 'bg-trust-green text-trust-green-foreground'
                              : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                          }`}
                        >
                          {location}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">No locations found</p>
                      {searchTerms.location && (
                        <button
                          onClick={() => setSearchTerms(prev => ({ ...prev, location: '' }))}
                          className="text-xs text-primary hover:underline mt-1"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
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
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl p-6 border border-gray-200/40 shadow-lg hover:shadow-xl transition-all duration-200 ring-1 ring-gray-100/50"
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-md">
                    <Briefcase className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-1">{allFilteredJobs.length}</div>
                <div className="text-sm text-gray-600 font-medium">Active Jobs</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl p-6 border border-gray-200/40 shadow-lg hover:shadow-xl transition-all duration-200 ring-1 ring-gray-100/50"
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-md">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-1">95%</div>
                <div className="text-sm text-gray-600 font-medium">Success Rate</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl p-6 border border-gray-200/40 shadow-lg hover:shadow-xl transition-all duration-200 ring-1 ring-gray-100/50"
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-md">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-1">24h</div>
                <div className="text-sm text-gray-600 font-medium">Avg Response</div>
              </motion.div>
            </div>
          </motion.div>

          {/* Jobs Grid */}

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
                        setFilters({ categories: [], locations: [], radius: 25, showPaidOnly: false });
                        setSortBy('budget_high');
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
                      {filterOptions.categories.map((category, idx) => (
                        <motion.label 
                          key={category} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: idx * 0.03 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-all duration-150 active:scale-[0.98]"
                        >
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
                        </motion.label>
                      ))}
                    </div>
                  </div>

                  {/* Mobile Location Filter */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-slate-700 mb-3">Location</h4>
                    <div className="space-y-2">
                      {filterOptions.locations.map((location, idx) => (
                        <motion.label 
                          key={location} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: idx * 0.03 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-all duration-150 active:scale-[0.98]"
                        >
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
                        </motion.label>
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
                          <motion.button
                            key={urgency}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setFilters(prev => ({
                              ...prev,
                              urgency: prev.urgency === urgency ? undefined : urgency
                            }))}
                            className={`inline-flex items-center gap-2 rounded-full px-4 h-10 transition-all duration-150 active:scale-[0.97] ${isPressed
                                ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            aria-pressed={isPressed}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="text-sm font-medium">{urgency}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mobile IP Filter Toggle */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <div className="p-1.5 bg-purple-100 rounded-full">
                        <Globe className="h-3.5 w-3.5 text-purple-600" />
                      </div>
                      IP-Based Location Filter
                    </h4>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIpFilterEnabled(prev => !prev)}
                      className={`w-full p-4 rounded-xl border-2 font-semibold transition-all duration-150 flex items-center justify-between active:scale-[0.98] ${
                        ipFilterEnabled
                          ? 'bg-purple-500 text-white border-purple-500 shadow-md'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5" />
                        <div className="text-left">
                          <div className="text-sm font-semibold">IP Location Filtering</div>
                          <div className={`text-xs mt-0.5 ${ipFilterEnabled ? 'text-purple-100' : 'text-slate-500'}`}>
                            {ipFilterEnabled ? 'Jobs filtered by your IP location' : 'Show all jobs regardless of location'}
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs px-3 py-1 font-bold ${
                          ipFilterEnabled 
                            ? 'bg-white/20 text-white' 
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {ipFilterEnabled ? 'ON' : 'OFF'}
                      </Badge>
                    </motion.button>
                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {ipFilterEnabled ? 'Radius filter is available when enabled' : 'Enable to use radius-based filtering'}
                    </p>
                  </div>

                  {/* Mobile My Paid Jobs Filter */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <div className="p-1.5 bg-emerald-100 rounded-full">
                        <PoundSterling className="h-3.5 w-3.5 text-emerald-600" />
                      </div>
                      My Paid Jobs
                      {loadingPaymentStatuses && (
                        <RefreshCw className="h-3.5 w-3.5 text-emerald-600 animate-spin ml-1" />
                      )}
                    </h4>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFilters(prev => ({ ...prev, showPaidOnly: !prev.showPaidOnly }))}
                      disabled={loadingPaymentStatuses}
                      className={`w-full p-4 rounded-xl border-2 font-semibold transition-all duration-150 flex items-center justify-between active:scale-[0.98] ${
                        filters.showPaidOnly
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-md'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      } ${loadingPaymentStatuses ? 'opacity-60 cursor-wait' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <PoundSterling className="h-5 w-5" />
                        <div className="text-left">
                          <div className="text-sm font-semibold">Show My Paid Jobs Only</div>
                          <div className={`text-xs mt-0.5 ${filters.showPaidOnly ? 'text-emerald-100' : 'text-slate-500'}`}>
                            {loadingPaymentStatuses ? 'Checking payment status...' : filters.showPaidOnly ? 'Showing jobs you have paid for' : 'Show all available jobs'}
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs px-3 py-1 font-bold ${
                          filters.showPaidOnly 
                            ? 'bg-white/20 text-white' 
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {loadingPaymentStatuses ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          getPaidJobsCount()
                        )}
                      </Badge>
                    </motion.button>
                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {loadingPaymentStatuses ? (
                        'Checking payment status...'
                      ) : getPaidJobsCount() > 0 ? (
                        `You have ${getPaidJobsCount()} paid job${getPaidJobsCount() !== 1 ? 's' : ''}`
                      ) : (
                        'No paid jobs yet'
                      )}
                    </p>
                  </div>

                  {/* Professional Mobile Radius Filter */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <div className="p-1.5 bg-blue-100 rounded-full">
                        <MapPin className="h-3.5 w-3.5 text-blue-600" />
                      </div>
                      Search Radius
                      {!ipFilterEnabled && (
                        <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-slate-200 text-slate-600">
                          Disabled
                        </Badge>
                      )}
                    </h4>
                    <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100 ${!ipFilterEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
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
                          onClick={() => ipFilterEnabled && setMobileRadiusOpen(!mobileRadiusOpen)}
                          disabled={!ipFilterEnabled}
                          className={`w-full p-4 border-2 rounded-xl text-sm font-semibold focus:outline-none text-blue-900 shadow-sm flex items-center justify-between ${
                            ipFilterEnabled
                              ? 'bg-white border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                              : 'bg-slate-100 border-slate-200 cursor-not-allowed'
                          }`}
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
                      <p className={`text-xs mt-2 flex items-center gap-1 ${ipFilterEnabled ? 'text-blue-600' : 'text-slate-400'}`}>
                        <AlertCircle className="h-3 w-3" />
                        {ipFilterEnabled ? 'Jobs within your selected radius will be shown' : 'Enable IP Filter to use radius-based filtering'}
                      </p>
                    </div>
                  </div>

                  {/* Mobile Sort Control */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-slate-700 mb-3">Sort by</h4>
                    <div className="space-y-2">
                      {[
                        { key: 'budget_high', label: 'Highest Budget First' },
                        { key: 'budget_low', label: 'Lowest Budget First' },
                      ].map(({ key, label }, idx) => (
                        <motion.button
                          key={key}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: 0.15 + idx * 0.05 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSortBy(key as typeof sortBy)}
                          className={`w-full text-left p-3 rounded-lg transition-all duration-150 active:scale-[0.98] ${sortBy === key
                              ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                              : 'hover:bg-slate-50 text-slate-700'
                            }`}
                        >
                          <span className="text-sm font-medium">{label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <motion.div whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={() => setShowMobileFilters(false)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 rounded-xl font-medium transition-all duration-150 active:scale-[0.98] active:shadow-lg"
                      >
                        Apply
                      </Button>
                    </motion.div>
                    <motion.div whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="outline"
                        onClick={() => setShowMobileFilters(false)}
                        className="w-full h-12 rounded-xl font-medium border-slate-300 text-slate-700 hover:bg-slate-50 transition-all duration-150 active:scale-[0.98]"
                      >
                        Cancel
                      </Button>
                    </motion.div>
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
            className="relative"
          >
            {/* Loading Overlay for Postcode Updates */}
            {loadingPostcode && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 flex flex-col items-center gap-4">
                  <div className="relative">
                    <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
                    <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse opacity-30"></div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-900 mb-1">Updating jobs for your location</p>
                    <p className="text-xs text-slate-600">Finding jobs near {userPostcode}...</p>
                  </div>
                </div>
              </div>
            )}
            
            {visibleJobs.length === 0 ? (
              <div className="max-w-2xl mx-auto">
                <Card className="bg-white border border-slate-200 shadow-sm rounded-lg p-8">
                  <div className="text-center">
                    {/* Icon */}
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MapPin className="h-8 w-8 text-slate-400" />
                    </div>
                    
                    {/* Main Message */}
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      No jobs within {filters.radius || 25} miles{userPostcode ? ` of ${userPostcode}` : ''}
                    </h3>
                    <p className="text-slate-600 mb-8 max-w-md mx-auto">
                      Try widening your search radius. You can also update your postcode in your profile settings.
                    </p>

                    {/* Effective Radius Notification */}
                    {effectiveRadius && requestedRadius && effectiveRadius !== requestedRadius && (
                      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm text-amber-800 mb-2">
                              No jobs within {requestedRadius} miles. Showing jobs within {effectiveRadius} miles.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEffectiveRadius(null);
                                setRequestedRadius(null);
                                handleRadiusChange(requestedRadius);
                              }}
                              className="text-amber-700 border-amber-300 hover:bg-amber-100 text-xs"
                            >
                              Revert to {requestedRadius} miles
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quick Action Buttons */}
                    <div className="space-y-6">
                      {/* Progressive Radius Increment Buttons */}
                      <div>
                        <div className="text-center mb-3">
                          <p className="text-sm font-medium text-slate-700">
                            {radiusAttempts === 0 && "Try expanding your search radius:"}
                            {radiusAttempts === 1 && "Still no luck? Try even wider search:"}
                            {radiusAttempts >= 2 && "Try again with bigger miles:"}
                          </p>
                          {radiusAttempts > 0 && (
                            <p className="text-xs text-slate-500 mt-1">
                              Previous searches: {radiusAttempts} attempt{radiusAttempts > 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                          {getProgressiveRadiusIncrements(filters.radius || 25, radiusAttempts).map((increment) => {
                            const newRadius = (filters.radius || 25) + increment;
                            return (
                              <Button
                                key={increment}
                                variant="outline"
                                size="sm"
                                onClick={() => handleRadiusChange(newRadius, true)}
                                className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg transition-all hover:border-blue-300 hover:text-blue-700"
                                disabled={loadingPostcode}
                              >
                                {loadingPostcode ? (
                                  <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                                ) : null}
                                +{increment} miles
                              </Button>
                            );
                          })}
                        </div>
                        {radiusAttempts >= 2 && (
                          <p className="text-xs text-amber-600 text-center mt-2 font-medium">
                            💡 Consider updating your postcode or clearing filters if still no results
                          </p>
                        )}
                      </div>

                      {/* Clear Filters */}
                      {(filters.categories.length > 0 || filters.locations.length > 0 || filters.urgency) && (
                        <div>
                          <p className="text-sm font-medium text-slate-700 mb-3">Active filters:</p>
                          <div className="flex flex-wrap justify-center gap-2">
                            {filters.categories.length > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setFilters(prev => ({ ...prev, categories: [] }));
                                  setRadiusAttempts(0); // Reset attempts when clearing filters
                                }}
                                className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg transition-all hover:border-blue-300"
                                disabled={loadingPostcode}
                              >
                                {loadingPostcode ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : null}
                                Clear categories ({filters.categories.length})
                              </Button>
                            )}
                            {filters.locations.length > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setFilters(prev => ({ ...prev, locations: [] }));
                                  setRadiusAttempts(0); // Reset attempts when clearing filters
                                }}
                                className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg transition-all hover:border-blue-300"
                                disabled={loadingPostcode}
                              >
                                {loadingPostcode ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : null}
                                Clear locations ({filters.locations.length})
                              </Button>
                            )}
                            {filters.urgency && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setFilters(prev => ({ ...prev, urgency: undefined }));
                                  setRadiusAttempts(0); // Reset attempts when clearing filters
                                }}
                                className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg transition-all hover:border-blue-300"
                                disabled={loadingPostcode}
                              >
                                {loadingPostcode ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : null}
                                Clear urgency
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setFilters({ categories: [], locations: [] });
                                setRadiusAttempts(0); // Reset attempts when clearing all filters
                              }}
                              className="border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg font-medium transition-all hover:border-blue-300"
                              disabled={loadingPostcode}
                            >
                              {loadingPostcode ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : null}
                              Clear all filters
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Primary Action */}
                      <div className="pt-4 border-t border-slate-200">
                        <Button
                          onClick={() => {
                            setRadiusAttempts(0); // Reset attempts on manual refresh
                            window.location.reload();
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all hover:shadow-md"
                          disabled={loadingPostcode}
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${loadingPostcode ? 'animate-spin' : ''}`} />
                          {loadingPostcode ? 'Searching...' : 'Refresh Jobs'}
                        </Button>
                        <p className="text-xs text-slate-500 mt-2">
                          This will reload the page and fetch the latest jobs
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-7">
                  <AnimatePresence>
                    {visibleJobs.map((job, index) => (
                      <motion.div
                        key={job.project_id}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ 
                          duration: 0.24, 
                          delay: Math.min(index * 0.04, 0.24),
                          ease: [0.22, 0.61, 0.36, 1]
                        }}
                        whileHover={{ y: -4, transition: { duration: 0.2, ease: 'easeOut' } }}
                      >
                        <Card className="bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 group flex flex-col h-[540px] rounded-xl overflow-hidden">
                          {/* Job Image Section - Fixed Height */}
                          <div className="relative h-44 w-full flex-shrink-0 bg-gradient-to-br from-slate-50 via-white to-slate-50 overflow-hidden">
                            {job.image_urls && job.image_urls.length > 0 ? (
                              <>
                                <img
                                  src={job.image_urls[0]}
                                  alt={job.job_title}
                                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                  loading="lazy"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const fallback = target.nextElementSibling as HTMLElement;
                                    if (fallback) fallback.style.display = 'flex';
                                  }}
                                />
                                {/* Fallback for broken images */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 items-center justify-center hidden">
                                  <div className="p-5 bg-white/90 backdrop-blur-sm rounded-xl shadow-md">
                                    {getCategoryIcon(job.additional_data?.serviceCategory || job.service_category, 'lg')}
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 flex items-center justify-center">
                                <div className="p-5 bg-white/90 backdrop-blur-sm rounded-xl shadow-md">
                                  {getCategoryIcon(job.additional_data?.serviceCategory || job.service_category, 'lg')}
                                </div>
                              </div>
                            )}

                            {/* Price Badge - Top Left */}
                            <div className="absolute top-3 left-3">
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.2, delay: 0.1 }}
                                className="bg-white/95 backdrop-blur-sm text-slate-900 text-sm font-bold px-3.5 py-1.5 rounded-lg shadow-md"
                              >
                                {extractPriceOnly(job.budget)}
                              </motion.div>
                            </div>

                            {/* NEW Badge - Top Right */}
                            {isNewJob(job.created_at) && (
                              <div className="absolute top-3 right-3">
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  whileInView={{ opacity: 1, scale: 1 }}
                                  viewport={{ once: true }}
                                  transition={{ duration: 0.2, delay: 0.15 }}
                                  className="bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-md"
                                >
                                  NEW
                                </motion.div>
                              </div>
                            )}
                          </div>

                          {/* Card Content */}
                          <div className="flex-1 p-5 flex flex-col">
                            {/* Category & Time */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-1.5">
                                {getCategoryIcon(job.additional_data?.serviceCategory || job.service_category, 'sm')}
                                <span className="text-xs text-slate-600 font-semibold uppercase tracking-wide">
                                  {job.additional_data?.serviceCategory || job.service_category}
                                </span>
                              </div>
                              <span className="text-xs text-slate-500 font-medium">
                                {formatTimeAgo(job.created_at)}
                              </span>
                            </div>

                            {/* Job Title */}
                            <h3 className="text-lg font-bold text-slate-900 line-clamp-2 leading-tight mb-3 group-hover:text-emerald-600 transition-colors">
                              {job.job_title}
                            </h3>

                            {/* Location & Urgency */}
                            <div className="space-y-1.5 mb-3">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                                <span className="text-sm text-slate-700 font-medium line-clamp-1">
                                  {job.additional_data?.nuts || job.nuts || job.location}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                                  formatUrgency(job.urgency) === 'ASAP'
                                    ? 'bg-red-100 text-red-700 border border-red-200'
                                    : formatUrgency(job.urgency) === 'This week'
                                      ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                      : formatUrgency(job.urgency) === 'This month'
                                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}>
                                  {formatUrgency(job.urgency)}
                                </span>
                              </div>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed flex-1 mb-4">
                              {job.job_description}
                            </p>

                            {/* Action Button */}
                            <Button
                              variant="outline"
                              className="w-full border-2 border-slate-300 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 font-medium py-2 sm:py-2.5 rounded-lg transition-all duration-200"
                              onClick={() => navigate(`/jobs/${job.project_id}`)}
                            >
                              <Eye className="h-4 w-4 mr-2 text-slate-500 group-hover:text-emerald-600" />
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
                  <div className="flex flex-col items-center mt-12 space-y-5">
                    <div className="text-center">
                      <p className="text-sm text-gray-700 font-medium mb-3">
                        Showing {visibleJobs.length} of {allFilteredJobs.length} jobs
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-xs mx-auto shadow-inner">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-blue-500 h-2.5 rounded-full transition-all duration-300 shadow-sm"
                          style={{ width: `${(visibleJobs.length / allFilteredJobs.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <Button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 px-8 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md active:scale-[0.98]"
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
                    <div className="text-center py-8 px-10 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200/50 shadow-md">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <p className="text-gray-800 font-semibold text-lg mb-1">You've seen all available jobs!</p>
                      <p className="text-sm text-gray-600 font-medium">
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