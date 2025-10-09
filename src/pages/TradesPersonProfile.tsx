import { useState, useEffect } from "react";
import MobileHeader from "@/components/MobileHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";

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
    X,
    Trash2,
    MessageCircle,
    ChevronDown,
    ChevronUp,
    ArrowLeft
} from "lucide-react";

const TradesPersonProfile = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const [traderProfile, setTraderProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();


    const [editingField, setEditingField] = useState<string | null>(null);
    const [editingServices, setEditingServices] = useState(false);
    const [tempData, setTempData] = useState<any>({});
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [ratingTraderRatingProfile, setRatingTraderRatingProfile] = useState<any>(null);
    const [loadingRatings, setLoadingRatings] = useState(true);
    const [ratingsError, setRatingsError] = useState<string | null>(null);
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());

    // Accordion states for mobile
    const [accordionStates, setAccordionStates] = useState({
        contact: true,
        services: false,
        certifications: false,
        portfolio: false,
        about: false
    });

    const [searchParams] = useSearchParams();

    const nameId = searchParams.get("nameId");
    console.log('show me the nameId', nameId);

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

    useEffect(() => {
        const fetchTraders = async () => {
            // Only fetch ratings if we have trader profile data with userId
            // if (!traderProfile?.userId) return;

            setLoadingRatings(true);
            setRatingsError(null);
            try {
                const response = await fetch(`${apiUrl}/travel/get-trader-rating?trader_id=${traderProfile.userId}`, {
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Trader rating:', data);
                setRatingTraderRatingProfile(data);
            } catch (error) {
                console.error('Error fetching traders:', error);
                setRatingsError('Unable to load reviews. Please try again.');
            } finally {
                setLoadingRatings(false);
            }
        };
        fetchTraders();
    }, [traderProfile?.userId, apiUrl]);

    // Helper function to check if comment is long
    const isCommentLong = (comment: string) => {
        return comment && comment.length > 200;
    };

    // Helper function to truncate comment
    const getTruncatedComment = (comment: string) => {
        return comment.substring(0, 200) + '...';
    };

    // Helper function to toggle comment expansion
    const toggleCommentExpansion = (index: number) => {
        setExpandedComments(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    const sortedComments = ratingTraderRatingProfile?.comments ?
        [...ratingTraderRatingProfile.comments].sort((a, b) =>
            new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
        ) : [];

    // Get reviews to display (show 2 initially for better UX)
    const displayedReviews = showAllReviews ? sortedComments : sortedComments.slice(0, 2);

    // Scroll to reviews section
    const scrollToReviews = () => {
        const reviewsSection = document.getElementById('customer-reviews-section');
        if (reviewsSection) {
            reviewsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // Save profile data (only for own profile)
    const saveProfile = async (field: string, value: any) => {
        if (!isOwnProfile || !userId) {
            toast({
                title: "Cannot Edit",
                description: "You can only edit your own profile.",
                variant: "destructive",
            });
            return;
        }

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
                credentials: 'include',
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
                    description: "",
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
                const response = await fetch(`${apiUrl}/travel/get-trader-project/${userId}`, {
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
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

    // Toggle accordion sections
    const toggleAccordion = (section: keyof typeof accordionStates) => {
        setAccordionStates(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Handle image upload
    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !isOwnProfile || !userId) {
            if (!isOwnProfile) {
                toast({
                    title: "Cannot Upload",
                    description: "You can only upload images to your own profile.",
                    variant: "destructive",
                });
            }
            return;
        }

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
                credentials: 'include',
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
        if (!file || !isOwnProfile || !userId) {
            console.log('No file selected or user not authenticated:', { file: !!file, userId, isOwnProfile });
            if (!isOwnProfile) {
                toast({
                    title: "Cannot Upload",
                    description: "You can only upload images to your own profile.",
                    variant: "destructive",
                });
            }
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
                credentials: 'include',
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
                    description: "",
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

    // Safely get userId and user data from localStorage
    const getUserData = () => {
        try {
            const localStorageData = localStorage.getItem('auth_user');
            if (!localStorageData) return { userId: null, userData: null };
            const userData = JSON.parse(localStorageData);
            return { userId: userData?.id, userData };
        } catch (error) {
            console.error('Error parsing user data:', error);
            return { userId: null, userData: null };
        }
    };

    const { userId, userData } = getUserData();

    // Determine which ID to use for fetching the profile
    const profileId = userId || nameId;

    // Check if this is the user's own profile (for editing capabilities)
    const isOwnProfile = userId && !nameId;

    // Check if user has master role for verified professional status
    const hasVerifiedProfessionalStatus = () => {
        if (!userData || !userData.role) return false;

        // Handle both array and string role formats
        if (Array.isArray(userData.role)) {
            return userData.role.includes('master');
        }
        return userData.role === 'master';
    };

    const [isVerified, setIsVerified] = useState(false);
    const [checkingVerification, setCheckingVerification] = useState(false);

    const checkTraderVerified = async (targetUserId: string) => {
        if (checkingVerification) return;

        setCheckingVerification(true);
        try {
            const response = await fetch(`${apiUrl}/travel/check-verified-trader/${targetUserId}`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            setIsVerified(data.success);
        } catch (error) {
            console.error('Error checking trader verification:', error);
            setIsVerified(false);
        } finally {
            setCheckingVerification(false);
        }
    }

    // Check verification status for homeowners viewing trader profiles
    useEffect(() => {
        const hasVerifiedProfessionalStatus2 = hasVerifiedProfessionalStatus();

        if (!isOwnProfile && nameId && !hasVerifiedProfessionalStatus2) {
            console.log('Checking verification for trader:', nameId);
            checkTraderVerified(nameId);
        } else if (hasVerifiedProfessionalStatus2) {
            // Trader has master role, so they're verified
            setIsVerified(true);
            console.log('show me the userId', userId);
            checkTraderVerified(userId);
        }
    }, [nameId, isOwnProfile]);

    useEffect(() => {
        const fetchProfile = async () => {
            // Use nameId if available (viewing someone else's profile), otherwise use userId (own profile)
            const targetId = nameId || userId;

            if (!targetId) {
                setError('No profile ID provided');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await fetch(`${apiUrl}/travel/get-trader-project/${targetId}`, {
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
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
    }, [userId, nameId, apiUrl]);

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
            {/* Hero Section - Compact Mobile Layout */}
            <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 border-b border-border/5">
                <div className="container mx-auto px-4 py-6 md:py-12 max-w-6xl">
                    {/* Mobile: Compact Stack Layout */}
                    <div className="block md:hidden">
                        {/* Back button for homeowners coming from chat */}
                        {nameId && (
                            <div className="flex items-center mb-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.history.back()}
                                    className="hover:bg-muted -ml-2 min-h-[44px] min-w-[44px] p-2"
                                    aria-label="Go back to chat"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                                <span className="text-sm text-muted-foreground ml-2">Back to chat</span>
                            </div>
                        )}

                        <div className="flex items-center gap-4 mb-4">
                            <Avatar className="h-16 w-16 border-2 border-background shadow-lg">
                                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-lg font-bold">
                                    {traderProfile.name?.split(' ').map((n: string) => n[0]).join('') || 'TP'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <h1 className="text-2xl font-bold text-foreground truncate">
                                    {traderProfile.name}
                                </h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="default" className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0 px-2 py-1 text-sm font-medium">
                                        {traderProfile.primaryTrade} Specialist
                                    </Badge>
                                    {/* Verification Badge for Homeowners - Mobile */}

                                    <Badge
                                        variant={isVerified ? "default" : "secondary"}
                                        className={`px-2 py-1 text-xs font-medium border-0 ${isVerified
                                            ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                                            : "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
                                            }`}
                                    >
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        {checkingVerification ? "Checking..." : (isVerified ? "Verified" : "Unverified")}
                                    </Badge>
                                    {ratingTraderRatingProfile?.rating !== undefined && ratingTraderRatingProfile?.rating > 0 && ratingTraderRatingProfile?.total_ratings > 0 && (
                                        <button
                                            onClick={() => {
                                                console.log('Rating clicked:', {
                                                    traderName: traderProfile.name,
                                                    rating: ratingTraderRatingProfile.rating,
                                                    totalReviews: ratingTraderRatingProfile.total_ratings,
                                                    timestamp: new Date().toISOString()
                                                });
                                            }}
                                            className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-50 to-slate-50 rounded-lg border border-blue-200/50"
                                        >
                                            <Star className="h-4 w-4 text-[#FACC15] fill-current" />
                                            <span className="text-sm font-bold text-gray-800">{ratingTraderRatingProfile.rating}</span>
                                            <span className="text-xs text-gray-600">({ratingTraderRatingProfile.total_ratings})</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <p className="text-muted-foreground text-sm mb-4">
                            Professional {traderProfile.primaryTrade.toLowerCase()} services in {traderProfile.city}
                        </p>

                        {/* Mobile Statistics */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-background/50 backdrop-blur-sm rounded-lg p-3 border border-border/20 text-center">
                                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{traderProfile.experienceYears}</div>
                                <div className="text-xs text-muted-foreground">Years Experience</div>
                            </div>
                            <div className="bg-background/50 backdrop-blur-sm rounded-lg p-3 border border-border/20 text-center">
                                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                    <span className="inline-flex items-baseline justify-center">
                                        {Number.isFinite(Number(traderProfile.radiusKm))
                                            ? parseInt(traderProfile.radiusKm, 10)
                                            : traderProfile.radiusKm}
                                        <span className="ml-1 text-sm text-muted-foreground">km</span>
                                    </span>
                                </div>
                                <div className="text-xs text-muted-foreground">Service Radius</div>
                            </div>
                        </div>
                    </div>

                    {/* Desktop: Original Layout */}
                    <div className="hidden md:flex flex-col md:flex-row items-center gap-8">
                        {/* Back button for homeowners coming from chat - Desktop */}
                        {nameId && (
                            <div className="absolute top-4 left-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.history.back()}
                                    className="hover:bg-muted min-h-[44px] min-w-[44px] p-2"
                                    aria-label="Go back to chat"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </div>
                        )}
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-2xl scale-110"></div>
                            <Avatar className="relative h-32 w-32 border-4 border-background shadow-2xl">
                                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-2xl font-bold">
                                    {traderProfile.name?.split(' ').map((n: string) => n[0]).join('') || 'TP'}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-3">
                                <div className="flex-1">
                                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-3">
                                        {traderProfile.name}
                                    </h1>
                                    <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                                        <Badge variant="default" className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0 px-4 py-2 text-base font-medium">
                                            {traderProfile.primaryTrade} Specialist
                                        </Badge>
                                        <Badge
                                            variant={isVerified ? "default" : "secondary"}
                                            className={`px-3 py-2 text-sm font-medium border-0 ${isVerified
                                                ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                                                : "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
                                                }`}
                                        >
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            {checkingVerification ? "Checking..." : (isVerified ? "Verified" : "Unverified")}
                                        </Badge>
                                    </div>
                                </div>

                                {ratingTraderRatingProfile?.rating !== undefined && ratingTraderRatingProfile?.rating > 0 && ratingTraderRatingProfile?.total_ratings > 0 && (
                                    <div className="flex justify-center md:justify-end">
                                        <button
                                            onClick={() => {
                                                console.log('Rating clicked:', {
                                                    traderName: traderProfile.name,
                                                    rating: ratingTraderRatingProfile.rating,
                                                    totalReviews: ratingTraderRatingProfile.total_ratings,
                                                    timestamp: new Date().toISOString()
                                                });
                                            }}
                                            className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-slate-50 hover:from-blue-100 hover:to-slate-100 rounded-xl border border-blue-200/50 hover:border-blue-300/70 transition-all duration-200 ease-in-out shadow-sm hover:shadow-md"
                                            aria-label="View rating details"
                                        >
                                            <div className="flex items-center gap-1">
                                                <Star className="h-5 w-5 text-[#FACC15] fill-current" />
                                                <span className="text-lg font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                                                    {ratingTraderRatingProfile.rating}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors">
                                                / 5
                                            </div>
                                            <div className="text-xs text-gray-500 group-hover:text-blue-500 transition-colors">
                                                ({ratingTraderRatingProfile.total_ratings} reviews)
                                            </div>
                                        </button>
                                    </div>
                                )}
                            </div>
                            <p className="text-muted-foreground text-lg max-w-2xl">
                                Professional {traderProfile.primaryTrade.toLowerCase()} services in {traderProfile.city} and surrounding areas
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="bg-background/50 backdrop-blur-sm rounded-xl p-4 border border-border/20">
                                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center">{traderProfile.experienceYears}</div>
                                <div className="text-sm text-muted-foreground text-center">Years Experience</div>
                            </div>
                            <div
                                className="bg-background/50 backdrop-blur-sm rounded-xl p-4 border border-border/20"
                                tabIndex={0}
                                aria-label={`Service Radius: ${Number.isFinite(traderProfile.radiusKm) ? parseInt(traderProfile.radiusKm, 10) : traderProfile.radiusKm} kilometers`}
                                role="region"
                            >
                                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center">
                                    <span className="inline-flex items-baseline justify-center">
                                        {Number.isFinite(Number(traderProfile.radiusKm))
                                            ? parseInt(traderProfile.radiusKm, 10)
                                            : traderProfile.radiusKm}
                                        <span className="ml-1 text-base text-muted-foreground">km</span>
                                    </span>
                                </div>
                                <div className="text-sm text-muted-foreground text-center">Service Radius</div>
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
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xl flex items-center">
                                        <User className="h-5 w-5 mr-2 text-gray-800" />
                                        Contact Details
                                    </CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="md:hidden p-1"
                                        onClick={() => toggleAccordion('contact')}
                                    >
                                        {accordionStates.contact ? (
                                            <ChevronUp className="h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </CardHeader>
                            <div className={`md:block ${accordionStates.contact ? 'block' : 'hidden'}`}>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        {/* Email - Hidden for homeowners viewing other profiles */}
                                        {isOwnProfile && (
                                            <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/10">
                                                <div className="bg-primary/10 p-2 rounded-lg">
                                                    <Mail className="h-4 w-4 text-gray-800" />
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
                                        )}

                                        {/* Phone - Hidden for homeowners viewing other profiles */}
                                        {isOwnProfile && (
                                            <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-secondary/5 to-secondary/10 rounded-xl border border-secondary/10">
                                                <div className="bg-secondary/10 p-2 rounded-lg">
                                                    <Phone className="h-4 w-4 text-gray-800" />
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
                                        )}

                                        {/* Location */}
                                        <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-accent/5 to-accent/10 rounded-xl border border-accent/10">
                                            <div className="bg-accent/10 p-2 rounded-lg">
                                                <MapPin className="h-4 w-4 text-gray-800" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="text-sm text-muted-foreground">Service Location</p>
                                                    {isOwnProfile && editingField !== 'location' && (
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
                                                <Calendar className="h-4 w-4 text-gray-800" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-muted-foreground">Member Since</p>
                                                <p className="font-medium text-foreground">{traderProfile.createdDate ? formatJoinDate(traderProfile.createdDate) : 'Recently joined'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {isOwnProfile && (
                                        <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg">
                                            <Edit3 className="h-4 w-4 mr-2" />
                                            Update Contact Info
                                        </Button>
                                    )}

                                    {/* Message for homeowners viewing other profiles */}
                                    {!isOwnProfile && (
                                        <div className="text-center py-4">
                                            <p className="text-sm text-muted-foreground">
                                                Contact information is private. Use the chat feature to get in touch with this tradesperson.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </div>
                        </Card>


                    </div>

                    {/* Right Column - Detailed Information */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Services & Expertise */}
                        <Card className="shadow-xl bg-gradient-to-br from-card to-card/80 border-0">
                            <CardHeader className="pb-6">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-2xl flex items-center">
                                        <Briefcase className="h-6 w-6 mr-3 text-gray-800" />
                                        Services & Expertise
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-semibold text-lg">Primary Specialization</h4>
                                        {isOwnProfile && editingField !== 'primaryTrade' && (
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
                                        {isOwnProfile && !editingServices && (
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
                                                <Award className="h-5 w-5 text-gray-800" />
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
                                        {isOwnProfile && (
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
                                        )}
                                    </div>

                                    {traderProfile.certificationImages && traderProfile.certificationImages.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <div className="flex gap-3 pb-2 min-w-max md:flex-wrap md:min-w-0">
                                                {traderProfile.certificationImages.map((image: string, index: number) => (
                                                    <div key={index} className="relative group overflow-hidden rounded-lg bg-muted/20 aspect-square w-24 h-24 md:w-32 md:h-32 flex-shrink-0">
                                                        <img
                                                            src={image}
                                                            alt={`Certification ${index + 1}`}
                                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                            loading="lazy"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                            <div className="absolute bottom-1 left-1 text-white">
                                                                <p className="text-xs font-medium">Cert {index + 1}</p>
                                                            </div>
                                                            {isOwnProfile && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    className="absolute top-1 right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                                    onClick={async () => {
                                                                        try {
                                                                            const updatedImages = traderProfile.certificationImages.filter((_, i) => i !== index);
                                                                            await saveProfile('certificationImages', updatedImages);
                                                                            toast({
                                                                                title: "Image deleted",
                                                                                description: "Certification image has been removed from your profile.",
                                                                            });
                                                                        } catch (error) {
                                                                            toast({
                                                                                title: "Error",
                                                                                description: "Failed to delete image. Please try again.",
                                                                                variant: "destructive",
                                                                            });
                                                                        }
                                                                    }}
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 bg-muted/20 rounded-lg border-2 border-dashed border-muted/40">
                                            <Award className="h-6 w-6 text-gray-800 mx-auto mb-2" />
                                            <h3 className="text-sm font-medium text-foreground mb-1">No Certification Images</h3>
                                            <p className="text-xs text-muted-foreground mb-3 max-w-xs mx-auto">
                                                Upload images of your certifications
                                            </p>
                                            {isOwnProfile && (
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
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Professional Bio */}
                        <Card className="shadow-xl bg-gradient-to-br from-card to-card/80 border-0 border-t border-gray-100 mt-8 pt-6">
                            <CardHeader className="pb-6">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-2xl">About Me</CardTitle>
                                    {isOwnProfile && editingField !== 'bio' && (
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
                        <Card className="shadow-xl bg-gradient-to-br from-card to-card/80 border-0 border-t border-gray-100 mt-8 pt-6">
                            <CardHeader className="pb-6">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-2xl flex items-center">
                                        <Camera className="h-6 w-6 mr-3 text-gray-800" />
                                        Portfolio Gallery
                                    </CardTitle>
                                    {isOwnProfile && (
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
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {traderProfile.projectImages && traderProfile.projectImages.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
                                        {traderProfile.projectImages.map((image: string, index: number) => (
                                            <div key={index} className="relative group overflow-hidden rounded-xl bg-muted/20 aspect-square">
                                                <img
                                                    src={image}
                                                    alt={`Portfolio work ${index + 1}`}
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    loading="lazy"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <div className="absolute bottom-2 left-2 text-white">
                                                        <p className="text-xs font-medium">Project {index + 1}</p>
                                                    </div>
                                                    {isOwnProfile && (
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                            onClick={async () => {
                                                                try {
                                                                    const updatedImages = traderProfile.projectImages.filter((_, i) => i !== index);
                                                                    await saveProfile('projectImages', updatedImages);
                                                                    toast({
                                                                        title: "Image deleted",
                                                                        description: "Portfolio image has been removed from your profile.",
                                                                    });
                                                                } catch (error) {
                                                                    toast({
                                                                        title: "Error",
                                                                        description: "Failed to delete image. Please try again.",
                                                                        variant: "destructive",
                                                                    });
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-muted/20 rounded-xl border-2 border-dashed border-muted/40">
                                        <Camera className="h-12 w-12 text-gray-800 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-foreground mb-2">No Portfolio Images</h3>
                                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                            Showcase your best work by adding photos of completed projects. High-quality images help attract more clients.
                                        </p>
                                        {isOwnProfile && (
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
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Soft section divider */}
                        <div className="h-px bg-gradient-to-r from-transparent via-gray-200/60 to-transparent my-8" />

                        {/* Customer Reviews */}
                        <Card id="customer-reviews-section" className="shadow-xl bg-gradient-to-br from-card to-card/80 border-0 mt-4 pt-4">
                            <CardHeader className="pb-6">
                                <div className="flex items-center justify-between flex-wrap gap-3">
                                    <CardTitle className="text-2xl flex items-center">
                                        <Star className="h-6 w-6 mr-3 text-[#FACC15]" />
                                        Customer Reviews
                                    </CardTitle>
                                    {!loadingRatings && ratingTraderRatingProfile?.total_ratings > 0 && (
                                        <div className="group w-full sm:w-auto flex justify-center sm:justify-end">
                                            <Badge
                                                variant="secondary"
                                                className="text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2 gap-2 cursor-pointer hover:bg-secondary/80 transition-all duration-200 animate-in fade-in-50 slide-in-from-right-2"
                                                onClick={scrollToReviews}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={(e) => e.key === 'Enter' && scrollToReviews()}
                                                title="Average rating from verified homeowners - Click to view reviews"
                                            >
                                                <Star className="h-4 w-4 fill-[#FACC15] text-[#FACC15] transition-transform group-hover:scale-110" />
                                                <span className="whitespace-nowrap">
                                                    {Number(ratingTraderRatingProfile.rating || 0).toFixed(1)} / 5 · {ratingTraderRatingProfile.total_ratings} {ratingTraderRatingProfile.total_ratings === 1 ? 'review' : 'reviews'}
                                                </span>
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {/* Premium Summary Stats */}
                                {!loadingRatings && !ratingsError && ratingTraderRatingProfile?.total_ratings > 0 && (
                                    <div className="mb-8 p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl border border-blue-100/50 animate-in slide-in-from-top-2 duration-500">
                                        <div className="flex items-center justify-between flex-wrap gap-4">
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-2">
                                                    <Star className="h-5 w-5 fill-[#FACC15] text-[#FACC15]" />
                                                    <span className="text-lg font-semibold text-gray-900">
                                                        {Number(ratingTraderRatingProfile.rating || 0).toFixed(1)} average
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {ratingTraderRatingProfile.total_ratings} {ratingTraderRatingProfile.total_ratings === 1 ? 'review' : 'reviews'}
                                                </div>
                                                <div className="flex items-center gap-1 text-sm text-green-600">
                                                    <CheckCircle className="h-4 w-4" />
                                                    Verified homeowner reviews
                                                </div>
                                            </div>

                                            {/* Progress bar visualization */}
                                            <div className="hidden md:block">
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <span>Quality</span>
                                                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-[#FACC15] to-yellow-400 transition-all duration-1000 ease-out"
                                                            style={{ width: `${(Number(ratingTraderRatingProfile.rating || 0) / 5) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    <span>{Math.round((Number(ratingTraderRatingProfile.rating || 0) / 5) * 100)}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Loading State */}
                                {loadingRatings && (
                                    <div className="space-y-6">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="bg-muted/20 p-6 rounded-xl border border-muted/20 animate-pulse">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex gap-1">
                                                            {[...Array(5)].map((_, idx) => (
                                                                <div key={idx} className="h-4 w-4 bg-muted rounded" />
                                                            ))}
                                                        </div>
                                                        <div className="h-4 w-8 bg-muted rounded" />
                                                    </div>
                                                    <div className="h-4 w-24 bg-muted rounded" />
                                                </div>
                                                <div className="h-4 w-32 bg-muted rounded mb-3" />
                                                <div className="space-y-2">
                                                    <div className="h-3 w-full bg-muted rounded" />
                                                    <div className="h-3 w-4/5 bg-muted rounded" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Error State */}
                                {!loadingRatings && ratingsError && (
                                    <div className="text-center py-8 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-900">
                                        <p className="text-red-600 dark:text-red-400 mb-4">{ratingsError}</p>
                                        <Button
                                            variant="outline"
                                            onClick={() => window.location.reload()}
                                            className="border-red-300 hover:bg-red-50"
                                        >
                                            Try Again
                                        </Button>
                                    </div>
                                )}

                                {/* Reviews List */}
                                {!loadingRatings && !ratingsError && sortedComments.length > 0 && (
                                    <>
                                        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-700 delay-200">
                                            {displayedReviews.map((review: any, index: number) => {
                                                const isExpanded = expandedComments.has(index);
                                                const isLong = isCommentLong(review.comment);
                                                const displayComment = isLong && !isExpanded
                                                    ? getTruncatedComment(review.comment)
                                                    : review.comment;

                                                return (
                                                    <div
                                                        key={index}
                                                        className="bg-gradient-to-r from-muted/30 to-muted/20 p-4 sm:p-6 rounded-xl border border-muted/20 hover:shadow-md transition-shadow duration-200"
                                                        aria-label={`Review rating ${review.rating} out of 5 for job ${review.job_title || 'Not specified'}`}
                                                    >
                                                        {/* Top row: Stars + Date */}
                                                        <div className="flex items-start justify-between mb-2 gap-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex group" role="img" aria-label={`${review.rating} out of 5 stars`}>
                                                                    {[...Array(5)].map((_, starIndex) => (
                                                                        <Star
                                                                            key={starIndex}
                                                                            className={`h-4 w-4 transition-all duration-200 hover:scale-110 ${starIndex < review.rating
                                                                                ? 'text-[#FACC15] fill-current group-hover:drop-shadow-sm'
                                                                                : 'text-gray-300'
                                                                                }`}
                                                                            aria-hidden="true"
                                                                        />
                                                                    ))}
                                                                </div>
                                                                <span className="text-sm font-medium text-muted-foreground">
                                                                    {review.rating}/5
                                                                </span>
                                                            </div>
                                                            <time className="text-xs text-muted-foreground whitespace-nowrap">
                                                                {new Date(review.createdDate).toLocaleDateString('en-GB', {
                                                                    day: 'numeric',
                                                                    month: 'short',
                                                                    year: 'numeric'
                                                                })}
                                                            </time>
                                                        </div>

                                                        {/* Job context tag */}
                                                        <div className="mb-4 mt-3">
                                                            <Badge variant="outline" className="text-xs font-normal gap-1.5">
                                                                <Briefcase className="h-3 w-3" />
                                                                Job · {review.job_title || 'Not specified'}
                                                            </Badge>
                                                        </div>

                                                        {/* Comment text */}
                                                        {review.comment && (
                                                            <div className="mb-3">
                                                                <p className="text-foreground leading-relaxed text-sm sm:text-base break-words">
                                                                    {displayComment}
                                                                </p>
                                                                {isLong && (
                                                                    <Button
                                                                        variant="link"
                                                                        className="h-auto p-0 mt-2 text-xs text-primary"
                                                                        onClick={() => toggleCommentExpansion(index)}
                                                                        aria-expanded={isExpanded}
                                                                    >
                                                                        {isExpanded ? 'Collapse' : 'Expand'}
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Reviewer footer */}
                                                        <div className="text-sm text-gray-600 italic border-t border-muted/30 pt-3 mt-3 font-medium">
                                                            — {review.first_name || 'Verified Homeowner'}
                                                            {review.first_name && (
                                                                <span className="text-green-600 ml-1">
                                                                    <CheckCircle className="inline h-3 w-3 mr-1" />
                                                                    (Verified Homeowner)
                                                                </span>
                                                            )}
                                                            {!review.first_name && (
                                                                <span className="text-green-600 ml-1">
                                                                    <CheckCircle className="inline h-3 w-3 mr-1" />
                                                                    Verified
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {/* View All Button with Enhanced UX */}
                                        {sortedComments.length > 2 && (
                                            <div className="mt-8 space-y-4">
                                                <div className="text-center">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setShowAllReviews(!showAllReviews)}
                                                        className="gap-2 hover:bg-primary/5 transition-colors duration-200 border-primary/20"
                                                    >
                                                        {showAllReviews ? (
                                                            <>
                                                                <ChevronUp className="h-4 w-4" />
                                                                Show Less Reviews
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ChevronDown className="h-4 w-4" />
                                                                View all {sortedComments.length} reviews
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>

                                                {/* Future: Sorting hint for multiple reviews */}
                                                {showAllReviews && sortedComments.length > 5 && (
                                                    <div className="text-center">
                                                        <p className="text-xs text-muted-foreground">
                                                            Showing newest reviews first
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Empty State */}
                                {!loadingRatings && !ratingsError && sortedComments.length === 0 && (
                                    <div className="text-center py-12 bg-muted/20 rounded-xl border-2 border-dashed border-muted/40">
                                        <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-foreground mb-2">No customer reviews yet</h3>
                                        <p className="text-muted-foreground max-w-md mx-auto">
                                            Complete more jobs to build your reputation.
                                        </p>
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