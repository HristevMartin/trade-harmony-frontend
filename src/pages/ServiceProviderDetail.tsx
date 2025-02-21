import { useParams, Link } from "react-router-dom";
import { Star, Calendar, Clock, Wrench, Award, Phone, Mail } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  date: string;
}

interface ServiceProvider {
  id: number;
  name: string;
  service: string;
  description: string;
  rating: number;
  image: string;
  reviews: number;
  expertise: string[];
  yearsOfExperience: number;
  portfolio: Project[];
  email: string;
  phone: string;
  availability: string;
}

const mockServiceProvider: ServiceProvider = {
  id: 1,
  name: "John Smith",
  service: "Professional Painting",
  description: "Specializing in interior and exterior painting with 15 years of experience. Known for precision and attention to detail.",
  rating: 4.8,
  image: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?q=80&w=2070&auto=format&fit=crop",
  reviews: 127,
  expertise: ["Interior Painting", "Exterior Painting", "Wall Repairs", "Color Consultation", "Wallpaper Installation"],
  yearsOfExperience: 15,
  portfolio: [
    {
      id: 1,
      title: "Modern Living Room Transformation",
      description: "Complete interior painting with custom color matching and accent wall design.",
      image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=2070&auto=format&fit=crop",
      date: "January 2024"
    },
    {
      id: 2,
      title: "Historic Home Restoration",
      description: "Exterior painting project preserving the original character of a 1920s home.",
      image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=2070&auto=format&fit=crop",
      date: "December 2023"
    },
    {
      id: 3,
      title: "Commercial Office Makeover",
      description: "Complete renovation of a 3000 sq ft office space with modern color schemes.",
      image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=2069&auto=format&fit=crop",
      date: "November 2023"
    }
  ],
  email: "john.smith@example.com",
  phone: "(555) 123-4567",
  availability: "Monday to Friday, 8 AM - 6 PM"
};

const ServiceProviderDetail = () => {
  const { id } = useParams();
  const provider = mockServiceProvider;

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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-20">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <img
                src={provider.image}
                alt={provider.name}
                className="w-full h-64 object-cover rounded-lg shadow-md"
              />
            </div>
            <div className="md:col-span-2">
              <h1 className="text-3xl font-bold mb-2">{provider.name}</h1>
              <p className="text-indigo-600 font-semibold mb-2">{provider.service}</p>
              <div className="mb-4">
                <RatingStars rating={provider.rating} />
                <span className="text-sm text-gray-600">({provider.reviews} reviews)</span>
              </div>
              <p className="text-gray-600 mb-4">{provider.description}</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Wrench className="text-indigo-600" />
                  <span>{provider.yearsOfExperience} Years Experience</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="text-indigo-600" />
                  <span>Available Now</span>
                </div>
              </div>
              <div className="flex gap-4">
                <Button className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Contact Now
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Send Message
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Wrench className="text-indigo-600" />
              Areas of Expertise
            </h2>
            <div className="flex flex-wrap gap-2">
              {provider.expertise.map((skill, index) => (
                <span
                  key={index}
                  className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Clock className="text-indigo-600" />
              Availability
            </h2>
            <p className="text-gray-600">{provider.availability}</p>
          </Card>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Award className="text-indigo-600" />
            Recent Projects
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {provider.portfolio.map((project) => (
              <Link key={project.id} to={`/project/${project.id}`}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">{project.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{project.description}</p>
                    <p className="text-sm text-indigo-600">{project.date}</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
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

export default ServiceProviderDetail;
