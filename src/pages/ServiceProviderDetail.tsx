import { useParams, Link } from "react-router-dom";
import { Star, Calendar, Clock, Wrench, Award, Phone, Mail, Video, ChevronLeft, MapPin, Edit, Save, X, CheckCircle2, MessageCircle, GraduationCap, Camera, User, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import qnevImage from './qnev.png';
import { useEffect, useState } from "react";

interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  date: string;
}

interface ServiceProvider {
  id: number;
  name: string;
  service: string;
  description: string;
  rating: number;
  image: string;
  reviews: number;
  expertise: string[];
  yearsOfExperience: number;
  portfolio: Project[];
  email: string;
  phone: string;
  availability: string;
}

interface PersonProfile {
  profileImage: string;
  fullName: string;
  selectedTrades: string | string[];
  bio: string;
  yearsExperience: number;
  email?: string;
  phone?: string;
  location?: string;
  city?: string;
  specialties?: string;
  rating?: number;
  reviews?: number;
  availability?: string;
  expertise?: string[];
  portfolio?: Project[];
}

const ServiceProviderDetail = () => {
  const [personProfile, setPersonProfile] = useState<PersonProfile | null>(null);
  const [showCallPopup, setShowCallPopup] = useState(false);
  const [showBookingPopup, setShowBookingPopup] = useState(false);
  const [projectImage, setProjectImage] = useState<string>('');
  const [projectsRegistered, setProjectsRegistered] = useState<any>(null);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editProjectData, setEditProjectData] = useState<any>(null);
  const { id } = useParams();
  console.log('show me the id', id)

  useEffect(() => {
    const callTheApi = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_TRAVEL_SECURITY}/travel/get-profile-by-id/${id}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        setPersonProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    callTheApi();
  }, [id]);

  console.log('dsadasdas', projectImage)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_TRAVEL_SECURITY}/travel/get-project-by-id/${id}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        console.log('show me the projects', data)
        let tmp = data.projectImages.map((image: string) => image)[0]
        console.log('tmp', tmp)
        setProjectImage(tmp);
        setProjectsRegistered(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    }

    fetchProjects();
  }, [id]);

  // Initialize edit data when project is loaded
  useEffect(() => {
    if (projectsRegistered) {
      setEditProjectData({
        title: projectsRegistered.title || '',
        description: projectsRegistered.description || '',
        projectDate: projectsRegistered.projectDate || '',
        specifications: projectsRegistered.specifications || []
      });
    }
  }, [projectsRegistered]);

  const handleBookMeeting = () => {
    if (!personProfile) return;

    setShowBookingPopup(true);
  };

  const handleCallClick = () => {
    console.log('Call button clicked!');
    console.log('personProfile:', personProfile);
    console.log('personProfile phone:', personProfile?.phone);
    setShowCallPopup(true);
    console.log('showCallPopup set to true');
  };

  const handleMessageClick = () => {
    if (!personProfile?.email) return;

    toast.success("Email Address", {
      description: personProfile.email,
      duration: 5000,
      action: {
        label: "Send Email",
        onClick: () => window.location.href = `mailto:${personProfile.email}`
      },
    });
  };

  const handleEditProject = () => {
    setIsEditingProject(true);
  };

  const handleCancelEdit = () => {
    setIsEditingProject(false);
    // Reset edit data to original values
    setEditProjectData({
      title: projectsRegistered.title || '',
      description: projectsRegistered.description || '',
      projectDate: projectsRegistered.projectDate || '',
      specifications: projectsRegistered.specifications || []
    });
  };

  const handleSaveProject = async () => {
    try {
      const projectId = projectsRegistered._id?.$oid || projectsRegistered.userId;
      
      const updatePayload = {
        projectId: projectId,
        userId: projectsRegistered.userId,
        title: editProjectData.title,
        description: editProjectData.description,
        projectDate: editProjectData.projectDate,
        specifications: editProjectData.specifications
      };

      const response = await fetch(`${import.meta.env.VITE_TRAVEL_SECURITY}/travel/update-project/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload)
      });

      if (!response.ok) {
        throw new Error('Failed to update project');
      }

      const updatedProject = await response.json();
      
      // Update local state with new data
      setProjectsRegistered(prev => ({
        ...prev,
        ...updatePayload
      }));
      
      setIsEditingProject(false);
      toast.success("Project updated successfully!");
      
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error("Failed to update project. Please try again.");
    }
  };

  const handleSpecificationChange = (index: number, value: string) => {
    const newSpecs = [...editProjectData.specifications];
    newSpecs[index] = value;
    setEditProjectData(prev => ({
      ...prev,
      specifications: newSpecs
    }));
  };

  const addSpecification = () => {
    setEditProjectData(prev => ({
      ...prev,
      specifications: [...prev.specifications, '']
    }));
  };

  const removeSpecification = (index: number) => {
    const newSpecs = editProjectData.specifications.filter((_: any, i: number) => i !== index);
    setEditProjectData(prev => ({
      ...prev,
      specifications: newSpecs
    }));
  };

  const RatingStars = ({ rating }: { rating: number }) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`w-5 h-5 ${index < Math.floor(rating)
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-300"
              }`}
          />
        ))}
        <span className="text-lg font-semibold text-gray-800 ml-2">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const constructionProvider: Record<string, string> = {
    'building': "Building & Construction",
    'plumbing': "Plumbing",
    'electrical': "Electrical",
    'painting': "Painting",
    'carpentry': "Carpentry",
    'hvac': "HVAC",
    'landscaping': "Landscaping"
  };

  const getServiceDisplayName = () => {
    if (!personProfile?.selectedTrades) return "Construction Professional";

    const trades = Array.isArray(personProfile.selectedTrades)
      ? personProfile.selectedTrades[0]
      : personProfile.selectedTrades;

    return constructionProvider[trades] || trades;
  };

  if (!personProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Navigation */}
      <div className="bg-muted/30 border-b py-4 pt-20 md:py-6 md:pt-24">
        <div className="container mx-auto px-4">
          <Link
            to="/service-providers"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors duration-200 group"
          >
            <ChevronLeft className="w-5 h-5 mr-2 transition-transform duration-200 group-hover:-translate-x-1" />
            <span className="text-base font-medium">Back to Service Providers</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-card rounded-3xl shadow-lg border overflow-hidden mb-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 p-6 md:p-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center lg:items-start gap-4">
              <div className="relative">
                <img
                  src={personProfile?.profileImage || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop"}
                  alt={personProfile?.fullName || "Construction Professional"}
                  className="w-40 h-40 lg:w-full lg:h-auto rounded-2xl object-cover shadow-md"
                />
                <div className="absolute -bottom-2 -right-2 bg-trust-blue text-trust-blue-foreground p-2 rounded-full shadow-lg">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
              
              {/* Quick Stats - Mobile */}
              <div className="lg:hidden w-full space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{personProfile?.yearsExperience || 15} years experience</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{personProfile?.city || personProfile?.location || "UK Wide"}</span>
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="flex flex-col">
              <div className="flex-1">
                {/* Name & Badge */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                      {personProfile?.fullName || "Construction Professional"}
                    </h1>
                    <p className="text-lg text-muted-foreground font-medium">
                      {getServiceDisplayName()}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-trust-blue/10 text-trust-blue px-4 py-2 rounded-full text-sm font-semibold border border-trust-blue/20">
                    <CheckCircle2 className="w-4 h-4" />
                    Verified Pro
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-3 mb-6">
                  <RatingStars rating={personProfile?.rating || 4.9} />
                  <span className="text-muted-foreground">({personProfile?.reviews || 143} reviews)</span>
                </div>

                {/* Quick Stats - Desktop */}
                <div className="hidden lg:flex items-center gap-6 mb-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{personProfile?.yearsExperience || 15} years experience</span>
                  </div>
                  <div className="h-4 w-px bg-border" />
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{personProfile?.city || personProfile?.location || "UK Wide"}</span>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {personProfile?.bio}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t">
                <Button
                  size="lg"
                  className="bg-trust-blue hover:bg-trust-blue/90 text-trust-blue-foreground shadow-md"
                  onClick={handleBookMeeting}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Chat with Trader
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="border-2"
                  onClick={handleCallClick}
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call Now
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="border-2"
                >
                  <Star className="w-5 h-5 mr-2" />
                  View Reviews
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Trust Metrics Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <Card className="p-6 border shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-trust-green/10 p-3 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-trust-green" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">98%</p>
                <p className="text-sm text-muted-foreground">Job completion rate</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-accent-orange/10 p-3 rounded-xl">
                <Star className="w-6 h-6 text-accent-orange fill-accent-orange" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">4.9/5</p>
                <p className="text-sm text-muted-foreground">Average rating ({personProfile?.reviews || 143})</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-trust-blue/10 p-3 rounded-xl">
                <Clock className="w-6 h-6 text-trust-blue" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">2 hours</p>
                <p className="text-sm text-muted-foreground">Typical response time</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Services & Expertise */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mb-8"
        >
          <Card className="p-6 md:p-8 border shadow-sm">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-foreground">
              <div className="bg-trust-blue/10 p-2.5 rounded-xl">
                <Wrench className="text-trust-blue w-6 h-6" />
              </div>
              Services & Expertise
            </h2>
            <div className="flex flex-wrap gap-3">
              {personProfile?.specialties && (
                <span className="bg-muted text-foreground px-4 py-2 rounded-full text-sm font-medium border">
                  {personProfile.specialties}
                </span>
              )}
              {personProfile?.expertise?.map((skill, index) => (
                <span key={index} className="bg-muted text-foreground px-4 py-2 rounded-full text-sm font-medium border">
                  {skill}
                </span>
              )) || (
                <>
                  <span className="bg-muted text-foreground px-4 py-2 rounded-full text-sm font-medium border">
                    {getServiceDisplayName()}
                  </span>
                  <span className="bg-muted text-foreground px-4 py-2 rounded-full text-sm font-medium border">
                    Residential Work
                  </span>
                  <span className="bg-muted text-foreground px-4 py-2 rounded-full text-sm font-medium border">
                    Commercial Projects
                  </span>
                </>
              )}
            </div>
          </Card>
        </motion.div>

        {/* About Me */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="mb-8"
        >
          <Card className="p-6 md:p-8 border shadow-sm">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-foreground">
              <div className="bg-trust-blue/10 p-2.5 rounded-xl">
                <User className="text-trust-blue w-6 h-6" />
              </div>
              About Me
            </h2>
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {personProfile?.bio || "Experienced tradesperson dedicated to delivering high-quality work and excellent customer service."}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Availability</p>
                    <p className="font-medium">{personProfile?.availability || "Mon-Fri, 8 AM - 6 PM"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Service Area</p>
                    <p className="font-medium">{personProfile?.city || personProfile?.location || "30 miles radius"}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Portfolio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mb-8"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-3 text-foreground">
              <div className="bg-accent-orange/10 p-2.5 rounded-xl">
                <Camera className="text-accent-orange w-6 h-6" />
              </div>
              Portfolio
            </h2>
            <p className="text-muted-foreground mt-2">Recent projects and completed work</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectsRegistered && (
              !isEditingProject ? (
                <Link to={`/project/${id}`} className="group block">
                  <Card className="overflow-hidden border shadow-sm hover:shadow-lg transition-all duration-300">
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={projectImage}
                        alt={projectsRegistered?.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-white text-sm font-medium">View Project Details →</p>
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {Array.isArray(projectsRegistered?.specifications) ? (
                          projectsRegistered.specifications.map((spec: string, index: number) => (
                            <span 
                              key={index}
                              className="px-3 py-1 bg-trust-blue/10 text-trust-blue rounded-full text-xs font-medium border border-trust-blue/20"
                            >
                              {spec}
                            </span>
                          ))
                        ) : (
                          <span className="px-3 py-1 bg-muted text-foreground rounded-full text-xs font-medium border">
                            General Construction
                          </span>
                        )}
                      </div>
                      
                      <h3 className="font-bold text-lg mb-2 text-foreground group-hover:text-trust-blue transition-colors">
                        {projectsRegistered?.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-3 line-clamp-2">
                        {projectsRegistered?.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{projectsRegistered?.projectDate}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ) : (
                <div className="block">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1, duration: 0.6 }}
                    className="bg-white rounded-xl md:rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="aspect-w-16 aspect-h-9 relative overflow-hidden">
                      <img
                        src={projectImage}
                        alt={projectsRegistered?.title}
                        className="w-full h-40 md:h-48 object-cover transition-transform duration-300 hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    
                    <div className="p-4 md:p-6">
                      {/* Edit Mode */}
                      <div className="space-y-4">
                        {/* Project Title */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Project Title</label>
                          <input
                            type="text"
                            value={editProjectData?.title || ''}
                            onChange={(e) => setEditProjectData(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter project title"
                          />
                        </div>

                        {/* Project Description */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                          <textarea
                            value={editProjectData?.description || ''}
                            onChange={(e) => setEditProjectData(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter project description"
                          />
                        </div>

                        {/* Project Date */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Project Date</label>
                          <input
                            type="date"
                            value={editProjectData?.projectDate || ''}
                            onChange={(e) => setEditProjectData(prev => ({ ...prev, projectDate: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        {/* Specifications */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Specifications</label>
                          <div className="space-y-2">
                            {editProjectData?.specifications?.map((spec: string, index: number) => (
                              <div key={index} className="flex gap-2">
                                <input
                                  type="text"
                                  value={spec}
                                  onChange={(e) => handleSpecificationChange(index, e.target.value)}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Enter specification"
                                />
                                <Button
                                  onClick={() => removeSpecification(index)}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              onClick={addSpecification}
                              variant="outline"
                              size="sm"
                              className="w-full text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white"
                            >
                              Add Specification
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )
            )}
          </div>
        </motion.div>
      </div>

      {/* Call Popup Window */}
      {showCallPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={() => setShowCallPopup(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 100, x: 100 }}
            animate={{ scale: 1, opacity: 1, y: 0, x: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 100, x: 100 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl max-w-sm mx-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowCallPopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Phone Icon */}
            <div className="text-center mb-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Call {personProfile?.fullName}</h3>
              <p className="text-gray-600">Ready to discuss your project?</p>
            </div>

            {/* Phone Number */}
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <p className="text-2xl font-bold text-gray-900">+359 123 456 789</p>
              <p className="text-sm text-gray-500 mt-2">Tap number to call</p>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Booking Popup Window */}
      {showBookingPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={() => setShowBookingPopup(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 100 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 100 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl max-w-md mx-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowBookingPopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Calendar Icon */}
            <div className="text-center mb-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Book Meeting with {personProfile?.fullName}</h3>
              <p className="text-gray-600">Choose your preferred booking method</p>
            </div>

            {/* Booking Options */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  window.open('https://calendly.com/', '_blank');
                  setShowBookingPopup(false);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-300 flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Book via Calendly
              </button>

              <button
                onClick={() => {
                  window.open('https://cal.com/', '_blank');
                  setShowBookingPopup(false);
                }}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-300 flex items-center justify-center gap-2"
              >
                <Clock className="w-4 h-4" />
                Book via Cal.com
              </button>

              <button
                onClick={() => {
                  const subject = `Meeting Request with ${personProfile?.fullName}`;
                  const body = `Hi ${personProfile?.fullName},\n\nI would like to schedule a meeting to discuss potential work.\n\nService Interest: ${getServiceDisplayName()}\n\nBest regards`;
                  const mailtoLink = `mailto:${personProfile?.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                  window.location.href = mailtoLink;
                  setShowBookingPopup(false);
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-300 flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Send Email Request
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ServiceProviderDetail;
