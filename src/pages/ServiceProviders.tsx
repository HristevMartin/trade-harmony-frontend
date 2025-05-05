
import { useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useSearchParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Navbar from "@/components/Navbar";

interface ServiceProvider {
  id: number;
  name: string;
  service: string;
  description: string;
  rating: number;
  image: string;
  reviews: number;
}

const serviceProviders: Record<string, ServiceProvider[]> = {
  "Professional Painting": [
    {
      id: 1,
      name: "John Smith",
      service: "Professional Painting",
      description: "Specializing in interior and exterior painting with 15 years of experience. Known for precision and attention to detail.",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1604357209793-fca5dca89f97?q=80&w=2044&auto=format&fit=crop", // Professional painter working on interior
      reviews: 127,
    },
    {
      id: 2,
      name: "Sarah Johnson",
      service: "Professional Painting",
      description: "Expert in decorative painting and custom finishes. Over 10 years of experience in residential and commercial projects.",
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=2070&auto=format&fit=crop", // Painter with equipment
      reviews: 89,
    },
  ],
  "Electrical Services": [
    {
      id: 3,
      name: "Mike Wilson",
      service: "Electrical Services",
      description: "Licensed electrician specializing in residential and commercial installations. Expert in smart home systems.",
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1565608438257-fac3c27aa6e6?q=80&w=2070&auto=format&fit=crop", // Electrician working on panel
      reviews: 156,
    },
    {
      id: 4,
      name: "David Chen",
      service: "Electrical Services",
      description: "Certified electrician with expertise in troubleshooting and repairs. Available 24/7 for emergency services.",
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=2069&auto=format&fit=crop", // Electrician with tools
      reviews: 203,
    },
  ],
  "Mechanical Repairs": [
    {
      id: 5,
      name: "Robert Martinez",
      service: "Mechanical Repairs",
      description: "Specialized in vehicle diagnostics and repairs. ASE certified with 20 years of experience.",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?q=80&w=2070&auto=format&fit=crop", // Mechanic working on car
      reviews: 178,
    },
    {
      id: 6,
      name: "Tom Anderson",
      service: "Mechanical Repairs",
      description: "Expert in European car repairs and maintenance. Factory-trained technician with comprehensive diagnostic tools.",
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1630515507471-620235fc09db?q=80&w=2073&auto=format&fit=crop", // Mechanic with diagnostic equipment
      reviews: 145,
    },
  ],
};

const ServiceProviders = () => {
  const [searchParams] = useSearchParams();
  const serviceType = searchParams.get("service") || "Professional Painting";
  const providers = serviceProviders[serviceType] || [];

  const RatingStars = ({ rating }: { rating: number }) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`w-4 h-4 ${
              index < Math.floor(rating)
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-2">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center mb-4"
        >
          {serviceType}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-600 text-center mb-12 max-w-2xl mx-auto"
        >
          Find trusted professionals in your area
        </motion.p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {providers.map((provider, index) => (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="h-full"
            >
              <Link to={`/service-provider/${provider.id}`} className="h-full block">
                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                  <AspectRatio ratio={16/9} className="bg-muted">
                    <img
                      src={provider.image}
                      alt={provider.name}
                      className="object-cover w-full h-full"
                    />
                  </AspectRatio>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-semibold mb-2">{provider.name}</h3>
                    <RatingStars rating={provider.rating} />
                    <p className="text-sm text-gray-500 mt-1">
                      {provider.reviews} reviews
                    </p>
                    <p className="text-gray-600 mt-4 flex-grow">{provider.description}</p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      View Profile
                    </motion.button>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
      
      <footer className="bg-gray-800 text-white py-8 mt-16">
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

export default ServiceProviders;
