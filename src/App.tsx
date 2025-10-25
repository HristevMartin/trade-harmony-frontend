
import "./lib/fetch-interceptor";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ServiceProviders from "./pages/ServiceProviders";
import ServiceProviderDetail from "./pages/ServiceProviderDetail";
import ProjectDetail from "./pages/ProjectDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Navbar from "./components/Navbar";
import PostJob from "./pages/PostJob";
import JobDetail from "./pages/JobDetail";
import Footer from "./components/Footer";
import EditJobs from "./pages/EditJobs";
import TradesPerson from "./pages/TradesPerson";
import TradesPersonOnboarding from "./pages/TradesPersonOnboarding";
import TradesPersonJobs from "./pages/TradesPersonJobs";
import HomeownerGetProjects from "./pages/HomeownerGetProjects";
import Auth from "./pages/Auth";
import TradesPersonProfile from "./pages/TradesPersonProfile";
import StripeProvider from "@/components/ui/StripeElement";
import PaymentResult from "./pages/PaymentResult";
import TestChatModal from "./pages/TestChatModal";
import Chat from "./pages/Chat";
import ResetPassword from "./pages/ResetPassword";
import RateTraders from "./pages/RateTraders";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import PWAUpdateNotification from "./components/PWAUpdateNotification";
import PWAInstallPopup from "./components/PWAInstallPopup";
import usePWAInstallPopup from "./hooks/usePWAInstallPopup";
import CookieConsent from "./components/CookieConsent";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useEffect } from 'react';
import { markRecentLogin } from './lib/fetch-interceptor';

const queryClient = new QueryClient();

const ConditionalFooter = () => {
  const location = useLocation();
  const isChatPage = location.pathname.startsWith('/chat');

  return !isChatPage ? <Footer /> : null;
};

const ConditionalCookieConsent = () => {
  const location = useLocation();
  const isLegalPage = location.pathname === '/privacy' || location.pathname === '/terms';

  // Don't show banner on privacy/terms pages to avoid redundancy
  return !isLegalPage ? <CookieConsent /> : null;
};

const SessionValidator = () => {
  useEffect(() => {
    const validateSession = async () => {
      const authUser = localStorage.getItem('auth_user');
      
      // Only validate if we have user data in localStorage
      if (!authUser) {
        console.log('📝 No auth_user in localStorage, skipping session validation');
        return;
      }

      try {
        console.log('🔍 Validating session with backend...');
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${apiUrl}/travel/auth/session`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store'
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Session validation response:', data);

          if (data.authenticated) {
            // Session is valid, mark recent login to prevent interceptor redirects
            markRecentLogin();
            console.log('✅ Session valid! User authenticated, marked recent login');
          } else {
            // Session invalid, clear localStorage
            console.log('❌ Session invalid, clearing localStorage');
            localStorage.removeItem('auth_user');
            localStorage.removeItem('access_token');
            window.dispatchEvent(new Event('authChange'));
          }
        } else {
          // 401 or other error, session invalid
          console.log('❌ Session validation failed with status:', response.status);
          localStorage.removeItem('auth_user');
          localStorage.removeItem('access_token');
          window.dispatchEvent(new Event('authChange'));
        }
      } catch (error) {
        console.error('⚠️ Error validating session:', error);
        // Don't clear localStorage on network errors, just log
      }
    };

    validateSession();
  }, []);

  return null; // This component doesn't render anything
};

const App = () => {
  const { isPopupOpen, canInstall, hidePopup, triggerInstall } = usePWAInstallPopup();

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {/* <PWAUpdateNotification />
        <PWAInstallPopup
          isOpen={isPopupOpen}
          onClose={hidePopup}
          onInstall={triggerInstall}
          canInstall={canInstall}
        /> */}
          <StripeProvider>
            <BrowserRouter>
              <SessionValidator />
              <Navbar />
              <ConditionalCookieConsent />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/service-providers" element={<ServiceProviders />} />
                <Route path="/service-provider/:id" element={<ServiceProviderDetail />} />
                <Route path="/project/:id" element={<ProjectDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/post-job" element={<PostJob />} />
                <Route path="*" element={<NotFound />} />
                <Route path="/jobs/:id" element={<JobDetail />} />
                <Route path="/edit-job/:id" element={<EditJobs />} />
                <Route path="/tradesperson" element={<TradesPerson />} />
                <Route path="/tradesperson/onboarding" element={<TradesPersonOnboarding />} />
                <Route path="/tradesperson/jobs" element={<TradesPersonJobs />} />
                <Route path="/homeowner/my-projects" element={<HomeownerGetProjects />} />
                <Route path="/tradesperson/profile" element={<TradesPersonProfile />} />
                <Route path="/payment-result" element={<PaymentResult />} />
                <Route path="/test-chat" element={<TestChatModal />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/chat/:conversation_id" element={<Chat />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/rate-traders/:jobId" element={<RateTraders />} />
              </Routes>

              <ConditionalFooter />
            </BrowserRouter>
          </StripeProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
