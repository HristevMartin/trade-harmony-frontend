
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { AspectRatio } from "@/components/ui/aspect-ratio";

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

  // Default image specific to the service type if none is provided
  let defaultImage = "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?q=80&w=2070&auto=format&fit=crop";
  
  if (title.toLowerCase().includes("paint")) {
    defaultImage = "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=2070&auto=format&fit=crop";
  } else if (title.toLowerCase().includes("electric")) {
    defaultImage = "https://images.unsplash.com/photo-1565608438257-fac3c27aa6e6?q=80&w=2070&auto=format&fit=crop";
  } else if (title.toLowerCase().includes("mechanic")) {
    defaultImage = "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?q=80&w=2070&auto=format&fit=crop";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      onClick={handleClick}
      className="cursor-pointer h-full"
    >
      <Card className="group relative overflow-hidden border-none bg-gradient-to-br from-white to-gray-50 h-full flex flex-col hover:shadow-xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Image Section with AspectRatio for consistent sizing */}
        <div className="relative">
          <AspectRatio ratio={16/9} className="bg-muted">
            <img
              src={image || defaultImage}
              alt={title}
              className="object-cover w-full h-full rounded-t-lg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </AspectRatio>
        </div>
        
        <div className="relative z-10 p-8 flex-grow flex flex-col">
          <div className="mb-6 text-indigo-600 transform group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
          <h3 className="text-2xl font-bold mb-3 text-gray-800">{title}</h3>
          <p className="text-gray-600 leading-relaxed flex-grow">{description}</p>
          
          <div className="mt-4">
            <span className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors group-hover:underline">
              Learn more
              <svg className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ServiceCard;
