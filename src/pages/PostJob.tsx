import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SuccessModal from "@/components/SuccessModal";
import ErrorModal from "@/components/ErrorModal";
import AuthModal from "@/components/AuthModal";
import MobileHeader from "@/components/MobileHeader";
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
import { X, Sparkles } from "lucide-react";
import UKLocationInput from "@/components/UKLocationInput";
import type { JobDraft } from "@/lib/ai/placeholders";
import { Alert, AlertDescription } from "@/components/ui/alert";

const PostJob = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // Get country from query param and validate it exists in our mapping
    const countryParam = searchParams.get('country')?.toUpperCase() || 'GB';
    const countryCodeMap = {
        'GB': '🇬🇧 United Kingdom',
    };
    
    // Service categories array
    const serviceCategories = [
        'Plumbing', 'Electrical', 'Carpentry', 'Roofing', 'Painting', 
        'Gardening', 'Heating & Cooling', 'Flooring', 'Cleaning', 'Removals', 'Handyman', 'Mechanic'
    ];
    
    // Use the country if it exists in our mapping, otherwise default to GB
    const initialCountry = countryCodeMap[countryParam as keyof typeof countryCodeMap] ? countryParam : 'GB';
    const initialPostcode = searchParams.get('postcode') || '';
    
    // Get category from query param and find the exact match from serviceCategories
    const categoryParam = searchParams.get('category') || '';
    
    // Find exact category match (case-insensitive)
    const initialCategory = categoryParam 
        ? serviceCategories.find(cat => cat.toLowerCase() === categoryParam.toLowerCase()) || ''
        : '';
    
    // Generate initial job title based on category
    const generateJobTitleFromCategory = (category: string) => {
        if (!category) return '';
        
        const categoryTitles: Record<string, string> = {
            'plumbing': 'Plumbing repair needed',
            'electrical': 'Electrical work required',
            'carpentry': 'Carpentry work needed',
            'roofing': 'Roofing repair required',
            'painting': 'Painting work needed',
            'gardening': 'Garden maintenance required',
            'heating & cooling': 'Heating and cooling repair needed',
            'flooring': 'Flooring installation needed',
            'cleaning': 'Cleaning service required',
            'removals': 'Moving and removal service needed',
            'handyman': 'Handyman services required',
            'mechanic': 'Mechanic services needed'
        };
        
        return categoryTitles[category.toLowerCase()] || `${category} work needed`;
    };
    
    const initialJobTitle = initialCategory ? generateJobTitleFromCategory(initialCategory) : '';
    
    console.log('Query params:', { country: countryParam, postcode: initialPostcode, mappedCountry: initialCountry, category: categoryParam, matchedCategory: initialCategory, generatedTitle: initialJobTitle });
    
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
        postcode: initialPostcode,
        area: '',
        location: '',
        serviceCategory: initialCategory,
        jobTitle: initialJobTitle,
        jobDescription: '',
        budget: '',
        customBudget: '',
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
    const [isAiGenerating, setIsAiGenerating] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState('');
    const [showAiSuggestion, setShowAiSuggestion] = useState(false);
    const [showAiBriefInput, setShowAiBriefInput] = useState(false);
    const [aiBrief, setAiBrief] = useState('');
    const [aiResponse, setAiResponse] = useState<{title: string, description: string, service_category?: string} | null>(null);
    const [aiError, setAiError] = useState('');
    const [isDraftApplied, setIsDraftApplied] = useState(false);

    // Calculate completion progress for each step
    const getStepCompletion = () => {
        const locationComplete = formData.country === 'GB' 
            ? (formData.postcode && formData.postcode.trim() !== '' && formData.area && formData.area.trim() !== '')
            : (formData.location && formData.location.trim() !== '');
            
        const steps = {
            1: formData.country && locationComplete, // Location
            2: formData.serviceCategory && formData.jobTitle && formData.jobDescription.length >= 20, // Details
            3: true, // Photos (optional)
            4: formData.firstName && formData.email && formData.phone, // Contact
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
        const newJobTitle = initialCategory ? generateJobTitleFromCategory(initialCategory) : '';
        setFormData(prev => ({ 
            ...prev, 
            country: initialCountry, 
            postcode: initialPostcode,
            area: '',
            serviceCategory: initialCategory,
            jobTitle: newJobTitle
        }));
    }, [initialCountry, initialPostcode, initialCategory]);

    // Handle AI draft from query params
    useEffect(() => {
        const draftParam = searchParams.get('draft');
        if (draftParam && !isDraftApplied) {
            try {
                const draft: JobDraft = JSON.parse(decodeURIComponent(draftParam));
                
                // Map the draft urgency to our form urgency options
                const urgencyMap: Record<string, string> = {
                    'urgent': 'immediate',
                    'flexible': 'flexible',
                    'planned': 'next-month'
                };
                
                // Find matching service category
                const matchedCategory = serviceCategories.find(
                    cat => cat.toLowerCase() === draft.categoryLabel.toLowerCase()
                ) || draft.categoryLabel;
                
                setFormData(prev => ({
                    ...prev,
                    serviceCategory: matchedCategory,
                    jobTitle: draft.title,
                    jobDescription: draft.description,
                    urgency: urgencyMap[draft.urgency] || 'flexible',
                    budget: draft.suggestedBudget?.min && draft.suggestedBudget?.max 
                        ? `${draft.suggestedBudget.min}-${draft.suggestedBudget.max}` 
                        : ''
                }));
                
                setIsDraftApplied(true);
                
                // Scroll to top to show the AI draft banner
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } catch (error) {
                console.error('Error parsing draft:', error);
            }
        }
    }, [searchParams, isDraftApplied]);

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

    const validateField = (field: string, value: string | boolean, returnError: boolean = false): boolean | string => {
        const errors: Record<string, string> = {};
        
        switch (field) {
            case 'jobTitle':
                if (!value || (value as string).length < 5) {
                    errors[field] = 'Job title is required (minimum 5 characters)';
                } else if ((value as string).length > 120) {
                    errors[field] = 'Job title must be less than 120 characters';
                }
                break;
            case 'jobDescription':
                if (!value || (value as string).length < 20) {
                    errors[field] = 'Job description is required (minimum 20 characters)';
                }
                break;
            case 'serviceCategory':
                if (!value || value === '') {
                    errors[field] = 'Service category is required';
                }
                break;
            case 'budget':
                if (!value || value === '') {
                    errors[field] = 'Budget range is required';
                }
                // Don't validate custom budget here - it will be validated separately in customBudget case
                break;
            case 'customBudget':
                if (formData.budget === 'custom') {
                    const stringValue = value as string;
                    if (!stringValue || stringValue.trim() === '') {
                        errors[field] = 'Custom budget amount is required';
                    } else {
                        // Validate that it's a valid number
                        const numValue = parseFloat(stringValue.replace(/[^\d.]/g, ''));
                        if (isNaN(numValue) || numValue <= 0) {
                            errors[field] = 'Please enter a valid budget amount';
                        } else if (numValue > 100000) {
                            errors[field] = 'Budget amount seems too high. Please contact us for large projects.';
                        }
                    }
                }
                break;
            case 'area':
                if (formData.country === 'GB') {
                    if (!value || (value as string).trim() === '') {
                        errors[field] = 'Area/Town is required';
                    }
                }
                break;
            case 'location':
                if (formData.country !== 'GB') {
                    if (!value || (value as string).trim() === '') {
                        errors[field] = 'Location is required';
                    }
                }
                break;
            case 'postcode':
                // Only validate postcode if country is GB and location is London
                if (formData.country === 'GB' && formData.area === 'London') {
                    if (!value || (value as string).trim() === '') {
                        errors[field] = 'Postcode is required for London';
                    } else {
                        const ukPostcodeRegex = /^[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}$/i;
                        if (!ukPostcodeRegex.test((value as string).trim())) {
                            errors[field] = 'Please enter a valid UK postcode (e.g., SW1A 1AA)';
                        }
                    }
                }
                break;
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!value || !emailRegex.test(value as string)) {
                    errors[field] = 'Please enter a valid email address';
                }
                break;
            case 'phone':
                if (!value || (value as string).length < 10) {
                    errors[field] = 'Phone number is required (minimum 10 digits)';
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
        
        if (returnError) {
            return errors[field] || '';
        }
        
        setFormErrors(prev => ({ ...prev, ...errors }));
        return Object.keys(errors).length === 0;
    };

    const handleBlur = (field: string, value: string | boolean) => {
        validateField(field, value);
    };

    const handleAiGeneration = () => {
        setShowAiBriefInput(true);
        setShowAiSuggestion(false);
        setAiError('');
        setAiResponse(null);
        
        // Scroll to the AI input section after a brief delay to ensure it's rendered
        setTimeout(() => {
            const aiSection = document.getElementById('ai-brief-section');
            if (aiSection) {
                aiSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }, 100);
    };

    const handleAiBriefSubmit = async () => {
        if (!aiBrief.trim()) {
            setAiError('Please enter a brief description of your job');
            return;
        }

        setIsAiGenerating(true);
        setAiError('');
        
        try {
            // Enhance the brief with service category context
            const enhancedBrief = formData.serviceCategory 
                ? `${formData.serviceCategory} service needed: ${aiBrief.trim()}`
                : aiBrief.trim();

            const response = await fetch(`${API_URL}/travel/ai-helper`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    brief: enhancedBrief,
                    service_category: formData.serviceCategory || undefined
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setAiResponse(data);
                setShowAiSuggestion(true);
                setShowAiBriefInput(false);
                
                // Scroll to the AI suggestion section after a brief delay
                setTimeout(() => {
                    const suggestionSection = document.getElementById('ai-suggestion-section');
                    if (suggestionSection) {
                        suggestionSection.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });
                    }
                }, 300);
            } else if (response.status === 429) {
                setAiError('AI service is currently busy. Please try again in a moment.');
            } else {
                const errorData = await response.json().catch(() => ({}));
                setAiError(errorData.message || 'Failed to generate suggestions. Please try again.');
            }
        } catch (error) {
            console.error('AI generation error:', error);
            setAiError('Connection error. Please check your internet and try again.');
        } finally {
            setIsAiGenerating(false);
        }
    };

    const handleAcceptSuggestion = () => {
        if (aiResponse) {
            handleInputChange('jobTitle', aiResponse.title);
            handleInputChange('jobDescription', aiResponse.description);
            
            // Update service category if AI suggested one and it's valid
            if (aiResponse.service_category && serviceCategories.includes(aiResponse.service_category)) {
                handleInputChange('serviceCategory', aiResponse.service_category);
            }
        }
        setShowAiSuggestion(false);
        setShowAiBriefInput(false);
        setAiBrief('');
        
        // Clear any form errors
        if (formErrors.jobDescription || formErrors.jobTitle || formErrors.serviceCategory) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.jobDescription;
                delete newErrors.jobTitle;
                delete newErrors.serviceCategory;
                return newErrors;
            });
        }
    };

    const handleEditSuggestion = () => {
        if (aiResponse) {
            handleInputChange('jobTitle', aiResponse.title);
            handleInputChange('jobDescription', aiResponse.description);
            
            // Update service category if AI suggested one and it's valid
            if (aiResponse.service_category && serviceCategories.includes(aiResponse.service_category)) {
                handleInputChange('serviceCategory', aiResponse.service_category);
            }
        }
        setShowAiSuggestion(false);
        setShowAiBriefInput(false);
        setAiBrief('');
        
        // Focus the textarea for editing
        setTimeout(() => {
            const textarea = document.getElementById('jobDescription') as HTMLTextAreaElement;
            if (textarea) {
                textarea.focus();
                // Move cursor to end
                textarea.setSelectionRange(textarea.value.length, textarea.value.length);
            }
        }, 100);
    };

    const handleRegenerateSuggestion = () => {
        setShowAiBriefInput(true);
        setShowAiSuggestion(false);
        setAiError('');
        
        // Scroll to the AI input section after a brief delay
        setTimeout(() => {
            const aiSection = document.getElementById('ai-brief-section');
            if (aiSection) {
                aiSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
                
                // Focus the textarea for immediate editing
                setTimeout(() => {
                    const textarea = aiSection.querySelector('textarea');
                    if (textarea) {
                        textarea.focus();
                    }
                }, 300);
            }
        }, 100);
    };

    const handleCloseBriefInput = () => {
        setShowAiBriefInput(false);
        setAiBrief('');
        setAiError('');
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

    // Scroll to the first error field
    const scrollToFirstError = (errors: Record<string, string> = formErrors) => {
        // Use setTimeout to ensure the errors are set in the DOM first
        setTimeout(() => {
            // Define the order of fields to check (in the order they appear on the form)
            const fieldOrder = [
                'postcode', 'area', 'location', 'serviceCategory', 'jobTitle', 'jobDescription', 
                'budget', 'customBudget', 'urgency', 'firstName', 'email', 'phone', 'gdprConsent'
            ];
            
            // Find the first field with an error
            for (const field of fieldOrder) {
                if (errors[field]) {
                    const element = document.getElementById(field);
                    
                    if (element) {
                        // Scroll to the element with some offset for better visibility
                        const elementRect = element.getBoundingClientRect();
                        const absoluteElementTop = elementRect.top + window.pageYOffset;
                        const offset = 100; // Offset from top of viewport
                        
                        window.scrollTo({
                            top: absoluteElementTop - offset,
                            behavior: 'smooth'
                        });
                        
                        // Focus the element for better accessibility
                        element.focus();
                        break;
                    }
                }
            }
        }, 100);
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
        // Only include postcode validation if country is GB AND location is London
        const baseFields = ['serviceCategory', 'jobTitle', 'jobDescription', 'budget', 'customBudget', 'email', 'firstName', 'phone', 'urgency', 'gdprConsent'];
        const fieldsToValidate = formData.country === 'GB' 
            ? (formData.area === 'London' 
                ? ['postcode', 'area', ...baseFields]
                : ['area', ...baseFields])
            : ['location', ...baseFields];
        let isValid = true;
        
        const currentErrors: Record<string, string> = {};
        
        fieldsToValidate.forEach(field => {
            const value = field === 'gdprConsent' ? formData.gdprConsent : formData[field as keyof typeof formData];
            
            const errorMessage = validateField(field, value, true) as string;
            if (errorMessage) {
                isValid = false;
                currentErrors[field] = errorMessage;
            }
            // Also run normal validation to set form errors
            validateField(field, value);
        });
        
        // Special validation for custom budget
        if (formData.budget === 'custom' && (!formData.customBudget || formData.customBudget.trim() === '')) {
            setFormErrors(prev => ({ ...prev, budget: 'Please enter your custom budget amount' }));
            currentErrors.budget = 'Please enter your custom budget amount';
            isValid = false;
        }
        
        if (!isValid) {
            console.log('VALIDATION FAILED - Current errors:', currentErrors);
            console.log('Form data at time of validation:', formData);
            // Scroll to the first error field using current errors
            setTimeout(() => scrollToFirstError(currentErrors), 50);
            return;
        }
        
        console.log('VALIDATION PASSED - Form is valid, proceeding...');

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
            
            // Add form fields with special handling for budget
            Object.keys(formData).forEach(key => {
                const value = formData[key as keyof typeof formData];
                if (value !== null && value !== undefined) {
                    // Handle budget field specially
                    if (key === 'budget') {
                        if (value === 'custom' && formData.customBudget) {
                            // Send the custom budget amount as the budget value
                            formDataToSend.append('budget', `Custom: £${formData.customBudget}`);
                            formDataToSend.append('budgetType', 'custom');
                            formDataToSend.append('budgetAmount', formData.customBudget);
                        } else {
                            formDataToSend.append(key, value.toString());
                            formDataToSend.append('budgetType', 'range');
                        }
                    } else if (key === 'customBudget') {
                        // Only send customBudget if budget is set to custom
                        if (formData.budget === 'custom') {
                            formDataToSend.append(key, value.toString());
                        }
                    } else {
                        formDataToSend.append(key, value.toString());
                    }
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
                credentials: 'include',
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

    return (
        <>
            <MobileHeader 
                title="Post Your Job"
                subtitle="Free to post - Connect with verified tradespeople"
            />
            <div className="min-h-screen bg-slate-50">
                <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-10">
                    {/* Header */}
                    <div className="text-center mb-8 sm:block hidden">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-4">Post Your Job</h1>
                        <p className="text-slate-600 mb-4">
                            It's free to post. Upload photos, add details, and connect with verified tradespeople.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                            <HiLockClosed className="w-4 h-4" aria-hidden="true" />
                            <span>Your details are private. Only verified professionals see your job.</span>
                        </div>

                    </div>

                    {/* AI Draft Banner */}
                    {isDraftApplied && (
                        <Alert className="mb-6 border-trust-blue/20 bg-trust-blue/5">
                            <Sparkles className="h-4 w-4 text-trust-blue" />
                            <AlertDescription className="text-sm">
                                <strong>AI draft applied</strong> — Review the details below and make any changes before posting
                            </AlertDescription>
                        </Alert>
                    )}

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
                                                {/* <button
                                                    onClick={() => setFormErrors(prev => ({ ...prev, general: '' }))}
                                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-transparent hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                >
                                                    Dismiss
                                                </button> */}
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
                                    {formData.country === 'GB' ? (
                                        <UKLocationInput
                                            value={{
                                                country: formData.country,
                                                location: formData.area, // Use area field for UK
                                                postcode: formData.postcode
                                            }}
                                            onChange={(locationData) => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    area: locationData.location, // Set area field for UK
                                                    postcode: locationData.postcode
                                                }));
                                                
                                                // Clear errors when fields are updated
                                                if (locationData.location && formErrors.area) {
                                                    setFormErrors(prev => {
                                                        const newErrors = { ...prev };
                                                        delete newErrors.area;
                                                        return newErrors;
                                                    });
                                                }
                                                if (locationData.postcode && formErrors.postcode) {
                                                    setFormErrors(prev => {
                                                        const newErrors = { ...prev };
                                                        delete newErrors.postcode;
                                                        return newErrors;
                                                    });
                                                }
                                            }}
                                            errors={{
                                                location: formErrors.area, // Use area errors for UK
                                                postcode: formErrors.postcode
                                            }}
                                        />
                                    ) : (
                                        <>
                                            <Label htmlFor="location" className="text-sm font-medium text-slate-700">
                                                Town/City or Postcode <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="location"
                                                value={formData.location}
                                                onChange={(e) => handleInputChange('location', e.target.value)}
                                                onBlur={(e) => handleBlur('location', e.target.value)}
                                                placeholder="Enter your postcode or area"
                                                className={`rounded-xl border-slate-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:ring-offset-0 ${
                                                    formErrors.location ? 'ring-1 ring-red-300 bg-red-50 border-red-300' : ''
                                                }`}
                                                aria-invalid={!!formErrors.location}
                                                aria-describedby={formErrors.location ? 'location-error' : 'location-help'}
                                            />
                                            {formErrors.location ? (
                                                <p id="location-error" className="text-xs text-red-600 mt-1">{formErrors.location}</p>
                                            ) : (
                                                <p id="location-help" className="text-xs text-slate-500 mt-1">
                                                    We'll use this to find local tradespeople
                                                </p>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </fieldset>

                        {/* Section 2: Job Details */}
                        <fieldset className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-5 md:p-6 mb-5 md:mb-6 transition-shadow hover:shadow-md">
                            <legend className="text-lg font-semibold text-slate-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 px-2">
                                <div className="flex items-center gap-2">
                                    <HiWrenchScrewdriver className="w-5 h-5 text-blue-600" aria-hidden="true" />
                                    Job Details
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAiGeneration}
                                    disabled={isAiGenerating || showAiBriefInput}
                                    className={`
                                        inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm
                                        bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600
                                        transition-all duration-200 ease-in-out w-fit
                                        ${(isAiGenerating || showAiBriefInput) ? 'opacity-75 cursor-not-allowed' : 'hover:scale-105 hover:shadow-md'}
                                        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                                    `}
                                    aria-label="Generate job details with AI"
                                >
                                    <span className="text-lg">✨</span>
                                    <span className="hidden sm:inline">AI Assistant</span>
                                    <span className="sm:hidden">AI Help</span>
                                </button>
                            </legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="serviceCategory" className="text-sm font-medium text-slate-700">Service Category <span className="text-red-500">*</span></Label>
                                    <Select value={formData.serviceCategory} onValueChange={(value) => {
                                        handleInputChange('serviceCategory', value);
                                        handleBlur('serviceCategory', value);
                                    }}>
                                        <SelectTrigger 
                                            id="serviceCategory"
                                            className={`rounded-xl border-slate-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:ring-offset-0 ${
                                                formErrors.serviceCategory ? 'ring-1 ring-red-300 bg-red-50 border-red-300' : ''
                                            }`}
                                            aria-invalid={!!formErrors.serviceCategory}
                                            aria-describedby={formErrors.serviceCategory ? 'serviceCategory-error' : 'serviceCategory-help'}
                                        >
                                            <SelectValue placeholder="Select a service" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {serviceCategories.map((category) => (
                                                <SelectItem key={category} value={category}>{category}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {formErrors.serviceCategory ? (
                                        <p id="serviceCategory-error" className="text-xs text-red-600 mt-1">{formErrors.serviceCategory}</p>
                                    ) : (
                                        <p id="serviceCategory-help" className="text-xs text-slate-500 mt-1">Required - select the type of work needed</p>
                                    )}
                                </div>
                                <div>
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="jobTitle" className="text-sm font-medium text-slate-700">Job Title <span className="text-red-500">*</span></Label>
                                        <span className="text-xs text-slate-500">{formData.jobTitle.length}/120</span>
                                    </div>
                                    <Input
                                        id="jobTitle"
                                        value={formData.jobTitle}
                                        onChange={(e) => {
                                            handleInputChange('jobTitle', e.target.value);
                                            // Clear error if title becomes valid
                                            if (e.target.value.length >= 5 && formErrors.jobTitle) {
                                                setFormErrors(prev => {
                                                    const newErrors = { ...prev };
                                                    delete newErrors.jobTitle;
                                                    return newErrors;
                                                });
                                            }
                                        }}
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
                                        <p id="jobTitle-help" className="text-xs text-slate-500 mt-1">Required - brief summary of what you need</p>
                                    )}
                                </div>
                                <div className="md:col-span-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <Label htmlFor="jobDescription" className="text-sm font-medium text-slate-700">Job Description <span className="text-red-500">*</span></Label>
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
                                            <p id="jobDescription-help" className="text-xs text-slate-500 mt-1">Required - be as detailed as possible to get accurate quotes</p>
                                            <div className="text-xs text-slate-400 mt-2 space-y-1">
                                                <p>Examples:</p>
                                                <p>"• Kitchen tap is dripping constantly and won't turn off properly"</p>
                                                <p>"• Need 3 ceiling lights installed in living room, have the fixtures"</p>
                                                <p>"• Fence panel blown down in storm, need replacement and fitting"</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* AI Brief Input */}
                                    <div 
                                        id="ai-brief-section"
                                        className={`
                                            overflow-hidden transition-all duration-300 ease-in-out
                                            ${showAiBriefInput ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}
                                        `}
                                    >
                                        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4 shadow-sm">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
                                                        <span className="text-white text-sm">✨</span>
                                                    </div>
                                                    <h4 className="text-sm font-semibold text-slate-800">AI Job Assistant</h4>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleCloseBriefInput}
                                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                                    aria-label="Close AI assistant"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            
                                            <div className="mb-3">
                                                {formData.serviceCategory && (
                                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full mb-2">
                                                        <HiWrenchScrewdriver className="w-3 h-3" />
                                                        {formData.serviceCategory} Project
                                                    </div>
                                                )}
                                                <p className="text-sm text-slate-600">
                                                    {formData.serviceCategory 
                                                        ? `Tell me about your ${formData.serviceCategory.toLowerCase()} project, and I'll help you write a compelling job title and description.`
                                                        : 'Tell me briefly what work you need done, and I\'ll help you write a compelling job title and description.'
                                                    }
                                                </p>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                <Textarea
                                                    value={aiBrief}
                                                    onChange={(e) => {
                                                        setAiBrief(e.target.value);
                                                        if (aiError) setAiError('');
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                                            e.preventDefault();
                                                            if (aiBrief.trim() && !isAiGenerating) {
                                                                handleAiBriefSubmit();
                                                            }
                                                        } else if (e.key === 'Escape') {
                                                            e.preventDefault();
                                                            handleCloseBriefInput();
                                                        }
                                                    }}
                                                    placeholder={(() => {
                                                        const examples = {
                                                            'Plumbing': 'My kitchen tap is dripping and won\'t turn off properly',
                                                            'Electrical': 'Need 3 ceiling lights installed in living room',
                                                            'Carpentry': 'Custom built-in wardrobe needed for bedroom',
                                                            'Roofing': 'Roof tiles damaged in storm, need repair',
                                                            'Painting': 'Need 2 bedrooms painted, walls are currently white',
                                                            'Gardening': 'Garden overgrown, need pruning and landscaping',
                                                            'Heating & Cooling': 'Boiler not working, no hot water or heating',
                                                            'Flooring': 'Replace old carpet with laminate flooring',
                                                            'Cleaning': 'Deep clean after renovation work',
                                                            'Removals': 'Moving from 3-bed house to 2-bed flat',
                                                            'Handyman': 'Various small repairs around the house',
                                                            'Mechanic': 'Car won\'t start, need diagnostic and repair'
                                                        };
                                                        
                                                        const example = formData.serviceCategory 
                                                            ? examples[formData.serviceCategory as keyof typeof examples] || `Need help with ${formData.serviceCategory.toLowerCase()} work`
                                                            : 'My kitchen tap is dripping and won\'t turn off properly';
                                                            
                                                        return `e.g., ${example}... (Ctrl+Enter to generate, Esc to cancel)`;
                                                    })()}
                                                    className="min-h-[80px] rounded-lg border-purple-200 bg-white/80 placeholder:text-slate-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 resize-none"
                                                    disabled={isAiGenerating}
                                                />
                                                
                                                {aiError && (
                                                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                        <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                                                        </svg>
                                                        <p className="text-sm text-red-700">{aiError}</p>
                                                    </div>
                                                )}
                                                
                                                <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={handleCloseBriefInput}
                                                        disabled={isAiGenerating}
                                                        className="
                                                            inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium
                                                            text-slate-600 bg-white border border-slate-300 rounded-lg
                                                            hover:bg-slate-50 hover:border-slate-400 disabled:opacity-50
                                                            transition-all duration-200 ease-in-out
                                                            focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2
                                                            order-2 sm:order-1
                                                        "
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleAiBriefSubmit}
                                                        disabled={isAiGenerating || !aiBrief.trim()}
                                                        className="
                                                            inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium
                                                            text-white bg-gradient-to-r from-purple-500 to-blue-500
                                                            hover:from-purple-600 hover:to-blue-600 rounded-lg shadow-sm
                                                            disabled:opacity-50 disabled:cursor-not-allowed
                                                            transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-md
                                                            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                                                            order-1 sm:order-2
                                                        "
                                                    >
                                                        {isAiGenerating ? (
                                                            <>
                                                                <svg className="animate-spin h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                                Generating...
                                                            </>
                                                        ) : (
                                                            <>
                                                                ✨ Generate
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* AI Suggestion Box */}
                                    <div 
                                        id="ai-suggestion-section"
                                        className={`
                                            overflow-hidden transition-all duration-500 ease-in-out
                                            ${showAiSuggestion ? 'max-h-[600px] opacity-100 mt-4' : 'max-h-0 opacity-0'}
                                        `}
                                    >
                                        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4 shadow-sm">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
                                                        <span className="text-white text-sm">✨</span>
                                                    </div>
                                                    <h4 className="text-sm font-semibold text-slate-800">AI Suggestions</h4>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleRegenerateSuggestion}
                                                    className="text-purple-600 hover:text-purple-700 text-xs font-medium transition-colors"
                                                    aria-label="Regenerate suggestions"
                                                >
                                                    Regenerate
                                                </button>
                                            </div>
                                            
                                            {aiResponse && (
                                                <div className="space-y-3 mb-4">
                                                    {aiResponse.service_category && (
                                                        <div className="bg-white/60 border border-purple-200/50 rounded-lg p-3">
                                                            <h5 className="text-xs font-semibold text-purple-700 mb-1">Suggested Service Category:</h5>
                                                            <div className="flex items-center gap-2">
                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                                                    <HiWrenchScrewdriver className="w-3 h-3" />
                                                                    {aiResponse.service_category}
                                                                </span>
                                                                {aiResponse.service_category !== formData.serviceCategory && formData.serviceCategory && (
                                                                    <span className="text-xs text-amber-600 font-medium">
                                                                        (Different from current: {formData.serviceCategory})
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="bg-white/60 border border-purple-200/50 rounded-lg p-3">
                                                        <h5 className="text-xs font-semibold text-purple-700 mb-1">Suggested Title:</h5>
                                                        <p className="text-sm text-slate-700 font-medium">
                                                            {aiResponse.title}
                                                        </p>
                                                    </div>
                                                    <div className="bg-white/60 border border-purple-200/50 rounded-lg p-3">
                                                        <h5 className="text-xs font-semibold text-purple-700 mb-1">Suggested Description:</h5>
                                                        <p className="text-sm text-slate-700 leading-relaxed">
                                                            {aiResponse.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div className="flex flex-col sm:flex-row gap-3 sm:justify-center mt-4 border-t border-purple-200/50 pt-4">
                                                <button
                                                    type="button"
                                                    onClick={handleEditSuggestion}
                                                    className="
                                                        inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium
                                                        text-purple-700 bg-white border-2 border-purple-300 rounded-lg
                                                        hover:bg-purple-50 hover:border-purple-400 hover:shadow-md
                                                        transition-all duration-200 ease-in-out transform hover:scale-105
                                                        focus:outline-none focus:ring-3 focus:ring-purple-500 focus:ring-offset-2
                                                        flex-1 sm:flex-none sm:min-w-[140px]
                                                    "
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Use & Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleAcceptSuggestion}
                                                    className="
                                                        inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium
                                                        text-white bg-gradient-to-r from-purple-500 to-blue-500
                                                        hover:from-purple-600 hover:to-blue-600 rounded-lg shadow-lg
                                                        transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-xl
                                                        focus:outline-none focus:ring-3 focus:ring-purple-500 focus:ring-offset-2
                                                        flex-1 sm:flex-none sm:min-w-[140px]
                                                    "
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Accept All
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </fieldset>

                        {/* Section 3: Photo Upload */}
                        <fieldset className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-5 md:p-6 mb-5 md:mb-6 transition-shadow hover:shadow-md">
                            <legend className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4 px-2">
                                <HiCamera className="w-5 h-5 text-blue-600" aria-hidden="true" />
                                Photos (Optional)
                            </legend>
                            <div className={`border-2 border-dashed rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors p-6 text-center border-slate-300 ${
                                uploadedImages.length >= 5 ? 'opacity-50 pointer-events-none' : ''
                            }`}>
                                <HiCloudArrowUp className="text-3xl text-slate-400 mb-2 mx-auto" aria-hidden="true" />
                                <p className="text-lg font-medium mb-2 text-slate-900">Upload photos of your job</p>
                                <p className="text-sm text-slate-600 mb-4">
                                    {uploadedImages.length >= 5 
                                        ? 'Maximum 5 photos reached' 
                                        : `Optional - add photos to help tradespeople understand your job (${uploadedImages.length}/5)`
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
                                Budget & Timeline
                            </legend>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="budget" className="text-sm font-medium text-slate-700">Budget Range <span className="text-red-500">*</span></Label>
                                    <Select value={formData.budget} onValueChange={(value) => {
                                        handleInputChange('budget', value);
                                        // Clear custom budget if switching away from custom
                                        if (value !== 'custom' && formData.customBudget) {
                                            handleInputChange('customBudget', '');
                                        }
                                        // Clear any existing budget errors when selection changes
                                        if (formErrors.budget) {
                                            setFormErrors(prev => {
                                                const newErrors = { ...prev };
                                                delete newErrors.budget;
                                                return newErrors;
                                            });
                                        }
                                        handleBlur('budget', value);
                                    }}>
                                        <SelectTrigger 
                                            id="budget"
                                            className={`rounded-xl border-slate-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:ring-offset-0 ${
                                                formErrors.budget ? 'ring-1 ring-red-300 bg-red-50 border-red-300' : ''
                                            }`}
                                            aria-invalid={!!formErrors.budget}
                                            aria-describedby={formErrors.budget ? 'budget-error' : 'budget-help'}
                                        >
                                            <SelectValue placeholder="Select budget range" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="flexible">Flexible</SelectItem>
                                            <SelectItem value="under-200">Under £200</SelectItem>
                                            <SelectItem value="200-500">£200 - £500</SelectItem>
                                            <SelectItem value="over-500">£500+</SelectItem>
                                            <SelectItem value="custom">Custom Amount</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    
                                    {/* Custom Budget Input - Show when 'Custom Amount' is selected */}
                                    {formData.budget === 'custom' && (
                                        <div className="mt-3">
                                            <Label htmlFor="customBudget" className="text-sm font-medium text-slate-700">Enter your budget amount <span className="text-red-500">*</span></Label>
                                            <div className="relative mt-1">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">£</span>
                                                <Input
                                                    id="customBudget"
                                                    type="text"
                                                    placeholder="e.g. 750"
                                                    value={formData.customBudget}
                                                    onChange={(e) => {
                                                        // Allow only numbers and decimal point
                                                        const value = e.target.value.replace(/[^\d.]/g, '');
                                                        // Prevent multiple decimal points
                                                        const parts = value.split('.');
                                                        const cleanValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : value;
                                                        handleInputChange('customBudget', cleanValue);
                                                        
                                                        // Clear budget errors when user starts typing
                                                        if (formErrors.budget || formErrors.customBudget) {
                                                            setFormErrors(prev => {
                                                                const newErrors = { ...prev };
                                                                delete newErrors.budget;
                                                                delete newErrors.customBudget;
                                                                return newErrors;
                                                            });
                                                        }
                                                    }}
                                                    onBlur={(e) => handleBlur('customBudget', e.target.value)}
                                                    className={`pl-8 rounded-xl border-slate-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:ring-offset-0 ${
                                                        formErrors.customBudget ? 'ring-1 ring-red-300 bg-red-50 border-red-300' : ''
                                                    }`}
                                                    aria-invalid={!!formErrors.customBudget}
                                                    aria-describedby={formErrors.customBudget ? 'custom-budget-error' : 'custom-budget-help'}
                                                />
                                            </div>
                                            {formErrors.customBudget ? (
                                                <p id="custom-budget-error" className="text-xs text-red-600 mt-1">{formErrors.customBudget}</p>
                                            ) : (
                                                <p id="custom-budget-help" className="text-xs text-slate-500 mt-1">Enter the amount you're willing to spend on this project</p>
                                            )}
                                        </div>
                                    )}
                                    
                                    {formErrors.budget ? (
                                        <p id="budget-error" className="text-xs text-red-600 mt-1">{formErrors.budget}</p>
                                    ) : (
                                        <p id="budget-help" className="text-xs text-slate-500 mt-1">Required - helps tradespeople provide accurate quotes</p>
                                    )}
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
                                        <Label htmlFor="firstName" className="text-sm font-medium text-slate-700">First Name <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="firstName"
                                            value={formData.firstName}
                                            onChange={(e) => {
                                                handleInputChange('firstName', e.target.value);
                                                // Clear error if name becomes valid
                                                if (e.target.value.length >= 2 && formErrors.firstName) {
                                                    setFormErrors(prev => {
                                                        const newErrors = { ...prev };
                                                        delete newErrors.firstName;
                                                        return newErrors;
                                                    });
                                                }
                                            }}
                                            onBlur={(e) => handleBlur('firstName', e.target.value)}
                                            placeholder="Your first name"
                                            className={`rounded-xl border-slate-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:ring-offset-0 ${
                                                formErrors.firstName ? 'ring-1 ring-red-300 bg-red-50 border-red-300' : ''
                                            }`}
                                            aria-invalid={!!formErrors.firstName}
                                            aria-describedby={formErrors.firstName ? 'firstName-error' : 'firstName-help'}
                                        />
                                        {formErrors.firstName ? (
                                            <p id="firstName-error" className="text-xs text-red-600 mt-1">{formErrors.firstName}</p>
                                        ) : (
                                            <p id="firstName-help" className="text-xs text-slate-500 mt-1">Required for tradespeople to address you</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => {
                                                handleInputChange('email', e.target.value);
                                                // Clear error if email becomes valid
                                                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                                if (emailRegex.test(e.target.value) && formErrors.email) {
                                                    setFormErrors(prev => {
                                                        const newErrors = { ...prev };
                                                        delete newErrors.email;
                                                        return newErrors;
                                                    });
                                                }
                                            }}
                                            onBlur={(e) => handleBlur('email', e.target.value)}
                                            placeholder="your@email.com"
                                            className={`rounded-xl border-slate-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:ring-offset-0 ${
                                                formErrors.email ? 'ring-1 ring-red-300 bg-red-50 border-red-300' : ''
                                            }`}
                                            aria-invalid={!!formErrors.email}
                                            aria-describedby={formErrors.email ? 'email-error' : 'email-help'}
                                        />
                                        {formErrors.email ? (
                                            <p id="email-error" className="text-xs text-red-600 mt-1">{formErrors.email}</p>
                                        ) : (
                                            <p id="email-help" className="text-xs text-slate-500 mt-1">Required for receiving quotes and updates</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="phone" className="text-sm font-medium text-slate-700">Phone Number <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => {
                                            handleInputChange('phone', e.target.value);
                                            // Clear error if phone becomes valid
                                            if (e.target.value.length >= 10 && formErrors.phone) {
                                                setFormErrors(prev => {
                                                    const newErrors = { ...prev };
                                                    delete newErrors.phone;
                                                    return newErrors;
                                                });
                                            }
                                        }}
                                        onBlur={(e) => handleBlur('phone', e.target.value)}
                                        placeholder="Your phone number"
                                        className={`rounded-xl border-slate-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:ring-offset-0 ${
                                            formErrors.phone ? 'ring-1 ring-red-300 bg-red-50 border-red-300' : ''
                                        }`}
                                        aria-invalid={!!formErrors.phone}
                                        aria-describedby={formErrors.phone ? 'phone-error' : 'phone-help'}
                                    />
                                    {formErrors.phone ? (
                                        <p id="phone-error" className="text-xs text-red-600 mt-1">{formErrors.phone}</p>
                                    ) : (
                                        <p id="phone-help" className="text-xs text-slate-500 mt-1">Required for tradespeople to contact you</p>
                                    )}
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
                                disabled={isSubmitting || showAuthModal}
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
                            <p className="text-xs text-slate-400 mt-1 text-center">
                                Photos are optional but help you get better quotes
                            </p>
                        </div>

                        {/* Mobile Sticky CTA */}
                        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur border-t p-3 md:hidden z-50">
                            <button 
                                type="submit" 
                                className="inline-flex items-center justify-center rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-3 shadow-md hover:shadow-lg transition w-full disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isSubmitting || showAuthModal}
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
                                        id="gdprConsent"
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
                initialEmail={formData.email}
            />
        </>
    );
};

export default PostJob;