
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

const queryClient = new QueryClient();

const ConditionalFooter = () => {
  const location = useLocation();
  const isChatPage = location.pathname.startsWith('/chat');
  
  return !isChatPage ? <Footer /> : null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>

    <TooltipProvider>
      <Toaster />
      <Sonner />
      <StripeProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/service-providers" element={<ServiceProviders />} />
            <Route path="/service-provider/:id" element={<ServiceProviderDetail />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
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
          </Routes>
          <ConditionalFooter />
        </BrowserRouter>
      </StripeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
