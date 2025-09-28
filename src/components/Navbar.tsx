import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Building, Wrench, Zap, Menu, X, User, FolderOpen, LogIn, LogOut, MessageCircle } from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path: string) => location.pathname === path;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Chat state
  const [hasChats, setHasChats] = useState(false);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [conversationsFromSummary, setConversationsFromSummary] = useState([]);

  // Function to optimistically update unread count (can be called from other components)
  const updateUnreadCount = (delta: number) => {
    setUnreadTotal(prev => Math.max(0, prev + delta));
  };

  // Expose updateUnreadCount globally for other components to use
  useEffect(() => {
    (window as any).updateNavbarUnreadCount = updateUnreadCount;
    return () => {
      delete (window as any).updateNavbarUnreadCount;
    };
  }, []);


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
          const response = await fetch(`${import.meta.env.VITE_API_URL}/travel/get-user-role?userId=${userId}`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          const data = await response.json();
          console.log('show me the user role', data);

          // Handle the case where API returns an array of roles
          if (Array.isArray(data)) {
            // Update user with the array of roles from API
            const updatedUser = { ...authUser, role: data };
            localStorage.setItem('auth_user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            console.log('Updated user role to:', data);
          } else if (data.trader) {
            // Handle legacy format if needed
            const updatedUser = { ...authUser, role: data.trader };
            localStorage.setItem('auth_user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            console.log('Updated user role to:', data.trader);
          } else if (data.role) {
            // Handle case where API returns role directly
            const updatedUser = { ...authUser, role: data.role };
            localStorage.setItem('auth_user', JSON.stringify(updatedUser));
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


  // Chat summary fetching with polling
  useEffect(() => {
    const getChatSummary = async () => {
      if (!user) {
        return;
      }

      // console.log('show me the user in here', user);

      try {
        setLoadingSummary(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/travel/chat-component/chat-summary`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Chat summary data:', data);

          // Update state based on API response
          const hasConversations = data.conversations && data.conversations.length > 0;
          setHasChats(hasConversations);
          setUnreadTotal(data.unread_total || 0);
          setConversationsFromSummary(data.conversations || []);
        } else {
          // If chat summary fails, reset chat state
          console.warn('Failed to fetch chat summary:', response.status);
          setHasChats(false);
          setUnreadTotal(0);
          setConversationsFromSummary([]);
        }
      } catch (error) {
        console.error('Error fetching chat summary:', error);
      } finally {
        setLoadingSummary(false);
      }
    };

    // Initial fetch
    getChatSummary();

    // Set up polling every 30 seconds
    const pollInterval = setInterval(getChatSummary, 30000);

    return () => {
      clearInterval(pollInterval);
    };
  }, [user]);



  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleChatNavigation = () => {
    navigate(`/chat?sideBarOpen=true`);
    setIsMobileMenuOpen(false);
  };

  // check if user?.role is array or string properly
  const isCustomer = Array.isArray(user?.role) ? user?.role.includes('customer') : user?.role === 'customer' || user?.role === 'USER';
  console.log('show me the isCustomer', isCustomer);
  const isLoggedIn = !!user;

  // Show "View Jobs" for users with trader role
  const isTrader = Array.isArray(user?.role)
    ? user?.role.includes('trader') // Show View Jobs if user has trader role
    : user?.role === 'trader'; // Fallback for string role

  // Check if user already has trader role (hide join button)
  const hasTraderRole = Array.isArray(user?.role)
    ? user?.role.includes('trader')
    : user?.role === 'trader';
  console.log('show me the isTrader', isTrader);
  console.log('user role:', user?.role);
  console.log('user role type:', typeof user?.role);
  console.log('isTrader calculation:', {
    isArray: Array.isArray(user?.role),
    roleValue: user?.role,
    includesMaster: Array.isArray(user?.role) ? user?.role.includes('master') : false,
    equalsMaster: user?.role === 'master'
  });

  const handleLogout = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/travel/logout`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) console.warn('Logout API returned', res.status);
    } catch (err) {
      console.error('Error logging out:', err);
    } finally {
      // Clear all authentication data from localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('auth_user');
      
      // Reset component state
      setUser(null);
      setHasChats(false);
      setUnreadTotal(0);
      setConversationsFromSummary([]);
      setLoadingSummary(false);
      
      // Notify other components of auth change
      window.dispatchEvent(new Event('authChange'));
      setIsMobileMenuOpen(false);
      navigate('/');
    }
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
              <>
                <button
                  onClick={() => handleNavigation('/tradesperson/jobs')}
                  className={`text-foreground hover:text-trust-blue transition-colors font-medium flex items-center gap-2 ${isActive('/tradesperson/jobs') ? 'text-trust-blue' : ''}`}
                >
                  View Jobs
                </button>
                <button
                  onClick={() => handleNavigation('/tradesperson/profile')}
                  className={`text-foreground hover:text-trust-blue transition-colors font-medium flex items-center gap-2 ${isActive('/tradesperson/profile') ? 'text-trust-blue' : ''}`}
                >
                  My Profile
                </button>
              </>
            )}

            {/* Chat Button - Show if user is authenticated and has chats */}
            {isLoggedIn && hasChats && !loadingSummary && (
              <button
                onClick={handleChatNavigation}
                className={`relative text-foreground hover:text-trust-blue transition-colors font-medium flex items-center gap-2 ${location.pathname.startsWith('/chat') ? 'text-trust-blue' : ''}`}
                aria-label={unreadTotal > 0 ? `Open chat, ${unreadTotal} unread messages` : 'Open chat'}
              >
                <MessageCircle className="w-5 h-5" />
                Chat
                {unreadTotal > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {unreadTotal > 99 ? '99' : unreadTotal}
                  </span>
                )}
              </button>
            )}

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

            {/* CTA Button - Only show if user doesn't have trader role */}
            {!hasTraderRole && (
              <Button
                onClick={() => handleNavigation('/tradesperson/onboarding')}
                variant="outline"
                className="border-trust-blue text-trust-blue hover:bg-trust-blue hover:text-trust-blue-foreground transition-all duration-300 hover:scale-105"
              >
                Join as a Tradesperson
              </Button>
            )}
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
                    className={`flex items-center gap-2 w-full text-left py-2 px-4 rounded-lg transition-colors ${isActive('/homeowner/my-projects') ? 'bg-trust-blue/10 text-trust-blue' : 'text-foreground hover:bg-muted'}`}
                  >
                    My Projects
                  </button>
                )}

                {/* View Jobs & Profile - Only show for verified traders (master role) */}
                {isTrader && (
                  <>
                    <button
                      onClick={() => handleNavigation('/tradesperson/jobs')}
                      className={`flex items-center gap-2 w-full text-left py-2 px-4 rounded-lg transition-colors ${isActive('/tradesperson/jobs') ? 'bg-trust-blue/10 text-trust-blue' : 'text-foreground hover:bg-muted'}`}
                    >
                      View Jobs
                    </button>
                    <button
                      onClick={() => handleNavigation('/tradesperson/profile')}
                      className={`flex items-center gap-2 w-full text-left py-2 px-4 rounded-lg transition-colors ${isActive('/tradesperson/profile') ? 'bg-trust-blue/10 text-trust-blue' : 'text-foreground hover:bg-muted'}`}
                    >
                      My Profile
                    </button>
                  </>
                )}

                {/* Chat Button - Show if user is authenticated and has chats */}
                {isLoggedIn && hasChats && !loadingSummary && (
                  <button
                    onClick={handleChatNavigation}
                    className={`flex items-center justify-between w-full text-left py-2 px-4 rounded-lg transition-colors ${location.pathname.startsWith('/chat') ? 'bg-trust-blue/10 text-trust-blue' : 'text-foreground hover:bg-muted'}`}
                    aria-label={unreadTotal > 0 ? `Open chat, ${unreadTotal} unread messages` : 'Open chat'}
                  >
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      Chat
                    </div>
                    {unreadTotal > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                        {unreadTotal > 99 ? '99' : unreadTotal}
                      </span>
                    )}
                  </button>
                )}

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

                  {/* CTA Button - Only show if user doesn't have trader role */}
                  {!hasTraderRole && (
                    <Button
                      onClick={() => handleNavigation('/tradesperson/onboarding')}
                      variant="outline"
                      className="w-full border-trust-blue text-trust-blue hover:bg-trust-blue hover:text-trust-blue-foreground transition-all duration-300"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Join as a Tradesperson
                    </Button>
                  )}
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
