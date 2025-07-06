import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, AlertCircle, ArrowRight, MapPin, Clock, Phone } from "lucide-react";
import { useSearchParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import qnevImage from './qnev.png';

interface ServiceProvider {
  _id?: number;
  id?: number;
  name: string;
  service: string;
  description: string;
  rating: number;
  image: string;
  reviews: number;
  userId?: number;
  profileImageUrl?: string;
  profileImage?: string;
  fullName?: string;
  bio?: string;
  location?: string;
  city?: string;
  yearsExperience?: string;
  specialties?: string;
  selectedTrades?: string;
}

const serviceProviders: Record<string, ServiceProvider[]> = {
  "Building & Construction": [
    {
      _id: 7,
      id: 7,
      name: "Nasko Yanev",
      service: "Book a Builder",
      description: "Expert in interior renovations, specializing in wall texturing, flooring installation, and ceiling work. 12+ years of experience in residential projects.",
      rating: 4.9,
      image: qnevImage,
      reviews: 143,
    }
  ],
  "Professional Painting": [
    {
      _id: 1,
      id: 1,
      name: "John Smith",
      service: "Professional Painting",
      description: "Specializing in interior and exterior painting with 15 years of experience. Known for precision and attention to detail.",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1604357209793-fca5dca89f97?q=80&w=2044&auto=format&fit=crop",
      reviews: 127,
    },
    {
      _id: 2,
      id: 2,
      name: "Sarah Johnson",
      service: "Professional Painting",
      description: "Expert in decorative painting and custom finishes. Over 10 years of experience in residential and commercial projects.",
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=2070&auto=format&fit=crop",
      reviews: 89,
    },
  ],
  "Electrical Services": [],
  "Mechanical Repairs": [],
};

const mapDatabaseToFrontend = (data: any) => {
  const mapping = {
    "Book a Builder": "building",
    "Find Electricians": "electrical",
    "Mechanical Repairs": "mechanic"
  }
  return mapping[data] || data;
}

const reverseMapDatabaseToFrontend = (data: any) => {
  const mapping = {
    "building": "Book a Builder",
    "electrical": "Find Electricians",
    "mechanic": "Mechanical Repairs"
  }
  return mapping[data] || data;
}

const ServiceProviders = () => {
  const [searchParams] = useSearchParams();
  const serviceType = searchParams.get("service");
  console.log('serviceTyddsadasdasdaspe', serviceType)
  const [servicesFetched, setServicesFetched] = useState<ServiceProvider[]>([]);
  console.log('show me the serviceType', serviceType)
  const mappedServiceType = mapDatabaseToFrontend(serviceType);

  const [allServices, setAllServices] = useState<ServiceProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllServices = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${import.meta.env.VITE_TRAVEL_SECURITY}/travel/get-all-profiles`);
        if (response.ok) {
          const data = await response.json(); 
          let dataProfiles = data.profiles
          console.log('show me this wweee', dataProfiles)
          setAllServices(dataProfiles);
        } else {
          console.error('Failed to fetch all services');
        }
      } catch (error) {
        console.error('Error fetching all services:', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (!serviceType) {
      console.log('when service is missing', serviceType)
      fetchAllServices();
    }
  }, [serviceType]);

  let backendUrl = import.meta.env.VITE_TRAVEL_SECURITY
  console.log('show me the bakendUrl', backendUrl)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${import.meta.env.VITE_TRAVEL_SECURITY}/travel/get-specific-services/${mappedServiceType}`);
        if (response.ok) {
          const data = await response.json();
          console.log('show me the database data', data);
          const mappedData = data.map((item: any) => ({
            ...item,
            service: reverseMapDatabaseToFrontend(item.service)
          }));
          setServicesFetched(mappedData);
        } else {
          console.error('Failed to fetch services');
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (serviceType && mappedServiceType) {
      fetchServices();
    }
  }, [mappedServiceType, serviceType]);

  const RatingStars = ({ rating }: { rating: number }) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`w-4 h-4 ${index < Math.floor(rating)
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-300"
              }`}
          />
        ))}
        <span className="text-sm text-gray-700 ml-2 font-semibold">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Navbar />
      
      {/* Hero Section - Beautiful background with form */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-700 to-blue-800 pt-20 pb-16 md:pt-24 md:pb-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-white"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Find a local construction expert near you
              </h1>
              <p className="text-lg md:text-xl text-blue-100 mb-6 leading-relaxed">
                Fill in a short form and get free quotes for professional construction services near you
              </p>
              
              {/* Trustpilot-style rating */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-1">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-green-400 font-bold">Trustpilot 4.8</span>
                </div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-orange-400 fill-orange-400" />
                  ))}
                </div>
              </div>
              <p className="text-blue-200">Excellent rating - 4.8/5 (9300+ reviews)</p>
            </motion.div>

            {/* Right Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl p-4 md:p-6 shadow-2xl max-w-md mx-auto lg:mx-0"
            >
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-5 text-center lg:text-left">
                Get help from a local construction expert
              </h3>
              
              <div className="space-y-3">
                {[
                  "Building & Construction",
                  "Electrical Services", 
                  "Plumbing Services",
                  "Painting & Decoration",
                  "Mechanical Repairs"
                ].map((service, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 text-sm md:text-base">{service}</span>
                  </div>
                ))}
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-gray-500 text-sm md:text-base ml-7 md:ml-8">... or anything else</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-12 relative z-10 pb-16">
        {isLoading ? (
          /* Loading State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-white rounded-xl md:rounded-2xl shadow-2xl p-6 md:p-8 lg:p-12 text-center"
          >
            <div className="max-w-md mx-auto">
              <div className="bg-blue-50 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="animate-spin rounded-full h-8 w-8 md:h-10 md:w-10 border-b-2 border-blue-600"></div>
              </div>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 text-gray-900">
                Finding Professionals...
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed text-sm md:text-base">
                Please wait while we load available {serviceType || 'construction'} professionals in your area.
              </p>
            </div>
          </motion.div>
        ) : (serviceType ? servicesFetched.length > 0 : allServices.length > 0) ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {/* Results Header */}
            <div className="bg-white rounded-t-xl md:rounded-t-2xl shadow-lg p-4 md:p-6 mb-0">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                    {serviceType ? `${serviceType} Specialists` : 'All Traders'}
                  </h2>
                  <p className="text-gray-600 text-sm md:text-base">
                    {serviceType 
                      ? `${servicesFetched.length} verified ${serviceType.toLowerCase()} professional${servicesFetched.length !== 1 ? 's' : ''} ready to help`
                      : `${allServices.length} verified construction professional${allServices.length !== 1 ? 's' : ''} ready to help`
                    }
                  </p>
                </div>
                
              </div>
            </div>

            {/* Providers Grid */}
            <div className="bg-gray-50 p-4 md:p-6 lg:p-8 rounded-b-xl md:rounded-b-2xl shadow-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {(serviceType ? servicesFetched : allServices).map((provider, index) => (
                  <motion.div
                    key={provider._id || provider.userId || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.6 }}
                    whileHover={{ y: -4, scale: 1.01 }}
                    className="h-full"
                  >
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col bg-white border-0 shadow-lg rounded-xl p-6">
                      {/* Profile Section */}
                      <div className="text-center mb-4">
                        <div className="relative inline-block mb-3">
                          <img
                            src={provider?.profileImage || provider?.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop"}
                            alt={provider.fullName || provider.name}
                            className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-4 border-gray-100 shadow-md"
                          />
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-1">
                          {provider.fullName || provider.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          {provider?.city || "Local Area"}
                        </p>
                        
                        {/* Experience and Specialties */}
                        <div className="mb-3 space-y-2">
                          {provider.yearsExperience && (
                            <div className="flex items-center justify-center gap-2">
                              <div className="bg-blue-100 p-1.5 rounded-full">
                                <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <span className="text-xs text-gray-700 font-medium">
                                {provider.yearsExperience} years experience
                              </span>
                            </div>
                          )}
                          
                          {provider.specialties && (
                            <div className="flex items-center justify-center gap-2">
                              <div className="bg-green-100 p-1.5 rounded-full">
                                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M9.664.43c.196-.23.489-.267.712-.07L19 8.174a.75.75 0 01-.024 1.086L9.24 19.82a.75.75 0 01-1.033-.067l-1.211-1.35a.75.75 0 01.919-1.2l.325.162a11.612 11.612 0 002.7-2.581 2.994 2.994 0 01-1.6-2.497c0-.414.336-.75.75-.75s.75.336.75.75a1.5 1.5 0 103-0 .75.75 0 011.5 0 2.25 2.25 0 11-4.5 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <span className="text-xs text-gray-700 font-medium">
                                {provider.specialties}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-center gap-1 mb-4">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, starIndex) => (
                              <Star
                                key={starIndex}
                                className={`w-4 h-4 ${starIndex < Math.floor(4.9)
                                  ? "text-orange-400 fill-orange-400"
                                  : "text-gray-300"
                                  }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-bold text-gray-900 ml-1">4.9</span>
                          <span className="text-sm text-gray-500">({provider.reviews || 143})</span>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="mb-6 flex-1">
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {provider.bio || provider.description || "Expert construction professional with years of experience. Specializing in quality workmanship and customer satisfaction."}
                        </p>
                      </div>

                      {/* Request Quote Button */}
                      <Link to={`/service-provider/${provider?.userId}`} className="block">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full bg-white border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white py-3 px-4 rounded-lg transition-all duration-300 font-semibold text-sm"
                        >
                          See Profile
                        </motion.button>
                      </Link>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-white rounded-xl md:rounded-2xl shadow-2xl p-6 md:p-8 lg:p-12 text-center"
          >
            <div className="max-w-md mx-auto">
              <div className="bg-blue-50 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-8 w-8 md:h-10 md:w-10 text-blue-600" />
              </div>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 text-gray-900">
                No Professionals Available Yet
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed text-sm md:text-base">
                We're expanding our network of {serviceType} professionals in your area. 
                Check back soon or browse other services.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-lg transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                  >
                    Browse All Services
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white py-3 px-6 rounded-lg transition-all duration-300 font-semibold"
                >
                  Join as Professional
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ServiceProviders;
