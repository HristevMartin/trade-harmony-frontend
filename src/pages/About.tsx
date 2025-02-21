
import { Building, Info, User, Mail, Phone, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-600 opacity-10 z-0"></div>
        <div className="container mx-auto px-4 pt-32 pb-20 relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-bold text-center mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
          >
            About TradesPro
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-600 text-center max-w-3xl mx-auto"
          >
            Connecting skilled professionals with clients who need their expertise since 2024
          </motion.p>
        </div>
      </div>

      {/* Story and Mission Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl p-8 transform hover:scale-105 transition-transform duration-300"
          >
            <div className="mb-6">
              <span className="inline-block p-3 bg-indigo-100 rounded-2xl">
                <Building className="w-8 h-8 text-indigo-600" />
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Our Story</h2>
            <p className="text-gray-600 leading-relaxed">
              Founded in 2024, TradesPro emerged from a vision to revolutionize how people connect with skilled trades professionals. 
              We believe in making home improvements and repairs accessible to everyone while ensuring the highest quality of service.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl p-8 transform hover:scale-105 transition-transform duration-300"
          >
            <div className="mb-6">
              <span className="inline-block p-3 bg-purple-100 rounded-2xl">
                <Info className="w-8 h-8 text-purple-600" />
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              We're committed to revolutionizing the trades industry by providing a seamless platform that connects skilled professionals 
              with clients. Our mission is to ensure quality, reliability, and satisfaction in every service provided.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Team Section */}
      <div className="container mx-auto px-4 py-16">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-12 text-gray-800"
        >
          Meet Our Team
        </motion.h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { name: "John Doe", role: "Founder & CEO", image: "photo-1581092795360-fd1ca04f0952" },
            { name: "Jane Smith", role: "Operations Director", image: "photo-1485827404703-89b55fcc595e" },
            { name: "Mike Johnson", role: "Technical Lead", image: "photo-1581092795360-fd1ca04f0952" }
          ].map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-xl p-6 text-center transform hover:scale-105 transition-transform duration-300"
            >
              <div className="relative mb-6 inline-block">
                <div className="absolute inset-0 bg-indigo-600 rounded-full opacity-10"></div>
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto object-cover relative z-10"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{member.name}</h3>
              <p className="text-indigo-600 font-medium">{member.role}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16 mt-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold mb-8">Get in Touch</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="flex flex-col items-center">
                <Mail className="w-8 h-8 mb-4" />
                <p>contact@tradespro.com</p>
              </div>
              <div className="flex flex-col items-center">
                <Phone className="w-8 h-8 mb-4" />
                <p>(555) 123-4567</p>
              </div>
              <div className="flex flex-col items-center">
                <MapPin className="w-8 h-8 mb-4" />
                <p>123 Business Ave, Suite 100</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">TradesPro</h3>
              <p className="text-gray-400">Connecting skilled professionals with quality clients.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <p className="text-gray-400">Email: contact@tradespro.com</p>
              <p className="text-gray-400">Phone: (555) 123-4567</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TradesPro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;
