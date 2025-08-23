import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Shield, 
  CheckCircle, 
  Star, 
  Upload, 
  MapPin, 
  Wrench, 
  Camera, 
  User, 
  Mail, 
  Phone,
  Lock,
  X
} from "lucide-react";

const PostJob = () => {
    const [searchParams] = useSearchParams();
    const initialCountry = searchParams.get('country') || 'GB';
    const initialLocation = searchParams.get('postcode') || '';
    
    const [formData, setFormData] = useState({
        country: initialCountry,
        location: initialLocation,
        serviceCategory: '',
        jobTitle: '',
        jobDescription: '',
        budget: '',
        urgency: '',
        firstName: '',
        email: '',
        phone: '',
        contactMethod: 'email'
    });

    const [uploadedImages, setUploadedImages] = useState<File[]>([]);

    useEffect(() => {
        setFormData(prev => ({ 
            ...prev, 
            country: initialCountry, 
            location: initialLocation 
        }));
    }, [initialCountry, initialLocation]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setUploadedImages(prev => [...prev, ...files]);
    };

    const removeImage = (index: number) => {
        setUploadedImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Form submission logic here
        console.log('Form submitted:', formData, uploadedImages);
    };

    const serviceCategories = [
        'Plumbing', 'Electrical', 'Carpentry', 'Roofing', 'Painting', 
        'Gardening', 'Heating & Cooling', 'Flooring', 'Cleaning', 'Other'
    ];

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-surface via-surface-50 to-accent/5">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-foreground mb-4">Post Your Job</h1>
                        <p className="text-lg text-muted-foreground mb-4">
                            It's free to post. Upload photos, add details, and connect with verified tradespeople.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <Lock className="w-4 h-4" />
                            <span>Your details are private. Only verified professionals see your job.</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Section 1: Job Location */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-primary" />
                                    Job Location
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="country">Country</Label>
                                        <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="GB">United Kingdom</SelectItem>
                                                <SelectItem value="IE">Ireland</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="location">Town/City or Postcode</Label>
                                        <Input
                                            id="location"
                                            value={formData.location}
                                            onChange={(e) => handleInputChange('location', e.target.value)}
                                            placeholder="Enter your postcode or area"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Section 2: Job Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Wrench className="w-5 h-5 text-primary" />
                                    Job Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="serviceCategory">Service Category</Label>
                                    <Select value={formData.serviceCategory} onValueChange={(value) => handleInputChange('serviceCategory', value)}>
                                        <SelectTrigger>
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
                                    <Label htmlFor="jobTitle">Job Title</Label>
                                    <Input
                                        id="jobTitle"
                                        value={formData.jobTitle}
                                        onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                                        placeholder="e.g., Fix leaking pipe"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="jobDescription">Job Description</Label>
                                    <Textarea
                                        id="jobDescription"
                                        value={formData.jobDescription}
                                        onChange={(e) => handleInputChange('jobDescription', e.target.value)}
                                        placeholder="Describe the problem and when you need it done"
                                        className="min-h-[120px]"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Section 3: Photo Upload */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Camera className="w-5 h-5 text-primary" />
                                    Photos (Required)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-lg font-medium mb-2">Upload photos of your job</p>
                                    <p className="text-muted-foreground mb-4">Drag and drop or click to browse</p>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        id="photo-upload"
                                    />
                                    <Button asChild variant="outline">
                                        <label htmlFor="photo-upload" className="cursor-pointer">
                                            Choose Files
                                        </label>
                                    </Button>
                                </div>
                                
                                {uploadedImages.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-sm font-medium mb-2">Uploaded Images:</p>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {uploadedImages.map((file, index) => (
                                                <div key={index} className="relative">
                                                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                                                        <Camera className="w-8 h-8 text-muted-foreground" />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                    <p className="text-xs text-muted-foreground mt-1 truncate">{file.name}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Section 4: Optional Extras */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Optional Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <Label>Budget Range</Label>
                                    <Select value={formData.budget} onValueChange={(value) => handleInputChange('budget', value)}>
                                        <SelectTrigger>
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
                                    <Label>When do you need this done?</Label>
                                    <RadioGroup 
                                        value={formData.urgency} 
                                        onValueChange={(value) => handleInputChange('urgency', value)}
                                        className="mt-2"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="asap" id="asap" />
                                            <Label htmlFor="asap">ASAP</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="week" id="week" />
                                            <Label htmlFor="week">Within a week</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="flexible" id="flexible" />
                                            <Label htmlFor="flexible">Flexible</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Section 5: Contact Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5 text-primary" />
                                    Contact Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input
                                            id="firstName"
                                            value={formData.firstName}
                                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                                            placeholder="Your first name"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        placeholder="Your phone number"
                                    />
                                </div>
                                <div>
                                    <Label>Preferred Contact Method</Label>
                                    <RadioGroup 
                                        value={formData.contactMethod} 
                                        onValueChange={(value) => handleInputChange('contactMethod', value)}
                                        className="mt-2"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="email" id="email-contact" />
                                            <Label htmlFor="email-contact" className="flex items-center gap-2">
                                                <Mail className="w-4 h-4" />
                                                Email
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="phone" id="phone-contact" />
                                            <Label htmlFor="phone-contact" className="flex items-center gap-2">
                                                <Phone className="w-4 h-4" />
                                                Phone
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="either" id="either-contact" />
                                            <Label htmlFor="either-contact">Either</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    We never share your details publicly.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Trust & Assurance Block */}
                        <Card className="bg-primary/5 border-primary/20">
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                                    <div className="flex flex-col items-center">
                                        <CheckCircle className="w-8 h-8 text-primary mb-2" />
                                        <p className="text-sm font-medium">Free to post — no obligation to hire</p>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <Shield className="w-8 h-8 text-primary mb-2" />
                                        <p className="text-sm font-medium">Verified & insured tradespeople only</p>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <Star className="w-8 h-8 text-primary mb-2" />
                                        <p className="text-sm font-medium">30,000+ happy customers</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Final CTA */}
                        <div className="text-center space-y-4">
                            <Button 
                                type="submit" 
                                size="lg" 
                                className="w-full md:w-auto px-12 py-4 text-lg font-semibold"
                                disabled={uploadedImages.length === 0}
                            >
                                Post My Job
                            </Button>
                            <p className="text-sm text-muted-foreground">
                                We'll notify local tradespeople right away.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default PostJob;