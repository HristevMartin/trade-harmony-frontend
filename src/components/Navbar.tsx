import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Building, Wrench, Zap } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

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
    <nav className="fixed w-full bg-white/90 backdrop-blur-sm z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="text-xl font-semibold tracking-tight hover:text-indigo-600 transition-colors">
              TradesPro
            </Link>
          </div>
          
          <div className="hidden md:flex space-x-8">
            <Link 
              to="/" 
              className={`text-gray-700 hover:text-indigo-600 transition-colors relative group ${isActive("/") ? "text-indigo-600" : ""}`}
            >
              Home
              <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 transform transition-transform ${isActive("/") ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="text-gray-700 hover:text-indigo-600 transition-colors focus:outline-none flex items-center gap-1 group">
                <span className="relative">
                  Services
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 transform transition-transform ${isActive("/service-providers") ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-64 bg-white p-1 rounded-lg shadow-lg border border-gray-100 animate-fade-in" 
                sideOffset={8}
              >
                <div className="p-2 mb-1 text-sm font-medium text-gray-500 border-b border-gray-100">
                  Our Services
                </div>
                {availableServices.map((service: any, index: number) => (
                  <Link key={index} to={`/service-providers?service=${encodeURIComponent(service.title)}`}>
                    <DropdownMenuItem className="flex items-center gap-3 py-3 cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-colors rounded-md">
                      <div className={`p-1.5 rounded-md ${
                        service.title.includes('Building') ? 'bg-indigo-100 text-indigo-600' :
                        service.title.includes('Electrical') ? 'bg-yellow-100 text-yellow-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {service.icon}
                      </div>
                      <div>
                        <p className="font-medium">{service.title}</p>
                        <p className="text-xs text-gray-500">{service.description}</p>
                      </div>
                    </DropdownMenuItem>
                  </Link>
                ))}
                {availableServices.length > 0 && <DropdownMenuSeparator />}
                <Link to="/service-providers">
                  <DropdownMenuItem className="flex justify-center py-2 text-indigo-600 hover:bg-indigo-50 font-medium cursor-pointer rounded-md">
                    View All Services
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
          
            {/* <Link 
              to="/contact" 
              className={`text-gray-700 hover:text-indigo-600 transition-colors relative group ${isActive("/contact") ? "text-indigo-600" : ""}`}
            >
              Contact
              <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 transform transition-transform ${isActive("/contact") ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
            </Link> */}
          </div>

          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Menu className="h-6 w-6 text-gray-700" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white rounded-lg shadow-lg border border-gray-100 animate-fade-in p-1">
                <div className="p-2 mb-1 text-sm font-medium text-gray-500 border-b border-gray-100">
                  Menu
                </div>
                <Link to="/">
                  <DropdownMenuItem className="cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-colors rounded-md py-2">
                    Home
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <div className="px-3 py-1 text-xs font-medium text-gray-500">Services</div>
                {availableServices.map((service: any, index: number) => (
                  <Link key={index} to={`/service-providers?service=${encodeURIComponent(service.title)}`}>
                    <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-colors rounded-md py-2">
                      <div className={
                        service.title.includes('Building') ? 'text-indigo-600' :
                        service.title.includes('Electrical') ? 'text-yellow-600' :
                        'text-blue-600'
                      }>
                        {service.icon}
                      </div>
                      {service.title}
                    </DropdownMenuItem>
                  </Link>
                ))}
                <DropdownMenuSeparator />
                {/* <Link to="/about">
                  <DropdownMenuItem className="cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-colors rounded-md py-2">
                    About
                  </DropdownMenuItem>
                </Link>
                <Link to="/contact">
                  <DropdownMenuItem className="cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-colors rounded-md py-2">
                    Contact
                  </DropdownMenuItem>
                </Link> */}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
