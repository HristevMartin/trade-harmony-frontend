import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import ErrorModal from "@/components/ErrorModal";
import {
    HiArrowLeft,
    HiWrenchScrewdriver,
    HiMapPin,
    HiCurrencyPound,
    HiClock,
    HiCamera,
    HiCloudArrowUp,
    HiXMark,
    HiCheckCircle,
    HiUserCircle,
    HiEnvelope,
    HiPhone,
    HiGlobeAlt
} from "react-icons/hi2";

// Country options mapping
const countryOptions = [
    { value: 'GB', label: '🇬🇧 United Kingdom' },
    { value: 'BG', label: '🇧🇬 Bulgaria' },
    { value: 'DE', label: '🇩🇪 Germany' },
    { value: 'FR', label: '🇫🇷 France' },
    { value: 'ES', label: '🇪🇸 Spain' },
];

// Service categories
const serviceCategories = [
    'Electrical',
    'Plumbing',
    'Heating & Gas',
    'Building & Construction',
    'Roofing',
    'Carpentry',
    'Flooring',
    'Painting & Decorating',
    'Gardening & Landscaping',
    'Cleaning',
    'Handyman Services',
    'Kitchen & Bathroom',
    'Windows & Doors',
    'Tiling',
    'Other'
];

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

interface FormData {
    job_title: string;
    job_description: string;
    location: string;
    budget: string;
    urgency: string;
    images: File[];
    existing_images: string[];
    first_name: string;
    email: string;
    phone: string;
    country: string;
    service_category: string;
}

