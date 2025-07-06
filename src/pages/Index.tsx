
import { HardHat, Wrench, Zap, ArrowRight, Building, Search, CheckCircle, Star, Users, Shield, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServiceCard from "@/components/ServiceCard";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const Index = () => {
  const services = [
    {
      title: "Building & Construction",
      description: "Complete building services for residential and commercial projects.",
      icon: <Building className="h-6 w-6" />,
      image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop",
      dbField: "building"
    },
    {
      title: "Electrical Services", 
      description: "Licensed electricians for all your electrical needs and installations.",
      icon: <Zap className="h-6 w-6" />,
      image: "https://media.istockphoto.com/id/1469656864/photo/electrician-engineer-uses-a-multimeter-to-test-the-electrical-installation-and-power-line.jpg?s=612x612&w=0&k=20&c=h70UOpNbJYT5G2oGT-KUeIE3yXwEgsCpr25yR1rnGtU=",
      dbField: "electrical"
    },
    {
      title: "Mechanical Repairs",
      description: "Comprehensive mechanical services for construction equipment and vehicles.", 
      icon: <Wrench className="h-6 w-6" />,
      image: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?q=80&w=2070&auto=format&fit=crop",
      dbField: "mechanic"
    },
  ];

  const [servicesFetched, setServicesFetched] = useState<any>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [postcode, setPostcode] = useState("");

  const mapDatabaseToFrontend = (dbServices: any[]) => {
    return services
      .map(frontendService => {
        const dbService = dbServices.find(db => 
          db.trade === frontendService.dbField ||
          db.type === frontendService.dbField || 
          db.service_type === frontendService.dbField ||
          db.name?.toLowerCase() === frontendService.dbField
        );
        
        if (dbService) {
          return {
            ...frontendService,
            title: dbService.title || dbService.name || frontendService.title,
            description: dbService.description || frontendService.description,
            icon: frontendService.icon,
            image: frontendService.image,
            ...dbService
          };
        }
        
        return null;
      })
      .filter(service => service !== null);
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoadingServices(true);
        let url = `${import.meta.env.VITE_TRAVEL_SECURITY}/travel/get-project-services`;
        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          const mappedServices = mapDatabaseToFrontend(data);
          setServicesFetched(mappedServices);
        } else {
          setServicesFetched(services);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        setServicesFetched(services);
      } finally {
        setIsLoadingServices(false);
      }
    };
    fetchServices();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section - MyJobQuote Style */}
      <section className="relative bg-gradient-to-b from-blue-50 to-blue-100 overflow-hidden">
        {/* Illustrated Background */}
        <div className="absolute inset-0">
          {/* Simple illustrated cityscape background */}
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-blue-200 to-transparent"></div>
          <svg className="absolute bottom-0 left-0 w-full h-48" viewBox="0 0 1200 200" xmlns="http://www.w3.org/2000/svg">
            {/* Simple building silhouettes */}
            <rect x="50" y="120" width="80" height="80" fill="#cbd5e1" opacity="0.6"/>
            <rect x="150" y="100" width="60" height="100" fill="#94a3b8" opacity="0.6"/>
            <rect x="230" y="130" width="70" height="70" fill="#cbd5e1" opacity="0.6"/>
            <rect x="900" y="110" width="90" height="90" fill="#94a3b8" opacity="0.6"/>
            <rect x="1010" y="125" width="75" height="75" fill="#cbd5e1" opacity="0.6"/>
            {/* Trees */}
            <circle cx="400" cy="160" r="25" fill="#86efac" opacity="0.7"/>
            <rect x="395" y="160" width="10" height="40" fill="#a3a3a3" opacity="0.7"/>
            <circle cx="800" cy="150" r="30" fill="#86efac" opacity="0.7"/>
            <rect x="795" y="150" width="10" height="50" fill="#a3a3a3" opacity="0.7"/>
          </svg>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-16 lg:py-24">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            {/* Left Tradesperson Illustration */}
            <div className="hidden lg:block flex-shrink-0">
              <div className="w-64 h-80 relative">
                {/* Simplified tradesperson illustration */}
                <div className="absolute bottom-0 left-8">
                  {/* Body */}
                  <div className="w-24 h-32 bg-teal-700 rounded-t-3xl relative">
                    {/* Arms */}
                    <div className="absolute -left-4 top-8 w-8 h-20 bg-white rounded-full transform -rotate-12"></div>
                    <div className="absolute -right-4 top-8 w-8 h-20 bg-white rounded-full transform rotate-12"></div>
                  </div>
                  {/* Legs */}
                  <div className="w-24 h-16 bg-blue-600 rounded-b-lg"></div>
                  {/* Head */}
                  <div className="absolute -top-16 left-4 w-16 h-16 bg-pink-300 rounded-full">
                    {/* Hair */}
                    <div className="absolute -top-2 left-2 w-12 h-8 bg-amber-800 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Content */}
            <div className="flex-1 text-center max-w-2xl mx-auto">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4"
              >
                Find Tradespeople,<br />
                <span className="text-gray-700">compare up to 3 quotes!</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl text-gray-600 mb-8"
              >
                It's FREE and there are no obligations
              </motion.p>

              {/* Search Form */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="bg-white rounded-2xl p-3 shadow-xl max-w-md mx-auto flex items-center"
              >
                <div className="flex-1 flex items-center">
                  <Search className="h-5 w-5 text-gray-400 ml-4 mr-3" />
                  <Input
                    type="text"
                    placeholder="Enter your postcode"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    className="border-0 text-lg py-6 focus:outline-none focus:ring-0 bg-transparent"
                  />
                </div>
                <Button 
                  size="lg" 
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 rounded-xl font-semibold"
                >
                  Get Started
                </Button>
              </motion.div>

              {/* Trustpilot Style Reviews */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mt-8 flex items-center justify-center space-x-2"
              >
                <span className="text-gray-700 font-semibold">Excellent</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-green-500 fill-current" />
                  ))}
                </div>
                <span className="text-gray-600">30,896 reviews on</span>
                <span className="text-green-600 font-bold">★ Trustpilot</span>
              </motion.div>
            </div>

            {/* Right Tradespeople Illustration */}
            <div className="hidden lg:block flex-shrink-0">
              <div className="w-64 h-80 relative">
                {/* Construction worker with hard hat */}
                <div className="absolute bottom-0 right-8">
                  {/* Body */}
                  <div className="w-20 h-28 bg-orange-400 rounded-t-2xl relative">
                    {/* Safety vest stripes */}
                    <div className="absolute top-4 left-2 right-2 h-2 bg-white opacity-80"></div>
                    <div className="absolute top-8 left-2 right-2 h-2 bg-white opacity-80"></div>
                  </div>
                  {/* Legs */}
                  <div className="w-20 h-14 bg-blue-800 rounded-b-lg"></div>
                  {/* Head */}
                  <div className="absolute -top-12 left-2 w-16 h-12 bg-pink-300 rounded-full"></div>
                  {/* Hard hat */}
                  <div className="absolute -top-16 left-1 w-18 h-8 bg-yellow-400 rounded-full"></div>
                </div>
                
                {/* Taller tradesperson */}
                <div className="absolute bottom-0 right-32">
                  {/* Body */}
                  <div className="w-24 h-36 bg-blue-400 rounded-t-3xl relative">
                    {/* Tool belt */}
                    <div className="absolute bottom-8 left-0 right-0 h-4 bg-amber-800"></div>
                  </div>
                  {/* Legs */}
                  <div className="w-24 h-16 bg-blue-700 rounded-b-lg"></div>
                  {/* Head */}
                  <div className="absolute -top-16 left-4 w-16 h-16 bg-pink-300 rounded-full">
                    {/* Hair */}
                    <div className="absolute -top-1 left-3 w-10 h-6 bg-amber-700 rounded-full"></div>
                  </div>
                  {/* Tool in hand */}
                  <div className="absolute top-16 -right-6 w-2 h-20 bg-gray-600 transform rotate-45"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between max-w-4xl mx-auto">
            <div className="mb-8 md:mb-0">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                Over 50,000 tradespeople nationwide use MyJobQuote
              </h2>
            </div>
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg"
            >
              Sign up as a trade
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
