
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
  const [searchQuery, setSearchQuery] = useState("");

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

  const howItWorksSteps = [
    {
      number: "1",
      title: "Tell us what you need",
      description: "Answer a few questions about your project and we'll find the right tradesperson for you",
      icon: <Search className="h-8 w-8" />
    },
    {
      number: "2", 
      title: "Compare quotes",
      description: "Receive up to 5 quotes from local, vetted professionals and compare prices",
      icon: <Users className="h-8 w-8" />
    },
    {
      number: "3",
      title: "Hire with confidence",
      description: "Choose your tradesperson based on reviews, ratings and previous work",
      icon: <CheckCircle className="h-8 w-8" />
    }
  ];

  const trustStats = [
    { value: "2M+", label: "Jobs completed" },
    { value: "50K+", label: "Trusted tradespeople" },
    { value: "4.8★", label: "Average rating" },
    { value: "98%", label: "Customer satisfaction" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      location: "London",
      rating: 5,
      text: "Found an excellent electrician through the platform. Quick, professional, and fairly priced!",
      service: "Electrical Work"
    },
    {
      name: "Mark Thompson", 
      location: "Manchester",
      rating: 5,
      text: "The builders we found were fantastic. Completed our extension on time and within budget.",
      service: "Building & Construction"
    },
    {
      name: "Emma Davis",
      location: "Birmingham", 
      rating: 5,
      text: "Great service! Multiple quotes received within hours and all were from verified professionals.",
      service: "General Repairs"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            >
              Find Trusted Local <br />
              <span className="text-blue-200">Tradespeople</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto"
            >
              Get free quotes from vetted professionals near you. Compare prices, read reviews, and hire with confidence.
            </motion.p>

            {/* Search Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl max-w-2xl mx-auto"
            >
              <div className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="What service do you need? (e.g. electrician, plumber, builder)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="text-lg py-6 border-2 border-gray-200 focus:border-blue-500 text-gray-900"
                  />
                </div>
                <Button 
                  size="lg" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6 rounded-xl font-semibold"
                >
                  Get Free Quotes
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
              <p className="text-gray-500 text-sm mt-4 text-center">
                It takes less than 2 minutes
              </p>
            </motion.div>

            {/* Trust Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
            >
              {trustStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-blue-200 text-sm">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              How It Works
            </motion.h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Getting quotes from local tradespeople has never been easier
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {howItWorksSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                  {step.number}
                </div>
                <div className="text-blue-600 mb-4 flex justify-center">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Popular Services
            </motion.h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find trusted professionals for all your home improvement needs
            </p>
          </div>

          {isLoadingServices ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl border shadow-sm p-6 h-80">
                  <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded mb-3 animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {servicesFetched.map((service: any, index: any) => (
                <ServiceCard
                  key={index}
                  title={service.title}
                  description={service.description}
                  icon={service.icon}
                  image={service.image}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/service-providers" className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-800 text-lg">
              View all services <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              What Our Customers Say
            </motion.h2>
            <p className="text-xl text-gray-600">
              Join thousands of satisfied customers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      "{testimonial.text}"
                    </p>
                    <div className="border-t pt-4">
                      <div className="font-semibold text-gray-900">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {testimonial.location} • {testimonial.service}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Safety Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Your Safety is Our Priority
            </motion.h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              All our tradespeople are thoroughly vetted and insured
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Shield className="h-12 w-12 text-blue-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">Fully Vetted</h3>
              <p className="text-blue-100">
                Every tradesperson undergoes thorough background checks and verification
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <CheckCircle className="h-12 w-12 text-blue-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">Insured & Qualified</h3>
              <p className="text-blue-100">
                All professionals carry full insurance and relevant qualifications
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Clock className="h-12 w-12 text-blue-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">24/7 Support</h3>
              <p className="text-blue-100">
                Our customer support team is here to help whenever you need us
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
