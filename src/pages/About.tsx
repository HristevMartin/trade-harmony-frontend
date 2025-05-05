
import { Building, HardHat, Drill, Wrench, ArrowRight, FactoryIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const About = () => {
  const teamMembers = [
    { name: "John Doe", role: "Founder & CEO", image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=2070&auto=format&fit=crop" },
    { name: "Jane Smith", role: "Operations Director", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1998&auto=format&fit=crop" },
    { name: "Mike Johnson", role: "Technical Lead", image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1974&auto=format&fit=crop" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section - Construction themed */}
      <div className="bg-amber-600 text-white py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{backgroundImage: "url('https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a?q=80&w=2070&auto=format&fit=crop')"}}></div>
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-amber-500 rounded-full opacity-30"></div>
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-amber-500 rounded-full opacity-30"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-6"
          >
            About TradesPro Construction
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-amber-100 text-center max-w-3xl mx-auto"
          >
            Building connections between construction professionals and clients since 2024
          </motion.p>
        </div>
      </div>

      {/* Value Proposition Section */}
      <div className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">Our Mission</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're committed to revolutionizing the construction industry by providing a seamless platform that connects skilled professionals 
              with clients. Our mission is to ensure quality, reliability, and excellence in every construction project.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <motion.div 
              className="bg-white rounded-xl p-8 shadow-sm border flex flex-col items-center text-center transition-transform hover:scale-105"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-6">
                <Building className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Quality Construction</h3>
              <p className="text-gray-600">We connect you with top-rated construction professionals who deliver excellence on every project.</p>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-xl p-8 shadow-sm border flex flex-col items-center text-center transition-transform hover:scale-105"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-6">
                <HardHat className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Safety Guaranteed</h3>
              <p className="text-gray-600">All our contractors are vetted to ensure they meet the highest safety standards in the industry.</p>
            </motion.div>
            
            <motion.div 
              className="bg-white rounded-xl p-8 shadow-sm border flex flex-col items-center text-center transition-transform hover:scale-105"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-6">
                <FactoryIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">Expert Craftsmanship</h3>
              <p className="text-gray-600">Our network includes only the most skilled tradespeople and construction professionals in the business.</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
            <motion.div 
              className="md:w-1/2"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <img 
                src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2070&auto=format&fit=crop" 
                alt="Construction workers on site" 
                className="rounded-xl shadow-lg"
              />
            </motion.div>
            <motion.div 
              className="md:w-1/2"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">Our Story</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Founded in 2024, TradesPro emerged from a vision to revolutionize how people connect with skilled construction professionals. 
                We identified a gap in the market for a platform that makes finding quality contractors simple and reliable.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                What started as a small idea has grown into a comprehensive construction service platform that helps thousands of customers 
                and professionals connect every day, creating meaningful opportunities for both builders and those who need construction expertise.
              </p>
              <Link to="/contact">
                <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                  Contact Our Team <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900"
          >
            Meet Our Construction Experts
          </motion.h2>
          
          <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-sm border p-6 text-center transition-transform hover:shadow-md"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-6 object-cover border-4 border-amber-100"
                />
                <h3 className="text-xl font-bold text-gray-800 mb-2">{member.name}</h3>
                <p className="text-amber-600 font-medium mb-4">{member.role}</p>
                <p className="text-gray-600 text-sm">
                  Expert in the construction industry with a passion for connecting skilled professionals with quality projects.
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-amber-600 text-white rounded-2xl p-10 md:p-16 shadow-xl relative overflow-hidden">
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-amber-500 rounded-full opacity-30"></div>
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-amber-500 rounded-full opacity-30"></div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10 text-center">Join Our Construction Network</h2>
            <p className="text-xl text-amber-100 mb-10 relative z-10 max-w-xl mx-auto text-center">
              Whether you're looking for quality construction services or offering your building expertise, we're here to help you connect.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Button 
                className="bg-white text-amber-600 hover:bg-amber-50 text-lg px-8 py-3 h-auto rounded-full font-semibold"
              >
                Post a construction job
              </Button>
              <Button 
                className="bg-amber-700 text-white hover:bg-amber-800 text-lg px-8 py-3 h-auto rounded-full font-semibold"
              >
                Join as a Contractor
              </Button>
            </div>
          </div>
        </div>
      </div>

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
                <li><Link to="/service-providers?service=Building%20%26%20Construction" className="text-gray-400 hover:text-white transition-colors">Building & Construction</Link></li>
                <li><Link to="/service-providers?service=Electrical%20Services" className="text-gray-400 hover:text-white transition-colors">Electrical Services</Link></li>
                <li><Link to="/service-providers?service=Mechanical%20%26%20Equipment" className="text-gray-400 hover:text-white transition-colors">Mechanical & Equipment</Link></li>
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

export default About;
