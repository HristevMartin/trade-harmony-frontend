import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
    CheckCircle
} from "lucide-react";

const TradesPersonProfile = () => {
    const [traderProfile, setTraderProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const apiUrl = import.meta.env.VITE_API_URL;
    
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
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">My Profile</h1>
                    <p className="text-muted-foreground">Manage your professional information and settings</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Profile Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Profile Card */}
                        <Card className="shadow-lg bg-gradient-to-br from-card via-card to-card/80">
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center text-center space-y-4">
                                    <div className="relative">
                                        <Avatar className="h-24 w-24 border-4 border-trust-blue/20">
                                            <AvatarImage src={traderProfile.projectImages?.[0] || ''} alt={traderProfile.name} />
                                            <AvatarFallback className="bg-trust-blue text-trust-blue-foreground text-lg font-semibold">
                                                {traderProfile.name?.split(' ').map((n: string) => n[0]).join('') || 'TP'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-md"
                                        >
                                            <Camera className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-semibold text-foreground">{traderProfile.name}</h2>
                                        <p className="text-trust-blue font-medium">{traderProfile.primaryTrade}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Stats */}
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center">
                                    <Briefcase className="h-5 w-5 mr-2 text-trust-blue" />
                                    Quick Stats
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Jobs Completed</span>
                                    <span className="font-semibold">0</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Experience</span>
                                    <span className="font-semibold">{traderProfile.experienceYears} years</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Service Area</span>
                                    <span className="font-semibold">Within {traderProfile.radiusKm}km</span>
                                </div>
                                <Separator />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Detailed Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Contact Information */}
                        <Card className="shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-xl flex items-center">
                                    <User className="h-5 w-5 mr-2 text-trust-blue" />
                                    Contact Information
                                </CardTitle>
                                <Button variant="outline" size="sm">
                                    <Edit3 className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-3">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Email</p>
                                            <p className="font-medium">{traderProfile.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Phone</p>
                                            <p className="font-medium">{traderProfile.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Location</p>
                                            <p className="font-medium">{traderProfile.city}, {traderProfile.postcode}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Member Since</p>
                                            <p className="font-medium">{traderProfile.createdDate ? formatJoinDate(traderProfile.createdDate) : 'Recently'}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Services & Skills */}
                        <Card className="shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-xl flex items-center">
                                    <Award className="h-5 w-5 mr-2 text-trust-blue" />
                                    Services & Skills
                                </CardTitle>
                                <Button variant="outline" size="sm">
                                    <Edit3 className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h4 className="font-medium mb-3">Primary Trade</h4>
                                    <Badge variant="default" className="bg-trust-blue text-trust-blue-foreground">
                                        {traderProfile.primaryTrade}
                                    </Badge>
                                </div>

                                <div>
                                    <h4 className="font-medium mb-3">Additional Services</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {getOtherServices().length > 0 ? (
                                            getOtherServices().map((service: string, index: number) => (
                                                <Badge key={index} variant="secondary">
                                                    {service}
                                                </Badge>
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No additional services listed</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium mb-3">Verified Skills</h4>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline" className="border-trust-green text-trust-green">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            {traderProfile.primaryTrade} Specialist
                                        </Badge>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium mb-3">Certifications</h4>
                                    <p className="text-muted-foreground">{traderProfile.certifications || 'No certifications listed'}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Bio */}
                        <Card className="shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-xl">Professional Bio</CardTitle>
                                <Button variant="outline" size="sm">
                                    <Edit3 className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground leading-relaxed">{traderProfile.bio || 'No bio available'}</p>
                            </CardContent>
                        </Card>

                        {/* Availability */}
                        <Card className="shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-xl flex items-center">
                                    <Clock className="h-5 w-5 mr-2 text-trust-blue" />
                                    Availability
                                </CardTitle>
                                <Button variant="outline" size="sm">
                                    <Edit3 className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-foreground">Current Status</p>
                                        <p className="text-sm text-muted-foreground">Usually responds within 2 hours</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TradesPersonProfile;