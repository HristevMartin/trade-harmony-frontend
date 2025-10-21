import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { FOOTER_GROUPS, filterFooterGroups, type AuthUser } from "@/config/navigation";
import { reopenCookieConsent } from "./CookieConsent";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hasChats, setHasChats] = useState(false);

  // Handle smooth scrolling to hash sections and special links
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Special handling for Cookie Settings
    if (href === '#cookie-settings') {
      e.preventDefault();
      reopenCookieConsent();
      return;
    }

    // Check if link contains a hash
    if (href.includes('#')) {
      e.preventDefault();
      const [path, hash] = href.split('#');
      
      // If we're already on the target path, just scroll
      if (location.pathname === path || path === '') {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        // Navigate to the path first, then scroll
        navigate(path || '/');
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    }
  };

  // Load user from localStorage (same logic as Navbar)
  useEffect(() => {
    const checkAuthState = () => {
      const authUser = localStorage.getItem('auth_user');
      if (authUser) {
        try {
          const userData = JSON.parse(authUser);
          setUser(userData);
        } catch (error) {
          console.error('Error parsing user data in Footer:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    checkAuthState();

    // Listen for auth changes from other components
    window.addEventListener('storage', checkAuthState);
    window.addEventListener('authChange', checkAuthState);

    return () => {
      window.removeEventListener('storage', checkAuthState);
      window.removeEventListener('authChange', checkAuthState);
    };
  }, []);

  // Check if user has chats (simplified - matches Navbar's hasChats logic)
  useEffect(() => {
    const checkChats = async () => {
      if (!user) {
        setHasChats(false);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/travel/chat-component/chat-summary`,
          {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          }
        );

        if (response.ok) {
          const data = await response.json();
          const hasConversations = data.conversations && data.conversations.length > 0;
          setHasChats(hasConversations);
        } else {
          setHasChats(false);
        }
      } catch (error) {
        console.error('Error checking chats in Footer:', error);
        setHasChats(false);
      }
    };

    checkChats();
  }, [user]);

  // Filter footer groups based on user auth and role
  const visibleGroups = filterFooterGroups(FOOTER_GROUPS, user, hasChats);

  return (
    <footer 
      role="contentinfo" 
      className="relative bg-[#0B1220] bg-gradient-to-b from-[#0B1220] to-[#0E1A2B] text-slate-300 pb-[max(env(safe-area-inset-bottom),1rem)]"
    >
      <nav aria-label="Footer">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-16">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-16">
            {visibleGroups.map((group) => (
              <div key={group.title} className="space-y-3">
                <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-slate-200">
                  {group.title}
                </h3>
                <ul className="space-y-2">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        to={item.href}
                        onClick={(e) => handleLinkClick(e, item.href)}
                        className="inline-flex items-center text-sm text-slate-300 hover:text-white hover:underline underline-offset-4 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 transition-colors py-1.5 sm:py-0"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          {/* Divider */}
          <div className="mt-10 sm:mt-12 border-t border-slate-800"></div>
          
          {/* Bottom Legal Bar */}
          <div className="py-4 flex flex-col md:flex-row items-center justify-center md:justify-between gap-3 text-xs text-slate-500">
            <p>
              &copy; {new Date().getFullYear()} JobHub. Built in the UK.
            </p>
            <div className="flex gap-6">
              {/* Optional privacy/terms links */}
              {/* {routeExists(ROUTES.privacy) && (
                <Link 
                  to={ROUTES.privacy}
                  className="hover:text-slate-200 hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-sm transition-colors"
                >
                  Privacy Policy
                </Link>
              )}
              {routeExists(ROUTES.terms) && (
                <Link 
                  to={ROUTES.terms}
                  className="hover:text-slate-200 hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-sm transition-colors"
                >
                  Terms of Service
                </Link>
              )} */}
            </div>
          </div>
        </div>
      </nav>
    </footer>
  );
};

export default Footer; 