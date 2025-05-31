import { HardHat, Wrench, Zap, ArrowRight, Building } from "lucide-react";
import Navbar from "@/components/Navbar";
import ServiceCard from "@/components/ServiceCard";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";


const Index = () => {
  const services = [
    {
      title: "Building & Construction",
      description: "Complete building services for residential and commercial projects.",
      icon: <Building className="h-6 w-6" />,
      image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop", // Construction site with workers
      dbField: "building"
    },
    {
      title: "Electrical Services", 
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

  const mapDatabaseToFrontend = (dbServices: any[]) => {
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
            // Keep frontend icon and image
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
      }
    };
    fetchServices();
  }, []);

  console.log('show me the servicesFetched', servicesFetched);

  // Dynamic construction stats - for animation purposes
  const constructionStats = [
    { value: "1.2M+", label: "Projects Completed" },
    { value: "3.5M+", label: "Happy Customers" },
    { value: "4.9", label: "Customer Rating" },
    { value: "15K+", label: "Service Providers" }
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
              Building Excellence, One Project at a Time
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-blue-100 mb-8 max-w-xl"
            >
              Connect with top construction professionals for your next project. Quality work, guaranteed.
            </motion.p>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button
                className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 h-auto rounded-full font-semibold"
                size="lg"
              >
                Post a construction job <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                className="bg-blue-700 text-white hover:bg-blue-800 text-lg px-8 py-6 h-auto rounded-full font-semibold"
                size="lg"
              >
                Join as a Contractor
              </Button>
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
            <motion.img
              src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2070&auto=format&fit=crop"
              alt="Construction professionals"
              className="rounded-lg shadow-2xl"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
          </div>

          {/* Background decorative elements */}
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-blue-500 rounded-full opacity-30"></div>
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-500 rounded-full opacity-30"></div>
        </div>
      </section>

      {/* Services Section - Construction focused */}
      <section className="py-16 px-4 bg-gray-50">

        <div className="container mx-auto">

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-10 text-gray-900"
          >
            Construction services we offer
          </motion.h2>

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


          <div className="text-center mt-12">
            <Link to="/service-providers" className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-800">
              View all construction services <ArrowRight className="ml-1 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">TradesPro</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2">
                {services.map((service, index) => (
                  <li key={index}><Link to={`/service-providers?service=${encodeURIComponent(service.title)}`} className="text-gray-400 hover:text-white transition-colors">{service.title}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Service Providers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2">
                <li className="text-gray-400">Email: contact@tradespro.com</li>
                <li className="text-gray-400">Phone: (555) 123-4567</li>
                <li className="text-gray-400">123 Business Ave, Suite 100</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TradesPro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
