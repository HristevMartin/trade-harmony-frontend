import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ArrowRight } from "lucide-react";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  image?: string;
}

const ServiceCard = ({ title, description, icon, image }: ServiceCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/service-providers?service=${encodeURIComponent(title)}`);
  };

  // Construction-themed default images specific to the service type
  let defaultImage = "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?q=80&w=2070&auto=format&fit=crop";
  
  if (title.toLowerCase().includes("paint")) {
    defaultImage = "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=2070&auto=format&fit=crop";
  } else if (title.toLowerCase().includes("electric")) {
    defaultImage = "https://images.unsplash.com/photo-1565608438257-fac3c27aa6e6?q=80&w=2070&auto=format&fit=crop";
  } else if (title.toLowerCase().includes("mechanic")) {
    defaultImage = "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?q=80&w=2070&auto=format&fit=crop";
  } else if (title.toLowerCase().includes("plumb")) {
    defaultImage = "https://images.unsplash.com/photo-1607472586893-edb57bdc0545?q=80&w=2070&auto=format&fit=crop";
  } else if (title.toLowerCase().includes("roof")) {
    defaultImage = "https://images.unsplash.com/photo-1632759145396-888e3fe8ec30?q=80&w=2070&auto=format&fit=crop";
  } else if (title.toLowerCase().includes("carpen")) {
    defaultImage = "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=2070&auto=format&fit=crop";
  } else if (title.toLowerCase().includes("build")) {
    defaultImage = "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070&auto=format&fit=crop";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true }}
      onClick={handleClick}
      className="cursor-pointer h-full group"
      whileHover={{ 
        y: -8,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
    >
      <Card className="overflow-hidden border-0 rounded-2xl shadow-lg h-full flex flex-col bg-white group-hover:shadow-2xl transition-all duration-500 relative">
        {/* Image Section with improved overlay */}
        <div className="relative overflow-hidden">
          <AspectRatio ratio={4/3} className="bg-gradient-to-br from-gray-100 to-gray-200">
            <img
              src={image || defaultImage}
              alt={title}
              className="object-cover w-full h-full transition-all duration-700 group-hover:scale-110"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
            
            {/* Icon Overlay - appears on hover */}
            <motion.div 
              className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
            >
              <div className="text-blue-600">
                {icon}
              </div>
            </motion.div>

            {/* Arrow indicator */}
            <motion.div 
              className="absolute bottom-4 right-4 bg-blue-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
              whileHover={{ scale: 1.1 }}
            >
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </AspectRatio>
        </div>
        
        {/* Content Section with improved design */}
        <div className="p-6 flex-grow flex flex-col bg-gradient-to-br from-white to-gray-50/30 group-hover:bg-gradient-to-br group-hover:from-blue-50/50 group-hover:to-indigo-50/30 transition-all duration-500">
          {/* Title Section */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-900 transition-colors duration-300 mb-2 leading-tight">
              {title}
            </h3>
            <div className="w-12 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full group-hover:w-16 transition-all duration-300"></div>
          </div>
          
          {/* Description */}
          <p className="text-gray-600 group-hover:text-gray-700 text-sm leading-relaxed flex-grow transition-colors duration-300">
            {description}
          </p>
          
          {/* Call to action text */}
          <div className="mt-4 flex items-center text-blue-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <span>Explore Service</span>
            <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>

        {/* Subtle border gradient effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/0 via-blue-600/0 to-indigo-600/0 group-hover:from-blue-600/10 group-hover:via-indigo-600/5 group-hover:to-blue-600/10 transition-all duration-500 pointer-events-none"></div>
      </Card>
    </motion.div>
  );
};

export default ServiceCard;
