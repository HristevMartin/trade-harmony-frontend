import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight, Upload, X, CheckCircle, Badge } from 'lucide-react';

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

  // Load from localStorage on mount
  useEffect(() => {
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
      }
    }

    // Load draft
    const savedDraft = localStorage.getItem('pro_onboarding_draft');
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        setFormData({ ...initialProDraft, ...prefillData, ...parsedDraft });
      } catch (error) {
        console.error('Error loading saved draft:', error);
        setFormData({ ...initialProDraft, ...prefillData });
      }
    } else {
      setFormData({ ...initialProDraft, ...prefillData });
    }
  }, []);

  // Save draft to localStorage
  const saveDraft = useCallback(() => {
    localStorage.setItem('pro_onboarding_draft', JSON.stringify(formData));
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
        return !!formData.city.trim() && !!formData.postcode.trim();
      case 4:
        return formData.marketingConsent;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
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

  const completeRegistration = () => {
    if (validateStep(4)) {
      setIsCompleted(true);
      localStorage.removeItem('pro_onboarding_draft');
      
      // Redirect after showing success
      setTimeout(() => {
        navigate('/tradesperson/jobs');
      }, 2000);
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
                  <select
                    id="serviceRadius"
                    value={formData.radiusKm}
                    onChange={(e) => updateFormData('radiusKm', parseInt(e.target.value))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {radiusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
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
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>

            {currentStep < 4 ? (
              <Button
                onClick={nextStep}
                disabled={!isStepValid(currentStep)}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={completeRegistration}
                disabled={!isStepValid(currentStep)}
                className="bg-success hover:bg-success/90 text-success-foreground"
              >
                Complete Registration
              </Button>
            )}
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex justify-between items-center">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          {currentStep < 4 ? (
            <Button
              onClick={nextStep}
              disabled={!isStepValid(currentStep)}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={completeRegistration}
              disabled={!isStepValid(currentStep)}
              className="bg-success hover:bg-success/90 text-success-foreground"
            >
              Complete Registration
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradesPersonOnboarding;