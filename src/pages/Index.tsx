import { HardHat, Wrench, Zap, ArrowRight, Building } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServiceCard from "@/components/ServiceCard";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";


const Index = () => {
  const navigate = useNavigate();
  const services = [
    {
      title: "Book a Builder",
      description: "Complete building services for residential and commercial projects.",
      icon: <Building className="h-6 w-6" />,
      image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop", // Construction site with workers
      dbField: "building"
    },
    {
      title: "Find Electricians", 
      description: "Licensed electricians for all your electrical needs and installations.",
      icon: <Zap className="h-6 w-6" />,
      image: "https://media.istockphoto.com/id/1469656864/photo/electrician-engineer-uses-a-multimeter-to-test-the-electrical-installation-and-power-line.jpg?s=612x612&w=0&k=20&c=h70UOpNbJYT5G2oGT-KUeIE3yXwEgsCpr25yR1rnGtU=", // Electrician working on a panel
      dbField: "electrical"
    },
    {
      title: "Mechanical Repairs",
      description: "Comprehensive mechanical services for construction equipment and vehicles.", 
      icon: <Wrench className="h-6 w-6" />,
      image: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?q=80&w=2070&auto=format&fit=crop", // Mechanic working on construction equipment
      dbField: "mechanic"
    },
  ];

  console.log('in here 2')

  const [servicesFetched, setServicesFetched] = useState<any>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoadingServices, setIsLoadingServices] = useState(true);

  // Carousel images representing various professional services
  const carouselImages = [
    {
      url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2070&auto=format&fit=crop",
      alt: "Book a Builder",
      service: "Book a Builder"
    },
    {
      url: "https://contractortrainingcenter.com/cdn/shop/articles/Untitled_design_1.png?v=1693506427&width=1100",
      alt: "Find Electricians",
      service: "Find Electricians"
    }
  ];

  // Auto-slide effect
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prevSlide) => 
        prevSlide === carouselImages.length - 1 ? 0 : prevSlide + 1
      );
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(slideInterval);
  }, [carouselImages.length]);

  const mapDatabaseToFrontend = (dbServices: any[]) => {
    console.log('show me the dbServices', dbServices)
    // Filter and map only services that exist in the database
    return services
      .map(frontendService => {
        // Find matching database service by dbField
        const dbService = dbServices.find(db => 
          db.trade === frontendService.dbField ||
          db.type === frontendService.dbField || 
          db.service_type === frontendService.dbField ||
          db.name?.toLowerCase() === frontendService.dbField
        );
        
        if (dbService) {
          // Merge database data with frontend configuration
          return {
            ...frontendService,
            // Override with database values if they exist
            title: dbService.title || dbService.name || frontendService.title,
            description: dbService.description || frontendService.description,
            icon: frontendService.icon,
            image: frontendService.image,
            // Add any additional database fields
            ...dbService
          };
        }
        
        // Return null if no database match found
        return null;
      })
      .filter(service => service !== null); // Remove null entries (services not in database)
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoadingServices(true);
        let url = `${import.meta.env.VITE_TRAVEL_SECURITY}/travel/get-project-services`;
        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          console.log('show me the database data', data);
          
          // Map database data to frontend services using our mapping
          const mappedServices = mapDatabaseToFrontend(data);
          console.log('mapped services', mappedServices);
          
          setServicesFetched(mappedServices);
        } else {
          console.error('Failed to fetch services');
          // Fallback to static services if API fails
          setServicesFetched(services);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        // Fallback to static services if API fails
        setServicesFetched(services);
      } finally {
        setIsLoadingServices(false);
      }
    };
    fetchServices();
  }, []);

  // Dynamic stats - for animation purposes
  const constructionStats = [
    { value: "1.2M+", label: "Services Completed" },
    { value: "3.5M+", label: "Happy Customers" },
    { value: "4.9", label: "Customer Rating" },
    { value: "15K+", label: "Skilled Professionals" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section  className="bg-blue-600 text-white py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2070&auto=format&fit=crop')" }}></div>
        <div className="container mx-auto px-4 lg:px-8 flex flex-col lg:flex-row items-center relative z-10">
          <div className="lg:w-1/2 z-10 mb-10 lg:mb-0">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 max-w-xl"
            >
              Connect with Skilled Professionals for Every Trade
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-blue-100 mb-8 max-w-xl"
            >
              The ultimate platform connecting skilled tradespeople with clients. From construction to cleaning, find trusted professionals for any service.
            </motion.p>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button
                className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 h-auto rounded-full font-semibold"
                size="lg"
                onClick={() => navigate('/service-providers')}
              >
                Find a Service Provider <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              {/* <Button
                className="bg-blue-700 text-white hover:bg-blue-800 text-lg px-8 py-6 h-auto rounded-full font-semibold"
                size="lg"
              >
                Join as a Professional
              </Button> */}
            </div>

            <div className="flex items-center gap-6 mt-10">
              {constructionStats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 + (index * 0.1) }}
                >
                  <motion.span
                    className="text-xl font-bold"
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{
                      duration: 0.5,
                      delay: 1.2 + (index * 0.1),
                      type: "spring",
                      stiffness: 200
                    }}
                  >
                    {stat.value}
                  </motion.span>
                  <span className="text-blue-100 text-sm">{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="lg:w-1/2 z-10">
            {/* Image Carousel */}
            <div className="relative">
              <div className="overflow-hidden rounded-lg shadow-2xl">
                <motion.div 
                  className="flex transition-transform duration-1000 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {carouselImages.map((image, index) => (
                    <motion.img
                      key={index}
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-80 lg:h-96 object-cover flex-shrink-0 cursor-pointer hover:scale-105 transition-transform duration-300"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                      onClick={() => navigate(`/service-providers?service=${encodeURIComponent(image.service)}`)}
                    />
                  ))}
                </motion.div>
              </div>
              
              {/* Navigation Dots */}
              <div className="flex justify-center mt-6 space-x-2">
                {carouselImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentSlide 
                        ? 'bg-white shadow-lg' 
                        : 'bg-white/50 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
              
              {/* Service Type Indicator */}
              <motion.div 
                key={currentSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-4 text-center"
              >
                <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                  {carouselImages[currentSlide].alt}
                </span>
              </motion.div>
            </div>
          </div>

          {/* Background decorative elements */}
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-blue-500 rounded-full opacity-30"></div>
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-500 rounded-full opacity-30"></div>
        </div>
      </section>

      {/* Services Section - All trades focused */}
      <section className="py-16 px-4 bg-gray-50">

        <div className="container mx-auto">

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-10 text-gray-900"
          >
            Hire Trusted Tradespeople Near You
          </motion.h2>

          {isLoadingServices ? (
            /* Loading State for Services */
            <div className="grid md:grid-cols-3 gap-8 px-4">
              {[...Array(3)].map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.6 }}
                  className="bg-white rounded-xl shadow-lg p-6 h-80"
                >
                  {/* Image Skeleton */}
                  <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
                  
                  {/* Title Skeleton */}
                  <div className="h-6 bg-gray-200 rounded mb-3 animate-pulse"></div>
                  
                  {/* Description Skeleton */}
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 px-4">
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
            <Link to="/service-providers" className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-800">
              View all professional services <ArrowRight className="ml-1 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
