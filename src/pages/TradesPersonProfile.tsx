import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useToast } from "@/hooks/use-toast";
import {
    User,
    MapPin,
    Phone,
    Mail,
    Calendar,
    Award,
    Star,
    Edit3,
    Camera,
    Briefcase,
    Clock,
    CheckCircle,
    Save,
    X
} from "lucide-react";

const TradesPersonProfile = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const [traderProfile, setTraderProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    // Editing states
    const [editingField, setEditingField] = useState<string | null>(null);
    const [editingServices, setEditingServices] = useState(false);
    const [tempData, setTempData] = useState<any>({});
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Service options - simplified to match popular services
    const getServiceOptions = () => {
        return [
            'Plumbing',
            'Electrical', 
            'Carpentry',
            'Roofing',
            'Painting',
            'Gardening',
            'Heating & Cooling',
            'Mechanical Repairs'
        ];
    };

    // Save profile data
    const saveProfile = async (field: string, value: any) => {
        if (!userId) return;
        
        setSaving(true);
        try {
            const updateData = { [field]: value };
            
            // Optimistically update the UI immediately
            setTraderProfile(prev => ({
                ...prev,
                [field]: value
            }));
            
            const response = await fetch(`${apiUrl}/travel/get-trader-project/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            const data = await response.json();
            
            if (data.success) {
                // Update with server response to ensure consistency
                setTraderProfile(data.project);
                toast({
                    title: "Profile Updated",
                    description: "Your profile has been successfully updated.",
                });
                setEditingField(null);
                setEditingServices(false);
                setTempData({});
            } else {
                // Revert optimistic update on failure
                setTraderProfile(prev => prev);
                throw new Error('Failed to update profile');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            // Fetch fresh data to ensure UI is in sync
            try {
                const response = await fetch(`${apiUrl}/travel/get-trader-project/${userId}`);
                const data = await response.json();
                if (data.success) {
                    setTraderProfile(data.project);
                }
            } catch (fetchError) {
                console.error('Error fetching fresh profile data:', fetchError);
            }
            
            toast({
                title: "Error",
                description: "Failed to update profile. Please try again.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    // Handle service selection
    const handleServiceToggle = (service: string) => {
        setSelectedServices(prev => 
            prev.includes(service) 
                ? prev.filter(s => s !== service)
                : [...prev, service]
        );
    };

    // Start editing services
    const startEditingServices = () => {
        const currentServices = getOtherServices();
        setSelectedServices([...currentServices]); // Create a copy to avoid mutations
        setEditingServices(true);
    };

    // Save services
    const saveServices = async () => {
        const servicesJson = JSON.stringify(selectedServices);
        await saveProfile('otherServices', servicesJson);
        setEditingServices(false); // Close editing mode after save
    };

    // Cancel editing
    const cancelEditing = () => {
        setEditingField(null);
        setEditingServices(false);
        setTempData({});
        setSelectedServices([]);
    };

    // Handle image upload
    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !userId) return;

        setUploadingImage(true);
        try {
            const formData = new FormData();
            
            // Add the portfolio image
            formData.append('portfolio_image', file);
            
            // Add existing portfolio images to maintain them
            if (traderProfile.projectImages) {
                traderProfile.projectImages.forEach((imageUrl, index) => {
                    formData.append('existing_portfolio_images', imageUrl);
                });
            }

            const response = await fetch(`${apiUrl}/travel/get-trader-project/${userId}`, {
                method: 'PUT',
                body: formData,
            });

            const data = await response.json();
            
            if (data.success) {
                // Update the trader profile with the response data
                setTraderProfile(data.project || data.trader);
                
                
                toast({
                    title: "Image Uploaded",
                    description: "Your portfolio image has been successfully uploaded.",
                });
            } else {
                throw new Error(data.error || 'Failed to upload image');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            toast({
                title: "Upload Failed",
                description: "Failed to upload image. Please try again.",
                variant: "destructive",
            });
        } finally {
            setUploadingImage(false);
            // Reset the input
            if (event.target) {
                event.target.value = '';
            }
        }
    };

    const handleCertificationImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !userId) {
            console.log('No file selected or user not authenticated:', { file: !!file, userId });
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast({
                title: "Invalid File Type",
                description: "Please select an image file (JPG, PNG, etc.).",
                variant: "destructive",
            });
            return;
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            toast({
                title: "File Too Large",
                description: "Please select an image smaller than 10MB.",
                variant: "destructive",
            });
            return;
        }

        console.log('Starting certification image upload:', {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            userId
        });

        try {
            setUploadingImage(true);
            
            const formData = new FormData();
            
            // Add the certification image with the correct field name expected by the API
            formData.append('certificationImages', file);
            
            // Add existing certification images to maintain them
            if (traderProfile.certificationImages && Array.isArray(traderProfile.certificationImages)) {
                traderProfile.certificationImages.forEach((imageUrl, index) => {
                    formData.append('existing_certification_images', imageUrl);
                });
            }

            // Add existing portfolio images to maintain them
            if (traderProfile.projectImages && Array.isArray(traderProfile.projectImages)) {
                traderProfile.projectImages.forEach((imageUrl, index) => {
                    formData.append('existing_portfolio_images', imageUrl);
                });
            }

            // Add userId for the API
            formData.append('userId', userId);

            // Debug: Log FormData entries
            console.log('FormData entries for certification upload:');
            for (let [key, value] of formData.entries()) {
                if (value instanceof File) {
                    console.log(`${key}:`, `File(${value.name}, ${value.size} bytes, ${value.type})`);
                } else {
                    console.log(`${key}:`, value);
                }
            }

            const response = await fetch(`${apiUrl}/travel/get-trader-project/${userId}`, {
                method: 'PUT',
                body: formData,
            });

            console.log('Certification upload response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Certification upload failed:', response.status, errorText);
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            console.log('Certification upload response data:', data);
            
            if (data.success) {
                // Update the trader profile with the response data
                setTraderProfile(data.project || data.trader);
                
                toast({
                    title: "Certification Image Uploaded",
                    description: "Your certification image has been successfully uploaded.",
                });
            } else {
                throw new Error(data.error || 'Failed to upload certification image');
            }
        } catch (error) {
            console.error('Error uploading certification image:', error);
            toast({
                title: "Upload Failed",
                description: `Failed to upload certification image: ${error.message}`,
                variant: "destructive",
            });
        } finally {
            setUploadingImage(false);
            // Reset the input
            if (event.target) {
                event.target.value = '';
            }
        }
    };
    
    // Safely get userId from localStorage
    const getUserId = () => {
        try {
            const localStorageData = localStorage.getItem('auth_user');
            if (!localStorageData) return null;
            const userData = JSON.parse(localStorageData);
            return userData?.id;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    };

    const userId = getUserId();

    useEffect(() => {
        const fetchProfile = async () => {
            if (!userId) {
                setError('User not authenticated');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await fetch(`${apiUrl}/travel/get-trader-project/${userId}`);
                const data = await response.json();
                
                if (data.success) {
                    setTraderProfile(data.project);
                } else {
                    setError('Failed to load profile');
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                setError('Failed to load profile. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [userId, apiUrl]);

    // Parse otherServices from JSON string
    const getOtherServices = () => {
        try {
            if (!traderProfile?.otherServices) return [];
            const parsed = JSON.parse(traderProfile.otherServices);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    };

    // Format date for display
    const formatJoinDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            month: 'long',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
                <div className="container mx-auto px-4 py-8 max-w-6xl">
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trust-blue mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Loading your profile...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !traderProfile) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
                <div className="container mx-auto px-4 py-8 max-w-6xl">
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <Card className="w-full max-w-md mx-auto shadow-lg">
                            <CardContent className="p-6 text-center">
                                <h2 className="text-lg font-semibold text-destructive mb-2">Profile Not Found</h2>
                                <p className="text-muted-foreground mb-4">{error || 'Unable to load profile data'}</p>
                                <Button onClick={() => window.location.reload()}>
                                    Try Again
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-background">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 border-b border-border/5">
                <div className="container mx-auto px-4 py-12 max-w-6xl">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-2xl scale-110"></div>
                            <Avatar className="relative h-32 w-32 border-4 border-background shadow-2xl">
                                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-2xl font-bold">
                                    {traderProfile.name?.split(' ').map((n: string) => n[0]).join('') || 'TP'}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-3">
                                {traderProfile.name}
                            </h1>
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                                <Badge variant="default" className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0 px-4 py-2 text-base font-medium">
                                    {traderProfile.primaryTrade} Specialist
                                </Badge>
                                <Badge variant="outline" className="border-primary/30 text-primary px-3 py-1">
                                    {traderProfile.experienceYears} years exp.
                                </Badge>
                            </div>
                            <p className="text-muted-foreground text-lg max-w-2xl">
                                Professional {traderProfile.primaryTrade.toLowerCase()} services in {traderProfile.city} and surrounding areas
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="bg-background/50 backdrop-blur-sm rounded-xl p-4 border border-border/20">
                                <div className="text-2xl font-bold text-primary">{traderProfile.experienceYears}</div>
                                <div className="text-sm text-muted-foreground">Years Experience</div>
                            </div>
                            <div className="bg-background/50 backdrop-blur-sm rounded-xl p-4 border border-border/20">
                                <div className="text-2xl font-bold text-primary">{traderProfile.radiusKm}km</div>
                                <div className="text-sm text-muted-foreground">Service Radius</div>
                            </div>
                            <div className="bg-background/50 backdrop-blur-sm rounded-xl p-4 border border-border/20">
                                <div className="text-2xl font-bold text-primary flex items-center justify-center">
                                    <Star className="h-5 w-5 fill-current" />
                                </div>
                                <div className="text-sm text-muted-foreground">Verified Pro</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Sidebar - Contact & Quick Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Contact Information */}
                        <Card className="shadow-xl bg-gradient-to-br from-card to-card/80 border-0">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-xl flex items-center">
                                    <User className="h-5 w-5 mr-2 text-primary" />
                                    Contact Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                 <div className="space-y-4">
                                     {/* Email */}
                                     <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/10">
                                         <div className="bg-primary/10 p-2 rounded-lg">
                                             <Mail className="h-4 w-4 text-primary" />
                                         </div>
                                         <div className="flex-1">
                                             <div className="flex items-center justify-between mb-2">
                                                 <p className="text-sm text-muted-foreground">Email Address</p>
                                                 {editingField !== 'email' && (
                                                     <Button
                                                         size="sm"
                                                         variant="ghost"
                                                         onClick={() => {
                                                             setEditingField('email');
                                                             setTempData({ email: traderProfile.email });
                                                         }}
                                                         className="h-6 w-6 p-0 hover:bg-primary/10"
                                                     >
                                                         <Edit3 className="h-3 w-3" />
                                                     </Button>
                                                 )}
                                             </div>
                                             {editingField === 'email' ? (
                                                 <div className="space-y-2">
                                                     <Input
                                                         value={tempData.email || ''}
                                                         onChange={(e) => setTempData({ ...tempData, email: e.target.value })}
                                                         type="email"
                                                         className="text-sm"
                                                     />
                                                     <div className="flex gap-2">
                                                         <Button
                                                             size="sm"
                                                             onClick={() => saveProfile('email', tempData.email)}
                                                             disabled={saving}
                                                             className="h-7 px-3"
                                                         >
                                                             <Save className="h-3 w-3 mr-1" />
                                                             Save
                                                         </Button>
                                                         <Button
                                                             size="sm"
                                                             variant="outline"
                                                             onClick={cancelEditing}
                                                             className="h-7 px-3"
                                                         >
                                                             <X className="h-3 w-3 mr-1" />
                                                             Cancel
                                                         </Button>
                                                     </div>
                                                 </div>
                                             ) : (
                                                 <p className="font-medium text-foreground break-all">{traderProfile.email}</p>
                                             )}
                                         </div>
                                     </div>
                                     
                                     {/* Phone */}
                                     <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-secondary/5 to-secondary/10 rounded-xl border border-secondary/10">
                                         <div className="bg-secondary/10 p-2 rounded-lg">
                                             <Phone className="h-4 w-4 text-secondary" />
                                         </div>
                                         <div className="flex-1">
                                             <div className="flex items-center justify-between mb-2">
                                                 <p className="text-sm text-muted-foreground">Phone Number</p>
                                                 {editingField !== 'phone' && (
                                                     <Button
                                                         size="sm"
                                                         variant="ghost"
                                                         onClick={() => {
                                                             setEditingField('phone');
                                                             setTempData({ phone: traderProfile.phone });
                                                         }}
                                                         className="h-6 w-6 p-0 hover:bg-secondary/10"
                                                     >
                                                         <Edit3 className="h-3 w-3" />
                                                     </Button>
                                                 )}
                                             </div>
                                             {editingField === 'phone' ? (
                                                 <div className="space-y-2">
                                                     <Input
                                                         value={tempData.phone || ''}
                                                         onChange={(e) => setTempData({ ...tempData, phone: e.target.value })}
                                                         type="tel"
                                                         className="text-sm"
                                                     />
                                                     <div className="flex gap-2">
                                                         <Button
                                                             size="sm"
                                                             onClick={() => saveProfile('phone', tempData.phone)}
                                                             disabled={saving}
                                                             className="h-7 px-3"
                                                         >
                                                             <Save className="h-3 w-3 mr-1" />
                                                             Save
                                                         </Button>
                                                         <Button
                                                             size="sm"
                                                             variant="outline"
                                                             onClick={cancelEditing}
                                                             className="h-7 px-3"
                                                         >
                                                             <X className="h-3 w-3 mr-1" />
                                                             Cancel
                                                         </Button>
                                                     </div>
                                                 </div>
                                             ) : (
                                                 <p className="font-medium text-foreground">{traderProfile.phone}</p>
                                             )}
                                         </div>
                                     </div>
                                     
                                     {/* Location */}
                                     <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-accent/5 to-accent/10 rounded-xl border border-accent/10">
                                         <div className="bg-accent/10 p-2 rounded-lg">
                                             <MapPin className="h-4 w-4 text-accent" />
                                         </div>
                                         <div className="flex-1">
                                             <div className="flex items-center justify-between mb-2">
                                                 <p className="text-sm text-muted-foreground">Service Location</p>
                                                 {editingField !== 'location' && (
                                                     <Button
                                                         size="sm"
                                                         variant="ghost"
                                                         onClick={() => {
                                                             setEditingField('location');
                                                             setTempData({ city: traderProfile.city, postcode: traderProfile.postcode });
                                                         }}
                                                         className="h-6 w-6 p-0 hover:bg-accent/10"
                                                     >
                                                         <Edit3 className="h-3 w-3" />
                                                     </Button>
                                                 )}
                                             </div>
                                             {editingField === 'location' ? (
                                                 <div className="space-y-2">
                                                     <div className="grid grid-cols-2 gap-2">
                                                         <div>
                                                             <Label htmlFor="city" className="text-xs text-muted-foreground">City</Label>
                                                             <Input
                                                                 id="city"
                                                                 value={tempData.city || ''}
                                                                 onChange={(e) => setTempData({ ...tempData, city: e.target.value })}
                                                                 className="text-sm"
                                                             />
                                                         </div>
                                                         <div>
                                                             <Label htmlFor="postcode" className="text-xs text-muted-foreground">Postcode</Label>
                                                             <Input
                                                                 id="postcode"
                                                                 value={tempData.postcode || ''}
                                                                 onChange={(e) => setTempData({ ...tempData, postcode: e.target.value })}
                                                                 className="text-sm"
                                                             />
                                                         </div>
                                                     </div>
                                                     <div className="flex gap-2">
                                                         <Button
                                                             size="sm"
                                                             onClick={async () => {
                                                                 // Save both city and postcode
                                                                 await saveProfile('city', tempData.city);
                                                                 await saveProfile('postcode', tempData.postcode);
                                                             }}
                                                             disabled={saving}
                                                             className="h-7 px-3"
                                                         >
                                                             <Save className="h-3 w-3 mr-1" />
                                                             Save
                                                         </Button>
                                                         <Button
                                                             size="sm"
                                                             variant="outline"
                                                             onClick={cancelEditing}
                                                             className="h-7 px-3"
                                                         >
                                                             <X className="h-3 w-3 mr-1" />
                                                             Cancel
                                                         </Button>
                                                     </div>
                                                 </div>
                                             ) : (
                                                 <p className="font-medium text-foreground">{traderProfile.city}, {traderProfile.postcode}</p>
                                             )}
                                         </div>
                                     </div>
                                     
                                     <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-muted/5 to-muted/10 rounded-xl border border-muted/20">
                                         <div className="bg-muted/10 p-2 rounded-lg">
                                             <Calendar className="h-4 w-4 text-muted-foreground" />
                                         </div>
                                         <div className="flex-1">
                                             <p className="text-sm text-muted-foreground">Member Since</p>
                                             <p className="font-medium text-foreground">{traderProfile.createdDate ? formatJoinDate(traderProfile.createdDate) : 'Recently joined'}</p>
                                         </div>
                                     </div>
                                 </div>
                                
                                <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg">
                                    <Edit3 className="h-4 w-4 mr-2" />
                                    Update Contact Info
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Professional Status */}
                        <Card className="shadow-xl bg-gradient-to-br from-card to-card/80 border-0">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-xl flex items-center">
                                    <Award className="h-5 w-5 mr-2 text-primary" />
                                    Professional Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                                    <div className="flex items-center space-x-3">
                                        <div className="bg-green-500 p-1.5 rounded-full">
                                            <CheckCircle className="h-4 w-4 text-white" />
                                        </div>
                                        <span className="font-medium text-green-800 dark:text-green-200">Verified Professional</span>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                                        <div className="text-2xl font-bold text-primary">{traderProfile.experienceYears}</div>
                                        <div className="text-xs text-muted-foreground">Years Experience</div>
                                    </div>
                                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                                        <div className="text-2xl font-bold text-primary">{traderProfile.radiusKm}km</div>
                                        <div className="text-xs text-muted-foreground">Coverage Area</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Detailed Information */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Services & Expertise */}
                        <Card className="shadow-xl bg-gradient-to-br from-card to-card/80 border-0">
                            <CardHeader className="pb-6">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-2xl flex items-center">
                                        <Briefcase className="h-6 w-6 mr-3 text-primary" />
                                        Services & Expertise
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-semibold text-lg">Primary Specialization</h4>
                                        {editingField !== 'primaryTrade' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    setEditingField('primaryTrade');
                                                    setTempData({ primaryTrade: traderProfile.primaryTrade });
                                                }}
                                                className="border-primary/20 hover:bg-primary/5"
                                            >
                                                <Edit3 className="h-3 w-3 mr-2" />
                                                Edit
                                            </Button>
                                        )}
                                    </div>
                                    
                                    {editingField === 'primaryTrade' ? (
                                        <div className="space-y-4">
                                            <select
                                                value={tempData.primaryTrade || ''}
                                                onChange={(e) => setTempData({ ...tempData, primaryTrade: e.target.value })}
                                                className="w-full p-3 border border-border/20 rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            >
                                                <option value="">Select Primary Trade</option>
                                                {getServiceOptions().map((service, index) => (
                                                    <option key={index} value={service}>
                                                        {service}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => saveProfile('primaryTrade', tempData.primaryTrade)}
                                                    disabled={saving || !tempData.primaryTrade}
                                                >
                                                    <Save className="h-3 w-3 mr-1" />
                                                    Save Trade
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={cancelEditing}
                                                >
                                                    <X className="h-3 w-3 mr-1" />
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <Badge variant="default" className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-6 py-3 text-lg font-medium border-0 shadow-lg">
                                                <Award className="h-4 w-4 mr-2" />
                                                {traderProfile.primaryTrade}
                                            </Badge>
                                        </div>
                                    )}
                                </div>

                                <Separator className="my-6" />

                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-semibold text-lg">Additional Services</h4>
                                        {!editingServices && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={startEditingServices}
                                                className="border-primary/20 hover:bg-primary/5"
                                            >
                                                <Edit3 className="h-3 w-3 mr-2" />
                                                Edit
                                            </Button>
                                        )}
                                    </div>
                                    
                                    {editingServices ? (
                                        <div className="space-y-4">
                                            <div className="max-h-64 overflow-y-auto border border-border/20 rounded-lg p-4 bg-muted/10">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {getServiceOptions().map((service, index) => (
                                                        <div key={index} className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={`service-${index}`}
                                                                checked={selectedServices.includes(service)}
                                                                onCheckedChange={() => handleServiceToggle(service)}
                                                            />
                                                            <Label
                                                                htmlFor={`service-${index}`}
                                                                className="text-sm font-medium cursor-pointer"
                                                            >
                                                                {service}
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={saveServices}
                                                    disabled={saving}
                                                >
                                                    <Save className="h-3 w-3 mr-1" />
                                                    Save Services
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={cancelEditing}
                                                >
                                                    <X className="h-3 w-3 mr-1" />
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="min-h-[80px] flex items-center">
                                            {getOtherServices().length > 0 ? (
                                                <div className="flex flex-wrap gap-3">
                                                    {getOtherServices().map((service: string, index: number) => (
                                                        <Badge key={index} variant="secondary" className="px-4 py-2 text-sm">
                                                            {service}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="w-full text-center p-8 bg-muted/20 rounded-xl border-2 border-dashed border-muted/40">
                                                    <p className="text-muted-foreground text-lg">No additional services listed</p>
                                                    <p className="text-sm text-muted-foreground/70 mt-1">Add more services to attract more clients</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <Separator className="my-6" />

                                <div>
                                    <h4 className="font-semibold mb-4 text-lg">Certifications & Qualifications</h4>
                                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                                        <div className="flex items-start space-x-4">
                                            <div className="bg-blue-500 p-2 rounded-lg">
                                                <Award className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-blue-900 dark:text-blue-100 text-lg">
                                                    {traderProfile.certifications || 'Professional Certification'}
                                                </p>
                                                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                                    Verified industry qualification
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Certification Images */}
                                <div className="mt-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-semibold text-lg">Certification Images</h4>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleCertificationImageUpload}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                disabled={uploadingImage}
                                            />
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="border-primary/20 hover:bg-primary/5"
                                                disabled={uploadingImage}
                                            >
                                                <Camera className="h-4 w-4 mr-2" />
                                                {uploadingImage ? 'Uploading...' : 'Add Images'}
                                            </Button>
                                        </div>
                                    </div>

                                    {traderProfile.certificationImages && traderProfile.certificationImages.length > 0 ? (
                                        <div className="flex flex-wrap gap-3">
                                            {traderProfile.certificationImages.map((image: string, index: number) => (
                                                <div key={index} className="relative group overflow-hidden rounded-lg bg-muted/20 aspect-square w-32 h-32">
                                                    <img 
                                                        src={image} 
                                                        alt={`Certification ${index + 1}`}
                                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                        <div className="absolute bottom-2 left-2 text-white">
                                                            <p className="text-xs font-medium">Certificate {index + 1}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 bg-muted/20 rounded-lg border-2 border-dashed border-muted/40">
                                            <Award className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                                            <h3 className="text-sm font-medium text-foreground mb-1">No Certification Images</h3>
                                            <p className="text-xs text-muted-foreground mb-3 max-w-xs mx-auto">
                                                Upload images of your certifications
                                            </p>
                                            <div className="relative inline-block">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleCertificationImageUpload}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    disabled={uploadingImage}
                                                />
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    className="border-primary/20 hover:bg-primary/5 text-xs"
                                                    disabled={uploadingImage}
                                                >
                                                    <Camera className="h-3 w-3 mr-1" />
                                                    {uploadingImage ? 'Uploading...' : 'Upload'}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                         {/* Professional Bio */}
                         <Card className="shadow-xl bg-gradient-to-br from-card to-card/80 border-0">
                             <CardHeader className="pb-6">
                                 <div className="flex items-center justify-between">
                                     <CardTitle className="text-2xl">About Me</CardTitle>
                                     {editingField !== 'bio' && (
                                         <Button 
                                             variant="outline" 
                                             size="sm" 
                                             className="border-primary/20 hover:bg-primary/5"
                                             onClick={() => {
                                                 setEditingField('bio');
                                                 setTempData({ bio: traderProfile.bio || '' });
                                             }}
                                         >
                                             <Edit3 className="h-4 w-4 mr-2" />
                                             Edit Bio
                                         </Button>
                                     )}
                                 </div>
                             </CardHeader>
                             <CardContent>
                                 {editingField === 'bio' ? (
                                     <div className="space-y-4">
                                         <Textarea
                                             value={tempData.bio || ''}
                                             onChange={(e) => setTempData({ ...tempData, bio: e.target.value })}
                                             placeholder="Tell clients about yourself, your experience, and what makes you unique..."
                                             className="min-h-[120px] text-base"
                                         />
                                         <div className="flex gap-2">
                                             <Button
                                                 size="sm"
                                                 onClick={() => saveProfile('bio', tempData.bio)}
                                                 disabled={saving}
                                             >
                                                 <Save className="h-3 w-3 mr-1" />
                                                 Save Bio
                                             </Button>
                                             <Button
                                                 size="sm"
                                                 variant="outline"
                                                 onClick={cancelEditing}
                                             >
                                                 <X className="h-3 w-3 mr-1" />
                                                 Cancel
                                             </Button>
                                         </div>
                                     </div>
                                 ) : (
                                     <div className="bg-gradient-to-r from-muted/30 to-muted/20 p-6 rounded-xl border border-muted/20">
                                         <p className="text-foreground leading-relaxed text-lg">
                                             {traderProfile.bio || `Experienced ${traderProfile.primaryTrade.toLowerCase()} professional with ${traderProfile.experienceYears} years in the industry. Based in ${traderProfile.city}, providing quality services within a ${traderProfile.radiusKm}km radius.`}
                                         </p>
                                     </div>
                                 )}
                             </CardContent>
                          </Card>

                         {/* Portfolio Gallery */}
                         <Card className="shadow-xl bg-gradient-to-br from-card to-card/80 border-0">
                             <CardHeader className="pb-6">
                                 <div className="flex items-center justify-between">
                                     <CardTitle className="text-2xl flex items-center">
                                         <Camera className="h-6 w-6 mr-3 text-primary" />
                                         Portfolio Gallery
                                     </CardTitle>
                                     <div className="relative">
                                         <input
                                             type="file"
                                             accept="image/*"
                                             onChange={handleImageUpload}
                                             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                             disabled={uploadingImage}
                                         />
                                         <Button 
                                             variant="outline" 
                                             size="sm" 
                                             className="border-primary/20 hover:bg-primary/5"
                                             disabled={uploadingImage}
                                         >
                                             <Camera className="h-4 w-4 mr-2" />
                                             {uploadingImage ? 'Uploading...' : 'Add Images'}
                                         </Button>
                                     </div>
                                 </div>
                             </CardHeader>
                             <CardContent>
                                 {traderProfile.projectImages && traderProfile.projectImages.length > 0 ? (
                                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                         {traderProfile.projectImages.map((image: string, index: number) => (
                                             <div key={index} className="relative group overflow-hidden rounded-xl bg-muted/20 aspect-square">
                                                 <img 
                                                     src={image} 
                                                     alt={`Portfolio work ${index + 1}`}
                                                     className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                 />
                                                 <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                     <div className="absolute bottom-3 left-3 text-white">
                                                         <p className="text-sm font-medium">Project {index + 1}</p>
                                                     </div>
                                                 </div>
                                             </div>
                                         ))}
                                     </div>
                                 ) : (
                                     <div className="text-center py-12 bg-muted/20 rounded-xl border-2 border-dashed border-muted/40">
                                         <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                         <h3 className="text-lg font-medium text-foreground mb-2">No Portfolio Images</h3>
                                         <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                             Showcase your best work by adding photos of completed projects. High-quality images help attract more clients.
                                         </p>
                                         <div className="relative inline-block">
                                             <input
                                                 type="file"
                                                 accept="image/*"
                                                 onChange={handleImageUpload}
                                                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                 disabled={uploadingImage}
                                             />
                                             <Button 
                                                 variant="outline" 
                                                 className="border-primary/20 hover:bg-primary/5"
                                                 disabled={uploadingImage}
                                             >
                                                 <Camera className="h-4 w-4 mr-2" />
                                                 {uploadingImage ? 'Uploading...' : 'Upload Your First Image'}
                                             </Button>
                                         </div>
                                     </div>
                                 )}
                             </CardContent>
                          </Card>

                      </div>
                  </div>
              </div>
          </div>
      );
};

export default TradesPersonProfile;