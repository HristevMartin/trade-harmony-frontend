import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SuccessModal from "@/components/SuccessModal";
import ErrorModal from "@/components/ErrorModal";
import AuthModal from "@/components/AuthModal";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  HiShieldCheck, 
  HiMapPin, 
  HiWrenchScrewdriver, 
  HiCamera, 
  HiAdjustmentsHorizontal, 
  HiUserCircle, 
  HiCloudArrowUp, 
  HiCheckCircle,
  HiStar, 
  HiLockClosed 
} from "react-icons/hi2";
import { X } from "lucide-react";

const PostJob = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // Get country from query param and validate it exists in our mapping
    const countryParam = searchParams.get('country')?.toUpperCase() || 'GB';
    const countryCodeMap = {
        'GB': '🇬🇧 United Kingdom',
        'BG': '🇧🇬 Bulgaria',
        'DE': '🇩🇪 Germany',
        'FR': '🇫🇷 France',
        'ES': '🇪🇸 Spain',
    };
    
    // Use the country if it exists in our mapping, otherwise default to GB
    const initialCountry = countryCodeMap[countryParam as keyof typeof countryCodeMap] ? countryParam : 'GB';
    const initialPostcode = searchParams.get('postcode') || '';
    
    console.log('Query params:', { country: countryParam, postcode: initialPostcode, mappedCountry: initialCountry });
    
    // Extract city/town from postcode parameter if available
    const extractCityFromPostcode = (postcode: string, country: string) => {
        if (!postcode) return '';
        
        const pc = postcode.toUpperCase().replace(/\s/g, '');
        
        // If it's already a city name (contains letters), return as-is
        if (/^[A-Z][a-z]+/.test(postcode)) {
            return postcode;
        }
        
        // Country-specific postcode patterns
        if (country === 'GB') {
            // UK Postcode patterns
            if (pc.match(/^[ENSW][0-9]/)) return 'London';
            if (pc.startsWith('M')) return 'Manchester';
            if (pc.startsWith('B')) return 'Birmingham';
            if (pc.startsWith('LS')) return 'Leeds';
            if (pc.startsWith('S')) return 'Sheffield';
            if (pc.startsWith('L')) return 'Liverpool';
            if (pc.startsWith('NE')) return 'Newcastle';
            if (pc.startsWith('G')) return 'Glasgow';
            if (pc.startsWith('EH')) return 'Edinburgh';
            if (pc.startsWith('CF')) return 'Cardiff';
            if (pc.startsWith('BS')) return 'Bristol';
            if (pc.startsWith('LE')) return 'Leicester';
            if (pc.startsWith('CV')) return 'Coventry';
            if (pc.startsWith('NG')) return 'Nottingham';
            if (pc.startsWith('BD')) return 'Bradford';
            if (pc.startsWith('HU')) return 'Hull';
            if (pc.startsWith('ST')) return 'Stoke-on-Trent';
            if (pc.startsWith('PL')) return 'Plymouth';
            if (pc.startsWith('SO')) return 'Southampton';
            if (pc.startsWith('PO')) return 'Portsmouth';
        } else if (country === 'BG') {
            // Bulgarian cities (if numeric postcode, map to major cities)
            if (pc.startsWith('1')) return 'Sofia';
            if (pc.startsWith('4')) return 'Plovdiv';
            if (pc.startsWith('9')) return 'Varna';
            if (pc.startsWith('8')) return 'Burgas';
            if (pc.startsWith('5')) return 'Stara Zagora';
        }
        
        // If no specific match, return the postcode as entered
        return postcode;
    };
    
    const [formData, setFormData] = useState({
        country: initialCountry,
        location: extractCityFromPostcode(initialPostcode, initialCountry),
        serviceCategory: '',
        jobTitle: '',
        jobDescription: '',
        budget: '',
        urgency: '',
        firstName: '',
        email: '',
        phone: '',
        contactMethod: 'email',
        gdprConsent: false
    });

    const [uploadedImages, setUploadedImages] = useState<File[]>([]);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorModalMessage, setErrorModalMessage] = useState('');
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [pendingSubmission, setPendingSubmission] = useState(false);

    // Calculate completion progress for each step
    const getStepCompletion = () => {
        const steps = {
            1: formData.country && formData.location, // Location
            2: formData.serviceCategory && formData.jobTitle && formData.jobDescription.length >= 20, // Details
            3: uploadedImages.length > 0, // Photos
            4: formData.firstName && formData.email, // Contact
            5: formData.gdprConsent // Review/Consent
        };
        return steps;
    };

    // Auto-advance to next incomplete step
    useEffect(() => {
        const completion = getStepCompletion();
        const completedSteps = Object.entries(completion).filter(([_, completed]) => completed).length;
        const nextIncompleteStep = Math.min(completedSteps + 1, 5);
        setCurrentStep(nextIncompleteStep);
    }, [formData, uploadedImages]);

    useEffect(() => {
        setFormData(prev => ({ 
            ...prev, 
            country: initialCountry, 
            location: extractCityFromPostcode(initialPostcode, initialCountry)
        }));
    }, [initialCountry, initialPostcode]);

    // Check user role on component mount
    useEffect(() => {
        const roleCheck = checkUserRole();
        if (!roleCheck.isValid) {
            setFormErrors(prev => ({ ...prev, general: roleCheck.message }));
            // Scroll to top to make the error message visible
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, []);

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            // Limit to 5 images total
            const currentCount = uploadedImages.length;
            const remainingSlots = 5 - currentCount;
            const filesToAdd = files.slice(0, remainingSlots);
            setUploadedImages(prev => [...prev, ...filesToAdd]);
            
            // Clear the input so the same file can be selected again if needed
            e.target.value = '';
        }
    };

    const removeImage = (index: number) => {
        setUploadedImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSuccessModalClose = () => {
        setShowSuccessModal(false);
    };

    const handleViewJob = () => {
        const jobData = localStorage.getItem('jobId');
        console.log('in here the jobData is', jobData);
        if (jobData) {
            const { jobId } = JSON.parse(jobData);
            setShowSuccessModal(false);
            // Navigate with postSuccess state to show the banner
            navigate(`/jobs/${jobId}`, { state: { postSuccess: true } });
        }
    };

    const handleCreateAccount = () => {
        const jobData = localStorage.getItem('jobId');
        if (jobData) {
            const { jobId } = JSON.parse(jobData);
            setShowSuccessModal(false);
            window.location.href = `/signup?next=/jobs/${jobId}`;
        }
    };

    const handleResendEmail = async () => {
        const jobData = localStorage.getItem('jobId');
        if (jobData) {
            const { jobId } = JSON.parse(jobData);
            try {
                const response = await fetch(`/api/email/resend?jobId=${jobId}`, {
                    method: 'POST'
                });
                if (response.ok) {
                    console.log('Email resent successfully');
                    // You could show a toast notification here
                } else {
                    console.error('Failed to resend email');
                }
            } catch (error) {
                console.error('Error resending email:', error);
            }
        }
    };

    const handleErrorModalClose = () => {
        setShowErrorModal(false);
        setErrorModalMessage('');
    };

    const handleRetrySubmit = () => {
        setShowErrorModal(false);
        setErrorModalMessage('');
        // Could automatically retry the form submission here if needed
    };

    // Cleanup object URLs when component unmounts or images change
    useEffect(() => {
        return () => {
            uploadedImages.forEach(file => {
                if (file instanceof File) {
                    const url = URL.createObjectURL(file);
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [uploadedImages]);

    const validateField = (field: string, value: string | boolean) => {
        const errors: Record<string, string> = {};
        
        switch (field) {
            case 'jobTitle':
                if (!value || (value as string).length < 5) {
                    errors[field] = 'Job title must be at least 5 characters';
                } else if ((value as string).length > 120) {
                    errors[field] = 'Job title must be less than 120 characters';
                }
                break;
            case 'jobDescription':
                if (!value || (value as string).length < 20) {
                    errors[field] = 'Please provide a detailed description (minimum 20 characters)';
                }
                break;
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!value || !emailRegex.test(value as string)) {
                    errors[field] = 'Please enter a valid email address';
                }
                break;
            case 'phone':
                if (formData.contactMethod === 'phone' && (!value || (value as string).length < 10)) {
                    errors[field] = 'Phone number is required when phone contact is selected';
                }
                break;
            case 'firstName':
                if (!value || (value as string).length < 2) {
                    errors[field] = 'First name is required';
                }
                break;
            case 'urgency':
                if (!value || value === '') {
                    errors[field] = 'Please select when you need this work done';
                }
                break;
            case 'gdprConsent':
                if (!value) {
                    errors[field] = 'You must agree to the privacy policy to continue';
                }
                break;
        }
        
        setFormErrors(prev => ({ ...prev, ...errors }));
        return Object.keys(errors).length === 0;
    };

    const handleBlur = (field: string, value: string | boolean) => {
        validateField(field, value);
    };

    const API_URL = import.meta.env.VITE_API_URL;

    // Check if user is authenticated
    const isAuthenticated = () => {
        const token = localStorage.getItem('access_token');
        return !!token;
    };

    // Check if authenticated user has correct role for posting jobs
    const checkUserRole = () => {
        const token = localStorage.getItem('access_token');
        const authUser = localStorage.getItem('auth_user');
        
        if (!token || !authUser) {
            return { isValid: true, message: '' }; // Not authenticated, allow to proceed with auth modal
        }

        try {
            const userData = JSON.parse(authUser);
            const userRole = Array.isArray(userData.role) ? userData.role : [userData.role];
            if (userRole.includes('trader') || userRole.includes('TRADER')) {
                return {
                    isValid: false,
                    message: 'Traders cannot post homeowner projects. Please create a new customer account or switch to a customer account to post a job.'
                };
            }
            return { isValid: true, message: '' };
        } catch (error) {
            console.error('Error parsing user data:', error);
            // If we can't parse user data, clear it and allow to proceed
            localStorage.removeItem('auth_user');
            localStorage.removeItem('access_token');
            return { isValid: true, message: '' };
        }
    };

    // Handle authentication success
    const handleAuthSuccess = (authData: { id: string; role: string; token: string; email?: string }) => {
        console.log('Authentication successful:', authData);
        setShowAuthModal(false);
        
        // Check if the authenticated user has the correct role
        const authUserRole = Array.isArray(authData.role) ? authData.role : [authData.role];
        if (authUserRole.includes('trader') || authUserRole.includes('TRADER')) {
            setFormErrors(prev => ({ 
                ...prev, 
                general: 'Traders cannot post homeowner projects. Please create a new customer account or switch to a customer account to post a job.' 
            }));
            setPendingSubmission(false);
            // Scroll to top to make the error message visible
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        
        // If there was a pending submission, proceed with it
        if (pendingSubmission) {
            setPendingSubmission(false);
            // Call the actual job submission
            submitJobData();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Clear any previous errors
        setFormErrors({});
        
        // Validate all fields
        const fieldsToValidate = ['jobTitle', 'jobDescription', 'email', 'firstName', 'phone', 'urgency', 'gdprConsent'];
        let isValid = true;
        
        fieldsToValidate.forEach(field => {
            const value = field === 'gdprConsent' ? formData.gdprConsent : formData[field as keyof typeof formData];
            if (!validateField(field, value)) {
                isValid = false;
            }
        });
        
        if (uploadedImages.length === 0) {
            setFormErrors(prev => ({ ...prev, photos: 'At least one photo is required' }));
            isValid = false;
        }
        
        if (!isValid) {
            return;
        }

        // Check user role first (for authenticated users)
        const roleCheck = checkUserRole();
        if (!roleCheck.isValid) {
            setFormErrors(prev => ({ ...prev, general: roleCheck.message }));
            // Scroll to top to make the error message visible
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // Check if user is authenticated
        if (!isAuthenticated()) {
            // Show auth modal and mark submission as pending
            setPendingSubmission(true);
            setShowAuthModal(true);
            return;
        }

        await submitJobData();
    };

    const submitJobData = async () => {
        setIsSubmitting(true);
        
        try {
            // Create FormData for file upload
            const formDataToSend = new FormData();
            
            // Add form fields
            Object.keys(formData).forEach(key => {
                const value = formData[key as keyof typeof formData];
                if (value !== null && value !== undefined) {
                    formDataToSend.append(key, value.toString());
                }
            });
            
            // Add images
            uploadedImages.forEach((file, index) => {
                formDataToSend.append(`images`, file);
            });

            // Add userId from auth data
            const authUser = localStorage.getItem('auth_user');
            if (authUser) {
                const userData = JSON.parse(authUser);
                formDataToSend.append('userId', userData.id);
            }

            // Add auth token to headers
            const token = localStorage.getItem('access_token');
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            console.log('Sending form data:', {
                formData,
                imageCount: uploadedImages.length,
                API_URL,
                hasToken: !!token
            });

            console.log('formDataToSend', formDataToSend);
            
            const submitDataRequest = await fetch(`${API_URL}/travel/save-client-project`, {
                method: 'POST',
                headers,
                body: formDataToSend,
            });
            
            if (submitDataRequest.ok) {
                const data = await submitDataRequest.json();
                console.log('Success response:', data);
                let localStorageData = JSON.stringify({
                    jobId: data.project_id,
                })
                localStorage.setItem('jobId', localStorageData);
                setShowSuccessModal(true);
            } else {
                const errorData = await submitDataRequest.text();
                console.error('Server error:', errorData);
                
                // Try to parse error response
                try {
                    const errorJson = JSON.parse(errorData);
                    if (errorJson.errors) {
                        // If there are specific field errors, show them inline
                        setFormErrors(errorJson.errors);
                    } else {
                        // If it's a general server error, show error modal
                        setErrorModalMessage(errorJson.message || 'Server error occurred. Please try again.');
                        setShowErrorModal(true);
                    }
                } catch {
                    // If error response isn't JSON, show error modal
                    setErrorModalMessage('Server error occurred. Please try again later.');
                    setShowErrorModal(true);
                }
            }
        } catch (error) {
            console.error('Request failed:', error);
            setErrorModalMessage('Please check your connection and try again.');
            setShowErrorModal(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const steps = [
        { number: 1, title: 'Location', icon: HiMapPin },
        { number: 2, title: 'Details', icon: HiWrenchScrewdriver },
        { number: 3, title: 'Photos', icon: HiCamera },
        { number: 4, title: 'Contact', icon: HiUserCircle },
        { number: 5, title: 'Review', icon: HiCheckCircle }
    ];

    const serviceCategories = [
        'Plumbing', 'Electrical', 'Carpentry', 'Roofing', 'Painting', 
        'Gardening', 'Heating & Cooling', 'Flooring', 'Cleaning'
    ];

    return (
        <>
            <div className="min-h-screen bg-slate-50">
                <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-10">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">Post Your Job</h1>
                        <p className="text-slate-600 mb-4">
                            It's free to post. Upload photos, add details, and connect with verified tradespeople.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                            <HiLockClosed className="w-4 h-4" aria-hidden="true" />
                            <span>Your details are private. Only verified professionals see your job.</span>
                        </div>

                    </div>

                    {/* Breadcrumb Steps */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between max-w-2xl mx-auto">
                            {steps.map((step, index) => {
                                const Icon = step.icon;
                                const completion = getStepCompletion();
                                const isCompleted = completion[step.number as keyof typeof completion];
                                const isCurrent = currentStep === step.number;
                                
                                return (
                                    <div key={step.number} className="flex items-center">
                                        <div className={`flex flex-col items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                                                isCompleted 
                                                    ? 'bg-green-500 text-white' 
                                                    : isCurrent 
                                                        ? 'bg-blue-500 text-white' 
                                                        : 'bg-slate-200 text-slate-500'
                                            }`}>
                                                {isCompleted ? (
                                                    <HiCheckCircle className="w-5 h-5" />
                                                ) : (
                                                    <Icon className="w-5 h-5" />
                                                )}
                                            </div>
                                            <span className={`text-xs font-medium mt-1 ${
                                                isCompleted ? 'text-green-600' : isCurrent ? 'text-blue-600' : 'text-slate-500'
                                            }`}>
                                                {step.title}
                                            </span>
                                        </div>
                                        {index < steps.length - 1 && (
                                            <div className={`flex-1 h-0.5 mx-2 transition-colors ${
                                                isCompleted ? 'bg-green-500' : 'bg-slate-200'
                                            }`} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-6">
                            <div className="w-full bg-slate-200 rounded-full h-2">
                                <div 
                                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${(Object.values(getStepCompletion()).filter(Boolean).length / 5) * 100}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-slate-500 mt-2 text-center">
                                {Object.values(getStepCompletion()).filter(Boolean).length} of 5 steps completed
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div aria-live="polite" aria-atomic="true" className="sr-only">
                            {Object.keys(formErrors).length > 0 && 
                                `Form has ${Object.keys(formErrors).length} error${Object.keys(formErrors).length > 1 ? 's' : ''}`
                            }
                        </div>
                        
                        {/* General Error Message */}
                        {formErrors.general && (
                            <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-6">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <p className="text-sm font-medium text-red-800 mb-3">
                                            {formErrors.general}
                                        </p>
                                        {formErrors.general.includes('Traders cannot post') && (
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => {
                                                        localStorage.removeItem('access_token');
                                                        localStorage.removeItem('auth_user');
                                                        setFormErrors(prev => ({ ...prev, general: '' }));
                                                        window.location.reload();
                                                    }}
                                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                >
                                                    Logout & Create Customer Account
                                                </button>
                                                <button
                                                    onClick={() => setFormErrors(prev => ({ ...prev, general: '' }))}
                                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-transparent hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                >
                                                    Dismiss
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Section 1: Job Location */}
                        <fieldset className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-5 md:p-6 mb-5 md:mb-6 transition-shadow hover:shadow-md">
                            <legend className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4 px-2">
                                <HiMapPin className="w-5 h-5 text-blue-600" aria-hidden="true" />
                                Job Location
                            </legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="country" className="text-sm font-medium text-slate-700">Country</Label>
                                    <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                                        <SelectTrigger 
                                            id="country"
                                            className="rounded-xl border-slate-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:ring-offset-0"
                                        >
                                            <SelectValue placeholder="Select country">
                                                {formData.country ? countryCodeMap[formData.country as keyof typeof countryCodeMap] : 'Select country'}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(countryCodeMap).map(([code, name]) => (
                                                <SelectItem key={code} value={code}>{name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="location" className="text-sm font-medium text-slate-700">Town/City or Postcode</Label>
                                    <Input
                                        id="location"
                                        value={formData.location}
                                        onChange={(e) => handleInputChange('location', e.target.value)}
                                        placeholder="Enter your postcode or area"
                                        className="rounded-xl border-slate-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:ring-offset-0"
                                        aria-describedby="location-help"
                                    />
                                    <p id="location-help" className="text-xs text-slate-500 mt-1">We'll use this to find local tradespeople</p>
                                </div>
                            </div>
                        </fieldset>

                        {/* Section 2: Job Details */}
                        <fieldset className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-5 md:p-6 mb-5 md:mb-6 transition-shadow hover:shadow-md">
                            <legend className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4 px-2">
                                <HiWrenchScrewdriver className="w-5 h-5 text-blue-600" aria-hidden="true" />
                                Job Details
                            </legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="serviceCategory" className="text-sm font-medium text-slate-700">Service Category</Label>
                                    <Select value={formData.serviceCategory} onValueChange={(value) => handleInputChange('serviceCategory', value)}>
                                        <SelectTrigger 
                                            id="serviceCategory"
                                            className="rounded-xl border-slate-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:ring-offset-0"
                                        >
                                            <SelectValue placeholder="Select a service" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {serviceCategories.map((category) => (
                                                <SelectItem key={category} value={category}>{category}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="jobTitle" className="text-sm font-medium text-slate-700">Job Title</Label>
                                        <span className="text-xs text-slate-500">{formData.jobTitle.length}/120</span>
                                    </div>
                                    <Input
                                        id="jobTitle"
                                        value={formData.jobTitle}
                                        onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                                        onBlur={(e) => handleBlur('jobTitle', e.target.value)}
                                        placeholder="e.g., Fix leaking pipe"
                                        maxLength={120}
                                        className={`rounded-xl border-slate-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:ring-offset-0 ${
                                            formErrors.jobTitle ? 'ring-1 ring-red-300 bg-red-50 border-red-300' : ''
                                        }`}
                                        aria-invalid={!!formErrors.jobTitle}
                                        aria-describedby={formErrors.jobTitle ? 'jobTitle-error' : 'jobTitle-help'}
                                    />
                                    {formErrors.jobTitle ? (
                                        <p id="jobTitle-error" className="text-xs text-red-600 mt-1">{formErrors.jobTitle}</p>
                                    ) : (
                                        <p id="jobTitle-help" className="text-xs text-slate-500 mt-1">Brief summary of what you need</p>
                                    )}
                                </div>
                                <div className="md:col-span-2">
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="jobDescription" className="text-sm font-medium text-slate-700">Job Description</Label>
                                        <span className="text-xs text-slate-500">{formData.jobDescription.length} characters</span>
                                    </div>
                                    <Textarea
                                        id="jobDescription"
                                        value={formData.jobDescription}
                                        onChange={(e) => {
                                            handleInputChange('jobDescription', e.target.value);
                                            // Auto-resize
                                            e.target.style.height = 'auto';
                                            e.target.style.height = e.target.scrollHeight + 'px';
                                            // Clear error if description becomes valid
                                            if (e.target.value.length >= 20 && formErrors.jobDescription) {
                                                setFormErrors(prev => {
                                                    const newErrors = { ...prev };
                                                    delete newErrors.jobDescription;
                                                    return newErrors;
                                                });
                                            }
                                        }}
                                        onBlur={(e) => handleBlur('jobDescription', e.target.value)}
                                        placeholder="Describe the problem and when you need it done"
                                        className={`min-h-[120px] rounded-xl border-slate-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:ring-offset-0 resize-none overflow-hidden ${
                                            formErrors.jobDescription ? 'ring-1 ring-red-300 bg-red-50 border-red-300' : ''
                                        }`}
                                        aria-invalid={!!formErrors.jobDescription}
                                        aria-describedby={formErrors.jobDescription ? 'jobDescription-error' : 'jobDescription-help'}
                                    />
                                    {formErrors.jobDescription ? (
                                        <p id="jobDescription-error" className="text-xs text-red-600 mt-1">{formErrors.jobDescription}</p>
                                    ) : (
                                        <div>
                                            <p id="jobDescription-help" className="text-xs text-slate-500 mt-1">Be as detailed as possible to get accurate quotes</p>
                                            <div className="text-xs text-slate-400 mt-2 space-y-1">
                                                <p>Examples:</p>
                                                <p>"• Kitchen tap is dripping constantly and won't turn off properly"</p>
                                                <p>"• Need 3 ceiling lights installed in living room, have the fixtures"</p>
                                                <p>"• Fence panel blown down in storm, need replacement and fitting"</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </fieldset>

                        {/* Section 3: Photo Upload */}
                        <fieldset className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-5 md:p-6 mb-5 md:mb-6 transition-shadow hover:shadow-md">
                            <legend className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4 px-2">
                                <HiCamera className="w-5 h-5 text-blue-600" aria-hidden="true" />
                                Photos (Required)
                            </legend>
                            <div className={`border-2 border-dashed rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors p-6 text-center border-slate-300 ${
                                uploadedImages.length >= 5 ? 'opacity-50 pointer-events-none' : ''
                            }`}>
                                <HiCloudArrowUp className="text-3xl text-slate-400 mb-2 mx-auto" aria-hidden="true" />
                                <p className="text-lg font-medium mb-2 text-slate-900">Upload photos of your job</p>
                                <p className="text-sm text-slate-600 mb-4">
                                    {uploadedImages.length >= 5 
                                        ? 'Maximum 5 photos reached' 
                                        : `Upload at least 1 photo (${uploadedImages.length}/5)`
                                    }
                                </p>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    id="photo-upload"
                                    disabled={uploadedImages.length >= 5}
                                />
                                <label 
                                    htmlFor="photo-upload" 
                                    className={`inline-flex items-center px-4 py-2 rounded-lg bg-white ring-1 ring-slate-200 hover:bg-slate-50 text-slate-700 font-medium transition-colors ${
                                        uploadedImages.length >= 5 
                                            ? 'cursor-not-allowed opacity-50' 
                                            : 'cursor-pointer'
                                    }`}
                                >
                                    {uploadedImages.length >= 5 ? 'Limit reached' : 'Choose photos'}
                                </label>
                            </div>
                            
                            {uploadedImages.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-sm font-medium mb-2 text-slate-700">Uploaded Images ({uploadedImages.length}/5):</p>
                                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                        {uploadedImages.map((file, index) => {
                                            const imageUrl = URL.createObjectURL(file);
                                            return (
                                                <div key={index} className="relative aspect-square overflow-hidden rounded-xl ring-1 ring-slate-200 bg-slate-50">
                                                    <img
                                                        src={imageUrl}
                                                        alt={`Upload preview ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                        onLoad={() => {
                                                            // Clean up the object URL after the image loads
                                                            // We'll do this in a cleanup effect instead
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="absolute -top-1 -right-1 bg-white/90 shadow rounded-full p-1 hover:bg-white transition-colors z-10"
                                                        aria-label={`Remove ${file.name}`}
                                                    >
                                                        <X className="w-3 h-3 text-slate-600" />
                                                    </button>
                                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                                        <p className="text-white text-xs truncate">{file.name}</p>
                                                        <p className="text-white/80 text-xs">{(file.size / 1024 / 1024).toFixed(1)}MB</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            
                            {formErrors.photos && (
                                <p className="text-xs text-red-600 mt-2">{formErrors.photos}</p>
                            )}
                        </fieldset>

                        {/* Section 4: Optional Details */}
                        <fieldset className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-5 md:p-6 mb-5 md:mb-6 transition-shadow hover:shadow-md">
                            <legend className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4 px-2">
                                <HiAdjustmentsHorizontal className="w-5 h-5 text-blue-600" aria-hidden="true" />
                                Optional Details
                            </legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="budget" className="text-sm font-medium text-slate-700">Budget Range</Label>
                                    <Select value={formData.budget} onValueChange={(value) => handleInputChange('budget', value)}>
                                        <SelectTrigger className="rounded-xl border-slate-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
                                            <SelectValue placeholder="Select budget range" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="flexible">Flexible</SelectItem>
                                            <SelectItem value="under-200">Under £200</SelectItem>
                                            <SelectItem value="200-500">£200 - £500</SelectItem>
                                            <SelectItem value="over-500">£500+</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-slate-700 block mb-3">
                                        When do you need this done? <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="space-y-2">
                                        {[
                                            { value: 'asap', label: 'ASAP' },
                                            { value: 'this_week', label: 'Within a week' },
                                            { value: 'this_month', label: 'Within a month' },
                                            { value: 'flexible', label: 'Flexible' }
                                        ].map((option) => (
                                            <label 
                                                key={option.value}
                                                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 hover:bg-slate-50 cursor-pointer transition-colors w-full ${
                                                    formData.urgency === option.value 
                                                        ? 'bg-blue-50 border-blue-400 text-blue-700' 
                                                        : formErrors.urgency
                                                            ? 'border-red-300 bg-red-50'
                                                            : 'border-slate-300 text-slate-700'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="urgency"
                                                    value={option.value}
                                                    checked={formData.urgency === option.value}
                                                    onChange={(e) => {
                                                        handleInputChange('urgency', e.target.value);
                                                        handleBlur('urgency', e.target.value);
                                                    }}
                                                    className="sr-only"
                                                    aria-invalid={!!formErrors.urgency}
                                                    aria-describedby={formErrors.urgency ? 'urgency-error' : undefined}
                                                />
                                                <span className="text-sm font-medium">{option.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {formErrors.urgency && (
                                        <p id="urgency-error" className="text-xs text-red-600 mt-2">{formErrors.urgency}</p>
                                    )}
                                </div>
                            </div>
                        </fieldset>

                        {/* Section 5: Contact Details */}
                        <fieldset className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-5 md:p-6 mb-5 md:mb-6 transition-shadow hover:shadow-md">
                            <legend className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4 px-2">
                                <HiUserCircle className="w-5 h-5 text-blue-600" aria-hidden="true" />
                                Contact Details
                            </legend>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="firstName" className="text-sm font-medium text-slate-700">First Name</Label>
                                        <Input
                                            id="firstName"
                                            value={formData.firstName}
                                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                                            placeholder="Your first name"
                                            className="rounded-xl border-slate-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            placeholder="your@email.com"
                                            className="rounded-xl border-slate-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="phone" className="text-sm font-medium text-slate-700">Phone Number (Optional)</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        placeholder="Your phone number"
                                        className="rounded-xl border-slate-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-slate-700 block mb-3">Preferred Contact Method</Label>
                                    <div className="space-y-2">
                                        {[
                                            { value: 'email', label: 'Email' },
                                            // { value: 'phone', label: 'Phone' },
                                            // { value: 'either', label: 'Either' }
                                        ].map((option) => (
                                            <label 
                                                key={option.value}
                                                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 hover:bg-slate-50 cursor-pointer transition-colors w-full ${
                                                    formData.contactMethod === option.value 
                                                        ? 'bg-blue-50 border-blue-400 text-blue-700' 
                                                        : 'border-slate-300 text-slate-700'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="contactMethod"
                                                    value={option.value}
                                                    checked={formData.contactMethod === option.value}
                                                    onChange={(e) => handleInputChange('contactMethod', e.target.value)}
                                                    className="sr-only"
                                                />
                                                <span className="text-sm font-medium">{option.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 flex items-center gap-2">
                                    <HiLockClosed className="w-4 h-4" aria-hidden="true" />
                                    We never share your details publicly.
                                </p>
                            </div>
                        </fieldset>

                        {/* Trust Strip */}
                        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-4 mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-center gap-2 text-slate-700 text-sm">
                                    <HiCheckCircle className="w-5 h-5 text-green-600" aria-hidden="true" />
                                    <span>Free to post — no obligation to hire</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-700 text-sm">
                                    <HiShieldCheck className="w-5 h-5 text-blue-600" aria-hidden="true" />
                                    <span>Verified & insured tradespeople only</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-700 text-sm">
                                    <HiStar className="w-5 h-5 text-orange-500" aria-hidden="true" />
                                    <span>30,000+ happy customers</span>
                                </div>
                            </div>
                        </div>

                        {/* Final CTA */}
                        <div className="text-center space-y-4 mt-8 sm:block hidden md:block md:mt-0">
                            <button 
                                type="submit" 
                                className="inline-flex items-center justify-center rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-3 shadow-md hover:shadow-lg transition w-full md:w-auto md:px-12 md:py-4 md:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={uploadedImages.length === 0 || isSubmitting || showAuthModal}
                                aria-busy={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Posting Your Job...
                                    </>
                                ) : (
                                    'Post My Job'
                                )}
                            </button>
                            <p className="text-xs text-slate-500 mt-2 text-center">
                                {!isAuthenticated() 
                                    ? "You'll be asked to sign in or create an account."
                                    : "We'll notify local tradespeople right away."
                                }
                            </p>
                        </div>

                        {/* Mobile Sticky CTA */}
                        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur border-t p-3 md:hidden z-50">
                            <button 
                                type="submit" 
                                className="inline-flex items-center justify-center rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-3 shadow-md hover:shadow-lg transition w-full disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={uploadedImages.length === 0 || isSubmitting || showAuthModal}
                                aria-busy={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Posting...
                                    </>
                                ) : (
                                    'Post My Job'
                                )}
                            </button>
                        </div>

                        {/* GDPR Consent */}
                        <fieldset className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-5 md:p-6 mb-5 md:mb-6 transition-shadow hover:shadow-md">
                            <legend className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4 px-2">
                                <HiLockClosed className="w-5 h-5 text-blue-600" aria-hidden="true" />
                                Privacy & Consent
                            </legend>
                            <div className="space-y-4">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.gdprConsent}
                                        onChange={(e) => {
                                            handleInputChange('gdprConsent', e.target.checked);
                                            handleBlur('gdprConsent', e.target.checked);
                                        }}
                                        className={`mt-1 rounded border-slate-300 text-blue-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:ring-offset-0 ${
                                            formErrors.gdprConsent ? 'ring-1 ring-red-300 bg-red-50 border-red-300' : ''
                                        }`}
                                        aria-invalid={!!formErrors.gdprConsent}
                                        aria-describedby={formErrors.gdprConsent ? 'gdpr-error' : 'gdpr-help'}
                                    />
                                    <div className="text-sm">
                                        <span className="text-slate-700">
                                            I agree to the <a href="/privacy" className="text-blue-600 hover:text-blue-700 underline">Privacy Policy</a> and 
                                            <a href="/terms" className="text-blue-600 hover:text-blue-700 underline ml-1">Terms of Service</a>.
                                            I consent to my details being shared with verified tradespeople to receive quotes.
                                        </span>
                                        {formErrors.gdprConsent && (
                                            <p id="gdpr-error" className="text-red-600 mt-1">{formErrors.gdprConsent}</p>
                                        )}
                                        {!formErrors.gdprConsent && (
                                            <p id="gdpr-help" className="text-slate-500 mt-1">Required to post your job</p>
                                        )}
                                    </div>
                                </label>
                            </div>
                        </fieldset>
                    </form>
                </div>
                
                {/* Mobile spacer for fixed sticky button */}
                <div className="h-20 md:hidden" />
            </div>
            
            {/* Success Modal */}
            <SuccessModal
                isOpen={showSuccessModal}
                onClose={handleSuccessModalClose}
                title="Job Posted Successfully! 🎉"
                jobId={(() => {
                    const jobData = localStorage.getItem('jobId');
                    return jobData ? JSON.parse(jobData).jobId : undefined;
                })()}
                emailSent={true} // You can make this dynamic based on your email service
                onViewJob={handleViewJob}
                onCreateAccount={handleCreateAccount}
                onResendEmail={handleResendEmail}
            />

            {/* Error Modal */}
            <ErrorModal
                isOpen={showErrorModal}
                onClose={handleErrorModalClose}
                title="Please try again"
                message={errorModalMessage}
                actionButton={{
                    text: "Try Again",
                    onClick: handleRetrySubmit
                }}
            />

            {/* Auth Modal */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => {
                    setShowAuthModal(false);
                    setPendingSubmission(false);
                }}
                onSuccess={handleAuthSuccess}
            />
        </>
    );
};

export default PostJob;