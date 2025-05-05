
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
      <Card className="group overflow-hidden border rounded-xl shadow-sm h-full flex flex-col hover:shadow-md transition-all duration-300 bg-white">
        {/* Image Section with AspectRatio for consistent sizing */}
        <div className="relative">
          <AspectRatio ratio={16/9} className="bg-muted">
            <img
              src={image || defaultImage}
              alt={title}
              className="object-cover w-full h-full"
            />
          </AspectRatio>
        </div>
        
        <div className="p-5 flex-grow flex flex-col">
          <div className="flex items-center mb-3">
            <div className="text-blue-600 mr-3">
              {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          </div>
          <p className="text-gray-600 text-sm flex-grow">{description}</p>
        </div>
      </Card>
    </motion.div>
  );
};

export default ServiceCard;
