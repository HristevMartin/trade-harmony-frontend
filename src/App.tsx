
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

// test

const App = () => (
  <QueryClientProvider client={queryClient}>

    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/service-providers" element={<ServiceProviders />} />
          <Route path="/service-provider/:id" element={<ServiceProviderDetail />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/post-job" element={<PostJob />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/edit-job/:id" element={<EditJobs />} />
          <Route path="/tradesperson" element={<TradesPerson />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
