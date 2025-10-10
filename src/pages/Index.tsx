
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
  Settings
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
      text: "Found an excellent electrician within hours. Professional service and fair pricing! The platform made it so easy to connect with skilled professionals.",
      name: "Sarah Mitchell",
      location: "Leeds",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      service: "Electrical Work"
    },
    {
      text: "Amazing plumber fixed our emergency leak quickly. Highly recommend this platform! Saved us from a potential disaster.",
      name: "John Davies",
      location: "Manchester",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      service: "Plumbing"
    },
    {
      text: "Professional roofer completed our project ahead of schedule. Excellent communication throughout the entire process.",
      name: "Michael Brown",
      location: "Bristol",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      service: "Roofing"
    },
    {
      text: "The carpenter we found was incredibly skilled and attention to detail was outstanding. Will definitely use again!",
      name: "Lisa Wilson",
      location: "Liverpool",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      service: "Carpentry"
    }
  ];

  const recentActivities = [
    { text: "Emma in", location: "Birmingham, UK", action: "posted a", service: "Carpentry job", time: "7 mins ago", icon: "✅" },
    { text: "James in", location: "London, UK", action: "applied for an", service: "Electrical job", time: "3 mins ago", icon: "👷" },
    { text: "Sarah in", location: "Leeds, UK", action: "posted a", service: "Plumbing job", time: "5 mins ago", icon: "✅" },
    { text: "Mark in", location: "Manchester, UK", action: "applied for a", service: "Roofing job", time: "12 mins ago", icon: "👷" },
    { text: "Anna in", location: "Liverpool, UK", action: "posted a", service: "Painting job", time: "8 mins ago", icon: "✅" },
    { text: "Peter in", location: "Bristol, UK", action: "applied for a", service: "Gardening job", time: "15 mins ago", icon: "👷" },
    { text: "Lisa in", location: "Newcastle, UK", action: "posted a", service: "Heating job", time: "4 mins ago", icon: "✅" },
    { text: "David in", location: "Sheffield, UK", action: "applied for an", service: "Electrical job", time: "6 mins ago", icon: "👷" }
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
            <div className="absolute top-1/4 left-1/6 opacity-10">
              <div className="bg-trust-blue/10 p-2 rounded-full">
                <Wrench className="h-4 w-4 text-trust-blue" />
              </div>
            </div>
            <div className="absolute top-3/4 right-1/6 opacity-10">
              <div className="bg-trust-green/10 p-2 rounded-full">
                <Hammer className="h-4 w-4 text-trust-green" />
              </div>
            </div>
            <div className="absolute bottom-1/4 left-1/5 opacity-10">
              <div className="bg-accent-orange/10 p-2 rounded-full">
                <Zap className="h-4 w-4 text-accent-orange" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content Container - Centered with Safe Margins */}
        <div className="relative z-10 flex flex-col justify-center min-h-[80vh] lg:min-h-[85vh] py-12 md:py-16">
          <div className="max-w-5xl mx-auto px-4">
            
            {/* Hero Title Section */}
            <div  className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
                className="font-bold leading-tight text-[clamp(1.8rem,5vw,3.2rem)] text-foreground mb-6 md:mb-8 max-w-4xl mx-auto"
            >
                Post your job and connect with trusted tradespeople{" "}
              <span className="text-trust-blue">near you</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
                className="text-slate-600 text-[clamp(1rem,2.8vw,1.25rem)] mb-8 md:mb-10 max-w-3xl mx-auto leading-relaxed"
            >
                It's free to post. Tradespeople apply to your job, and you choose the right one.
            </motion.p>
            </div>

            {/* Search Form Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-6"
            >
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
                        <span className="hidden lg:inline">Post Your Job Today</span>
                        <span className="lg:hidden">Post Job</span>
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                </Button>
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
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground w-full min-h-[48px] px-6 py-3 text-base font-semibold rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl group"
                onClick={handlePostJob}
              >
                <span className="flex items-center justify-center">
                  Post Your Job Today
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
              
              {/* Join as Tradesperson Button - Mobile Only */}
              {!isTrader && (
                <Button 
                  size="lg" 
                  onClick={() => navigate('/tradesperson/onboarding')}
                  className="bg-trust-blue hover:bg-trust-blue/90 text-white w-full min-h-[48px] px-6 py-3 text-base font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl group"
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
                aria-label="Social proof"
                className="flex items-center justify-center gap-2 text-sm sm:text-base opacity-90"
            >
              <span className="text-foreground font-semibold">Excellent</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-trust-green fill-current" />
                ))}
              </div>
                <span className="text-muted-foreground">5,000+ reviews on</span>
                <span className="text-trust-green font-bold">Trustpilot</span>
              </p>
            </motion.div>

            {/* Microcopy */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-center mt-6"
            >
              <p className="text-muted-foreground text-sm font-medium">
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
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Popular Services</h2>
                <p className="text-muted-foreground text-lg">Connect with trusted professionals for any home improvement project with our verified tradespeople network</p>
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
                    className="rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group border-2 border-primary/10 hover:border-primary/30 bg-gradient-to-br from-card via-card/95 to-card/80 backdrop-blur-sm"
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
                      <h3 className="font-semibold text-sm sm:text-base text-foreground group-hover:text-trust-blue transition-colors relative z-10">{service.name}</h3>
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
      <section className="py-8 md:py-14 bg-gradient-to-br from-secondary/5 via-muted/30 to-secondary/10">
        <div className="space-y-6 md:space-y-10">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">How It Works</h2>
              <p className="text-muted-foreground text-lg">Connect with verified professionals in three simple steps</p>
            </motion.div>
          </div>
          
          <div className="flex flex-col gap-5 md:flex-row md:gap-8">
            {[
              {
                icon: <ClipboardList className="h-12 w-12" />,
                title: "Post your job",
                description: "Tell us what you need doing and when you need it completed. Be as detailed as you like."
              },
              {
                icon: <UserPlus className="h-12 w-12" />,
                title: "Tradespeople apply",
                description: "Verified local tradespeople will apply to your job within 24 hours."
              },
              {
                icon: <Handshake className="h-12 w-12" />,
                title: "Choose the right professional",
                description: "Review applications, read profiles, and hire the best professional for your project."
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-card via-card/95 to-card/90 ring-2 ring-primary/10 text-center group flex-1 shadow-xl hover:shadow-2xl transition-all duration-300 border border-primary/5"
              >
                <div className="bg-trust-blue/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 transition-all duration-300">
                  <div className="text-trust-blue transition-transform duration-300" aria-hidden="true">{step.icon}</div>
                </div>
                <div className="bg-trust-blue text-trust-blue-foreground rounded-full w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center mx-auto mb-4 text-lg font-bold shadow-lg group-hover:shadow-xl transition-all duration-300">
                  {index + 1}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3 group-hover:text-trust-blue transition-colors">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof & Trust Section */}
      <section className="py-8 md:py-14 bg-background">
        <div className="space-y-6 md:space-y-10">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">What Our Customers Say</h2>
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-trust-green" aria-hidden="true" />
                  <span className="text-muted-foreground">All tradespeople are verified & insured</span>
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
            <div className="flex justify-center mt-6 sm:mt-8 gap-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-trust-blue/50 focus:ring-offset-2 ${
                    index === currentTestimonial 
                      ? 'bg-trust-blue scale-125 shadow-sm' 
                      : 'bg-trust-blue/30 hover:bg-trust-blue/50'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
          
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex justify-center"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="group cursor-default bg-gradient-to-br from-card/80 to-card/60 p-6 rounded-2xl border border-primary/10 shadow-lg transition-all duration-300">
                <div className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200 mb-2 transition-transform group-hover:scale-110">30,000+</div>
                <div className="text-muted-foreground font-medium">Happy Customers</div>
              </div>
              <div className="group cursor-default bg-gradient-to-br from-card/80 to-card/60 p-6 rounded-2xl border border-secondary/10 shadow-lg transition-all duration-300">
                <div className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200 mb-2 transition-transform group-hover:scale-110">50,000+</div>
                <div className="text-muted-foreground font-medium">Verified Tradespeople</div>
              </div>
              <div className="group cursor-default bg-gradient-to-br from-card/80 to-card/60 p-6 rounded-2xl border border-accent/10 shadow-lg transition-all duration-300">
                <div className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200 mb-2 transition-transform group-hover:scale-110">99%</div>
                <div className="text-muted-foreground font-medium">Customer Satisfaction</div>
              </div>
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

      {/* Mid-page CTA Band */}
      <section className="py-8 md:py-14 mb-8 md:mb-14 bg-gradient-to-r from-primary via-primary to-primary/90 text-primary-foreground relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJtMzYgMzQgNi0yIDYgMi02IDJ6bTAgNGwzLTEgMy0xIDMgMSAzIDEtNiAyem0wLTEwIDMtMSAzIDEtNiAyem0wLTQgMy0xIDMgMS02IDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="text-center relative z-10 space-y-6 md:space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
            Over 50,000 tradespeople nationwide are ready to help.
          </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 md:mb-10 opacity-90 leading-relaxed">
              Join thousands of satisfied customers who found their perfect tradesperson through our platform
          </p>
          <Button 
            size="lg" 
              className="bg-accent-orange hover:bg-accent-orange/90 text-white px-4 py-3 text-[15px] sm:text-lg sm:px-10 sm:py-6 h-auto min-h-[44px] font-semibold group transition-all duration-300 shadow-xl hover:shadow-2xl w-full sm:w-auto"
              onClick={handlePostJob}
          >
              <span className="flex items-center">
            Post Your Job Today
                <ArrowRight className="ml-2 sm:ml-3 h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-1 transition-transform" />
              </span>
          </Button>
          </motion.div>
        </div>
      </section>

      </div>

      {/* AI Job Assistant Modal */}
      <AiJobAssistant 
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        onUseDraft={handleUseDraft}
      />
    </div>
  );
};

export default Index;
