
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, AlertCircle } from "lucide-react";
import { useSearchParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Navbar from "@/components/Navbar";
import qnevImage from './qnev.png';

interface ServiceProvider {
  _id: number;
  name: string;
  service: string;
  description: string;
  rating: number;
  image: string;
  reviews: number;
}

const serviceProviders: Record<string, ServiceProvider[]> = {
  "Building & Construction": [
    {
      id: 7,
      name: "Nasko Yanev",
      service: "Building & Construction",
      description: "Expert in interior renovations, specializing in wall texturing, flooring installation, and ceiling work. 12+ years of experience in residential projects.",
      rating: 4.9,
      image: qnevImage,
      reviews: 143,
    }
  ],
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
  "Electrical Services": [],
  "Mechanical Repairs": [],
};

const mapDatabaseToFrontend = (data: any) => {
  const mapping = {
    "Building & Construction": "building",
    "Electrical Services": "electrical",
    "Mechanical Repairs": "mechanic"
  }
  return mapping[data] || data;
}

const reverseMapDatabaseToFrontend = (data: any) => {
  const mapping = {
    "building": "Building & Construction",
    "electrical": "Electrical Services",
    "mechanic": "Mechanical Repairs"
  }
  return mapping[data] || data;
}


const ServiceProviders = () => {
  const [searchParams] = useSearchParams();
  const serviceType = searchParams.get("service") || "Building & Construction";
  console.log('serviceType', serviceType)
  const providers = serviceProviders[serviceType] || [];
  const [servicesFetched, setServicesFetched] = useState<ServiceProvider[]>([]);
  console.log('show me the serviceType', serviceType)
  const mappedServiceType = mapDatabaseToFrontend(serviceType);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(`http://localhost:8080/travel/get-specific-services/${mappedServiceType}`);
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
      }
    };
    fetchServices();
  }, []);


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
          className="text-4xl font-bold text-center mb-4 mt-5"
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

        {servicesFetched.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {servicesFetched.map((provider, index) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="h-full"
              >
                <Link to={`/service-provider/${provider?.userId}`} className="h-full block">
                  <Card  className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                    <AspectRatio ratio={16 / 9} className="bg-muted">
                      <img
                        src={provider.profileImageUrl}
                        alt={provider.fullName}
                        className="object-cover w-full h-full"
                      />
                    </AspectRatio>
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-xl font-semibold mb-2">{provider.name}</h3>
                      <RatingStars rating={4.9} />
                      <p className="text-sm text-gray-500 mt-1">
                        {provider.reviews} reviews
                      </p>
                      <p className="text-gray-600 mt-4 flex-grow">{provider.bio}</p>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        View Profile
                      </motion.button>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center py-16"
          >
            <div className="flex justify-center mb-6">
              <AlertCircle className="h-16 w-16 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold mb-4">No Available Offers Yet</h2>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              We're currently expanding our network of {serviceType} professionals.
              Please check back soon for available service providers.
            </p>
            <Link to="/">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors"
              >
                Return to Home
              </motion.button>
            </Link>
          </motion.div>
        )}
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
