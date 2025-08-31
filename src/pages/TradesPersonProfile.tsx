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
  // Mock data - in real app this would come from API/context
  const [profile] = useState({
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+44 7700 123456",
    avatar: "",
    primaryTrade: "Electrical",
    otherServices: ["Plumbing", "General Maintenance"],
    location: "London, SW20 9NP",
    radiusKm: 25,
    experienceYears: 8,
    joinedDate: "2023-06-15",
    completedJobs: 47,
    rating: 4.8,
    reviewCount: 32,
    verifiedSkills: ["Electrical Installation", "Fault Finding", "Circuit Design"],
    certifications: "City & Guilds Level 3, 18th Edition Wiring Regulations",
    bio: "Experienced electrician with over 8 years in residential and commercial electrical work. Specializing in modern installations, fault finding, and smart home systems. Fully insured and committed to delivering high-quality work on time.",
    availability: "Available",
    responseTime: "Usually responds within 2 hours"
  });

  const [traderProfile,setTraderProfile] = useState({});

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${apiUrl}/travel/get-tradesperson-profile`);
        const data = await response.json();
        setTraderProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, []);

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
                      <AvatarImage src={profile.avatar} alt={profile.name} />
                      <AvatarFallback className="bg-trust-blue text-trust-blue-foreground text-lg font-semibold">
                        {profile.name.split(' ').map(n => n[0]).join('')}
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
                    <h2 className="text-xl font-semibold text-foreground">{profile.name}</h2>
                    <p className="text-trust-blue font-medium">{profile.primaryTrade}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-accent-orange text-accent-orange" />
                      <span className="ml-1 font-medium">{profile.rating}</span>
                    </div>
                    <span className="text-muted-foreground">({profile.reviewCount} reviews)</span>
                  </div>

                  <Badge 
                    variant="secondary" 
                    className="bg-trust-green/10 text-trust-green hover:bg-trust-green/20"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {profile.availability}
                  </Badge>
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
                  <span className="font-semibold">{profile.completedJobs}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Experience</span>
                  <span className="font-semibold">{profile.experienceYears} years</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Service Area</span>
                  <span className="font-semibold">Within {profile.radiusKm}km</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Response Time</span>
                  <span className="font-semibold text-trust-green">2 hours</span>
                </div>
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
                      <p className="font-medium">{profile.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{profile.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{profile.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Member Since</p>
                      <p className="font-medium">June 2023</p>
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
                    {profile.primaryTrade}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Additional Services</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.otherServices.map((service, index) => (
                      <Badge key={index} variant="secondary">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Verified Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.verifiedSkills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="border-trust-green text-trust-green">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Certifications</h4>
                  <p className="text-muted-foreground">{profile.certifications}</p>
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
                <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
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
                    <p className="text-sm text-muted-foreground">{profile.responseTime}</p>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="bg-trust-green/10 text-trust-green hover:bg-trust-green/20"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {profile.availability}
                  </Badge>
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