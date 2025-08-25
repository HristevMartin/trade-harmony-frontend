import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Building, Wrench, Zap, Menu, X, User, FolderOpen, LogIn, LogOut } from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path: string) => location.pathname === path;
  const [availableServices, setAvailableServices] = useState<any>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

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

  // Check user authentication and role
  useEffect(() => {
    const checkAuthState = () => {
      const authUser = localStorage.getItem('auth_user');
      if (authUser) {
        try {
          const userData = JSON.parse(authUser);
          setUser(userData);
        } catch (error) {
          console.error('Error parsing user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };


    // Check auth state on mount
    checkAuthState();

    // Listen for storage changes (when localStorage is updated from other tabs/components)
    window.addEventListener('storage', checkAuthState);

    // Custom event listener for same-tab auth changes
    window.addEventListener('authChange', checkAuthState);

    return () => {
      window.removeEventListener('storage', checkAuthState);
      window.removeEventListener('authChange', checkAuthState);
    };
  }, []);


  useEffect(() => {
    const refetchUserRole = async () => {
      const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
      const userId = authUser?.id;
      if (userId) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/travel/get-user-role?userId=${userId}`);
          const data = await response.json();
          console.log('show me the user role', data);
          
          // Update the user data with new role
          if (data.trader) {
            const updatedUser = { ...authUser, role: data.trader };
            localStorage.setItem('auth_user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            console.log('Updated user role to:', data.trader);
          } else if (data.role) {
            // Handle case where API returns role directly
            const updatedUser = { ...authUser, role: data.role };
            localStorage.setItem('auth_user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            console.log('Updated user role to:', data.role);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      } else {
        console.log('No user ID found');
      }
    }
    refetchUserRole();
  }, []);


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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  // check if user?.role is array or string properly
  const isCustomer = Array.isArray(user?.role) ? user?.role.includes('customer') : user?.role === 'customer' || user?.role === 'USER';
  console.log('show me the isCustomer', isCustomer);
  const isLoggedIn = !!user;

  const isTrader = Array.isArray(user?.role) 
    ? user?.role.some(role => ['master', 'trader', 'tradesperson', 'MASTER', 'TRADER', 'TRADESPERSON'].includes(role))
    : ['master', 'trader', 'tradesperson', 'MASTER', 'TRADER', 'TRADESPERSON'].includes(user?.role);
  console.log('show me the isTrader', isTrader);
  console.log('user role:', user?.role);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('auth_user');
    setUser(null);
    
    // Dispatch custom event to notify other components of auth change
    window.dispatchEvent(new Event('authChange'));
    
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            onClick={() => handleNavigation('/')}
            style={{ cursor: 'pointer' }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold text-trust-blue"
          >
            JobHub
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => handleNavigation('/')} 
              className={`text-foreground hover:text-trust-blue transition-colors font-medium ${isActive('/') ? 'text-trust-blue' : ''}`}
            >
              Home
            </button>
            
            {/* My Projects - Only show for customers */}
            {isCustomer && (
              <button 
                onClick={() => handleNavigation('/homeowner/my-projects')} 
                className={`text-foreground hover:text-trust-blue transition-colors font-medium flex items-center gap-2 ${isActive('/homeowner/my-projects') ? 'text-trust-blue' : ''}`}
              >
                My Projects
              </button>
            )}

            {isTrader && (
              <button 
                onClick={() => handleNavigation('/tradesperson/jobs')} 
                className={`text-foreground hover:text-trust-blue transition-colors font-medium flex items-center gap-2 ${isActive('/tradesperson/jobs') ? 'text-trust-blue' : ''}`}
              >
                View Jobs
              </button>
            )}
            
            <a href="#services" className="text-foreground hover:text-trust-blue transition-colors font-medium">Services</a>
            <a href="#how-it-works" className="text-foreground hover:text-trust-blue transition-colors font-medium">How it Works</a>
            <a href="#contact" className="text-foreground hover:text-trust-blue transition-colors font-medium">Contact</a>
          </nav>

          {/* Desktop Auth & CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Login/Logout Button */}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="text-foreground hover:text-trust-blue transition-colors font-medium flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            ) : (
              <button
                onClick={() => handleNavigation('/auth')}
                className="text-foreground hover:text-trust-blue transition-colors font-medium flex items-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                Login
              </button>
            )}
            
            {/* CTA Button */}
            <Button
              onClick={() => handleNavigation('/tradesperson/onboarding')}
              variant="outline"
              className="border-trust-blue text-trust-blue hover:bg-trust-blue hover:text-trust-blue-foreground transition-all duration-300 hover:scale-105"
            >
              Join as a Tradesperson
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <nav className="py-4 space-y-4 border-t border-border/10 mt-4">
                <button 
                  onClick={() => handleNavigation('/')} 
                  className={`block w-full text-left py-2 px-4 rounded-lg transition-colors ${isActive('/') ? 'bg-trust-blue/10 text-trust-blue' : 'text-foreground hover:bg-muted'}`}
                >
                  Home
                </button>
                
                {/* My Projects - Only show for customers */}
                {isCustomer && (
                  <button 
                    onClick={() => handleNavigation('/homeowner/my-projects')} 
                    className={`flex items-center gap-2 w-full text-left py-2 px-4 rounded-lg transition-colors ${isActive('/my-projects') ? 'bg-trust-blue/10 text-trust-blue' : 'text-foreground hover:bg-muted'}`}
                  >
                    My Projects
                  </button>
                )}
                
                <a 
                  href="#services" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 px-4 rounded-lg text-foreground hover:bg-muted transition-colors"
                >
                  Services
                </a>
                
                <a 
                  href="#how-it-works" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 px-4 rounded-lg text-foreground hover:bg-muted transition-colors"
                >
                  How it Works
                </a>
                
                <a 
                  href="#contact" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 px-4 rounded-lg text-foreground hover:bg-muted transition-colors"
                >
                  Contact
                </a>
                
                {/* Mobile Auth & CTA Buttons */}
                <div className="pt-2 border-t border-border/10 space-y-3">
                  {/* Login/Logout Button */}
                  {isLoggedIn ? (
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full text-left py-2 px-4 rounded-lg text-foreground hover:bg-muted transition-colors"
                    >
                      Logout
                    </button>
                  ) : (
                    <button
                      onClick={() => handleNavigation('/auth')}
                      className="flex items-center gap-2 w-full text-left py-2 px-4 rounded-lg text-foreground hover:bg-muted transition-colors"
                    >
                      <LogIn className="h-4 w-4" />
                      Login
                    </button>
                  )}
                  
                  {/* CTA Button */}
                  <Button
                    onClick={() => handleNavigation('/tradesperson/onboarding')}
                    variant="outline"
                    className="w-full border-trust-blue text-trust-blue hover:bg-trust-blue hover:text-trust-blue-foreground transition-all duration-300"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Join as a Tradesperson
                  </Button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Navbar;