const EditJob = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [jobData, setJobData] = useState<JobData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorModalMessage, setErrorModalMessage] = useState('');
    
    const [formData, setFormData] = useState<FormData>({
        job_title: '',
        job_description: '',
        location: '',
        budget: '',
        urgency: '',
        images: [],
        existing_images: [],
        first_name: '',
        email: '',
        phone: '',
        country: '',
        service_category: ''
    });

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

                console.log('show me the data', data);
                
                if (data.success && data.project) {
                    const job = data.project;
                    setJobData(job);
                    
                    // Prefill form with existing data
                    setFormData({
                        job_title: job.job_title || '',
                        job_description: job.job_description || '',
                        location: job.additional_data?.location || '',
                        budget: job.budget || '',
                        urgency: job.urgency || '',
                        images: [],
                        existing_images: job.image_urls || [],
                        first_name: job.first_name || '',
                        email: job.email || '',
                        phone: job.phone || '',
                        country: job.additional_data?.country || '',
                        service_category: job.additional_data?.serviceCategory || ''
                    });
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

    const handleInputChange = (field: keyof FormData, value: string | string[]) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        const totalImages = formData.existing_images.length + formData.images.length + files.length;
        
        if (totalImages > 5) {
            setErrorModalMessage('Maximum 5 images allowed');
            setShowErrorModal(true);
            return;
        }

        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...files]
        }));
        
        // Clear input
        event.target.value = '';
    };

    const removeExistingImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            existing_images: prev.existing_images.filter((_, i) => i !== index)
        }));
    };

    const removeNewImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            
            // Prepare FormData with all job details and images
            const formDataToSend = new FormData();
            
            // Add basic job information
            formDataToSend.append('job_title', formData.job_title);
            formDataToSend.append('job_description', formData.job_description);
            formDataToSend.append('location', formData.location);
            formDataToSend.append('budget', formData.budget);
            formDataToSend.append('urgency', formData.urgency);
            
            // Add contact and additional information
            formDataToSend.append('first_name', formData.first_name);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('phone', formData.phone);
            formDataToSend.append('country', formData.country);
            formDataToSend.append('service_category', formData.service_category);
            
            // Add existing image URLs (that user wants to keep)
            formData.existing_images.forEach((imageUrl, index) => {
                formDataToSend.append('existing_images', imageUrl);
            });
            
            // Add new image files
            formData.images.forEach((image, index) => {
                formDataToSend.append('new_images', image);
            });
            
            // Add total image count for validation
            formDataToSend.append('total_images_count', (formData.existing_images.length + formData.images.length).toString());

            // Add userId from auth data
            const authUser = localStorage.getItem('auth_user');
            if (authUser) {
                const userData = JSON.parse(authUser);
                formDataToSend.append('userId', userData.id);
            }

            // Log what we're sending for debugging
            console.log('Sending to API:', {
                job_title: formData.job_title,
                job_description: formData.job_description,
                location: formData.location,
                budget: formData.budget,
                urgency: formData.urgency,
                existing_images_count: formData.existing_images.length,
                new_images_count: formData.images.length,
                existing_images: formData.existing_images,
            });

            const response = await fetch(`${import.meta.env.VITE_API_URL}/travel/edit-client-project/${id}`, {
                method: 'PUT',
                credentials: 'include',
                body: formDataToSend
            });

            const data = await response.json();
            console.log('API Response:', data);
            
            if (data.success) {
                setShowSuccess(true);
                setTimeout(() => {
                    setShowSuccess(false);
                    navigate(`/jobs/${id}`, { state: { editSuccess: true } });
                }, 2000);
            } else {
                throw new Error(data.message || 'Failed to update job');
            }
            
        } catch (err) {
            console.error('Error saving job:', err);
            setErrorModalMessage('Failed to save changes. Please try again.');
            setShowErrorModal(true);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        navigate(`/jobs/${id}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading job details...</p>
                </div>
            </div>
        );
    }

    if (error || !jobData) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900 mb-4">Job Not Found</h1>
                    <p className="text-slate-600 mb-6">{error || 'The job you are looking for does not exist.'}</p>
                    <Button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-700">
                        <HiArrowLeft className="w-4 h-4 mr-2" />
                        Go Home
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-slate-50 pb-20 md:pb-6">
                {/* Success Toast */}
                {showSuccess && (
                    <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
                        <div className="flex items-center gap-2">
                            <HiCheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-green-800 font-medium">Job updated successfully!</span>
                        </div>
                    </div>
                )}

                <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-10">
                    {/* Header */}
                    <div className="mb-6 md:mb-8">
                        <div className="flex items-center gap-4 mb-4">
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                className="flex items-center gap-2"
                                size="sm"
                            >
                                <HiArrowLeft className="w-4 h-4" />
                                Back
                            </Button>
                        </div>
                        
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-2">
                            Edit Job
                        </h1>
                        <p className="text-slate-600">
                            Update your job details to attract the right tradespeople
                        </p>
                    </div>

                    {/* Main Form Card */}
                    <Card className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-6 md:p-8 mb-6">
                        <div className="space-y-8">
                            {/* Job Details Section */}
                            <div>
                                <div className="flex items-center gap-2 mb-6">
                                    <HiWrenchScrewdriver className="w-5 h-5 text-blue-600" />
                                    <h2 className="text-lg font-semibold text-slate-900">Job Details</h2>
                                </div>
                                
                                <div className="space-y-6">
                                    {/* Service Category */}
                                    <div>
                                        <Label htmlFor="service_category" className="text-sm font-medium text-slate-900 mb-2 block">
                                            Service Category *
                                        </Label>
                                        <Select value={formData.service_category} onValueChange={(value) => handleInputChange('service_category', value)}>
                                            <SelectTrigger className="rounded-xl border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
                                                <SelectValue placeholder="Select a service category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {serviceCategories.map((category) => (
                                                    <SelectItem key={category} value={category}>
                                                        {category}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Job Title */}
                                    <div>
                                        <Label htmlFor="job_title" className="text-sm font-medium text-slate-900 mb-2 block">
                                            Job Title *
                                        </Label>
                                        <Input
                                            id="job_title"
                                            type="text"
                                            value={formData.job_title}
                                            onChange={(e) => handleInputChange('job_title', e.target.value)}
                                            placeholder="e.g. Fix leaking tap in kitchen"
                                            className="rounded-xl border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                        />
                                    </div>

                                    {/* Job Description */}
                                    <div>
                                        <Label htmlFor="job_description" className="text-sm font-medium text-slate-900 mb-2 block">
                                            Description *
                                        </Label>
                                        <Textarea
                                            id="job_description"
                                            value={formData.job_description}
                                            onChange={(e) => handleInputChange('job_description', e.target.value)}
                                            placeholder="Describe what needs to be done..."
                                            rows={4}
                                            className="rounded-xl border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Location Section */}
                            <div>
                                <div className="flex items-center gap-2 mb-6">
                                    <HiMapPin className="w-5 h-5 text-blue-600" />
                                    <h2 className="text-lg font-semibold text-slate-900">Location</h2>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Country */}
                                    <div>
                                        <Label htmlFor="country" className="text-sm font-medium text-slate-900 mb-2 block">
                                            Country *
                                        </Label>
                                        <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                                            <SelectTrigger className="rounded-xl border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
                                                <SelectValue placeholder="Select country" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {countryOptions.map((country) => (
                                                    <SelectItem key={country.value} value={country.value}>
                                                        {country.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Town/City */}
                                    <div>
                                        <Label htmlFor="location" className="text-sm font-medium text-slate-900 mb-2 block">
                                            Town/City *
                                        </Label>
                                        <Input
                                            id="location"
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => handleInputChange('location', e.target.value)}
                                            placeholder="e.g. London"
                                            className="rounded-xl border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Budget & Urgency Section */}
                            <div>
                                <div className="flex items-center gap-2 mb-6">
                                    <HiCurrencyPound className="w-5 h-5 text-blue-600" />
                                    <h2 className="text-lg font-semibold text-slate-900">Budget & Timing</h2>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Budget */}
                                    <div>
                                        <Label htmlFor="budget" className="text-sm font-medium text-slate-900 mb-2 block">
                                            Budget
                                        </Label>
                                        <Select value={formData.budget} onValueChange={(value) => handleInputChange('budget', value)}>
                                            <SelectTrigger className="rounded-xl border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
                                                <SelectValue placeholder="Select budget range" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="under-200">Under £200</SelectItem>
                                                <SelectItem value="200-500">£200 - £500</SelectItem>
                                                <SelectItem value="over-500">£500+</SelectItem>
                                                <SelectItem value="flexible">Flexible</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Urgency */}
                                    <div>
                                        <Label className="text-sm font-medium text-slate-900 mb-3 block">
                                            <HiClock className="w-4 h-4 inline mr-1" />
                                            When do you need this done? *
                                        </Label>
                                        <RadioGroup 
                                            value={formData.urgency} 
                                            onValueChange={(value) => handleInputChange('urgency', value)}
                                            className="space-y-2"
                                        >
                                            {[
                                                { value: 'asap', label: 'ASAP' },
                                                { value: 'this_week', label: 'Within a week' },
                                                { value: 'this_month', label: 'Within a month' },
                                                { value: 'flexible', label: 'Flexible' }
                                            ].map((option) => (
                                                <div key={option.value} className="flex items-center space-x-2">
                                                    <RadioGroupItem 
                                                        value={option.value} 
                                                        id={option.value}
                                                        className="border-slate-300"
                                                    />
                                                    <Label 
                                                        htmlFor={option.value}
                                                        className="text-sm font-normal cursor-pointer"
                                                    >
                                                        {option.label}
                                                    </Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information Section */}
                            <div>
                                <div className="flex items-center gap-2 mb-6">
                                    <HiUserCircle className="w-5 h-5 text-blue-600" />
                                    <h2 className="text-lg font-semibold text-slate-900">Contact Information</h2>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* First Name */}
                                    <div>
                                        <Label htmlFor="first_name" className="text-sm font-medium text-slate-900 mb-2 block">
                                            First Name *
                                        </Label>
                                        <Input
                                            id="first_name"
                                            type="text"
                                            value={formData.first_name}
                                            onChange={(e) => handleInputChange('first_name', e.target.value)}
                                            placeholder="e.g. John"
                                            className="rounded-xl border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                        />
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <Label htmlFor="phone" className="text-sm font-medium text-slate-900 mb-2 block">
                                            <HiPhone className="w-4 h-4 inline mr-1" />
                                            Phone Number
                                        </Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            placeholder="e.g. 07700 123456"
                                            className="rounded-xl border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                        />
                                    </div>

                                    {/* Email - Full Width */}
                                    <div className="md:col-span-2">
                                        <Label htmlFor="email" className="text-sm font-medium text-slate-900 mb-2 block">
                                            <HiEnvelope className="w-4 h-4 inline mr-1" />
                                            Email Address *
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            placeholder="e.g. john@example.com"
                                            className="rounded-xl border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Photos Section */}
                            <div>
                                <div className="flex items-center gap-2 mb-6">
                                    <HiCamera className="w-5 h-5 text-blue-600" />
                                    <h2 className="text-lg font-semibold text-slate-900">Photos</h2>
                                </div>

                                {/* Existing Photos */}
                                {(formData.existing_images.length > 0 || formData.images.length > 0) && (
                                    <div className="mb-4">
                                        <Label className="text-sm font-medium text-slate-900 mb-3 block">
                                            Current Photos
                                        </Label>
                                        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                            {/* Existing Images */}
                                            {formData.existing_images.map((imageUrl, index) => (
                                                <div key={`existing-${index}`} className="relative aspect-square">
                                                    <img
                                                        src={imageUrl}
                                                        alt={`Job photo ${index + 1}`}
                                                        className="w-full h-full object-cover rounded-xl ring-1 ring-slate-200"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeExistingImage(index)}
                                                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-colors"
                                                    >
                                                        <HiXMark className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                            
                                            {/* New Images */}
                                            {formData.images.map((image, index) => (
                                                <div key={`new-${index}`} className="relative aspect-square">
                                                    <img
                                                        src={URL.createObjectURL(image)}
                                                        alt={`New photo ${index + 1}`}
                                                        className="w-full h-full object-cover rounded-xl ring-1 ring-slate-200"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeNewImage(index)}
                                                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-colors"
                                                    >
                                                        <HiXMark className="w-3 h-3" />
                                                    </button>
                                                    <Badge className="absolute bottom-1 left-1 bg-blue-100 text-blue-800 text-xs">
                                                        New
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Upload New Photos */}
                                {(formData.existing_images.length + formData.images.length) < 5 && (
                                    <div>
                                        <Label className="text-sm font-medium text-slate-900 mb-3 block">
                                            Add More Photos
                                        </Label>
                                        <div className="border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors p-6 text-center">
                                            <HiCloudArrowUp className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                            <p className="text-sm text-slate-600 mb-3">
                                                Upload photos to help tradespeople understand the job
                                            </p>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleImageUpload}
                                                className="hidden"
                                                id="photo-upload"
                                            />
                                            <Label
                                                htmlFor="photo-upload"
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white ring-1 ring-slate-200 hover:bg-slate-50 cursor-pointer text-sm font-medium"
                                            >
                                                Choose photos
                                            </Label>
                                            <p className="text-xs text-slate-500 mt-2">
                                                Maximum 5 photos, up to 10MB each
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Desktop Action Buttons */}
                    <div className="hidden md:flex gap-4 justify-end">
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            className="px-6 py-2"
                            disabled={saving}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={saving || !formData.job_title || !formData.job_description || !formData.first_name || !formData.email || !formData.country || !formData.location || !formData.service_category}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700"
                        >
                            {saving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </div>
                </div>

                {/* Mobile Sticky Footer */}
                <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 p-4 md:hidden">
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            className="flex-1"
                            disabled={saving}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={saving || !formData.job_title || !formData.job_description || !formData.first_name || !formData.email || !formData.country || !formData.location || !formData.service_category}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                            {saving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </div>
                </div>

                {/* Mobile spacer for fixed sticky footer */}
                <div className="h-20 md:hidden" />

                {/* Error Modal */}
                <ErrorModal
                    isOpen={showErrorModal}
                    onClose={() => setShowErrorModal(false)}
                    title="Error"
                    message={errorModalMessage}
                    actionButton={{
                        text: "Try Again",
                        onClick: () => setShowErrorModal(false)
                    }}
                />
            </div>
        </>
    );
};

export default EditJob;