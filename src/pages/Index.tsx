import { 
  Wrench, 
  Zap, 
  ArrowRight, 
  Building, 
  Star, 
  Shield, 
  Droplets,
  PaintBucket,
  Trees,
  Thermometer,
  Hammer,
  ClipboardList,
  Handshake,
  UserPlus,
  MapPin,
  Quote,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Sparkle,
  Truck,
  Settings,
  CheckCircle2,
  Brain,
  TrendingUp,
  Award,
  Users,
  MessageSquare,
  ChevronDown,
  AlertCircle,
  ArrowUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import usePageTracking from "@/hooks/usePageTracking";
import { AiJobAssistant } from "@/components/ai/AiJobAssistant";
import JobAssistantMiniChat from "@/components/JobAssistantMiniChat";
import type { JobDraft } from "@/lib/ai/placeholders";

const Index = () => {
  const [postcode, setPostcode] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("UK");
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const navigate = useNavigate();
  usePageTracking('home');

  // Check user authentication and role on mount
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

    checkAuthState();
    window.addEventListener('storage', checkAuthState);
    window.addEventListener('authChange', checkAuthState);

    return () => {
      window.removeEventListener('storage', checkAuthState);
      window.removeEventListener('authChange', checkAuthState);
    };
  }, []);

  // Check if user is a trader (any status)
  const isTrader = user && (
    Array.isArray(user.role) 
      ? user.role.includes('trader') || user.role.includes('master')
      : user.role === 'trader' || user.role === 'master'
  );

  // Show Popular Services for anonymous users and homeowners, hide for traders
  const showPopularServices = !isTrader;

  const countries = [
    { name: "United Kingdom", code: "UK", flag: "🇬🇧" },
  ];

  const services = [
    { name: "Plumbing", icon: <Droplets className="h-8 w-8" />, color: "text-trust-blue", slug: "plumbing" },
    { name: "Electrical", icon: <Zap className="h-8 w-8" />, color: "text-yellow-500", slug: "electrical" },
    { name: "Carpentry", icon: <Hammer className="h-8 w-8" />, color: "text-amber-600", slug: "carpentry" },
    { name: "Roofing", icon: <Building className="h-8 w-8" />, color: "text-slate-600", slug: "roofing" },
    { name: "Painting", icon: <PaintBucket className="h-8 w-8" />, color: "text-purple-500", slug: "painting" },
    { name: "Gardening", icon: <Trees className="h-8 w-8" />, color: "text-trust-green", slug: "gardening" },
    { name: "Heating & Cooling", icon: <Thermometer className="h-8 w-8" />, color: "text-red-500", slug: "heating-cooling" },
    { name: "Mechanical Repairs", icon: <Wrench className="h-8 w-8" />, color: "text-gray-600", slug: "mechanical-repairs" },
    { name: "Cleaning", icon: <Sparkle className="h-8 w-8" />, color: "text-blue-500", slug: "cleaning" },
    { name: "Removals", icon: <Truck className="h-8 w-8" />, color: "text-orange-500", slug: "removals" },
    { name: "Handyman", icon: <Settings className="h-8 w-8" />, color: "text-indigo-500", slug: "handyman" },
  ];

  const testimonials = [
    {
      text: "Posted my job and had two verified electricians respond within hours. Proper chat system meant no dodgy phone calls.",
      name: "Sarah L.",
      location: "Hackney, London",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      service: "Verified Homeowner"
    },
    {
      text: "Been getting steady work through JobHub for three months now. The verification badge really helps customers trust me straight away.",
      name: "James M.",
      location: "Croydon, London",
      avatar: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      service: "Verified Tradesperson"
    },
    {
      text: "Much better than those other sites where you don't know who's legit. The verified badges and reviews gave me confidence choosing a plumber.",
      name: "Emma R.",
      location: "Islington, London",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      service: "Verified Homeowner"
    },
    {
      text: "No more paying for leads that go nowhere. JobHub only charges when both sides agree, which is fair for everyone.",
      name: "David P.",
      location: "Wandsworth, London",
      avatar: "https://images.unsplash.com/photo-1504593811423-6dd665756598?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      service: "Verified Tradesperson"
    }
  ];

  const recentActivities = [
    { text: "Now Live", location: "Across the UK", action: "connecting", service: "homeowners & trades", time: "", icon: "🚀" },
    { text: "AI-powered", location: "Smart Matching", action: "finding you", service: "the right professional", time: "", icon: "🧠" },
    { text: "Verification", location: "Available", action: "with", service: "qualification & insurance review", time: "", icon: "✅" },
    { text: "Free to", location: "Post Jobs", action: "with", service: "no obligation", time: "", icon: "🎉" },
    { text: "Secure", location: "In-Platform Chat", action: "for", service: "safe communication", time: "", icon: "💬" },
    { text: "Trusted by", location: "Verified Trades", action: "across", service: "the UK", time: "", icon: "🏠" },
    { text: "Join", location: "Today", action: "and post", service: "your first job", time: "", icon: "⭐" },
    { text: "Available", location: "In Your Area", action: "connecting", service: "local professionals", time: "", icon: "📍" }
  ];

  // Auto-advance testimonial carousel
  useEffect(() => {
    if (!isHovering) {
      const interval = setInterval(() => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isHovering, testimonials.length]);

  // Show/hide scroll to top button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollTop(scrollTop > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePrevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNextTestimonial();
    }
    if (isRightSwipe) {
      handlePrevTestimonial();
    }
  };

  function handlePostJob() {
    console.log('show me selected country', selectedCountry);
    console.log('show me postcode', postcode);
    navigate(`/post-job?country=${selectedCountry}&postcode=${postcode}`);
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Handle service tile click
  const handleServiceClick = (serviceSlug: string) => {
    if (isTrader) {
      // Redirect traders to jobs page
      navigate('/tradesperson/jobs');
      return;
    }
    
    // Navigate to post job with category preselected
    navigate(`/post-job?category=${serviceSlug}`);
  };

  // Handle service tile key press
  const handleServiceKeyPress = (e: React.KeyboardEvent, serviceSlug: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleServiceClick(serviceSlug);
    }
  };

  // Handle AI draft
  const handleUseDraft = (draft: JobDraft) => {
    const draftData = encodeURIComponent(JSON.stringify(draft));
    navigate(`/post-job?draft=${draftData}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
      
      
      <div className="max-w-6xl lg:max-w-7xl mx-auto px-4 sm:px-6">

      {/* Hero Section */}
      <section className="relative min-h-[80vh] lg:min-h-[85vh] overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 before:absolute before:inset-0 before:bg-gradient-to-t before:from-background/40 before:via-transparent before:to-transparent before:z-[1]">
        {/* Background Decorative Images - Positioned Outside Content Area */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Left Side Images */}
          <div className="hidden lg:block">
            {/* Far Left Top */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="absolute top-20 left-8 w-24 h-24 xl:w-28 xl:h-28 rounded-full overflow-hidden opacity-25 border-4 border-trust-blue/20"
            >
               <img 
                 src="https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=300&h=300&fit=crop&crop=center" 
                 alt="Professional using job platform on mobile device"
                 className="w-full h-full object-cover"
                 loading="lazy"
                 width="112"
                 height="112"
                 sizes="112px"
               />
            </motion.div>
            
            {/* Far Left Bottom */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.9 }}
              className="absolute bottom-32 left-12 w-28 h-28 xl:w-32 xl:h-32 rounded-full overflow-hidden opacity-25 border-4 border-accent-orange/20"
            >
               <img 
                 src="https://media.istockphoto.com/id/472105032/photo/auto-mechanic-working-on-a-car-in-his-garage.jpg?s=612x612&w=0&k=20&c=EyooxvXg5ufoSyzocedNdPnKCuhKzbvFQ0__snVIwto=" 
                 alt="Digital platform interface on laptop screen"
                 className="w-full h-full object-cover"
                 loading="lazy"
                 width="128"
                 height="128"
                 sizes="128px"
               />
            </motion.div>
          </div>

          {/* Right Side Images */}
          <div className="hidden lg:block">
            {/* Far Right Top */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.7 }}
              className="absolute top-32 right-8 w-20 h-20 xl:w-24 xl:h-24 rounded-full overflow-hidden opacity-25 border-4 border-trust-green/20"
            >
               <img 
                 src="https://www.southernliving.com/thmb/WFDNaUu60QnIwoz882hzNJpBdrc=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/GettyImages-1433923860-23d578ea089f409c8cc41475118fb2fa.jpg" 
                 alt="Job search platform on mobile and tablet devices"
                 className="w-full h-full object-cover"
                 loading="lazy"
                 width="96"
                 height="96"
                 sizes="96px"
               />
            </motion.div>
            
            {/* Far Right Bottom */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 1.1 }}
              className="absolute bottom-20 right-12 w-24 h-24 xl:w-28 xl:h-28 rounded-full overflow-hidden opacity-25 border-4 border-trust-blue/20"
            >
               <img 
                 src="https://www.goconstruct.org/media/osbb4dmj/plumber-ss2447578937.jpg?width=510&height=332&format=WebP&quality=75&v=1db893e1b5ba490" 
                 alt="Online job application and platform interface"
                 className="w-full h-full object-cover"
                 loading="lazy"
                 width="112"
                 height="112"
                 sizes="112px"
               />
            </motion.div>
          </div>

          {/* Subtle Tool Icons - Far Background */}
          <div className="hidden xl:block">
            <div className="absolute top-1/4 left-1/6 opacity-20">
              <div className="bg-trust-blue/20 p-3 rounded-full shadow-lg border border-trust-blue/30">
                <Wrench className="h-5 w-5 text-trust-blue" />
              </div>
            </div>
            <div className="absolute top-3/4 right-1/6 opacity-20">
              <div className="bg-trust-green/20 p-3 rounded-full shadow-lg border border-trust-green/30">
                <Hammer className="h-5 w-5 text-trust-green" />
              </div>
            </div>
            <div className="absolute bottom-1/4 left-1/5 opacity-20">
              <div className="bg-accent-orange/20 p-3 rounded-full shadow-lg border border-accent-orange/30">
                <Zap className="h-5 w-5 text-accent-orange" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content Container - Centered with Safe Margins */}
        <div className="relative z-10 flex flex-col justify-center min-h-[80vh] lg:min-h-[85vh] py-12 md:py-16">
          <div className="max-w-5xl mx-auto">
            
            {/* Hero Title Section */}
            <div  className="text-center">
            {/* Trust Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-trust-green/15 via-trust-blue/10 to-primary/10 backdrop-blur-sm text-trust-green px-4 py-2 sm:px-5 sm:py-2.5 rounded-full mb-4 sm:mb-6 font-semibold border border-trust-green/30 shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm md:text-base ring-1 ring-white/20"
            >
              <span className="text-lg sm:text-xl">💫</span>
              <span className="bg-gradient-to-r from-trust-green to-trust-blue bg-clip-text text-transparent font-bold">Built for UK homeowners — verified trades, powered by AI</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
                className="font-bold leading-tight text-[clamp(1.8rem,5vw,3.2rem)] text-foreground mb-6 md:mb-8 max-w-4xl mx-auto"
            >
                Smarter Local Hiring —{" "}
              <span className="text-trust-blue">Where Real Verification Meets AI</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
                className="text-slate-600 text-[clamp(1rem,2.8vw,1.25rem)] mb-3 sm:mb-5 max-w-3xl mx-auto leading-relaxed"
            >
                AI helps you post clearly. Verified local pros bring it to life.
            </motion.p>
            </div>

            {/* Search Form Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-3"
            >
              <div className="bg-gradient-to-b from-sky-50/60 to-transparent rounded-2xl p-1">
                <div className="bg-gradient-to-br from-card/95 via-card/90 to-card/85 backdrop-blur-xl shadow-2xl ring-1 ring-primary/10 rounded-2xl p-4 sm:p-5 md:p-6 border border-primary/5">
                <div className="space-y-4 md:space-y-0 md:flex md:gap-3">
                  {/* Country Dropdown */}
                <div className="flex-1">
                    <label htmlFor="country-select" className="sr-only">Select Country</label>
                    <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                      <SelectTrigger 
                        id="country-select"
                        className="w-full h-12 min-h-[48px] text-base rounded-xl border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-colors bg-white"
                      >
                        <SelectValue placeholder="Country" />
                    </SelectTrigger>
                    <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            <div className="flex items-center gap-2">
                              <span>{country.flag}</span>
                              <span>{country.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                  {/* Location Input */}
                  <div className="flex-1">
                    <div className="relative group">
                      <label htmlFor="location-input" className="sr-only">Enter Location</label>
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-trust-blue transition-colors" />
                      <Input
                        id="location-input"
                        type="text"
                        placeholder="Postcode"
                        value={postcode}
                        onChange={(e) => setPostcode(e.target.value)}
                        className="w-full pl-10 h-12 min-h-[48px] text-base rounded-xl border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-colors bg-white"
                      />
                    </div>
                  </div>

                  {/* CTA Button - Hidden on mobile, replaced by sticky */}
                  <div className="hidden md:block flex-1">
                  <Button 
                  size="lg" 
                      className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground h-12 min-h-[48px] w-full font-semibold px-6 py-3 text-base rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl group"
                      onClick={handlePostJob}
                    >
                      <span className="flex items-center justify-center">
                        <span className="hidden lg:inline">Post Job</span>
                        <span className="lg:hidden">Post Job</span>
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                </Button>
              </div>
                </div>
              </div>
            </div>
            </motion.div>

            {/* Mobile CTA Button - Shows under form on mobile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-4 md:hidden space-y-3"
            >
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground w-full h-12 sm:w-auto px-6 py-3 text-base font-semibold rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-lg hover:-translate-y-0.5 group"
                onClick={handlePostJob}
              >
                <span className="flex items-center justify-center">
                  Post a Job with AI
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
              
              {/* Join as Tradesperson Button - Mobile Only */}
              {!isTrader && (
                <Button 
                  size="lg" 
                  onClick={() => navigate('/tradesperson/onboarding')}
                  className="bg-trust-blue hover:bg-trust-blue/90 text-white w-full h-12 sm:w-auto px-6 py-3 text-base font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-lg hover:-translate-y-0.5 group"
                >
                  <span className="flex items-center justify-center">
                    Join as Tradesperson
                    <UserPlus className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  </span>
                </Button>
              )}
            </motion.div>

         

            {/* Trustpilot Social Proof */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-4 sm:mt-5"
            >
              <p 
                role="note" 
                aria-label="Trust indicators"
                className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base opacity-90"
            >
              <span className="text-foreground font-semibold">Now live</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 text-trust-green fill-current" />
                ))}
              </div>
                <span className="text-muted-foreground">Trusted by verified trades across the UK</span>
              </p>
            </motion.div>

            {/* Microcopy */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-center mt-6"
            >
              <p className="text-muted-foreground text-xs sm:text-sm font-medium">
                Free to post. No obligation.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Service Categories Grid */}
      {showPopularServices && (
        <section className="py-4 md:py-14 bg-background">
          <div className="space-y-6 md:space-y-10">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 sm:mb-6">Popular Services</h2>
                <p className="text-muted-foreground text-base sm:text-lg px-4">Find trusted, verified professionals for any home project</p>
              </motion.div>
          </div>
          
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {services.map((service, index) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                  <Card 
                    className="rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-transform duration-300 cursor-pointer group border-2 border-primary/10 hover:border-primary/30 bg-gradient-to-br from-card via-card/95 to-card/80 backdrop-blur-sm"
                    onClick={() => handleServiceClick(service.slug)}
                    onKeyPress={(e) => handleServiceKeyPress(e, service.slug)}
                    role="button"
                    tabIndex={0}
                  >
                    <CardContent className="p-0 text-center relative overflow-hidden">
                      <div className={`${service.color} mb-3 transition-all duration-300 relative z-10 flex justify-center`}>
                        <div className="w-8 h-8" aria-hidden="true">
                          {service.icon}
                        </div>
                      </div>
                      <h3 className="font-semibold text-sm sm:text-base leading-tight text-foreground group-hover:text-trust-blue transition-colors relative z-10">{service.name}</h3>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Sparkles className="h-3 w-3 text-trust-blue" />
                      </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* How It Works Section */}
      <section  className="py-8 md:py-14 bg-gradient-to-br from-secondary/5 via-muted/30 to-secondary/10">
        <div className="space-y-6 md:space-y-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">How JobHub Works</h2>
              <p className="text-muted-foreground text-base sm:text-lg px-4">Smart AI assistance meets human verification — for your perfect match</p>
            </motion.div>
          </div>
          
          <div className="relative">
            {/* Connection lines - desktop only */}
            <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-trust-blue/30 to-transparent" aria-hidden="true" />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4 relative">
              {[
                {
                  icon: <ClipboardList className="h-10 w-10" />,
                  title: "Post Your Job with AI",
                  description: "Describe your project naturally. AI helps you refine your post and fill in missing details automatically.",
                  color: "trust-blue"
                },
                {
                  icon: <Brain className="h-10 w-10" />,
                  title: "AI Finds Perfect Matches",
                  description: "AI helps suggest local trades that best fit your job based on trade type and verified experience.",
                  color: "trust-green"
                },
                {
                  icon: <Users className="h-10 w-10" />,
                  title: "Verified Pros Apply",
                  description: "Verified and insured professionals prioritized",
                  color: "accent-orange"
                },
                {
                  icon: <Handshake className="h-10 w-10" />,
                  title: "Hire & Leave Reviews",
                  description: "Hire confidently and leave verified feedback after the job's done.",
                  color: "trust-blue"
                }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="relative"
                >
                  <div className="rounded-2xl py-6 px-6 bg-gradient-to-br from-card via-card/95 to-card/90 ring-2 ring-primary/10 text-center group shadow-xl hover:shadow-2xl transition-all duration-300 border border-primary/5 h-full min-h-[220px] sm:min-h-0">
                    {/* Step number badge */}
                    <div className={`bg-${step.color} text-white rounded-full w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center mx-auto mb-4 text-base font-bold shadow-lg group-hover:scale-110 transition-all duration-300`}>
                      {index + 1}
                    </div>
                    
                    {/* Icon */}
                    <div className={`bg-${step.color}/10 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-105`}>
                      <div className={`text-${step.color} transition-transform duration-300`} aria-hidden="true">{step.icon}</div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-foreground mb-3">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                  </div>
                  
                  {/* Arrow connector - desktop only */}
                  {index < 3 && (
                    <div className="hidden md:block absolute top-12 -right-4 text-trust-blue/40" aria-hidden="true">
                      <ArrowRight className="h-6 w-6" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile divider */}
      <hr className="my-6 border-gray-200 sm:hidden" />
      
      {/* Verified Network Section */}
      <section className="py-8 md:py-14 bg-background">
        <div className="space-y-6 md:space-y-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-trust-green/10 text-trust-green px-4 py-2 rounded-full mb-6 font-semibold">
                <Shield className="h-5 w-5" />
                <span>Verified Network</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">Smart Matching with Verified Badges</h2>
              <p className="text-muted-foreground text-base sm:text-lg px-4">Tradespeople can get <span className="font-semibold">verified</span> by uploading <span className="font-semibold">qualifications and insurance</span>, which are reviewed before approval. <span className="font-semibold">Verified badges</span> help you identify thoroughly checked professionals.</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2 italic px-4">Verification is optional but recommended — verified professionals are prioritized in AI search results and receive more opportunities.</p>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Left: What we verify */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl p-6 md:p-8 bg-gradient-to-br from-card via-card/95 to-card/90 border-2 border-trust-blue/20 shadow-xl"
            >
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7 text-trust-green" />
                What We Verify
              </h3>
              
              <div className="space-y-4">
                {[
                  { icon: <Award className="h-5 w-5" />, title: "Professional Qualifications", desc: "Trades upload proof of qualifications and certifications, which are verified before approval" },
                  { icon: <Shield className="h-5 w-5" />, title: "Insurance Coverage", desc: "Trades upload proof of insurance, which is verified before approval" },
                  { icon: <CheckCircle2 className="h-5 w-5" />, title: "Account Verification", desc: "Profile completeness and authenticity checked" },
                  { icon: <Star className="h-5 w-5" />, title: "Work History & Reviews", desc: "Real homeowner feedback from completed jobs" }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex gap-4 items-start p-4 rounded-xl bg-background/50 border border-border/50 hover:border-trust-blue/50 transition-all duration-300"
                  >
                    <div className="bg-trust-blue/10 rounded-lg p-2 text-trust-blue flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            {/* Right: Benefits */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl p-6 md:p-8 bg-gradient-to-br from-trust-green/5 to-trust-blue/5 border-2 border-trust-green/20 shadow-xl"
            >
              <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                <Shield className="h-6 w-6 sm:h-7 sm:w-7 text-trust-green" />
                Your Protection
              </h3>
              
              <div className="space-y-6">
                <div className="bg-card/80 rounded-xl p-5 border border-border/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-trust-green/10 rounded-full p-2">
                      <CheckCircle2 className="h-6 w-6 text-trust-green" />
                    </div>
                    <h4 className="font-bold text-foreground text-base sm:text-lg">AI chatbot finds the right professionals for you</h4>
                  </div>
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                    No endless scrolling — just ask our AI and we'll show you the best matches you can invite directly
                  </p>
                </div>
                
                <div className="bg-card/80 rounded-xl p-5 border border-border/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-trust-blue/10 rounded-full p-2">
                      <Award className="h-6 w-6 text-trust-blue" />
                    </div>
                    <h4 className="font-bold text-foreground text-base sm:text-lg">Verified badges help you identify trusted professionals</h4>
                  </div>
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                    Verification is optional — verified professionals upload qualifications and insurance, which are reviewed before badge approval
                  </p>
                </div>
                
                <div className="bg-card/80 rounded-xl p-5 border border-border/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-accent-orange/10 rounded-full p-2">
                      <Shield className="h-6 w-6 text-accent-orange" />
                    </div>
                    <h4 className="font-bold text-foreground text-base sm:text-lg">Reviews are verified and tied to completed jobs</h4>
                  </div>
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                    No fake reviews possible — only homeowners who completed jobs can leave feedback
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Trust badge strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center items-center gap-6 md:gap-12 py-6 px-4 bg-gradient-to-r from-trust-blue/5 via-trust-green/5 to-trust-blue/5 rounded-2xl border border-border/50"
          >
            {[
              { icon: <Shield className="h-6 w-6" />, text: "Verification Available" },
              { icon: <Award className="h-6 w-6" />, text: "Verified Pros Prioritized" },
              { icon: <MessageSquare className="h-6 w-6" />, text: "AI Chatbot Matching" },
              { icon: <Star className="h-6 w-6" />, text: "Reviewed by Real Homeowners" }
            ].map((badge, index) => (
              <div key={index} className="flex items-center gap-2 text-foreground font-semibold">
                <div className="text-trust-green">{badge.icon}</div>
                <span className="text-sm md:text-base">{badge.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mobile divider */}
      <hr className="my-6 border-gray-200 sm:hidden" />

      {/* AI Job Matching Section */}
      <section className="py-8 md:py-14 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="space-y-6 md:space-y-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/20  border border-primary/30 px-4 py-2 rounded-full mb-6 font-semibold shadow-lg">
                <Brain className="h-5 w-5" />
                <span>Powered by AI — Matching You Instantly</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">AI Finds the Right Professional — Instantly</h2>
              <p className="mt-2 text-sm text-gray-500 sm:hidden">
                AI learns from verified matches — getting smarter with every connection.
              </p>
              <p className="text-muted-foreground text-base sm:text-lg px-4">Use our AI chatbot to find suitable tradespeople based on trade, location, and experience. Click 'Notify Trader' to send email invitations, and professionals decide whether to apply.</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2 italic px-4">No profile browsing needed — AI shows you the best matches and verified professionals are prioritized in suggestions.</p>
            </motion.div>
          </div>
          
          {/* Visual matching examples */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                badge: "Perfect Fit",
                badgeColor: "trust-green",
                score: "Verified local pro in your area, available for your trade type.",
                icon: <CheckCircle2 className="h-6 w-6" />,
                title: "Expert Plumber",
                specialty: "Emergency Repairs",
                distance: "2.1 miles away",
                rating: 4.9,
                jobs: 247,
                reasons: ["Verified in your postcode area", "Matches your trade type", "Available for new jobs"]
              },
              {
                badge: "Good Match",
                badgeColor: "trust-blue",
                score: "Trusted professional nearby — may cover your postcode range.",
                icon: <TrendingUp className="h-6 w-6" />,
                title: "Certified Electrician",
                specialty: "Rewiring & Installations",
                distance: "5.3 miles away",
                rating: 4.7,
                jobs: 189,
                reasons: ["Within extended service area", "Verified trade credentials", "Good local reputation"]
              },
              {
                badge: "Not Suitable",
                badgeColor: "black",
                score: "Outside your selected postcode area or currently unavailable.",
                icon: <AlertCircle className="h-6 w-6" />,
                title: "General Handyman",
                specialty: "Minor Home Repairs",
                distance: "18.7 miles away",
                rating: 4.3,
                jobs: 56,
                reasons: ["Outside postcode coverage", "Currently unavailable", "Different trade specialty"]
              }
            ].map((match, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className={`rounded-2xl p-6 bg-gradient-to-br from-card to-card/90 shadow-xl border-2 ${
                  index === 0 ? 'border-trust-green/40 ring-2 ring-trust-green/20' : 
                  index === 1 ? 'border-trust-blue/30' : 
                  'border-border/30 opacity-75'
                } transition-all duration-300 hover:shadow-2xl`}
              >
                {/* Match badge */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <div className={`inline-flex items-center gap-2 bg-${match.badgeColor}/10 text-${match.badgeColor} px-3 py-1.5 rounded-full text-sm font-bold whitespace-nowrap`}>
                    {match.icon}
                    <span>{match.badge}</span>
                  </div>
                  <div className={`text-xs text-${match.badgeColor} font-medium max-w-[120px] text-right leading-tight`}>{match.score}</div>
                </div>
                
                {/* Profile summary */}
                <div className="mb-4 pb-4 border-b border-border/50">
                  <h4 className="text-lg font-bold text-foreground mb-1">{match.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{match.specialty}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {match.distance}
                  </p>
                </div>
                
                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-trust-green fill-current" />
                    <span className="font-semibold">{match.rating}</span>
                  </div>
                  <div className="text-muted-foreground">
                    {match.jobs} jobs
                  </div>
                </div>
                
                {/* AI reasoning */}
                <div className="space-y-2">
                  {match.reasons.map((reason, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <div className={`mt-0.5 flex-shrink-0 ${index === 2 ? 'text-muted' : 'text-trust-blue'}`}>
                        {index === 2 ? '•' : '✓'}
                      </div>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Benefits grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
          >
            {[
              { icon: <Brain className="h-8 w-8" />, title: "AI-Assisted Job Posts", desc: "AI helps you create clearer, more detailed job descriptions" },
              { icon: <TrendingUp className="h-8 w-8" />, title: "Location-Based Matching", desc: "Find suitable professionals in your postcode area" },
              { icon: <Shield className="h-8 w-8" />, title: "Verified Badges Available", desc: "Verification is optional — verified professionals upload qualifications and insurance for added trust" }
            ].map((benefit, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-card/80 border border-border/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20  mb-4 shadow-md border border-primary/20">
                  {benefit.icon}
                </div>
                <h4 className="font-bold text-foreground mb-2">{benefit.title}</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300">{benefit.desc}</p>
              </div>
            ))}
          </motion.div>
          
          {/* Footer explanation */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-center mt-8"
          >
            <p className="text-xs text-muted-foreground italic max-w-2xl mx-auto px-4">
              Matches are based on postcode proximity and verified trade profiles. AI assists in refining job posts for better accuracy.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Social Proof & Trust Section */}
      <section className="py-8 sm:py-12 bg-background">
        <div className="space-y-6 md:space-y-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-trust-green/10 text-trust-green px-4 py-2 rounded-full mb-6 font-semibold">
                <MessageSquare className="h-5 w-5" />
                <span>Our Mission</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">Trust Built In — Through Verified Reviews</h2>
              <p className="text-muted-foreground text-base sm:text-lg px-4">JobHub uses AI to connect homeowners with suitable tradespeople. Verified professionals upload qualifications and insurance for added trust.</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2 italic px-4">Every review comes from completed jobs — no fake feedback, ever. Both verified and unverified users can leave reviews.</p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-4 sm:mt-6 mb-6 sm:mb-8 px-4">
              <div className="flex items-center gap-1.5 sm:gap-2 bg-trust-green/10 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full border border-trust-green/20">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-trust-green" aria-hidden="true" />
                  <span className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium">Verified Reviews Only</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 bg-trust-blue/10 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full border border-trust-blue/20">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-trust-blue" aria-hidden="true" />
                  <span className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium">From Completed Jobs</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 bg-accent-orange/10 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full border border-accent-orange/20">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5 text-accent-orange" aria-hidden="true" />
                  <span className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium">Real Ratings You Can Trust</span>
              </div>
            </div>
            </motion.div>
          </div>
          
          {/* Testimonial Carousel */}
          <div className="relative">
            <div 
              className="overflow-hidden rounded-2xl scroll-snap-x"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <AnimatePresence mode="wait">
              <motion.div
                  key={currentTestimonial}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  <Card className="border-2 border-trust-blue/20 shadow-2xl bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm">
                    <CardContent className="p-4 sm:p-6 md:p-8 text-center relative">
                      {/* Background decoration */}
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-trust-blue/3 to-transparent pointer-events-none rounded-lg" />
                      
                      <Quote className="h-8 w-8 sm:h-12 sm:w-12 text-trust-blue mb-4 sm:mb-6 mx-auto relative z-10" aria-hidden="true" />
                      <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed italic relative z-10">
                        "{testimonials[currentTestimonial].text}"
                      </p>
                      
                      {/* Rating Stars */}
                      <div className="flex justify-center mb-4 sm:mb-6 relative z-10">
                        {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 sm:h-6 sm:w-6 text-trust-green fill-current mx-0.5" aria-hidden="true" />
                        ))}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 relative z-10">
                        <div className="relative">
                          <img 
                            src={testimonials[currentTestimonial].avatar} 
                            alt={testimonials[currentTestimonial].name}
                            className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full object-cover ring-4 ring-trust-blue/30 shadow-lg"
                            loading="lazy"
                            width="80"
                            height="80"
                            sizes="(max-width: 640px) 48px, 80px"
                          />
                          {/* Online indicator */}
                          <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 bg-trust-green rounded-full border-2 border-card" />
                        </div>
                        <div className="text-center sm:text-left">
                          <p className="font-bold text-foreground text-base sm:text-lg md:text-xl">{testimonials[currentTestimonial].name}</p>
                          <p className="text-muted-foreground font-medium text-sm sm:text-base">{testimonials[currentTestimonial].location}</p>
                          <p className="text-trust-blue font-semibold text-xs sm:text-sm bg-trust-blue/10 px-2 sm:px-3 py-1 rounded-full mt-1 inline-block">
                            {testimonials[currentTestimonial].service}
                          </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              </AnimatePresence>
            </div>
            
            {/* Navigation Buttons */}
            <button
              onClick={handlePrevTestimonial}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-background/90 hover:bg-background border-2 border-trust-blue/20 hover:border-trust-blue/50 rounded-full min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group z-20"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-trust-blue transition-transform" />
            </button>
            
            <button
              onClick={handleNextTestimonial}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-background/90 hover:bg-background border-2 border-trust-blue/20 hover:border-trust-blue/50 rounded-full min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 group z-20"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-trust-blue transition-transform" />
            </button>
            
            {/* Dots Indicator */}
            <div className="flex justify-center mt-6 sm:mt-8 gap-2 py-2 px-4 sm:px-0">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`h-2.5 w-2.5 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-trust-blue/50 focus:ring-offset-2 ${
                    index === currentTestimonial 
                      ? 'bg-gray-500' 
                      : 'bg-gray-300'
                  }`}
                  aria-current={index === currentTestimonial ? 'true' : 'false'}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
          
          {/* Summary Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto px-4"
          >
            <div className="text-center p-6 md:p-8 rounded-2xl bg-gradient-to-br from-card via-card/95 to-card/90 border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 shadow-md border border-primary/20">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">AI-Assisted Matching</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Faster, smarter job connections powered by intelligent automation.</p>
            </div>
            
            <div className="text-center p-6 md:p-8 rounded-2xl bg-gradient-to-br from-card via-card/95 to-card/90 border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-trust-green/10 mb-4 shadow-md border border-trust-green/20">
                <Shield className="h-8 w-8 text-trust-green" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Verified Badges Available</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Verification is optional — verified professionals upload qualifications and insurance for review — verification badges help you identify them.</p>
            </div>
            
            <div className="text-center p-6 md:p-8 rounded-2xl bg-gradient-to-br from-card via-card/95 to-card/90 border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-trust-blue/10 mb-4 shadow-md border border-trust-blue/20">
                <CheckCircle2 className="h-8 w-8 text-trust-blue" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Free for Homeowners</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Post your job at no cost — transparency from start to finish.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Recent Activity Feed */}
      <section className="py-8 md:py-14 bg-muted/30">
          <div className="overflow-hidden">
            <motion.div
              animate={{ x: [0, -1000] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="flex gap-12 whitespace-nowrap"
          >
            {[...recentActivities, ...recentActivities, ...recentActivities].map((activity, index) => (
              <div key={index} className="flex items-center gap-3 text-muted-foreground min-w-max bg-card/50 px-4 py-2 rounded-full border border-border/30">
                <span className="text-lg flex-shrink-0">{activity.icon}</span>
                <span className="text-sm font-medium">
                  {activity.text} <span className="font-bold text-foreground">{activity.location}</span> {activity.action} <span className="font-bold text-trust-blue">{activity.service}</span> <span className="text-xs opacity-75">{activity.time}</span>
                </span>
                </div>
              ))}
            </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-8 md:py-14 bg-gradient-to-br from-muted/20 via-background to-muted/20">
        <div className="space-y-6 md:space-y-10 max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">Frequently Asked Questions</h2>
              <p className="text-muted-foreground text-base sm:text-lg">Everything you need to know about finding and hiring tradespeople on JobHub</p>
            </motion.div>
          </div>
          
          <div className="space-y-4">
            {[
              {
                question: "What does 'verified' mean on JobHub?",
                answer: "Verification is optional for tradespeople. Verified professionals upload qualifications and insurance, which are manually reviewed before a verification badge is awarded. This includes trade certifications review, insurance confirmation, and profile completeness checks.",
                icon: <CheckCircle2 className="h-5 w-5 text-trust-green" />
              },
              {
                question: "How does JobHub's AI match me with professionals?",
                answer: "AI analyses skills, distance, and verified experience to recommend the best local matches. It compares your project requirements with each tradesperson's expertise, specialisations, location, and availability.",
                icon: <Brain className="h-5 w-5 text-primary" />
              },
              {
                question: "Is it really free to post a job?",
                answer: "Yes — posting a job is completely free, with no obligation to hire. Messaging tradespeople and reviewing profiles are also free for homeowners.",
                icon: <CheckCircle2 className="h-5 w-5 text-trust-blue" />
              },
              {
                question: "Are the reviews actually verified?",
                answer: "Every review is linked to a completed job, ensuring feedback is 100% authentic. Reviews can only be left after both parties confirm project completion.",
                icon: <MessageSquare className="h-5 w-5 text-accent-orange" />
              },
              {
                question: "How does JobHub's AI get smarter?",
                answer: "Over time, AI learns from successful matches and feedback to improve accuracy and recommendations. It continuously refines its understanding of what makes a successful homeowner-tradesperson partnership.",
                icon: <Brain className="h-5 w-5 text-primary" />
              }
            ].map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`rounded-2xl bg-white border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? 'bg-slate-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full text-left p-4 sm:p-6 min-h-[56px] flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 transition-colors duration-300"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                  >
                    <div className="flex items-center gap-3 flex-1 pr-2">
                      {faq.icon}
                      <span className="font-semibold text-gray-900 text-base sm:text-lg">{faq.question}</span>
                    </div>
                    <ChevronDown 
                      className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ease-in-out flex-shrink-0 ${
                        isOpen ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>
                  
                  <motion.div
                    id={`faq-answer-${index}`}
                    initial={false}
                    animate={{
                      height: isOpen ? 'auto' : 0,
                      opacity: isOpen ? 1 : 0
                    }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-gray-200">
                      <div className="pt-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
                        {faq.answer}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      </div>

      {/* Scroll to Top Button - Mobile Only */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 md:hidden 
                      bg-gradient-to-br from-primary to-indigo-600 
                      text-white p-4 rounded-2xl shadow-lg shadow-primary/30 
                      backdrop-blur-md hover:scale-105 
                      transition-all duration-300 
                      focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* AI Job Assistant Modal */}
      <AiJobAssistant 
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        onUseDraft={handleUseDraft}
      />

      {/* Home Chat Assistant */}
      <JobAssistantMiniChat variant="home" />
    </div>
  );
};

export default Index;
