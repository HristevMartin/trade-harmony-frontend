
import { useParams, Link } from "react-router-dom";
import { Star, Calendar, Clock, Wrench, Award, Phone, Mail, Video, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import qnevImage from './qnev.png'; 

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

const mockServiceProviders: Record<number, ServiceProvider> = {
  1: {
    id: 1,
    name: "John Smith",
    service: "Professional Painting",
    description: "Specializing in interior and exterior painting with 15 years of experience. Known for precision and attention to detail.",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1604357209793-fca5dca89f97?q=80&w=2044&auto=format&fit=crop",
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
  },
  7: {
    id: 7,
    name: "Nasko Yanev",
    service: "Building & Construction",
    description: "Expert in interior renovations, specializing in wall texturing, flooring installation, and ceiling work. 12+ years of experience in residential projects.",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop",
    reviews: 143,
    expertise: ["Interior Renovations", "Wall Texturing", "Flooring Installation", "Ceiling Work", "Room Remodeling"],
    yearsOfExperience: 12,
    portfolio: [
      {
        id: 7,
        title: "Complete Room Renovation",
        description: "Full interior renovation featuring custom wall texturing, premium wooden flooring, and modern ceiling design.",
        image: "/lovable-uploads/c35fa72c-a45a-4c7b-9587-f0a045db9c09.png",
        date: "March 2024"
      }
    ],
    email: "nasko.yanev@example.com",
    phone: "(555) 987-6543",
    availability: "Monday to Saturday, 7 AM - 7 PM"
  }
};

const ServiceProviderDetail = () => {
  const { id } = useParams();
  const providerId = id ? parseInt(id) : 1;
  console.log('show me the providerId', providerId)
  const provider = mockServiceProviders[7] || mockServiceProviders[1];

  const handleBookMeeting = () => {
    const now = new Date();
    const tomorrow = new Date(now.setDate(now.getDate() + 1));
    const formattedDate = tomorrow.toISOString().split('T')[0];

    const eventDuration = '1';
    const eventDetails = {
      text: `Meeting with ${provider.name}`,
      dates: `${formattedDate}/${formattedDate}`,
      details: `Meeting to discuss potential work with ${provider.name}\n\nService: ${provider.service}\n\nContact Details:\nPhone: ${provider.phone}\nEmail: ${provider.email}`,
    };

    const subject = `Meeting Request with ${provider.name}`;
    const body = `Hi ${provider.name},

I would like to schedule a meeting with you to discuss potential work.

Proposed Date: ${formattedDate}
Duration: ${eventDuration} hour

Service Interest: ${provider.service}

Best regards`;

    const mailtoLink = `mailto:${provider.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  const handleCallClick = () => {
    toast.success("Contact Number", {
      description: provider.phone,
      duration: 5000,
      action: {
        label: "Call",
        onClick: () => window.location.href = `tel:${provider.phone}`
      },
    });
  };

  const handleMessageClick = () => {
    toast.success("Email Address", {
      description: provider.email,
      duration: 5000,
      action: {
        label: "Send Email",
        onClick: () => window.location.href = `mailto:${provider.email}`
      },
    });
  };

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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8 md:py-12 lg:py-20">
        <Link
          to="/service-providers"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 md:mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Service Providers
        </Link>

        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 lg:p-8 mb-6 md:mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            <div className="md:col-span-1">
              <img
                src={qnevImage}
                alt={provider.name}
                className="w-full h-48 sm:h-56 md:h-64 object-cover rounded-lg shadow-md"
              />
            </div>
            <div className="md:col-span-2">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{provider.name}</h1>
              <p className="text-blue-600 font-semibold mb-2">{provider.service}</p>
              <div className="mb-3 md:mb-4">
                <RatingStars rating={provider.rating} />
                <span className="text-sm text-gray-600">({provider.reviews} reviews)</span>
              </div>
              <p className="text-gray-600 mb-4">{provider.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Wrench className="text-blue-600 flex-shrink-0" />
                  <span className="text-sm md:text-base">{provider.yearsOfExperience} Years Experience</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="text-blue-600 flex-shrink-0" />
                  <span className="text-sm md:text-base">Available Now</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 sm:gap-4">
                <Button size="sm" className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm" onClick={handleBookMeeting}>
                  <Video className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Book Meeting</span>
                </Button>
                <Button
                  size="sm"
                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
                  onClick={handleCallClick}
                >
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Contact Now</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1 text-blue-600 border-blue-600 hover:bg-blue-50 text-xs sm:text-sm"
                  onClick={handleMessageClick}
                >
                  <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Send Message</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8 mb-6 md:mb-8">
          <Card className="p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 flex items-center gap-2">
              <Wrench className="text-blue-600 w-4 h-4 md:w-5 md:h-5" />
              Areas of Expertise
            </h2>
            <div className="flex flex-wrap gap-2">
              {provider.expertise.map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-xs sm:text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </Card>
          <Card className="p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 flex items-center gap-2">
              <Clock className="text-blue-600 w-4 h-4 md:w-5 md:h-5" />
              Availability
            </h2>
            <p className="text-gray-600 text-sm md:text-base">{provider.availability}</p>
          </Card>
        </div>

        <div className="mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-2">
            <Award className="text-blue-600 w-5 h-5 md:w-6 md:h-6" />
            Recent Projects
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {provider.portfolio.map((project) => (
              <Link key={project.id} to={`/project/${project.id}`}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden h-full"
                >
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2 text-base md:text-lg">{project.title}</h3>
                    <p className="text-gray-600 text-xs md:text-sm mb-2">{project.description}</p>
                    <p className="text-xs md:text-sm text-blue-600">{project.date}</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <footer className="bg-gray-800 text-white py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div>
              <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">TradesPro</h3>
              <p className="text-gray-400 text-sm">Connecting skilled professionals with quality clients.</p>
            </div>
            <div>
              <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Quick Links</h3>
              <ul className="space-y-1 md:space-y-2 text-gray-400 text-sm">
                <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Contact</h3>
              <p className="text-gray-400 text-sm">Email: contact@tradespro.com</p>
              <p className="text-gray-400 text-sm">Phone: (555) 123-4567</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 TradesPro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ServiceProviderDetail;
