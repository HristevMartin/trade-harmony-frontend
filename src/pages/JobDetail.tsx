import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import MobileHeader from "@/components/MobileHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PayToApplyModal from "@/components/PayToApplyModal";
import PaidUserBanner from "@/components/PaidUserBanner";
import CompetitionIndicator from "@/components/CompetitionIndicator";
import AiJobFitCard from "@/components/AiJobFitCard";
import FollowUpQuestions from "@/components/FollowUpQuestions";
import JobAssistantMiniChat from "@/components/JobAssistantMiniChat";
import { useAiJobFit } from "@/hooks/useAiJobFit";
import {
    HiMapPin,
    HiWrenchScrewdriver,
    HiCamera,
    HiUserCircle,
    HiClock,
    HiCurrencyPound,
    HiPhone,
    HiEnvelope,
    HiCalendar,
    HiArrowLeft,
    HiEye,
    HiCheckCircle,
    HiInformationCircle,
    HiHome,
    HiPencilSquare,
    HiXMark,
    HiLockClosed
} from "react-icons/hi2";
import { X } from "lucide-react";

interface JobData {
    id: string;
    project_id: string;
    first_name: string;
    email: string;
    phone: string;
    contact_method: string;
    job_title: string;
    job_description: string;
    budget: string;
    urgency: string;
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
        [key: string]: any;
    };
}

const JobDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [jobData, setJobData] = useState<JobData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [showEditSuccess, setShowEditSuccess] = useState(false);
    const [showPostSuccess, setShowPostSuccess] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [showPayToApplyModal, setShowPayToApplyModal] = useState(false);
    const [userPaid, setUserPaid] = useState(false);
    const [paymentStatusLoaded, setPaymentStatusLoaded] = useState(false);
    const [jobStats, setJobStats] = useState<{
        completed_jobs: number;
        in_progress_jobs: number;
        total_posted: number;
        total_cancelled: number;
    } | null>(null);
    const [homeOwnerVerified, setHomeOwnerVerified] = useState(false);
    const [showVerificationModal, setShowVerificationModal] = useState(false);

    // Get AI job fit data for follow-up questions
    const { followUpQuestions } = useAiJobFit(jobData?.project_id || '');

    // Handler functions for follow-up questions
    const handleFollowUpQuestion = async (question: string) => {
        if (userPaid) {
            // Post-payment: Navigate to chat with the question
            try {
                console.log('Opening chat for job:', jobData?.project_id);
                const response = await fetch(`${import.meta.env.VITE_API_URL}/travel/chat-component/get-conversation-by-id/${jobData?.project_id}`, {
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch conversation');
                }
                const data = await response.json();
                console.log('Got conversation data:', data);
                navigate(`/chat/${data.conversation.conversation_id}?message=${encodeURIComponent(question)}`);
            } catch (error) {
                console.error('Error opening chat:', error);
                // Fallback: try with job ID directly
                navigate(`/chat/${jobData?.project_id}?message=${encodeURIComponent(question)}`);
            }
        } else {
            // Pre-payment: Trigger payment flow
            setShowPayToApplyModal(true);
        }
    };


    useEffect(() => {
        const request = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/travel/get-client-completed-jobs/${id}`, {
                    credentials: 'include',
                })
                if (!response.ok) {
                    console.log('Failed to fetch job stats');
                    return;
                }
                const data = await response.json();
                console.log('Job statistics:', data);
                if (data.success) {
                    setJobStats({
                        completed_jobs: data.completed_jobs || 0,
                        in_progress_jobs: data.in_progress_jobs || 0,
                        total_posted: data.total_posted || 0,
                        total_cancelled: data.total_cancelled || 0
                    });
                }
            } catch (error) {
                console.error('Error fetching job stats:', error);
            }
        }
        request();
    }, [id]);


    // Check if current user is a trader
    const isTrader = Array.isArray(user?.role)
        ? user?.role.includes('trader')
        : user?.role === 'trader';

    // Load user data from localStorage
    useEffect(() => {
        const authUser = localStorage.getItem('auth_user');
        if (authUser) {
            try {
                const userData = JSON.parse(authUser);
                setUser(userData);
            } catch (err) {
                console.error('Error parsing auth user:', err);
            }
        }
    }, []);

    useEffect(() => {
        const getCustomerApplication = async () => {
            if (!user?.id || !id) {
                setPaymentStatusLoaded(true);
                return;
            }

            try {
                const request = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/check-payment-status/${user.id}/${id}`);
                console.log('show me the request', request);

                if (!request.ok) {
                    console.log('failed the reps')
                    setPaymentStatusLoaded(true);
                    return;
                }

                const response = await request.json();
                console.log('show me if the user has paid', response);

                if (response.status === 'paid') {
                    console.log('in here the response is', response);
                    setUserPaid(true);
                }
            } catch (error) {
                console.error('Error checking payment status:', error);
            } finally {
                setPaymentStatusLoaded(true);
            }
        }

        getCustomerApplication();
    }, [user, id]);

    useEffect(() => {
        if (isTrader) {
            const makeRequest = async () => {
                let apiResponse = await fetch(`${import.meta.env.VITE_API_URL}/travel/trader-helper`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id
                    })
                })
                let data = await apiResponse.json()
                console.log('the data is', data)
            }
            makeRequest()
        }
    }, [isTrader])

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const getJobData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${import.meta.env.VITE_API_URL}/travel/get-client-project/${id}`, {
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();

                if (data.success && data.project) {
                    setJobData(data.project);
                } else {
                    setError('Job not found');
                }
            } catch (err) {
                setError('Failed to load job details');
                console.error('Error fetching job:', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            getJobData();
        }
    }, [id]);

    // Check for navigation state (edit success or post success)
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const postSuccessParam = urlParams.get('postSuccess');

        if (location.state?.editSuccess) {
            setShowEditSuccess(true);

            // Auto-hide after 5 seconds
            const timer = setTimeout(() => {
                setShowEditSuccess(false);
            }, 5000);

            // Clean up navigation state
            navigate(location.pathname, { replace: true, state: {} });

            return () => clearTimeout(timer);
        } else if (location.state?.postSuccess || postSuccessParam === 'true') {
            setShowPostSuccess(true);

            // Auto-hide after 5 seconds
            const timer = setTimeout(() => {
                setShowPostSuccess(false);
            }, 5000);

            // Clean up navigation state and URL params
            navigate(location.pathname, { replace: true, state: {} });

            return () => clearTimeout(timer);
        }
    }, [location, navigate]);


    useEffect(() => {
        const apiCall = async () => {
            let apiResponse = await fetch(`${import.meta.env.VITE_API_URL}/travel/check-verified-homeowner/${id}`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            let data = await apiResponse.json()
            if (data.status === true) {
                setHomeOwnerVerified(true)
            } else {
                setHomeOwnerVerified(false)
            }
        }
        apiCall()
    }, [id])


    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatBudget = (budget: string) => {
        const budgetMap: { [key: string]: string } = {
            'flexible': 'Flexible',
            'under-200': 'Under £200',
            '200-500': '£200 - £500',
            'over-500': '£500+'
        };
        return budgetMap[budget] || budget;
    };

    const formatUrgency = (urgency: string) => {
        const urgencyMap: { [key: string]: string } = {
            'asap': 'ASAP',
            'this_week': 'Within a week',
            'this_month': 'Within a month',
            'week': 'Within a week',
            'flexible': 'Flexible'
        };
        return urgencyMap[urgency] || urgency;
    };

    const getStatusColor = (status: string) => {
        const colors: { [key: string]: string } = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'active': 'bg-blue-100 text-blue-800',
            'completed': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getCountryFlag = (country: string) => {
        const flags: { [key: string]: string } = {
            'GB': '🇬🇧',
            'BG': '🇧🇬',
            'DE': '🇩🇪',
            'FR': '🇫🇷',
            'ES': '🇪🇸'
        };
        return flags[country] || '🌍';
    };

    // Show loading if either job data or payment status is still loading
    if (loading || (isTrader && !paymentStatusLoaded)) {
        return (
            <>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jobhub-blue mx-auto mb-4"></div>
                        <p className="text-gray-600">
                            {loading ? 'Loading job details...' : 'Checking application status...'}
                        </p>
                    </div>
                </div>
            </>
        );
    }

    if (error || !jobData) {
        return (
            <>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
                        <p className="text-gray-600 mb-6">{error || 'The job you are looking for does not exist.'}</p>
                        <Button onClick={() => navigate('/')} className="bg-jobhub-blue hover:bg-jobhub-blue/90">
                            <HiArrowLeft className="w-4 h-4 mr-2" />
                            Go Home
                        </Button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>

            <div className="min-h-screen bg-gray-50">
                {/* Edit Success Banner */}
                {showEditSuccess && (
                    <div className="bg-jobhub-successBg border-b border-emerald-200">
                        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-3 md:py-4">
                            <div className="flex items-start sm:items-center gap-3">
                                <HiCheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                                <div className="flex-1">
                                    <p className="text-emerald-800 font-medium text-sm sm:text-base leading-tight">
                                        Your job has been updated.
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowEditSuccess(false)}
                                    className="flex-shrink-0 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 p-1 h-auto"
                                >
                                    <HiXMark className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Original Success Banner (for newly posted jobs) */}
                {showPostSuccess && (
                    <div className="bg-jobhub-successBg border-b border-emerald-200">
                        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-3 md:py-4">
                            <div className="flex items-start sm:items-center gap-3">
                                <HiCheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                                <div className="flex-1">
                                    <p className="text-emerald-800 font-medium text-sm sm:text-base leading-tight">
                                        Your job has been posted! Local tradespeople will be notified shortly.
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowPostSuccess(false)}
                                    className="flex-shrink-0 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 p-1 h-auto"
                                >
                                    <HiXMark className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:gap-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate('/')}
                                    className="flex items-center justify-center gap-2 bg-white/50 hover:bg-white border-emerald-200 text-sm w-full sm:w-auto"
                                >
                                    <HiHome className="w-4 h-4" />
                                    Back to Home
                                </Button>
                            </div>
                        </div>
                    </div>
                )}



                <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-10">
                    {/* Header */}
                    <div className="mb-6 md:mb-8">
                        {/* Mobile Back Button - Above Title - Show for all users */}
                        <div className="sm:hidden mb-4">
                            <Button
                                onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/')}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2 bg-white/90 backdrop-blur-sm hover:bg-white border-slate-200 shadow-sm"
                            >
                                <HiArrowLeft className="w-4 h-4" />
                                Back
                            </Button>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-gray-900 font-semibold text-base md:text-lg tracking-tight">{jobData.first_name}</p>
                            {homeOwnerVerified ? (
                                <Badge 
                                    className="bg-jobhub-successBg text-emerald-700 border border-emerald-200 flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-medium hover:bg-emerald-100 transition-colors cursor-pointer"
                                    onClick={() => setShowVerificationModal(true)}
                                >
                                    <HiCheckCircle className="w-4 h-4" />
                                    Verified Client
                                </Badge>
                            ) : (
                                <Badge 
                                    className="bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-medium hover:bg-amber-100 transition-colors cursor-pointer"
                                    onClick={() => setShowVerificationModal(true)}
                                >
                                    <HiXMark className="w-4 h-4" />
                                    Unverified
                                </Badge>
                            )}
                        </div>

                        {/* Verification Info Message - Only for homeowners */}
                        {!isTrader && !homeOwnerVerified && (
                            <div className="mt-4 mb-4 p-4 bg-jobhub-infoBg border border-blue-200 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <HiInformationCircle className="w-4 h-4 text-jobhub-blue" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-gray-900 font-semibold mb-2 text-sm">Want to get verified?</h4>
                                        <p className="text-gray-700 text-sm leading-relaxed mb-3">
                                            Verified clients get more applications from trusted tradespeople and build stronger trust with professionals.
                                        </p>
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            className="bg-white border-jobhub-blue text-jobhub-blue hover:bg-jobhub-blue/5 text-xs font-medium"
                                        >
                                            Start Verification Process
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4">
                            {/* <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                <Button
                                    variant="outline"
                                    onClick={() => navigate(-1)}
                                    className="flex items-center gap-2 w-fit"
                                    size="sm"
                                >
                                    <HiArrowLeft className="w-4 h-4" />
                                    Back
                                </Button>
                                <Badge className={`${getStatusColor(jobData.status)} border-0 w-fit`}>
                                    {jobData.status.charAt(0).toUpperCase() + jobData.status.slice(1)}
                                </Badge>
                            </div> */}

                            {/* Edit Button - Desktop - Only show for non-traders */}
                            {!isTrader && (
                                <Button
                                    onClick={() => navigate(`/edit-job/${id}`)}
                                    className="hidden sm:flex items-center gap-2 bg-jobhub-blue hover:bg-jobhub-blue/90 w-fit"
                                    size="sm"
                                >
                                    <HiPencilSquare className="w-4 h-4" />
                                    Edit Job
                                </Button>
                            )}
                        </div>

                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-3 md:mb-4 leading-tight">
                            {jobData.job_title}
                        </h1>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-gray-600 text-sm sm:text-base mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                                    <HiMapPin className="w-3 h-3 text-gray-600" />
                                </div>
                                <span className="truncate font-medium">{getCountryFlag(jobData.additional_data.country)} {jobData.additional_data.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                                    <HiCalendar className="w-3 h-3 text-gray-600" />
                                </div>
                                <span className="truncate">Posted {formatDate(jobData.created_at)}</span>
                            </div>
                        </div>

                        {/* Job Status for Traders */}
                        {isTrader && !userPaid && paymentStatusLoaded && (
                            <div className="mt-3">
                                <Badge className="bg-jobhub-successBg text-emerald-700 border-emerald-200 px-3 py-1.5 text-sm font-medium">
                                    Job Open — Accepting Applicants
                                </Badge>
                            </div>
                        )}

                        {/* Job Statistics - For Traders */}
                        {isTrader && jobStats && (
                            <div className="mt-4">
                                <Card className="rounded-2xl bg-white shadow-sm border border-gray-200 p-4 md:p-5">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Homeowner's Job Activity</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <div className="text-center p-3 bg-white rounded-xl border-2 border-emerald-200">
                                            <div className="w-8 h-8 bg-jobhub-successBg rounded-full flex items-center justify-center mx-auto mb-2">
                                                <HiCheckCircle className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div className="text-2xl font-bold text-gray-900">{jobStats.completed_jobs}</div>
                                            <div className="text-xs text-gray-600 font-medium mt-1">Completed</div>
                                        </div>
                                        <div className="text-center p-3 bg-white rounded-xl border-2 border-blue-200">
                                            <div className="w-8 h-8 bg-jobhub-infoBg rounded-full flex items-center justify-center mx-auto mb-2">
                                                <HiClock className="w-5 h-5 text-jobhub-blue" />
                                            </div>
                                            <div className="text-2xl font-bold text-gray-900">{jobStats.in_progress_jobs}</div>
                                            <div className="text-xs text-gray-600 font-medium mt-1">Active</div>
                                        </div>
                                        <div className="text-center p-3 bg-white rounded-xl border-2 border-red-200">
                                            <div className="w-8 h-8 bg-jobhub-dangerBg rounded-full flex items-center justify-center mx-auto mb-2">
                                                <HiXMark className="w-5 h-5 text-red-600" />
                                            </div>
                                            <div className="text-2xl font-bold text-gray-900">{jobStats.total_cancelled}</div>
                                            <div className="text-xs text-gray-600 font-medium mt-1">Cancelled</div>
                                        </div>
                                        <div className="text-center p-3 bg-white rounded-xl border-2 border-gray-200">
                                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                                <HiWrenchScrewdriver className="w-5 h-5 text-gray-600" />
                                            </div>
                                            <div className="text-2xl font-bold text-gray-900">{jobStats.total_posted}</div>
                                            <div className="text-xs text-gray-600 font-medium mt-1">Total Jobs</div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-3 text-center">
                                        This shows the homeowner's job history on our platform
                                    </p>
                                </Card>
                            </div>
                        )}
                    </div>



                    {/* Apply for Job Banner - Desktop */}
                    {isTrader && !userPaid && paymentStatusLoaded && (
                        <>
                            {/* Desktop Banner */}
                            <div className="hidden md:block mb-6 md:mb-8">
                                <Card className="rounded-2xl bg-gradient-to-br from-jobhub-blue/95 to-jobhub-blue border border-jobhub-blue/20 p-6 md:p-8 shadow-lg transition-all duration-300 relative overflow-hidden">
                                    {/* Subtle decorative gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>
                                    
                                    <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                        <div className="text-white space-y-3">
                                            <h3 className="text-xl md:text-2xl font-bold leading-tight">Ready to apply for this job?</h3>
                                            <p className="text-blue-50 text-sm leading-relaxed flex items-center gap-2">
                                                <HiCheckCircle className="w-4 h-4 flex-shrink-0" />
                                                <span>We verify every job to protect your spend.</span>
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-center lg:items-end gap-2.5">
                                            <Button
                                                onClick={() => setShowPayToApplyModal(true)}
                                                className="bg-white text-jobhub-blue hover:bg-gray-50 font-bold px-8 py-4 text-lg rounded-full shadow-subtle hover:shadow-lift transition-all duration-200 min-h-[48px] whitespace-nowrap border border-white hover:scale-105"
                                                size="lg"
                                                aria-label="Apply for this job securely"
                                            >
                                                <HiLockClosed className="w-5 h-5 mr-2" />
                                                Apply for £5
                                            </Button>
                                            <p className="text-blue-100 text-xs text-center lg:text-right font-normal">
                                                Secure payment powered by Stripe
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* Mobile Sticky CTA */}
                            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-4 pb-safe shadow-lg">
                                <div className="space-y-3">
                                    <div className="text-center">
                                        <p className="text-gray-900 font-bold text-base leading-tight mb-1">Ready to apply for this job?</p>
                                        <p className="text-gray-600 text-xs mt-1.5 flex items-center justify-center gap-1.5">
                                            <HiCheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                            <span>We verify every job to protect your spend.</span>
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => setShowPayToApplyModal(true)}
                                        className="w-full bg-jobhub-blue hover:bg-jobhub-blue/90 text-white font-bold px-6 py-3.5 rounded-full shadow-subtle hover:shadow-lift transition-all duration-200 min-h-[48px] active:scale-95"
                                        aria-label="Apply for this job securely"
                                    >
                                        <HiLockClosed className="w-5 h-5 mr-2" />
                                        Apply for £5
                                    </Button>
                                    <p className="text-gray-500 text-xs text-center font-normal">
                                        Secure payment powered by Stripe
                                    </p>
                                </div>
                            </div>
                        </>
                    )}

                    {/* if user has paid already */}
                    {
                        userPaid && (
                            <PaidUserBanner
                                jobId={id || ''}
                                jobTitle={jobData.job_title}
                                homeownerInfo={{
                                    first_name: jobData.first_name,
                                    email: jobData.email,
                                    phone: jobData.phone
                                }}
                                onOpenChat={async () => {
                                    try {
                                        console.log('Opening chat for job:', id);
                                        const response = await fetch(`${import.meta.env.VITE_API_URL}/travel/chat-component/get-conversation-by-id/${id}`, {
                                            credentials: 'include',
                                            headers: {
                                                'Content-Type': 'application/json',
                                            }
                                        });
                                        if (!response.ok) {
                                            throw new Error('Failed to fetch conversation');
                                        }
                                        const data = await response.json();
                                        console.log('Got conversation data:', data);
                                        navigate(`/chat/${data.conversation.conversation_id}`);
                                    } catch (error) {
                                        console.error('Error opening chat:', error);
                                        // Fallback: navigate to chat with job ID
                                        navigate(`/chat?job_id=${id}`);
                                    }
                                }}
                            />
                        )
                    }

                    {/* AI Job Fit Card - Only for traders */}
                    {isTrader && paymentStatusLoaded && (
                        <div className="mb-6">
                            <AiJobFitCard jobId={jobData.project_id} />
                        </div>
                    )}

                    {/* Follow-up Questions - Only for traders */}
                    {isTrader && paymentStatusLoaded && followUpQuestions.length > 0 && (
                        <div className="mb-6">
                            <FollowUpQuestions
                                questions={followUpQuestions}
                                mode={userPaid ? 'postpay' : 'prepay'}
                                onQuestionClick={handleFollowUpQuestion}
                                className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-4 md:p-6"
                            />
                        </div>
                    )}


                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 pb-24 md:pb-0">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-4 md:space-y-6">
                            {/* What Happens Next Info Card */}
                            <Card className="rounded-2xl bg-jobhub-infoBg border border-blue-200 p-4 md:p-6">
                                <div className="flex items-start gap-3">
                                    <HiInformationCircle className="w-5 h-5 md:w-6 md:h-6 text-jobhub-blue flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">What happens next?</h3>
                                        <div className="space-y-1 md:space-y-2 text-xs md:text-sm text-gray-700">
                                            {isTrader ? (
                                                <>
                                                    <p>• Contact the homeowner to discuss the job</p>
                                                    <p>• Review the job requirements carefully</p>
                                                    <p>• Submit your application with a competitive quote</p>
                                                </>
                                            ) : (
                                                <>
                                                    <p>• You'll receive an email when tradespeople apply</p>
                                                    <p>• We'll keep you updated on all activity</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                            {/* Job Details */}
                            <Card className="rounded-2xl bg-white shadow-sm border border-gray-200 p-4 md:p-6">
                                <div className="flex items-center gap-2 mb-3 md:mb-4">
                                    <HiWrenchScrewdriver className="w-4 h-4 md:w-5 md:h-5 text-jobhub-blue" />
                                    <h2 className="text-base md:text-lg font-semibold text-gray-900">Job Details</h2>
                                </div>

                                <div className="space-y-3 md:space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1 text-sm md:text-base">Service Category</h3>
                                        <p className="text-gray-600 text-sm md:text-base">{jobData.additional_data.serviceCategory}</p>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1 text-sm md:text-base">Description</h3>
                                        <p className="text-gray-600 leading-relaxed text-sm md:text-base">{jobData.job_description}</p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-1 text-sm md:text-base">
                                                <HiCurrencyPound className="w-4 h-4" />
                                                Budget
                                            </h3>
                                            <p className="text-gray-600 text-sm md:text-base">{formatBudget(jobData.budget)}</p>
                                        </div>

                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-1 text-sm md:text-base">
                                                <HiClock className="w-4 h-4" />
                                                Urgency
                                            </h3>
                                            <p className="text-gray-600 text-sm md:text-base">{formatUrgency(jobData.urgency)}</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Photos */}
                            {jobData.image_urls && jobData.image_urls.length > 0 && (
                                <Card className="rounded-2xl bg-white shadow-sm border border-gray-200 p-4 md:p-6">
                                    <div className="flex items-center gap-2 mb-3 md:mb-4">
                                        <HiCamera className="w-4 h-4 md:w-5 md:h-5 text-jobhub-blue" />
                                        <h2 className="text-base md:text-lg font-semibold text-gray-900">
                                            Photos ({jobData.image_count})
                                        </h2>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-3 md:gap-4">
                                        {jobData.image_urls.map((imageUrl, index) => (
                                            <div
                                                key={index}
                                                className="relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50 cursor-pointer hover:border-jobhub-blue hover:shadow-lift transition-all"
                                                onClick={() => setSelectedImageIndex(index)}
                                            >
                                                <img
                                                    src={imageUrl}
                                                    alt={`Job photo ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            )}
                        </div>


                        {/* Sidebar */}
                        <div className="space-y-4 md:space-y-6">
                            {/* Contact Information - Hidden for traders */}
                            {!isTrader && (
                                <Card className="rounded-2xl bg-white shadow-sm border border-gray-200 p-4 md:p-6">
                                    <div className="flex items-center gap-2 mb-3 md:mb-4">
                                        <HiUserCircle className="w-4 h-4 md:w-5 md:h-5 text-jobhub-blue" />
                                        <h2 className="text-base md:text-lg font-semibold text-gray-900">Contact Information</h2>
                                    </div>

                                    <div className="space-y-3 md:space-y-4">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-1 text-sm md:text-base">Name</h3>
                                            <p className="text-gray-600 text-sm md:text-base">{jobData.first_name}</p>
                                        </div>

                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-1 text-sm md:text-base">
                                                <HiEnvelope className="w-4 h-4" />
                                                Email
                                            </h3>
                                            <p className="text-gray-600 text-sm md:text-base break-all">{jobData.email}</p>
                                        </div>

                                        {jobData.phone && (
                                            <div>
                                                <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-1 text-sm md:text-base">
                                                    <HiPhone className="w-4 h-4" />
                                                    Phone
                                                </h3>
                                                <p className="text-gray-600 text-sm md:text-base">{jobData.phone}</p>
                                            </div>
                                        )}

                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-1 text-sm md:text-base">Preferred Contact</h3>
                                            <p className="text-gray-600 capitalize text-sm md:text-base">{jobData.contact_method}</p>
                                        </div>
                                    </div>
                                </Card>
                            )}

                            {/* Location */}
                            <Card className="rounded-2xl bg-white shadow-sm border border-gray-200 p-4 md:p-6">
                                <div className="flex items-center gap-2 mb-3 md:mb-4">
                                    <HiMapPin className="w-4 h-4 md:w-5 md:h-5 text-jobhub-blue" />
                                    <h2 className="text-base md:text-lg font-semibold text-gray-900">Location</h2>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-gray-600 text-sm md:text-base">
                                        {getCountryFlag(jobData.additional_data.country)} {jobData.additional_data.location}
                                    </p>
                                    {jobData.additional_data.postcode && (
                                        <p className="text-gray-600 text-sm md:text-base font-medium">
                                            {jobData.additional_data.postcode}
                                        </p>
                                    )}
                                    <p className="text-xs md:text-sm text-gray-500">
                                        Country: {jobData.additional_data.country}
                                    </p>
                                </div>
                            </Card>

                            {/* Job Meta */}
                            <Card className="rounded-2xl bg-white shadow-sm border border-gray-200 p-4 md:p-6">
                                <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Job Information</h2>

                                <div className="space-y-3 text-xs md:text-sm">
                                    <div className="flex justify-between items-start">
                                        <span className="text-gray-500 flex-shrink-0">Created:</span>
                                        <span className="text-gray-900 text-right ml-2">{formatDate(jobData.created_at)}</span>
                                    </div>
                                    <div className="flex justify-between items-start">
                                        <span className="text-gray-500 flex-shrink-0">Updated:</span>
                                        <span className="text-gray-900 text-right ml-2">{formatDate(jobData.updated_at)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Status:</span>
                                        <Badge className={`${getStatusColor(jobData.status)} border-0 text-xs`}>
                                            {jobData.status.charAt(0).toUpperCase() + jobData.status.slice(1)}
                                        </Badge>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Modal */}
            {selectedImageIndex !== null && jobData.image_urls && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black bg-opacity-75 backdrop-blur-sm"
                    onClick={() => setSelectedImageIndex(null)}
                >
                    <div className="relative max-w-4xl max-h-[95vh] sm:max-h-[90vh] w-full">
                        <img
                            src={jobData.image_urls[selectedImageIndex]}
                            alt={`Job photo ${selectedImageIndex + 1}`}
                            className="w-full h-full object-contain rounded-lg sm:rounded-xl"
                        />
                        <button
                            onClick={() => setSelectedImageIndex(null)}
                            className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/90 hover:bg-white text-slate-700 rounded-full p-1.5 sm:p-2 transition-colors"
                        >
                            <X className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>

                        {jobData.image_urls.length > 1 && (
                            <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5 sm:gap-2">
                                {jobData.image_urls.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedImageIndex(index);
                                        }}
                                        className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-colors ${index === selectedImageIndex ? 'bg-white' : 'bg-white/50'
                                            }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Mobile Sticky Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 sm:hidden"
                style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}>
                {isTrader && !userPaid && paymentStatusLoaded && (
                    <div className="space-y-3">
                        <div className="text-center">
                            <p className="text-gray-900 font-bold text-base leading-tight mb-1">Ready to apply for this job?</p>
                            <p className="text-gray-600 text-xs mt-1.5 flex items-center justify-center gap-1.5">
                                <HiCheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                <span>We verify every job to protect your spend.</span>
                            </p>
                        </div>
                        <Button
                            onClick={() => setShowPayToApplyModal(true)}
                            className="w-full bg-jobhub-blue hover:bg-jobhub-blue/90 text-white font-bold px-6 py-3.5 rounded-full shadow-subtle hover:shadow-lift transition-all duration-200 min-h-[48px] active:scale-95"
                            aria-label="Apply for this job securely"
                        >
                            <HiLockClosed className="w-5 h-5 mr-2" />
                            Apply for £5
                        </Button>
                        <p className="text-gray-500 text-xs text-center font-normal">
                            Secure payment powered by Stripe
                        </p>
                    </div>
                )}


                {!isTrader && (
                    <Button
                        onClick={() => navigate(`/edit-job/${id}`)}
                        className="w-full bg-jobhub-blue hover:bg-jobhub-blue/90 flex items-center justify-center gap-2 min-h-[44px]"
                    >
                        <HiPencilSquare className="w-4 h-4" />
                        Edit Job
                    </Button>
                )}
            </div>

            {/* Pay to Apply Modal */}
            <PayToApplyModal
                isOpen={showPayToApplyModal}
                onClose={() => setShowPayToApplyModal(false)}
                jobTitle={jobData.job_title}
                jobId={id || ''}
                homeownerInfo={{
                    first_name: jobData.first_name,
                    email: jobData.email,
                    phone: jobData.phone
                }}
            />

            {/* Verification Modal */}
            {showVerificationModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        {homeOwnerVerified ? (
                            <>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-jobhub-successBg rounded-full flex items-center justify-center">
                                        <HiCheckCircle className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Verified Client</h3>
                                </div>
                                
                                <div className="space-y-3 mb-6">
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        This homeowner has been internally verified by JobHub. Their identity and activity have been confirmed through our verification process.
                                    </p>
                                    <div className="bg-jobhub-successBg border border-emerald-200 rounded-lg p-3">
                                        <div className="flex items-start gap-2">
                                            <HiCheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                            <div className="text-xs text-emerald-800">
                                                <p className="font-medium mb-1">Verification includes:</p>
                                                <ul className="space-y-1 text-xs">
                                                    <li>• Identity confirmation</li>
                                                    <li>• Activity validation</li>
                                                    <li>• Platform compliance check</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <Button
                                    onClick={() => setShowVerificationModal(false)}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    Got it
                                </Button>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                                        <HiXMark className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Unverified Client</h3>
                                </div>
                                
                                <div className="space-y-3 mb-6">
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        This homeowner has not been verified by JobHub yet. Their identity and activity have not been confirmed through our verification process.
                                    </p>
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                        <div className="flex items-start gap-2">
                                            <HiXMark className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                            <div className="text-xs text-amber-800">
                                                <p className="font-medium mb-1">Verification pending:</p>
                                                <ul className="space-y-1 text-xs">
                                                    <li>• Identity confirmation</li>
                                                    <li>• Activity validation</li>
                                                    <li>• Platform compliance check</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <Button
                                    onClick={() => setShowVerificationModal(false)}
                                    className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                                >
                                    Got it
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Job Assistant Mini Chat */}
            {jobData && !isTrader && (
                <JobAssistantMiniChat
                    jobId={id || ''}
                    title={jobData.job_title}
                    postcode={jobData.additional_data.location}
                    serviceCategory={jobData.additional_data.serviceCategory}
                />
            )}
        </>
    );
};

export default JobDetail;