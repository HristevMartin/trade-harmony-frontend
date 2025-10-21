import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";

interface CookieConsentProps {
  onOpenSettings?: () => void;
}

/**
 * CookieConsent Banner
 * 
 * Site-wide cookie consent notice for JobHub.
 * Displays on first visit, stores consent in localStorage.
 * 
 * Future enhancement: Add "Reject / Manage preferences" when
 * non-essential cookies (analytics, advertising) are introduced.
 */
const CookieConsent = ({ onOpenSettings }: CookieConsentProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const CONSENT_KEY = "cookie_consent";

  useEffect(() => {
    // Check if user has already given consent
    const consentStatus = localStorage.getItem(CONSENT_KEY);
    
    if (!consentStatus) {
      // Small delay to avoid jarring appearance on page load
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    // Trigger slide-down animation
    setIsDismissing(true);
    
    // Wait for animation to complete before hiding
    setTimeout(() => {
      localStorage.setItem(CONSENT_KEY, "accepted");
      setIsVisible(false);
      setIsDismissing(false);
    }, 300);
  };

  const handleDismiss = () => {
    // Trigger slide-down animation
    setIsDismissing(true);
    
    // Wait for animation to complete before hiding
    setTimeout(() => {
      localStorage.setItem(CONSENT_KEY, "dismissed");
      setIsVisible(false);
      setIsDismissing(false);
    }, 300);
  };

  // Expose method to re-open banner (for Cookie Settings link)
  useEffect(() => {
    const handleReopenConsent = () => {
      setIsDismissing(false); // Reset animation state
      setIsVisible(true);
    };

    window.addEventListener("reopenCookieConsent", handleReopenConsent);
    return () => window.removeEventListener("reopenCookieConsent", handleReopenConsent);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent notice"
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out transform ${
        isDismissing ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'
      }`}
    >
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-t border-slate-700/50 shadow-[0_-2px_8px_rgba(0,0,0,0.2)] backdrop-blur-sm">
        <div className="mx-auto max-w-screen-sm sm:max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-5 relative">
          {/* Close button - Top right on mobile, inline on desktop */}
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 sm:relative sm:hidden p-2 text-slate-400 hover:text-white transition-colors rounded-md hover:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-slate-600 z-10"
            aria-label="Dismiss cookie notice"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left">
            {/* Icon (desktop only) */}
            <div className="hidden sm:flex items-center justify-center shrink-0 w-12 h-12 bg-yellow-400/10 rounded-full">
              <Cookie className="h-6 w-6 text-yellow-400" />
            </div>

            {/* Message */}
            <div className="flex-1 text-sm sm:text-base text-slate-200 leading-relaxed break-words whitespace-normal pr-8 sm:pr-0">
              <span className="font-semibold text-white">🍪 Cookie Notice:</span>{" "}
              JobHub uses essential cookies to operate securely. We do not use analytics or advertising cookies yet.{" "}
              <Link
                to="/privacy#cookies"
                className="text-yellow-400 hover:text-yellow-300 underline underline-offset-2 font-medium transition-colors break-words"
              >
                Learn more in our Privacy Policy
              </Link>
              .
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto shrink-0">
              <button
                onClick={handleAccept}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 sm:py-3 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-yellow-400/30 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                aria-label="Accept cookies and close banner"
              >
                Got it
              </button>
              
              {/* Close button (desktop only) */}
              <button
                onClick={handleDismiss}
                className="hidden sm:block p-2.5 sm:p-3 text-slate-400 hover:text-white transition-colors rounded-md hover:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-slate-600"
                aria-label="Dismiss cookie notice"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Future: Add additional buttons here for Reject / Manage Preferences */}
          {/* Example structure:
          <div className="mt-3 flex flex-col sm:flex-row gap-2 justify-center sm:justify-start">
            <button className="text-sm text-slate-400 hover:text-white transition-colors">
              Reject non-essential
            </button>
            <button className="text-sm text-slate-400 hover:text-white transition-colors">
              Manage preferences
            </button>
          </div>
          */}
        </div>
      </div>
    </div>
  );
};

// Helper function to reopen consent banner (called from Footer)
export const reopenCookieConsent = () => {
  localStorage.removeItem("cookie_consent");
  window.dispatchEvent(new Event("reopenCookieConsent"));
};

export default CookieConsent;
