import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Upload, X, CheckCircle, Badge } from 'lucide-react';
import AuthModal from '@/components/AuthModal';

type ProDraft = {
  name: string;
  email: string;
  phone?: string;
  primaryTrade: string;
  otherServices: string[];
  city: string;
  postcode: string;
  radiusKm: number;
  experienceYears?: number;
  certifications?: string;
  certificationImages: File[];
  bio?: string;
  portfolio: File[];
  marketingConsent: boolean;
};

const initialProDraft: ProDraft = {
  name: '',
  email: '',
  phone: '',
  primaryTrade: '',
  otherServices: [],
  city: '',
  postcode: '',
  radiusKm: 10,
  experienceYears: undefined,
  certifications: '',
  certificationImages: [],
  bio: '',
  portfolio: [],
  marketingConsent: false
};

const serviceOptions = [
  'Plumbing', 'Electrical', 'Carpentry', 'Roofing', 'Painting & Decorating',
  'Gardening & Landscaping', 'Heating & Cooling', 'Flooring', 'Building & Construction',
  'Kitchen & Bathroom', 'Cleaning', 'Handyman Services'
];

const radiusOptions = [
  { label: 'Within 5 km', value: 5 },
  { label: 'Within 10 km', value: 10 },
  { label: 'Within 25 km', value: 25 },
  { label: 'Within 50 km', value: 50 }
];

const TradesPersonOnboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProDraft>(initialProDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingRegistration, setPendingRegistration] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Function to clear corrupted localStorage data
  const clearCorruptedData = useCallback(() => {
    try {
      localStorage.removeItem('pro_onboarding_draft');
      console.log('Cleared corrupted onboarding draft');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    const loadInitialData = () => {
      try {
        // Check for existing auth user to prefill
        const authUser = localStorage.getItem('auth_user');
        let prefillData = {};
        
        if (authUser) {
          try {
            const userData = JSON.parse(authUser);
            prefillData = {
              name: userData.name || '',
              email: userData.email || ''
            };
          } catch (error) {
            console.error('Error parsing auth user:', error);
            // Clear corrupted auth data
            localStorage.removeItem('auth_user');
          }
        }

        // Load draft
        const savedDraft = localStorage.getItem('pro_onboarding_draft');
        if (savedDraft) {
          try {
            const parsedDraft = JSON.parse(savedDraft);
            
            // Validate the parsed draft has expected structure
            if (parsedDraft && typeof parsedDraft === 'object') {
              // Filter out any invalid or corrupted data
              const validDraft = {
                name: parsedDraft.name || '',
                email: parsedDraft.email || '',
                phone: parsedDraft.phone || '',
                primaryTrade: parsedDraft.primaryTrade || '',
                otherServices: Array.isArray(parsedDraft.otherServices) ? parsedDraft.otherServices : [],
                city: parsedDraft.city || '',
                postcode: parsedDraft.postcode || '',
                radiusKm: typeof parsedDraft.radiusKm === 'number' ? parsedDraft.radiusKm : 10,
                experienceYears: typeof parsedDraft.experienceYears === 'number' ? parsedDraft.experienceYears : undefined,
                certifications: parsedDraft.certifications || '',
                certificationImages: [], // Don't restore File objects
                bio: parsedDraft.bio || '',
                portfolio: Array.isArray(parsedDraft.portfolio) ? [] : [], // Don't restore File objects
                marketingConsent: Boolean(parsedDraft.marketingConsent)
              };
              
              setFormData({ ...initialProDraft, ...prefillData, ...validDraft });
            } else {
              throw new Error('Invalid draft structure');
            }
          } catch (error) {
            console.error('Error loading saved draft:', error);
            // Clear corrupted draft data
            localStorage.removeItem('pro_onboarding_draft');
            setFormData({ ...initialProDraft, ...prefillData });
          }
        } else {
          setFormData({ ...initialProDraft, ...prefillData });
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        // Clear corrupted data and fallback to clean state
        clearCorruptedData();
        setFormData(initialProDraft);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [clearCorruptedData]);

  // Check user role on component mount
  useEffect(() => {
    const roleCheck = checkUserRole();
    if (!roleCheck.isValid) {
      setErrors(prev => ({ ...prev, general: roleCheck.message }));
      // Scroll to top to make the error message visible
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Save draft to localStorage (excluding File objects)
  const saveDraft = useCallback(() => {
    try {
      // Create a safe version of formData without File objects
      const draftToSave = {
        ...formData,
        portfolio: [], // Don't save File objects - they can't be serialized
        certificationImages: [] // Don't save File objects - they can't be serialized
      };
      localStorage.setItem('pro_onboarding_draft', JSON.stringify(draftToSave));
    } catch (error) {
      console.error('Error saving draft:', error);
      // If saving fails, remove the corrupted draft
      localStorage.removeItem('pro_onboarding_draft');
    }
  }, [formData]);

  // Save draft on step change and unload
  useEffect(() => {
    saveDraft();
  }, [currentStep, saveDraft]);

  useEffect(() => {
    const handleBeforeUnload = () => saveDraft();
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveDraft]);

  const updateFormData = (field: keyof ProDraft, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFieldBlur = (field: string) => {
    setTouchedFields(prev => new Set([...prev, field]));
    validateField(field);
  };

  const validateField = (field: string): boolean => {
    const newErrors = { ...errors };

    switch (field) {
      case 'name':
        if (!formData.name.trim()) {
          newErrors.name = 'Required';
        } else {
          delete newErrors.name;
        }
        break;
      case 'email':
        if (!formData.email.trim()) {
          newErrors.email = 'Required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Invalid email';
        } else {
          delete newErrors.email;
        }
        break;
      case 'primaryTrade':
        if (!formData.primaryTrade) {
          newErrors.primaryTrade = 'Required';
        } else {
          delete newErrors.primaryTrade;
        }
        break;
      case 'city':
        if (!formData.city.trim()) {
          newErrors.city = 'Required';
        } else {
          delete newErrors.city;
        }
        break;
      case 'postcode':
        if (!formData.postcode.trim()) {
          newErrors.postcode = 'Required';
        } else {
          delete newErrors.postcode;
        }
        break;
      case 'certificationImages':
        if (formData.certificationImages.length === 0) {
          newErrors.certificationImages = 'At least one certification image is required';
        } else {
          delete newErrors.certificationImages;
        }
        break;
      case 'marketingConsent':
        if (!formData.marketingConsent) {
          newErrors.marketingConsent = 'Required';
        } else {
          delete newErrors.marketingConsent;
        }
        break;
    }

    setErrors(newErrors);
    return !newErrors[field];
  };

  const validateStep = (step: number): boolean => {
    const fieldsToValidate: string[] = [];
    
    switch (step) {
      case 1:
        fieldsToValidate.push('name', 'email');
        break;
      case 2:
        fieldsToValidate.push('primaryTrade', 'certificationImages');
        break;
      case 3:
        fieldsToValidate.push('city', 'postcode');
        break;
      case 4:
        fieldsToValidate.push('marketingConsent');
        break;
    }

    return fieldsToValidate.every(field => validateField(field));
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.name.trim() && !!formData.email.trim() && /\S+@\S+\.\S+/.test(formData.email);
      case 2:
        return !!formData.primaryTrade && formData.certificationImages.length > 0;
      case 3:
        return !!formData.city.trim() && !!formData.postcode.trim();
      case 4:
        return formData.marketingConsent;
      default:
        return false;
    }
  };

  const nextStep = () => {
    // Prevent navigation if there's a role validation error
    if (errors.general && errors.general.includes('Customer accounts cannot register')) {
      return;
    }
    
    if (validateStep(currentStep) && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    // Prevent navigation if there's a role validation error
    if (errors.general && errors.general.includes('Customer accounts cannot register')) {
      return;
    }
    
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleServiceToggle = (service: string) => {
    if (formData.primaryTrade === service) {
      // If it's the primary trade, move it to otherServices
      updateFormData('primaryTrade', '');
      updateFormData('otherServices', [...formData.otherServices, service]);
    } else if (formData.otherServices.includes(service)) {
      // Remove from otherServices
      updateFormData('otherServices', formData.otherServices.filter(s => s !== service));
    } else if (!formData.primaryTrade) {
      // Set as primary trade if none selected
      updateFormData('primaryTrade', service);
    } else {
      // Add to otherServices
      updateFormData('otherServices', [...formData.otherServices, service]);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    let errorMessage = '';

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        errorMessage = `${file.name} is too large (max 5MB)`;
        continue;
      }
      if (!file.type.startsWith('image/')) {
        errorMessage = `${file.name} is not an image`;
        continue;
      }
      validFiles.push(file);
    }

    if (errorMessage) {
      setErrors(prev => ({ ...prev, portfolio: errorMessage }));
    } else {
      setErrors(prev => ({ ...prev, portfolio: '' }));
    }

    const newImages = [...formData.portfolio, ...validFiles].slice(0, 5);
    updateFormData('portfolio', newImages);
  };

  const removeImage = (index: number) => {
    const updatedImages = formData.portfolio.filter((_, i) => i !== index);
    updateFormData('portfolio', updatedImages);
  };

  const handleCertificationImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    let errorMessage = '';

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        errorMessage = `${file.name} is too large (max 5MB)`;
        continue;
      }
      if (!file.type.startsWith('image/')) {
        errorMessage = `${file.name} is not an image`;
        continue;
      }
      validFiles.push(file);
    }

    if (errorMessage) {
      setErrors(prev => ({ ...prev, certificationImages: errorMessage }));
    } else {
      setErrors(prev => ({ ...prev, certificationImages: '' }));
    }

    const newImages = [...formData.certificationImages, ...validFiles].slice(0, 3);
    updateFormData('certificationImages', newImages);
  };

  const removeCertificationImage = (index: number) => {
    const updatedImages = formData.certificationImages.filter((_, i) => i !== index);
    updateFormData('certificationImages', updatedImages);
  };

  const normalizePostcode = (postcode: string) => {
    return postcode.toUpperCase().replace(/\s+/g, ' ').trim();
  };

  const handlePostcodeChange = (value: string) => {
    updateFormData('postcode', normalizePostcode(value));
  };

  const handleBioChange = (value: string) => {
    if (value.length <= 400) {
      updateFormData('bio', value);
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!localStorage.getItem('access_token');
  };

  // Check if authenticated user has correct role for tradesperson registration
  const checkUserRole = () => {
    const token = localStorage.getItem('access_token');
    const authUser = localStorage.getItem('auth_user');
    
    if (!token || !authUser) {
      return { isValid: true, message: '' }; // Not authenticated, allow to proceed with auth modal
    }

    try {
      const userData = JSON.parse(authUser);
      const userRole = Array.isArray(userData.role) ? userData.role : [userData.role];
      if (userRole.includes('customer') || userRole.includes('CUSTOMER')) {
        return {
          isValid: false,
          message: 'Customer accounts cannot register as tradespeople. Please create a new trader account or switch to a trader account to complete registration.'
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
  const handleAuthSuccess = useCallback((authData: { id: string; role: string; token: string; email?: string }) => {
    console.log('Authentication successful:', authData);
    
    // Clear any previous errors
    setErrors(prev => ({ ...prev, general: '' }));
    
    setShowAuthModal(false);
    
    // Check if the authenticated user has the correct role
    const authUserRole = Array.isArray(authData.role) ? authData.role : [authData.role];
    if (authUserRole.includes('customer') || authUserRole.includes('CUSTOMER')) {
      setErrors(prev => ({ 
        ...prev, 
        general: 'Customer accounts cannot register as tradespeople. Please create a new trader account or switch to a trader account to complete registration.' 
      }));
      setPendingRegistration(false);
      // Scroll to top to make the error message visible
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    if (pendingRegistration) {
      setPendingRegistration(false);
      // Use a ref or state to prevent double execution
      submitRegistration();
    }
  }, [pendingRegistration, isSubmitting, hasSubmitted]);

  // Complete registration after auth success
  const submitRegistration = async () => {
    // Prevent double submission
    if (isSubmitting || hasSubmitted) {
      console.log('Submission already in progress or completed, skipping...');
      return;
    }

    console.log('Saving tradesperson data after authentication...');
    
    // Check authentication status
    const token = localStorage.getItem('access_token');
    const authUser = localStorage.getItem('auth_user');
    
    if (!token || !authUser) {
      console.error('No authentication data found');
      setErrors({ general: 'Authentication required. Please try again.' });
      return;
    }

    setIsSubmitting(true);
    setHasSubmitted(true);
    
    try {
      // Create FormData for file upload (exactly like PostJob component)
      const formDataToSend = new FormData();
      
      // Add basic tradesperson information - mimic PostJob's approach
      const tradespersonData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        primaryTrade: formData.primaryTrade,
        otherServices: JSON.stringify(formData.otherServices), // Convert array to JSON string
        city: formData.city,
        postcode: formData.postcode,
        radiusKm: formData.radiusKm.toString(),
        experienceYears: (formData.experienceYears || 0).toString(),
        certifications: formData.certifications || '',
        bio: formData.bio || '',
        marketingConsent: formData.marketingConsent.toString()
      };

      // Add form fields exactly like PostJob
      Object.keys(tradespersonData).forEach(key => {
        const value = tradespersonData[key as keyof typeof tradespersonData];
        if (value !== null && value !== undefined) {
          formDataToSend.append(key, value.toString());
        }
      });

      // Add portfolio images with the correct field name for the API
      formData.portfolio.forEach((file, index) => {
        formDataToSend.append('projectImages', file); // Use 'projectImages' key as expected by API
      });

      // Add certification images
      formData.certificationImages.forEach((file, index) => {
        formDataToSend.append('certificationImages', file);
      });

      // Add userId from auth data exactly like PostJob
      if (authUser) {
        const userData = JSON.parse(authUser);
        formDataToSend.append('userId', userData.id);
      }

      // Add auth token to headers exactly like PostJob
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log('Sending tradesperson data to:', `${import.meta.env.VITE_API_URL}/travel/save-trader-project`);
      console.log('Form data includes:', {
        name: formData.name,
        email: formData.email,
        primaryTrade: formData.primaryTrade,
        portfolioCount: formData.portfolio.length,
        certificationImagesCount: formData.certificationImages.length,
        hasToken: !!token
      });
      
      // Debug: Log all FormData entries
      console.log('FormData entries:');
      for (let [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          console.log(`${key}:`, `File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`${key}:`, value);
        }
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/travel/save-trader-project`, {
        method: 'POST',
        headers,
        body: formDataToSend
      });

      console.log('Tradesperson data save response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Tradesperson data saved successfully:', data);
        
        setIsCompleted(true);
        localStorage.removeItem('pro_onboarding_draft');
        console.log('Tradesperson registration flow completed');
        
        // Redirect after showing success
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        const errorText = await response.text();
        console.error('Failed to save tradesperson data:', response.status, 'Response:', errorText);
        
        // Try to parse error response
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.message) {
            setErrors({ general: errorJson.message });
          } else {
            setErrors({ general: 'Failed to save your information. Please try again.' });
          }
        } catch {
          setErrors({ general: 'Server error occurred. Please try again later.' });
        }
        setHasSubmitted(false);
      }
    } catch (error) {
      console.error('Error saving tradesperson data:', error);
      
      // More specific error messages
      if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
        setErrors({ general: 'Network error. Please check your internet connection and try again.' });
      } else if (error.message.includes('Server error: 401')) {
        setErrors({ general: 'Authentication expired. Please log in again.' });
        // Clear auth data if unauthorized
        localStorage.removeItem('access_token');
        localStorage.removeItem('auth_user');
      } else {
        setErrors({ general: error.message || 'Failed to save your information. Please try again.' });
      }
      setHasSubmitted(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeRegistration = () => {
    if (!validateStep(4)) {
      return;
    }

    // Clear any previous errors
    setErrors(prev => ({ ...prev, general: '' }));

    // Check user role first (for authenticated users)
    const roleCheck = checkUserRole();
    if (!roleCheck.isValid) {
      setErrors(prev => ({ ...prev, general: roleCheck.message }));
      // Scroll to top to make the error message visible
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (isAuthenticated()) {
      // User is already authenticated, proceed with registration
      submitRegistration();
    } else {
      // User not authenticated, show auth modal
      setPendingRegistration(true);
      setShowAuthModal(true);
    }
  };

  const progressPercentage = (currentStep / 4) * 100;
  const selectedServicesCount = (formData.primaryTrade ? 1 : 0) + formData.otherServices.length;
  const isEmailFromAuth = localStorage.getItem('auth_user');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
    }
  };

  // Debug log for rendering issues (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && currentStep === 4) {
      console.log('Step 4 Debug:', {
        currentStep,
        isCompleted,
        showAuthModal,
        hasFormData: !!formData,
        errors: Object.keys(errors),
        isSubmitting
      });
    }
  }, [currentStep, isCompleted, showAuthModal, formData, errors, isSubmitting]);

  // Show loading state while initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-md">
          <Card className="text-center py-12 animate-fade-in">
            <CardContent>
              <CheckCircle className="mx-auto mb-6 h-16 w-16 text-success animate-scale-in" />
              <h1 className="text-2xl font-bold text-foreground mb-4">
                Profile Created Successfully!
              </h1>
              <p className="text-muted-foreground mb-6">
                ✅ Let's find you some jobs.
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecting to your job dashboard...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-4 md:py-8" onKeyDown={handleKeyDown}>
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Progress Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Join as a Tradesperson</h1>
            <span className="text-sm text-muted-foreground">Step {currentStep} of 4</span>
          </div>
          <Progress value={progressPercentage} className="h-2 mb-2" />
          <div className="text-xs text-muted-foreground text-center">
            {Math.round(progressPercentage)}% complete
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-20 md:mb-6 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">
              {currentStep === 1 && 'Personal Details'}
              {currentStep === 2 && 'Services & Experience'}
              {currentStep === 3 && 'Location & Service Area'}
              {currentStep === 4 && 'Portfolio & Consent'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6">
            {/* General Error Display - Show on all steps */}
            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-red-800 mb-3">
                      {errors.general}
                    </p>
                    {errors.general.includes('Customer accounts cannot register') && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            localStorage.removeItem('access_token');
                            localStorage.removeItem('auth_user');
                            setErrors(prev => ({ ...prev, general: '' }));
                            window.location.reload();
                          }}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Logout & Create Trader Account
                        </button>
                        {/* No dismiss button for role validation errors - user must resolve the conflict */}
                      </div>
                    )}
                    {!errors.general.includes('Customer accounts cannot register') && (
                      <button
                        onClick={() => setErrors(prev => ({ ...prev, general: '' }))}
                        className="mt-2 text-xs text-red-500 hover:text-red-700 underline"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Personal Details */}
            {currentStep === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    onBlur={() => handleFieldBlur('name')}
                    placeholder="Enter your full name"
                    className={errors.name ? 'border-destructive' : ''}
                    aria-invalid={!!errors.name}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    onBlur={() => handleFieldBlur('email')}
                    placeholder="Enter your email address"
                    className={errors.email ? 'border-destructive' : ''}
                    readOnly={!!isEmailFromAuth}
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  {isEmailFromAuth && (
                    <p className="text-xs text-muted-foreground">Email from your account</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ''}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>
              </>
            )}

            {/* Step 2: Services & Experience */}
            {currentStep === 2 && (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Services Offered *</Label>
                    {selectedServicesCount > 0 && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Badge className="h-4 w-4" />
                        {selectedServicesCount} selected
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {serviceOptions.map((service) => {
                      const isPrimary = formData.primaryTrade === service;
                      const isSelected = isPrimary || formData.otherServices.includes(service);
                      
                      return (
                        <button
                          key={service}
                          type="button"
                          onClick={() => handleServiceToggle(service)}
                          className={`p-2 text-xs rounded-md border transition-all duration-200 relative ${
                            isPrimary
                              ? 'bg-primary text-primary-foreground border-primary ring-2 ring-primary/20'
                              : isSelected
                              ? 'bg-accent text-accent-foreground border-accent'
                              : 'bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground'
                          }`}
                        >
                          {service}
                          {isPrimary && (
                            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs px-1 rounded-full">
                              1°
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {errors.primaryTrade && <p className="text-sm text-destructive">{errors.primaryTrade}</p>}
                  <p className="text-xs text-muted-foreground">
                    Select your primary trade first, then add additional services
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      type="number"
                      min="0"
                      max="50"
                      value={formData.experienceYears || ''}
                      onChange={(e) => updateFormData('experienceYears', e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="e.g., 5"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certifications">Certifications & Qualifications</Label>
                  <Textarea
                    id="certifications"
                    value={formData.certifications || ''}
                    onChange={(e) => updateFormData('certifications', e.target.value)}
                    placeholder="List any relevant certifications, qualifications, or training"
                    rows={3}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Certification Images *</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Upload images of your certifications, licenses, or qualifications (max 3 images, 5MB each)
                    </p>

                    {/* Upload Area */}
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center transition-colors hover:border-primary/50">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleCertificationImageUpload}
                        className="hidden"
                        id="certification-upload"
                        disabled={formData.certificationImages.length >= 3}
                      />
                      <Label
                        htmlFor="certification-upload"
                        className={`cursor-pointer text-primary hover:underline text-sm ${
                          formData.certificationImages.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {formData.certificationImages.length >= 3 ? 'Maximum 3 images reached' : 'Click to upload certification images'}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG, PNG, WebP up to 5MB each
                      </p>
                    </div>

                    {errors.certificationImages && <p className="text-sm text-destructive mt-2">{errors.certificationImages}</p>}

                    {/* Image Previews */}
                    {formData.certificationImages.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                        {formData.certificationImages.map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Certification ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border transition-transform group-hover:scale-105"
                            />
                            <button
                              type="button"
                              onClick={() => removeCertificationImage(index)}
                              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/80 transition-colors"
                              aria-label={`Remove certification image ${index + 1}`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Location */}
            {currentStep === 3 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => updateFormData('city', e.target.value)}
                      onBlur={() => handleFieldBlur('city')}
                      placeholder="Enter your city"
                      className={errors.city ? 'border-destructive' : ''}
                      aria-invalid={!!errors.city}
                    />
                    {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postcode">Postcode *</Label>
                    <Input
                      id="postcode"
                      value={formData.postcode}
                      onChange={(e) => handlePostcodeChange(e.target.value)}
                      onBlur={() => handleFieldBlur('postcode')}
                      placeholder="e.g., SW20 9NP"
                      className={errors.postcode ? 'border-destructive' : ''}
                      aria-invalid={!!errors.postcode}
                    />
                    {errors.postcode && <p className="text-sm text-destructive">{errors.postcode}</p>}
                    <p className="text-xs text-muted-foreground">UK postcode format</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceRadius">Service Radius</Label>
                  <Select
                    value={formData.radiusKm.toString()}
                    onValueChange={(value) => updateFormData('radiusKm', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service radius" />
                    </SelectTrigger>
                    <SelectContent>
                      {radiusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">
                    Brief Bio 
                    <span className="text-xs text-muted-foreground ml-2">
                      {(formData.bio || '').length}/400
                    </span>
                  </Label>
                  <Textarea
                    id="bio"
                    value={formData.bio || ''}
                    onChange={(e) => handleBioChange(e.target.value)}
                    placeholder="Tell potential clients about yourself and your work..."
                    rows={3}
                    className={(formData.bio || '').length >= 400 ? 'border-warning' : ''}
                  />
                  <p className="text-xs text-muted-foreground">
                    Describe your experience, specializations, and approach to work
                  </p>
                </div>
              </>
            )}

            {/* Step 4: Portfolio & Consent */}
            {currentStep === 4 && (
              <>
                <div className="space-y-4">
                  <Label>Portfolio Images (Optional)</Label>
                  <p className="text-sm text-muted-foreground">
                    Upload up to 5 images showcasing your work (max 5MB each)
                  </p>

                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center transition-colors hover:border-primary/50">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="portfolio-upload"
                      disabled={formData.portfolio.length >= 5}
                    />
                    <Label
                      htmlFor="portfolio-upload"
                      className={`cursor-pointer text-primary hover:underline ${
                        formData.portfolio.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {formData.portfolio.length >= 5 ? 'Maximum 5 images reached' : 'Click to upload images'}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG, WebP up to 5MB each
                    </p>
                  </div>

                  {errors.portfolio && <p className="text-sm text-destructive">{errors.portfolio}</p>}

                  {/* Image Previews */}
                  {formData.portfolio.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {formData.portfolio.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Portfolio ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border transition-transform group-hover:scale-105"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/80 transition-colors"
                            aria-label={`Remove image ${index + 1}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="consent"
                      checked={formData.marketingConsent}
                      onCheckedChange={(checked) => updateFormData('marketingConsent', checked)}
                      onBlur={() => handleFieldBlur('marketingConsent')}
                      aria-invalid={!!errors.marketingConsent}
                    />
                    <div className="space-y-1">
                      <Label
                        htmlFor="consent"
                        className="text-sm font-normal leading-tight cursor-pointer"
                      >
                        I agree to be contacted about matching jobs *
                      </Label>
                      {errors.marketingConsent && (
                        <p className="text-sm text-destructive">{errors.marketingConsent}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    We'll only contact you about relevant job opportunities in your area
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Mobile Sticky Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 md:hidden">
          <div className="flex justify-between items-center max-w-2xl mx-auto">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1 || (errors.general && errors.general.includes('Customer accounts cannot register'))}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>

            {currentStep < 4 ? (
              <Button
                onClick={nextStep}
                disabled={!isStepValid(currentStep) || (errors.general && errors.general.includes('Customer accounts cannot register'))}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={completeRegistration}
                disabled={!isStepValid(currentStep) || isSubmitting || (errors.general && errors.general.includes('Customer accounts cannot register'))}
                className="bg-success hover:bg-success/90 text-success-foreground"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </div>
                ) : (
                  isAuthenticated() ? 'Complete Registration' : 'Login to Complete Registration'
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex justify-between items-center">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1 || (errors.general && errors.general.includes('Customer accounts cannot register'))}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          {currentStep < 4 ? (
            <Button
              onClick={nextStep}
              disabled={!isStepValid(currentStep) || (errors.general && errors.general.includes('Customer accounts cannot register'))}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={completeRegistration}
              disabled={!isStepValid(currentStep) || isSubmitting || (errors.general && errors.general.includes('Customer accounts cannot register'))}
              className="bg-success hover:bg-success/90 text-success-foreground"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </div>
              ) : (
                isAuthenticated() ? 'Complete Registration' : 'Login to Complete Registration'
              )}
            </Button>
          )}
        </div>

        {/* Mobile spacer for fixed sticky navigation */}
        <div className="h-24 md:hidden" />

        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => {
            setShowAuthModal(false);
            setPendingRegistration(false);
          }}
          onSuccess={handleAuthSuccess}
          role="trader"
        />
      </div>
    </div>
  );
};

export default TradesPersonOnboarding;