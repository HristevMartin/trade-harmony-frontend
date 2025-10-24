import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileHeader from '@/components/MobileHeader';
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
import PostcodeInput from '@/components/PostcodeInput';

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
  { label: 'Within 5 miles', value: 5 },
  { label: 'Within 10 miles', value: 10 },
  { label: 'Within 25 miles', value: 25 },
  { label: 'Within 50 miles', value: 50 }
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
  const [isHomeOwner, setIsHomeOwner] = useState(() => {
    const auth_user = localStorage.getItem('auth_user');
    if (auth_user) {
      let auth_user_parsed = JSON.parse(auth_user);
      return auth_user_parsed.role.includes('customer') || auth_user_parsed.role.includes('CUSTOMER');
    }
    return false;
  })

  console.log('isHomeOwner', isHomeOwner);

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
        // Validate postcode for all UK cities (only if a city is selected)
        if (formData.city && !formData.postcode.trim()) {
          newErrors.postcode = 'Required';
        } else {
          delete newErrors.postcode;
        }
        break;
      case 'certificationImages':
        // Certification images are now optional
        delete newErrors.certificationImages;
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
        fieldsToValidate.push('primaryTrade');
        break;
      case 3:
        // Validate both city and postcode for all UK cities
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
        return !!formData.primaryTrade;
      case 3:
        // Require both city and postcode for all UK cities
        return !!formData.city.trim() && !!formData.postcode.trim();
      case 4:
        // For step 4, just check marketing consent (all previous fields should already be validated)
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

  // Complete registration after auth success
  const submitRegistration = useCallback(async () => {
    // Prevent double submission
    if (isSubmitting || hasSubmitted) {
      console.log('Submission already in progress or completed, skipping...');
      return;
    }

    console.log('Saving tradesperson data after authentication...');

    // Check authentication status with detailed logging
    const token = localStorage.getItem('access_token');
    const authUser = localStorage.getItem('auth_user');

    console.log('Auth check in submitRegistration - Token:', token ? 'EXISTS' : 'MISSING', 'AuthUser:', authUser ? 'EXISTS' : 'MISSING');

    if (!token || !authUser) {
      console.error('No authentication data found in submitRegistration');
      console.error('Token:', token);
      console.error('AuthUser:', authUser);
      setErrors({ general: 'Authentication required. Please try again.' });
      setIsSubmitting(false);
      setHasSubmitted(false);
      return;
    }

    console.log('Authentication data confirmed, proceeding with API call');

    // Validate required fields before submission
    const requiredFields = ['name', 'email', 'primaryTrade', 'city', 'postcode'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof ProDraft]);

    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      setErrors({ general: `Missing required fields: ${missingFields.join(', ')}. Please complete all steps.` });
      setIsSubmitting(false);
      setHasSubmitted(false);
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
      console.log('Complete formData state:', formData);
      console.log('Required fields check:', {
        name: formData.name || 'MISSING',
        email: formData.email || 'MISSING',
        primaryTrade: formData.primaryTrade || 'MISSING',
        city: formData.city || 'MISSING',
        postcode: formData.postcode || 'MISSING',
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
        credentials: 'include',
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

        // Redirect after showing success to the jobs page
        setTimeout(() => {
          navigate('/tradesperson/jobs');
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
  }, [formData, isSubmitting, hasSubmitted, navigate]);

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

    // Always proceed with registration after successful auth
    setPendingRegistration(false);

    // Directly call submitRegistration with the auth data we received
    console.log('Auth success - calling submitRegistration directly with provided auth data');
    submitRegistrationWithAuthData(authData);
  }, [formData]);

  // Submit registration with auth data directly (bypassing localStorage timing issues)
  const submitRegistrationWithAuthData = useCallback(async (authData: { id: string; role: string; token: string; email?: string }) => {
    // Prevent double submission
    if (isSubmitting || hasSubmitted) {
      console.log('Submission already in progress or completed, skipping...');
      return;
    }

    console.log('Saving tradesperson data with provided auth data...');

    // Validate required fields before submission
    const requiredFields = ['name', 'email', 'primaryTrade', 'city', 'postcode'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof ProDraft]);

    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      console.log('Complete formData state:', formData);
      setErrors({ general: `Missing required fields: ${missingFields.join(', ')}. Please complete all steps.` });
      setIsSubmitting(false);
      setHasSubmitted(false);
      return;
    }

    setIsSubmitting(true);
    setHasSubmitted(true);

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();

      // Add basic tradesperson information
      const tradespersonData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        primaryTrade: formData.primaryTrade,
        otherServices: JSON.stringify(formData.otherServices),
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

      // Add userId from provided auth data exactly like PostJob
      formDataToSend.append('userId', authData.id);

      // Add auth token to headers exactly like PostJob
      const headers: HeadersInit = {};
      if (authData.token) {
        headers['Authorization'] = `Bearer ${authData.token}`;
      }

      console.log('Sending tradesperson data with auth data to:', `${import.meta.env.VITE_API_URL}/travel/save-trader-project`);
      console.log('Complete formData state:', formData);
      console.log('Required fields check:', {
        name: formData.name || 'MISSING',
        email: formData.email || 'MISSING',
        primaryTrade: formData.primaryTrade || 'MISSING',
        city: formData.city || 'MISSING',
        postcode: formData.postcode || 'MISSING',
        portfolioCount: formData.portfolio.length,
        certificationImagesCount: formData.certificationImages.length,
        hasToken: !!authData.token,
        userId: authData.id
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
        credentials: 'include',
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

        // Redirect after showing success to the jobs page
        setTimeout(() => {
          navigate('/tradesperson/jobs');
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
      } else {
        setErrors({ general: error.message || 'Failed to save your information. Please try again.' });
      }
      setHasSubmitted(false);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isSubmitting, hasSubmitted, navigate]);

  const completeRegistration = () => {
    if (!validateStep(4)) {
      return;
    }

    // Clear any previous errors
    setErrors(prev => ({ ...prev, general: '' }));

    // Debug: Log current form data state
    console.log('Complete Registration - Current Form Data:', {
      name: formData.name || 'MISSING',
      email: formData.email || 'MISSING',
      primaryTrade: formData.primaryTrade || 'MISSING',
      city: formData.city || 'MISSING',
      postcode: formData.postcode || 'MISSING',
      radiusKm: formData.radiusKm,
      marketingConsent: formData.marketingConsent
    });

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

  const stepTitles = {
    1: 'Personal Details',
    2: 'Services & Experience',
    3: 'Location & Service Area',
    4: 'Portfolio & Consent'
  };

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
    <div className="min-h-screen bg-background" onKeyDown={handleKeyDown}>
      <div className="container mx-auto px-4 py-6 md:py-8" style={{ maxWidth: '640px' }}>
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Join as a Tradesperson</h1>
            <div className="text-right">
              <div className="text-sm font-medium text-foreground">Step {currentStep} of 4</div>
              <div className="text-sm text-slate-600">— {stepTitles[currentStep as keyof typeof stepTitles]}</div>
            </div>
          </div>
          <div className="space-y-2">
            <Progress value={progressPercentage} className="h-2 bg-slate-200" style={{ height: '8px' }} />
            <div className="flex justify-center text-sm">
              <span className="font-medium text-foreground">{Math.round(progressPercentage)}% complete</span>
            </div>
          </div>
        </div>

        {isHomeOwner && (
          <div className="mb-6 rounded-xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 p-5 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-amber-900 mb-2">
                  Homeowners Cannot Register as Tradespeople
                </h3>
                <p className="text-sm text-amber-800 leading-relaxed mb-4">
                  You're currently logged in as a <strong>homeowner</strong>. To register as a tradesperson, you'll need to log out and create a separate tradesperson account.
                </p>
                <button
                  onClick={() => {
                    localStorage.removeItem('auth_user');
                    window.location.href = '/auth';
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-amber-600 text-amber-800 rounded-lg hover:bg-amber-50 hover:border-amber-700 hover:shadow-md transition-all font-semibold text-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Log Out & Register as Tradesperson
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step Content */}
        <Card className="mb-24 md:mb-8 border border-slate-200 shadow-sm" style={{ borderRadius: '12px' }}>
          <CardHeader className="pb-6">
            <CardTitle className="text-xl font-semibold text-foreground" style={{ marginBottom: '8px' }}>
              {stepTitles[currentStep as keyof typeof stepTitles]}
            </CardTitle>
          </CardHeader>
          <CardContent style={{ gap: '24px' }} className="space-y-6">
            {/* General Error Display - Show on all steps */}
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-red-900 mb-3">
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
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-base font-medium text-slate-900">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    onBlur={() => handleFieldBlur('name')}
                    placeholder="Enter your full name"
                    className={`h-12 text-base px-4 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:ring-offset-0 ${errors.name ? 'border-red-500 bg-red-50' : ''}`}
                    style={{ borderRadius: '12px', fontSize: '16px' }}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'name-error' : 'name-help'}
                  />
                  {errors.name ? (
                    <p id="name-error" className="text-sm text-red-600 font-medium">{errors.name}</p>
                  ) : (
                    <p id="name-help" className="text-sm text-slate-500">Required for your professional profile</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="email" className="text-base font-medium text-slate-900">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    onBlur={() => handleFieldBlur('email')}
                    placeholder="Enter your email address"
                    className={`h-12 text-base px-4 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:ring-offset-0 ${errors.email ? 'border-red-500 bg-red-50' : ''} ${isEmailFromAuth ? 'bg-slate-50' : ''}`}
                    style={{ borderRadius: '12px', fontSize: '16px' }}
                    readOnly={!!isEmailFromAuth}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : 'email-help'}
                  />
                  {errors.email ? (
                    <p id="email-error" className="text-sm text-red-600 font-medium">{errors.email}</p>
                  ) : isEmailFromAuth ? (
                    <p id="email-help" className="text-sm text-slate-500">Email from your account</p>
                  ) : (
                    <p id="email-help" className="text-sm text-slate-500">Required for job notifications and account access</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-base font-medium text-slate-900">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    placeholder="Enter your phone number"
                    className="h-12 text-base px-4 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:ring-offset-0"
                    style={{ borderRadius: '12px', fontSize: '16px' }}
                    aria-describedby="phone-help"
                  />
                  <p id="phone-help" className="text-sm text-slate-500">Optional — for direct client contact</p>
                </div>
              </>
            )}

            {/* Step 2: Services & Experience */}
            {currentStep === 2 && (
              <>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium text-slate-900">Services Offered *</Label>
                    {selectedServicesCount > 0 && (
                      <div className="flex items-center gap-1 text-sm text-slate-600">
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
                          className={`min-h-[44px] px-4 py-3 text-sm font-medium rounded-xl border-2 transition-all duration-200 relative focus:ring-2 focus:ring-blue-100 focus:ring-offset-0 ${isPrimary
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                              : isSelected
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                            }`}
                          style={{ minHeight: '44px' }}
                        >
                          {service}
                          {isPrimary && (
                            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-sm">
                              PRIMARY
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {errors.primaryTrade ? (
                    <p className="text-sm text-red-600 font-medium">{errors.primaryTrade}</p>
                  ) : (
                    <p className="text-sm text-slate-500">
                      Select your primary trade first, then add additional services
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="experience" className="text-base font-medium text-slate-900">Years of Experience</Label>
                    <Input
                      id="experience"
                      type="number"
                      min="0"
                      max="50"
                      value={formData.experienceYears || ''}
                      onChange={(e) => updateFormData('experienceYears', e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="e.g., 5"
                      className="h-12 text-base px-4 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:ring-offset-0"
                      style={{ borderRadius: '12px', fontSize: '16px', textAlign: 'right' }}
                      aria-describedby="experience-help"
                    />
                    <p id="experience-help" className="text-sm text-slate-500">0-50 years (optional)</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="certifications" className="text-base font-medium text-slate-900">Certifications & Qualifications</Label>
                  <Textarea
                    id="certifications"
                    value={formData.certifications || ''}
                    onChange={(e) => updateFormData('certifications', e.target.value)}
                    placeholder="List any relevant certifications, qualifications, or training"
                    rows={3}
                    className="text-base px-4 py-3 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:ring-offset-0"
                    style={{ borderRadius: '12px', fontSize: '16px' }}
                    aria-describedby="certifications-help"
                  />
                  <p id="certifications-help" className="text-sm text-slate-500">
                    Example: Gas Safe registered, City & Guilds Level 3, NVQ Level 2
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium text-slate-900">Certification Images (Optional)</Label>
                    <p className="text-sm text-slate-500 mb-4">
                      Upload images of your certifications, licenses, or qualifications (max 3 images, 5MB each)
                    </p>

                    {/* Upload Area */}
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center transition-all duration-200 hover:border-blue-400 hover:bg-blue-50/50 active:bg-blue-100/50">
                      <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
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
                        className={`cursor-pointer text-blue-600 hover:text-blue-700 font-medium ${formData.certificationImages.length >= 3 ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                      >
                        {formData.certificationImages.length >= 3 ? 'Maximum 3 images reached' : 'Click to upload certification images'}
                      </Label>
                      <p className="text-sm text-slate-500 mt-2">
                        JPG, PNG, WebP up to 5MB each
                      </p>
                    </div>

                    {errors.certificationImages && <p className="text-sm text-red-600 font-medium mt-2">{errors.certificationImages}</p>}

                    {/* Image Previews */}
                    {formData.certificationImages.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
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
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
                              aria-label={`Remove certification image ${index + 1}`}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {formData.certificationImages.length === 0 && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-700 text-center">
                          <strong>No certification images uploaded.</strong> While optional, adding certification images helps build trust with potential clients.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Location & Service Area */}
            {currentStep === 3 && (
              <>
                <div className="space-y-6">
                  {/* Town/City Input */}
                  <div className="space-y-3">
                    <Label htmlFor="city" className="text-base font-medium text-slate-900">Town/City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => {
                        updateFormData('city', e.target.value);
                        // Clear error when user starts typing and value is not empty
                        if (e.target.value.trim() && errors.city) {
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.city;
                            return newErrors;
                          });
                        }
                      }}
                      onBlur={() => handleFieldBlur('city')}
                      placeholder="Enter your town or city"
                      className={`h-12 text-base px-4 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:ring-offset-0 ${errors.city ? 'border-red-500 bg-red-50' : ''}`}
                      style={{ borderRadius: '12px', fontSize: '16px' }}
                      aria-invalid={!!errors.city}
                      aria-describedby={errors.city ? 'city-error' : 'city-help'}
                    />
                    {errors.city ? (
                      <p id="city-error" className="text-sm text-red-600 font-medium">{errors.city}</p>
                    ) : (
                      <p id="city-help" className="text-sm text-slate-500">Where are you based?</p>
                    )}
                  </div>

                  {/* Postcode Input with Dropdown */}
                  <div>
                    <PostcodeInput
                      label="Postcode"
                      placeholder="e.g., SW1A 1AA"
                      value={formData.postcode}
                      onChange={(value) => {
                        updateFormData('postcode', value);
                        // Clear errors when postcode is updated
                        if (value && errors.postcode) {
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.postcode;
                            return newErrors;
                          });
                        }
                      }}
                      onValid={(verifiedPostcode) => {
                        console.log('Postcode verified:', verifiedPostcode);
                        // Clear any postcode errors when verified
                        if (errors.postcode) {
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.postcode;
                            return newErrors;
                          });
                        }
                      }}
                      required
                      showSuggestions
                      maxSuggestions={8}
                      helperText="We'll verify this postcode exists and use it to match you with nearby jobs"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="serviceRadius" className="text-base font-medium text-slate-900">Service Radius</Label>
                  <div className="space-y-3">
                    <Select
                      value={formData.radiusKm.toString()}
                      onValueChange={(value) => updateFormData('radiusKm', parseInt(value))}
                    >
                      <SelectTrigger className="h-12 text-base border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:ring-offset-0" style={{ borderRadius: '12px', fontSize: '16px' }}>
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

                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-slate-300"></div>
                      <span className="text-xs text-slate-500 font-medium">OR</span>
                      <div className="flex-1 h-px bg-slate-300"></div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Input
                        id="customRadius"
                        type="number"
                        min="1"
                        max="200"
                        value={formData.radiusKm}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          // Allow empty input while typing
                          if (inputValue === '') {
                            updateFormData('radiusKm', 1);
                            return;
                          }
                          const value = parseInt(inputValue);
                          // Only update if it's a valid number
                          if (!isNaN(value)) {
                            updateFormData('radiusKm', Math.min(200, Math.max(1, value)));
                          }
                        }}
                        onBlur={(e) => {
                          // On blur, ensure we have a valid value
                          const value = parseInt(e.target.value);
                          if (isNaN(value) || value < 1) {
                            updateFormData('radiusKm', 10);
                          }
                        }}
                        placeholder="Enter custom radius"
                        className="h-12 text-base px-4 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:ring-offset-0"
                        style={{ borderRadius: '12px', fontSize: '16px' }}
                        aria-describedby="radius-help"
                      />
                      <span className="text-base font-medium text-slate-700 whitespace-nowrap">miles</span>
                    </div>
                  </div>
                  <p id="radius-help" className="text-sm text-slate-500">How far are you willing to travel for jobs? (1-200 miles)</p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="bio" className="text-base font-medium text-slate-900">
                    Brief Bio
                    <span className="text-sm text-slate-500 ml-2 font-normal">
                      {(formData.bio || '').length}/400
                    </span>
                  </Label>
                  <Textarea
                    id="bio"
                    value={formData.bio || ''}
                    onChange={(e) => handleBioChange(e.target.value)}
                    placeholder="Tell potential clients about yourself and your work..."
                    rows={4}
                    className={`text-base px-4 py-3 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:ring-offset-0 ${(formData.bio || '').length >= 400 ? 'border-orange-300 bg-orange-50' : ''}`}
                    style={{ borderRadius: '12px', fontSize: '16px' }}
                    aria-describedby="bio-help"
                  />
                  <p id="bio-help" className="text-sm text-slate-500">
                    Describe your experience, specializations, and approach to work (optional)
                  </p>
                </div>
              </>
            )}

            {/* Step 4: Portfolio & Consent */}
            {currentStep === 4 && (
              <>
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-medium text-slate-900">Portfolio Images (Optional)</Label>
                    <p className="text-sm text-slate-500 mt-1 mb-4">
                      Upload up to 5 images showcasing your work (max 5MB each)
                    </p>

                    {/* Upload Area */}
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center transition-all duration-200 hover:border-blue-400 hover:bg-blue-50/50 active:bg-blue-100/50">
                      <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
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
                        className={`cursor-pointer text-blue-600 hover:text-blue-700 font-medium ${formData.portfolio.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                      >
                        {formData.portfolio.length >= 5 ? 'Maximum 5 images reached' : 'Click to upload portfolio images'}
                      </Label>
                      <p className="text-sm text-slate-500 mt-2">
                        JPG, PNG, WebP up to 5MB each
                      </p>
                    </div>

                    {errors.portfolio && <p className="text-sm text-red-600 font-medium mt-2">{errors.portfolio}</p>}

                    {/* Image Previews */}
                    {formData.portfolio.length > 0 && (
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        {formData.portfolio.map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Portfolio ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border transition-transform group-hover:scale-105"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
                              aria-label={`Remove image ${index + 1}`}
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                              {index + 1}/{formData.portfolio.length}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {formData.portfolio.length === 0 && (
                      <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-sm text-slate-500 text-center">
                          <strong>No portfolio images yet.</strong> Adding photos of your work helps clients see your quality and style.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-200">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="consent"
                      checked={formData.marketingConsent}
                      onCheckedChange={(checked) => updateFormData('marketingConsent', checked)}
                      onBlur={() => handleFieldBlur('marketingConsent')}
                      aria-invalid={!!errors.marketingConsent}
                      className="mt-1"
                      style={{ minWidth: '20px', minHeight: '20px' }}
                    />
                    <div className="space-y-2">
                      <Label
                        htmlFor="consent"
                        className="text-base font-medium text-slate-900 leading-tight cursor-pointer"
                      >
                        I agree to be contacted about matching jobs *
                      </Label>
                      {errors.marketingConsent ? (
                        <p className="text-sm text-red-600 font-medium">{errors.marketingConsent}</p>
                      ) : (
                        <p className="text-sm text-slate-500">
                          We'll only contact you about relevant job opportunities in your area
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Mobile Sticky Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-200 p-4 md:hidden" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
          <div className="flex justify-between items-center gap-4" style={{ maxWidth: '640px', margin: '0 auto' }}>
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1 || (errors.general && errors.general.includes('Customer accounts cannot register'))}
              className="flex items-center gap-2 h-12 px-6 border-slate-300 text-slate-700 hover:bg-slate-50"
              style={{ borderRadius: '12px', minHeight: '48px' }}
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>

            {currentStep < 4 ? (
              <Button
                onClick={nextStep}
                disabled={!isStepValid(currentStep) || isHomeOwner || (errors.general && errors.general.includes('Customer accounts cannot register'))}
                className="flex items-center gap-2 h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                style={{ borderRadius: '12px', minHeight: '48px' }}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={completeRegistration}
                disabled={!isStepValid(currentStep) || isSubmitting || isHomeOwner || (errors.general && errors.general.includes('Customer accounts cannot register'))}
                className="h-12 px-6 bg-green-600 hover:bg-green-700 text-white shadow-sm"
                style={{ borderRadius: '12px', minHeight: '48px' }}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </div>
                ) : (
                  'Complete Registration'
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex justify-between items-center mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1 || (errors.general && errors.general.includes('Customer accounts cannot register'))}
            className="flex items-center gap-2 h-12 px-6 border-slate-300 text-slate-700 hover:bg-slate-50"
            style={{ borderRadius: '12px' }}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          {currentStep < 4 ? (
            <Button
              onClick={nextStep}
              disabled={!isStepValid(currentStep) || isHomeOwner || (errors.general && errors.general.includes('Customer accounts cannot register')) }
              className="flex items-center gap-2 h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              style={{ borderRadius: '12px' }}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={completeRegistration}
              disabled={!isStepValid(currentStep) || isSubmitting || isHomeOwner || (errors.general && errors.general.includes('Customer accounts cannot register'))}
              className="h-12 px-6 bg-green-600 hover:bg-green-700 text-white shadow-sm"
              style={{ borderRadius: '12px' }}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </div>
              ) : (
                'Complete Registration'
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
          initialEmail={formData.email}
          role="trader"
          defaultTab="register"
        />
      </div>
    </div>
  );
};

export default TradesPersonOnboarding;