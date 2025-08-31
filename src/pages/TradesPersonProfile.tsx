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
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-background">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 border-b border-border/5">
                <div className="container mx-auto px-4 py-12 max-w-6xl">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-2xl scale-110"></div>
                            <Avatar className="relative h-32 w-32 border-4 border-background shadow-2xl">
                                <AvatarImage src={traderProfile.projectImages?.[0] || ''} alt={traderProfile.name} className="object-cover" />
                                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-2xl font-bold">
                                    {traderProfile.name?.split(' ').map((n: string) => n[0]).join('') || 'TP'}
                                </AvatarFallback>
                            </Avatar>
                            <Button
                                size="icon"
                                variant="secondary"
                                className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full shadow-lg border-2 border-background hover:scale-105 transition-transform"
                            >
                                <Camera className="h-5 w-5" />
                            </Button>
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
                                    <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/10">
                                        <div className="bg-primary/10 p-2 rounded-lg">
                                            <Mail className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-muted-foreground">Email Address</p>
                                            <p className="font-medium text-foreground break-all">{traderProfile.email}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-secondary/5 to-secondary/10 rounded-xl border border-secondary/10">
                                        <div className="bg-secondary/10 p-2 rounded-lg">
                                            <Phone className="h-4 w-4 text-secondary" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-muted-foreground">Phone Number</p>
                                            <p className="font-medium text-foreground">{traderProfile.phone}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-accent/5 to-accent/10 rounded-xl border border-accent/10">
                                        <div className="bg-accent/10 p-2 rounded-lg">
                                            <MapPin className="h-4 w-4 text-accent" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-muted-foreground">Service Location</p>
                                            <p className="font-medium text-foreground">{traderProfile.city}, {traderProfile.postcode}</p>
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
                                    <Button variant="outline" size="sm" className="border-primary/20 hover:bg-primary/5">
                                        <Edit3 className="h-4 w-4 mr-2" />
                                        Edit Services
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                <div>
                                    <h4 className="font-semibold mb-4 text-lg">Primary Specialization</h4>
                                    <div className="relative">
                                        <Badge variant="default" className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-6 py-3 text-lg font-medium border-0 shadow-lg">
                                            <Award className="h-4 w-4 mr-2" />
                                            {traderProfile.primaryTrade}
                                        </Badge>
                                    </div>
                                </div>

                                <Separator className="my-6" />

                                <div>
                                    <h4 className="font-semibold mb-4 text-lg">Additional Services</h4>
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
                            </CardContent>
                        </Card>

                        {/* Professional Bio */}
                        <Card className="shadow-xl bg-gradient-to-br from-card to-card/80 border-0">
                            <CardHeader className="pb-6">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-2xl">About Me</CardTitle>
                                    <Button variant="outline" size="sm" className="border-primary/20 hover:bg-primary/5">
                                        <Edit3 className="h-4 w-4 mr-2" />
                                        Edit Bio
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-gradient-to-r from-muted/30 to-muted/20 p-6 rounded-xl border border-muted/20">
                                    <p className="text-foreground leading-relaxed text-lg">
                                        {traderProfile.bio || `Experienced ${traderProfile.primaryTrade.toLowerCase()} professional with ${traderProfile.experienceYears} years in the industry. Based in ${traderProfile.city}, providing quality services within a ${traderProfile.radiusKm}km radius.`}
                                    </p>
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