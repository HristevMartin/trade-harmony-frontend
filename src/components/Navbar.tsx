import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Building, Wrench, Zap } from "lucide-react";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const [availableServices, setAvailableServices] = useState<any>([]);

  // Define the same services mapping as in Index page
  const services = [
    {
      title: "Building & Construction",
      description: "Complete building services for residential and commercial projects",
      icon: <Building className="h-4 w-4" />,
      dbField: "building"
    },
    {
      title: "Electrical Services",
      description: "Licensed electrical installation & repairs",
      icon: <Zap className="h-4 w-4" />,
      dbField: "electrical"
    },
    {
      title: "Mechanical Repairs",
      description: "Expert diagnosis & repair solutions",
      icon: <Wrench className="h-4 w-4" />,
      dbField: "mechanic"
    },
  ];

  const mapDatabaseToFrontend = (dbServices: any[]) => {
    // Filter and map only services that exist in the database
    return services
      .map(frontendService => {
        // Find matching database service by dbField
        const dbService = dbServices.find(db =>
          db.trade === frontendService.dbField ||
          db.type === frontendService.dbField ||
          db.service_type === frontendService.dbField ||
          db.name?.toLowerCase() === frontendService.dbField
        );

        if (dbService) {
          // Merge database data with frontend configuration
          return {
            ...frontendService,
            // Override with database values if they exist
            title: dbService.title || dbService.name || frontendService.title,
            description: dbService.description || frontendService.description,
            icon: frontendService.icon,
            // Add any additional database fields
            ...dbService
          };
        }

        // Return null if no database match found
        return null;
      })
      .filter(service => service !== null); // Remove null entries (services not in database)
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        let url = `${import.meta.env.VITE_TRAVEL_SECURITY}/travel/get-project-services`;
        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          console.log('Navbar: show me the database data', data);

          // Map database data to frontend services using our mapping
          const mappedServices = mapDatabaseToFrontend(data);
          console.log('Navbar: mapped services', mappedServices);

          setAvailableServices(mappedServices);
        } else {
          console.error('Failed to fetch services');
          // Fallback to empty array if API fails
          setAvailableServices([]);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        // Fallback to empty array if API fails
        setAvailableServices([]);
      }
    };
    fetchServices();
  }, []);

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold text-trust-blue"
          >
            TradeFinder
          </motion.div>

          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-foreground hover:text-trust-blue transition-colors font-medium">Home</a>
            <a href="#" className="text-foreground hover:text-trust-blue transition-colors font-medium">Services</a>
            <a href="#" className="text-foreground hover:text-trust-blue transition-colors font-medium">How it Works</a>
            <a href="#" className="text-foreground hover:text-trust-blue transition-colors font-medium">Contact</a>
          </nav>

          <Button
            variant="outline"
            className="border-trust-blue text-trust-blue hover:bg-trust-blue hover:text-trust-blue-foreground transition-all duration-300 hover:scale-105 text-sm md:text-base px-3 md:px-4"
          >
            <span className="hidden sm:inline">Join as a Tradesperson</span>
            <span className="sm:hidden">Join Now</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
