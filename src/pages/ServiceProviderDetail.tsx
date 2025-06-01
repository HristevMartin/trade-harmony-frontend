import { useParams, Link } from "react-router-dom";
import { Star, Calendar, Clock, Wrench, Award, Phone, Mail, Video, ChevronLeft, MapPin } from "lucide-react";
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
  const [projectsRegistered, setProjectsRegistered] = useState<Project[]>([]);
  const { id } = useParams();

  useEffect(() => {
    const callTheApi = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_TRAVEL_SECURITY}/travel/get-profile-by-id/${id}`);
        const data = await response.json();
        setPersonProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    callTheApi();
  }, [id]);

  console.log('show me the project image projectImage', projectImage)
  console.log('show me the personProfile', personProfile)


  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_TRAVEL_SECURITY}/travel/get-project-by-id/${id}`);
        const data = await response.json();
        console.log('show me the projects', data)
        setProjectImage(data.projectImages.map((image: string) => image).join(','));
        setProjectsRegistered(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    }

    fetchProjects();
  }, [id]);

  console.log('show me the data projects', projectsRegistered)


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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Navbar />

      {/* Improved Navigation Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-4 pt-20 md:py-6 md:pt-24">
        <div className="container mx-auto px-4">
          <Link
            to="/service-providers"
            className="inline-flex items-center text-white/90 hover:text-white transition-colors duration-300 group"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="text-base md:text-lg font-medium">Back to Service Providers</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-4 md:mt-8 relative z-10">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl md:rounded-2xl shadow-2xl overflow-hidden mb-6 md:mb-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            {/* Profile Image Section */}
            <div className="lg:col-span-1 relative">
              <div className="aspect-square lg:aspect-auto lg:h-full relative overflow-hidden">
                <img
                  src={personProfile?.profileImage}
                  alt={personProfile?.fullName || "Construction Professional"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
            </div>

            {/* Profile Info Section */}
            <div className="lg:col-span-2 p-4 sm:p-6 md:p-8 lg:p-12">
              <div className="flex flex-col h-full">
                <div className="flex-1">
                  {/* Header with name and service badge */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4"
                  >
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                      {personProfile?.fullName || "Construction Professional"}
                    </h1>
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-sm md:text-sm font-semibold shadow-md flex-shrink-0">
                      {getServiceDisplayName()}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="flex items-center gap-2 mb-4 md:mb-6"
                  >
                    <RatingStars rating={personProfile?.rating || 4.9} />
                    <span className="text-gray-600 ml-1 text-sm md:text-base">({personProfile?.reviews || 143} reviews)</span>
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="text-gray-700 text-base md:text-lg leading-relaxed mb-6 md:mb-8"
                  >
                    {personProfile?.bio || "Specializing in interior and exterior painting with 15 years of experience. Known for precision and attention to detail."}
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8"
                  >
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="bg-blue-100 p-2.5 md:p-3 rounded-full">
                        <Wrench className="text-blue-600 w-5 h-5 md:w-6 md:h-6" />
                      </div>
                      <div>
                        <p className="text-xs md:text-sm text-gray-500 font-medium">Experience</p>
                        <p className="font-bold text-gray-900 text-base md:text-lg">{personProfile?.yearsExperience || 15} Years</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="bg-green-100 p-2.5 md:p-3 rounded-full">
                        <Calendar className="text-green-600 w-5 h-5 md:w-6 md:h-6" />
                      </div>
                      <div>
                        <p className="text-xs md:text-sm text-gray-500 font-medium">Availability</p>
                        <p className="font-bold text-gray-900 text-base md:text-lg">{personProfile?.availability || "Monday to Friday, 8 AM - 6 PM"}</p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4"
                >
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 md:px-8 md:py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm md:text-base"
                    onClick={handleBookMeeting}
                  >
                    <Video className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    Book Meeting
                  </Button>

                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-6 py-2.5 md:px-8 md:py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm md:text-base"
                    onClick={handleCallClick}
                  >
                    <Phone className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    Call Now
                  </Button>

                  {/* <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-2.5 md:px-8 md:py-3 rounded-xl transition-all duration-300 text-sm md:text-base"
                    onClick={handleMessageClick}
                  >
                    <Mail className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    Message
                  </Button> */}
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Additional Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
          {personProfile?.specialties && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <Card className="p-4 md:p-6 lg:p-8 h-full bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg">
                <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-3 text-gray-900">
                  <div className="bg-blue-600 p-2 md:p-3 rounded-full">
                    <Wrench className="text-white w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <span className="text-base md:text-xl lg:text-2xl">Specialties</span>
                </h2>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  <span className="bg-white text-blue-700 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium shadow-md">
                    {personProfile.specialties}
                  </span>
                </div>
              </Card>
            </motion.div>
          )}

          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            <Card className="p-4 md:p-6 lg:p-8 h-full bg-gradient-to-br from-green-50 to-teal-50 border-0 shadow-lg">
              <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-3 text-gray-900">
                <div className="bg-green-600 p-2 md:p-3 rounded-full">
                  <Clock className="text-white w-5 h-5 md:w-6 md:h-6" />
                </div>
                <span className="text-base md:text-xl lg:text-2xl">Availability</span>
              </h2>
              <div className="mt-3 md:mt-4 flex items-center gap-2 text-green-600">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-semibold text-sm md:text-base">Currently Available</span>
              </div>
            </Card>
          </motion.div> */}
        </div>

        {/* Recent Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="mb-8 md:mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 flex items-center gap-3 text-gray-900">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-2 md:p-3 rounded-full">
              <Award className="text-white w-6 h-6 md:w-8 md:h-8" />
            </div>
            <span className="text-xl md:text-2xl lg:text-3xl">Recent Projects</span>
          </h2>
          <div style={{border: '2px solid red'}} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {personProfile?.portfolio ? personProfile.portfolio.map((project, index) => (
              <Link key={projectsRegistered?.id} to={`/project/${projectsRegistered?.id}`} className="block">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 + (index * 0.1), duration: 0.6 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="bg-white rounded-xl md:rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer"
                >
                  <div className="aspect-w-16 aspect-h-9 relative overflow-hidden">
                    <img
                      src={projectImage}
                      alt={project.title}
                      className="w-full h-40 md:h-48 object-cover transition-transform duration-300 hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-4 md:p-6">
                    <h3 className="font-bold text-lg md:text-xl mb-2 md:mb-3 text-gray-900">{project.title}</h3>
                    <p className="text-gray-600 mb-3 md:mb-4 leading-relaxed text-sm md:text-base">{project.description}</p>
                    <p className="text-blue-600 font-semibold text-sm md:text-base">{project.date}</p>
                  </div>
                </motion.div>
              </Link>
            )) : (
              // Fallback if no projects from API
              <Link to="/project/7" className="block">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1, duration: 0.6 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="bg-white rounded-xl md:rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer"
                >
                  <div className="aspect-w-16 aspect-h-9 relative overflow-hidden">
                    <img
                      src="/lovable-uploads/c35fa72c-a45a-4c7b-9587-f0a045db9c09.png"
                      alt="Complete Room Renovation"
                      className="w-full h-40 md:h-48 object-cover transition-transform duration-300 hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-4 md:p-6">
                    <h3 className="font-bold text-lg md:text-xl mb-2 md:mb-3 text-gray-900">Complete Room Renovation</h3>
                    <p className="text-gray-600 mb-3 md:mb-4 leading-relaxed text-sm md:text-base">Full interior renovation featuring custom wall texturing, premium wooden flooring, and modern ceiling design.</p>
                    <p className="text-blue-600 font-semibold text-sm md:text-base">March 2024</p>
                  </div>
                </motion.div>
              </Link>
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
