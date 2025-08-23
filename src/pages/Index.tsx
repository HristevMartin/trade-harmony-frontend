
import { 
  HardHat, 
  Wrench, 
  Zap, 
  ArrowRight, 
  Building, 
  Search, 
  CheckCircle, 
  Star, 
  Users, 
  Shield, 
  Clock,
  Droplets,
  PaintBucket,
  Trees,
  Thermometer,
  Hammer,
  ClipboardList,
  MessageSquareQuote,
  Handshake,
  MapPin,
  Quote
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const Index = () => {
  const [postcode, setPostcode] = useState("");
  const [selectedService, setSelectedService] = useState("");

  const services = [
    { name: "Plumbing", icon: <Droplets className="h-8 w-8" />, color: "text-trust-blue" },
    { name: "Electrical", icon: <Zap className="h-8 w-8" />, color: "text-yellow-500" },
    { name: "Carpentry", icon: <Hammer className="h-8 w-8" />, color: "text-amber-600" },
    { name: "Roofing", icon: <Building className="h-8 w-8" />, color: "text-slate-600" },
    { name: "Painting", icon: <PaintBucket className="h-8 w-8" />, color: "text-purple-500" },
    { name: "Gardening", icon: <Trees className="h-8 w-8" />, color: "text-trust-green" },
    { name: "Heating & Cooling", icon: <Thermometer className="h-8 w-8" />, color: "text-red-500" },
    { name: "Mechanical Repairs", icon: <Wrench className="h-8 w-8" />, color: "text-gray-600" },
  ];

  const testimonials = [
    {
      text: "Found an excellent electrician within hours. Professional service and fair pricing!",
      name: "Sarah Mitchell",
      location: "Leeds",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
    },
    {
      text: "Amazing plumber fixed our emergency leak quickly. Highly recommend this platform!",
      name: "John Davies",
      location: "Manchester",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    },
    {
      text: "Got 3 quotes for garden landscaping. Saved me time and money!",
      name: "Emma Thompson",
      location: "Birmingham",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    }
  ];

  const recentActivities = [
    "Sarah in Leeds booked a Plumber 5 mins ago",
    "John in Manchester got 3 quotes for Electrical Work",
    "Emma in Birmingham hired a Carpenter",
    "Mike in Bristol found a Roofer 10 mins ago"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-trust-blue">TradeFinder</div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-foreground hover:text-trust-blue transition-colors">Home</a>
              <a href="#" className="text-foreground hover:text-trust-blue transition-colors">Services</a>
              <a href="#" className="text-foreground hover:text-trust-blue transition-colors">How it Works</a>
              <a href="#" className="text-foreground hover:text-trust-blue transition-colors">Contact</a>
            </nav>
            
            <Button variant="outline" className="border-trust-blue text-trust-blue hover:bg-trust-blue hover:text-trust-blue-foreground">
              Join as a Tradesperson
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-trust-blue/5 via-background to-trust-green/5 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6"
            >
              Find trusted tradespeople{" "}
              <span className="text-trust-blue">near you</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-muted-foreground mb-8"
            >
              Get up to 3 free quotes from verified professionals — no obligation.
            </motion.p>

            {/* Search Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-card rounded-2xl p-4 shadow-xl max-w-2xl mx-auto mb-8"
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Enter your postcode"
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value)}
                      className="pl-10 h-12 text-base"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.name} value={service.name}>
                          <div className="flex items-center gap-2">
                            <span className={service.color}>{service.icon}</span>
                            {service.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  size="lg" 
                  className="bg-accent-orange hover:bg-accent-orange/90 text-accent-orange-foreground h-12 px-8 font-semibold"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </motion.div>

            {/* Trust Proof */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex items-center justify-center space-x-2"
            >
              <span className="text-foreground font-semibold">Excellent</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-trust-green fill-current" />
                ))}
              </div>
              <span className="text-muted-foreground">30,000+ reviews on</span>
              <span className="text-trust-green font-bold">★ Trustpilot</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Service Categories Grid */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Popular Services</h2>
            <p className="text-muted-foreground text-lg">Find trusted professionals for any home improvement project</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {services.map((service, index) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <div className={`${service.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      {service.icon}
                    </div>
                    <h3 className="font-semibold text-foreground">{service.name}</h3>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">Get quotes in three simple steps</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: <ClipboardList className="h-12 w-12" />,
                title: "Post your job",
                description: "Tell us what you need doing and when you need it completed."
              },
              {
                icon: <MessageSquareQuote className="h-12 w-12" />,
                title: "Get up to 3 quotes",
                description: "Receive free quotes from verified local tradespeople."
              },
              {
                icon: <Handshake className="h-12 w-12" />,
                title: "Choose your tradesperson",
                description: "Compare quotes, read reviews, and hire the best professional."
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="text-center"
              >
                <div className="bg-trust-blue/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                  <div className="text-trust-blue">{step.icon}</div>
                </div>
                <div className="bg-trust-blue text-trust-blue-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof & Trust Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">What Our Customers Say</h2>
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-trust-green" />
                <span className="text-sm text-muted-foreground">All tradespeople are verified & insured</span>
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <Quote className="h-8 w-8 text-trust-blue mb-4" />
                    <p className="text-muted-foreground mb-4">"{testimonial.text}"</p>
                    <div className="flex items-center gap-3">
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-foreground">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          <div className="flex justify-center">
            <div className="flex items-center gap-8 text-muted-foreground">
              <div className="text-center">
                <div className="text-2xl font-bold text-trust-blue">30,000+</div>
                <div className="text-sm">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-trust-green">50,000+</div>
                <div className="text-sm">Verified Tradespeople</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-orange">99%</div>
                <div className="text-sm">Customer Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Activity Feed */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="overflow-hidden">
            <motion.div
              animate={{ x: [0, -1000] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="flex gap-8 whitespace-nowrap"
            >
              {[...recentActivities, ...recentActivities].map((activity, index) => (
                <div key={index} className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-trust-green" />
                  <span className="text-sm">{activity}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mid-page CTA Band */}
      <section className="py-16 bg-trust-blue text-trust-blue-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Over 50,000 tradespeople nationwide are ready to help.
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of satisfied customers who found their perfect tradesperson
          </p>
          <Button 
            size="lg" 
            className="bg-accent-orange hover:bg-accent-orange/90 text-accent-orange-foreground text-lg px-8 py-6"
          >
            Post Your Job Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
