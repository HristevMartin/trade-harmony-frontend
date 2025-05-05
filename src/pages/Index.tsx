
import { Paintbrush, Wrench, Zap, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import ServiceCard from "@/components/ServiceCard";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  const services = [
    {
      title: "Professional Painting",
      description: "Interior and exterior painting services for your home or business.",
      icon: <Paintbrush className="h-6 w-6" />,
      image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=2070&auto=format&fit=crop" // Professional painter with equipment
    },
    {
      title: "Electrical Services",
      description: "Licensed electricians for all your electrical needs and installations.",
      icon: <Zap className="h-6 w-6" />,
      image: "https://images.unsplash.com/photo-1565608438257-fac3c27aa6e6?q=80&w=2070&auto=format&fit=crop" // Electrician working on a panel
    },
    {
      title: "Mechanical Repairs",
      description: "Comprehensive mechanical services for vehicles and equipment.",
      icon: <Wrench className="h-6 w-6" />,
      image: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?q=80&w=2070&auto=format&fit=crop" // Mechanic working on a car engine
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section - Blue background similar to Airtasker */}
      <section className="bg-blue-600 text-white py-16 lg:py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8 flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 z-10 mb-10 lg:mb-0">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 max-w-xl"
            >
              Your Trusted Partner in Professional Services
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-blue-100 mb-8 max-w-xl"
            >
              Post any job. Pick the best professional. Get it done.
            </motion.p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button 
                className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 h-auto rounded-full font-semibold"
                size="lg"
              >
                Post a job for free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                className="bg-blue-700 text-white hover:bg-blue-800 text-lg px-8 py-6 h-auto rounded-full font-semibold"
                size="lg"
              >
                Become a Service Provider
              </Button>
            </div>
            
            <div className="flex items-center gap-6 mt-10">
              <div className="flex flex-col items-center">
                <span className="text-xl font-bold">1M+</span>
                <span className="text-blue-100 text-sm">Customers</span>
              </div>
              <div className="h-8 w-px bg-blue-400"></div>
              <div className="flex flex-col items-center">
                <span className="text-xl font-bold">2.5M+</span>
                <span className="text-blue-100 text-sm">Jobs Done</span>
              </div>
              <div className="h-8 w-px bg-blue-400"></div>
              <div className="flex flex-col items-center">
                <span className="text-xl font-bold">4.8</span>
                <span className="text-blue-100 text-sm">Customer Rating</span>
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/2 z-10">
            <img 
              src="https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=2574&auto=format&fit=crop" 
              alt="Service professionals" 
              className="rounded-lg shadow-2xl"
            />
          </div>
          
          {/* Background decorative elements */}
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-blue-500 rounded-full opacity-30"></div>
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-500 rounded-full opacity-30"></div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">Post your job in seconds</h2>
            <p className="text-xl text-gray-600">Save yourself hours and get your to-do list completed</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Describe what you need</h3>
              <p className="text-gray-600">Tell us what service you're looking for and when you need it.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Set your budget</h3>
              <p className="text-gray-600">Get quotes that fit your budget for any service.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Choose the best provider</h3>
              <p className="text-gray-600">Compare quotes, profiles, and reviews, then hire the best.</p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-3 h-auto rounded-full">
              Post your job
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-gray-900">Popular services</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
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
              View all services <ArrowRight className="ml-1 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials/CTA Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="bg-blue-600 text-white rounded-2xl p-10 md:p-16 shadow-xl relative overflow-hidden">
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-500 rounded-full opacity-30"></div>
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500 rounded-full opacity-30"></div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10">Ready to get started?</h2>
            <p className="text-xl text-blue-100 mb-10 relative z-10 max-w-xl mx-auto">
              Contact us today for a free consultation and estimate. Let's bring your vision to life with our expert craftsmanship.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Button 
                className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-3 h-auto rounded-full font-semibold"
              >
                Post a job for free
              </Button>
              <Button 
                className="bg-blue-700 text-white hover:bg-blue-800 text-lg px-8 py-3 h-auto rounded-full font-semibold"
              >
                Become a Service Provider
              </Button>
            </div>
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
