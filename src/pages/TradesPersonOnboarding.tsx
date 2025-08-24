import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Upload, X, CheckCircle } from 'lucide-react';

interface FormData {
  // Personal Details
  fullName: string;
  email: string;
  phone: string;
  
  // Business Details
  services: string[];
  experience: string;
  certifications: string;
  
  // Location
  city: string;
  postcode: string;
  serviceRadius: string;
  
  // Portfolio
  portfolioImages: File[];
}

const initialFormData: FormData = {
  fullName: '',
  email: '',
  phone: '',
  services: [],
  experience: '',
  certifications: '',
  city: '',
  postcode: '',
  serviceRadius: '10',
  portfolioImages: []
};

const serviceOptions = [
  'Plumbing', 'Electrical', 'Carpentry', 'Roofing', 'Painting & Decorating',
  'Gardening & Landscaping', 'Heating & Cooling', 'Flooring', 'Building & Construction',
  'Kitchen & Bathroom', 'Cleaning', 'Handyman Services'
];

const TradesPersonOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('tradesperson-onboarding');
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        setFormData({ ...initialFormData, ...parsedData });
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    }
  }, []);

  // Save to localStorage whenever formData changes
  useEffect(() => {
    localStorage.setItem('tradesperson-onboarding', JSON.stringify(formData));
  }, [formData]);

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Valid email is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        break;
      case 2:
        if (formData.services.length === 0) newErrors.services = 'Please select at least one service';
        if (!formData.experience.trim()) newErrors.experience = 'Years of experience is required';
        break;
      case 3:
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.postcode.trim()) newErrors.postcode = 'Postcode is required';
        break;
      case 4:
        // Portfolio is optional, no validation needed
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleServiceToggle = (service: string) => {
    const updatedServices = formData.services.includes(service)
      ? formData.services.filter(s => s !== service)
      : [...formData.services, service];
    updateFormData('services', updatedServices);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = [...formData.portfolioImages, ...files].slice(0, 5);
    updateFormData('portfolioImages', newImages);
  };

  const removeImage = (index: number) => {
    const updatedImages = formData.portfolioImages.filter((_, i) => i !== index);
    updateFormData('portfolioImages', updatedImages);
  };

  const completeRegistration = () => {
    if (validateStep(4)) {
      setIsCompleted(true);
      localStorage.removeItem('tradesperson-onboarding');
    }
  };

  const progressPercentage = (currentStep / 4) * 100;

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-md">
          <Card className="text-center py-12">
            <CardContent>
              <CheckCircle className="mx-auto mb-6 h-16 w-16 text-success" />
              <h1 className="text-2xl font-bold text-foreground mb-4">
                Registration Complete!
              </h1>
              <p className="text-muted-foreground mb-6">
                ✅ Your profile has been created successfully!
              </p>
              <p className="text-sm text-muted-foreground">
                We'll review your application and get back to you within 24 hours.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground">Join as a Tradesperson</h1>
            <span className="text-sm text-muted-foreground">Step {currentStep} of 4</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && 'Personal Details'}
              {currentStep === 2 && 'Business Details'}
              {currentStep === 3 && 'Location & Service Area'}
              {currentStep === 4 && 'Portfolio'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Personal Details */}
            {currentStep === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => updateFormData('fullName', e.target.value)}
                    placeholder="Enter your full name"
                    className={errors.fullName ? 'border-destructive' : ''}
                  />
                  {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    placeholder="Enter your email address"
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    placeholder="Enter your phone number"
                    className={errors.phone ? 'border-destructive' : ''}
                  />
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                </div>
              </>
            )}

            {/* Step 2: Business Details */}
            {currentStep === 2 && (
              <>
                <div className="space-y-2">
                  <Label>Services Offered *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {serviceOptions.map((service) => (
                      <button
                        key={service}
                        type="button"
                        onClick={() => handleServiceToggle(service)}
                        className={`p-2 text-xs rounded-md border transition-colors ${
                          formData.services.includes(service)
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background text-foreground border-input hover:bg-accent'
                        }`}
                      >
                        {service}
                      </button>
                    ))}
                  </div>
                  {errors.services && <p className="text-sm text-destructive">{errors.services}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience *</Label>
                  <Input
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => updateFormData('experience', e.target.value)}
                    placeholder="e.g., 5 years"
                    className={errors.experience ? 'border-destructive' : ''}
                  />
                  {errors.experience && <p className="text-sm text-destructive">{errors.experience}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certifications">Certifications & Qualifications</Label>
                  <Textarea
                    id="certifications"
                    value={formData.certifications}
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
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => updateFormData('city', e.target.value)}
                    placeholder="Enter your city"
                    className={errors.city ? 'border-destructive' : ''}
                  />
                  {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postcode">Postcode *</Label>
                  <Input
                    id="postcode"
                    value={formData.postcode}
                    onChange={(e) => updateFormData('postcode', e.target.value)}
                    placeholder="Enter your postcode"
                    className={errors.postcode ? 'border-destructive' : ''}
                  />
                  {errors.postcode && <p className="text-sm text-destructive">{errors.postcode}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceRadius">Service Radius</Label>
                  <select
                    id="serviceRadius"
                    value={formData.serviceRadius}
                    onChange={(e) => updateFormData('serviceRadius', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="5">Within 5 km</option>
                    <option value="10">Within 10 km</option>
                    <option value="25">Within 25 km</option>
                    <option value="50">Within 50 km</option>
                  </select>
                </div>
              </>
            )}

            {/* Step 4: Portfolio */}
            {currentStep === 4 && (
              <>
                <div className="space-y-4">
                  <Label>Portfolio Images (Optional)</Label>
                  <p className="text-sm text-muted-foreground">
                    Upload up to 5 images showcasing your work quality
                  </p>

                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="portfolio-upload"
                      disabled={formData.portfolioImages.length >= 5}
                    />
                    <Label
                      htmlFor="portfolio-upload"
                      className={`cursor-pointer text-primary hover:underline ${
                        formData.portfolioImages.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {formData.portfolioImages.length >= 5 ? 'Maximum 5 images' : 'Click to upload images'}
                    </Label>
                  </div>

                  {/* Image Previews */}
                  {formData.portfolioImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {formData.portfolioImages.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Portfolio ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/80"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center md:sticky md:bottom-4 bg-background md:bg-transparent py-4 md:py-0">
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
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={completeRegistration}
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