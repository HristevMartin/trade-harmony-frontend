
import { Paintbrush, Wrench, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import ServiceCard from "@/components/ServiceCard";

const Index = () => {
  const services = [
    {
      title: "Professional Painting",
      description: "Expert interior and exterior painting services for your home or business.",
      icon: <Paintbrush className="h-8 w-8" />,
    },
    {
      title: "Electrical Services",
      description: "Licensed electricians for all your electrical needs and installations.",
      icon: <Zap className="h-8 w-8" />,
    },
    {
      title: "Mechanical Repairs",
      description: "Comprehensive mechanical services for vehicles and equipment.",
      icon: <Wrench className="h-8 w-8" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-28 pb-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-down">
            Your Trusted Partner in Professional Services
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto animate-fade-up">
            We deliver excellence in painting, electrical work, and mechanical services.
            Quality craftsmanship backed by years of experience.
          </p>
          <button className="bg-gray-900 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-800 transition-colors animate-fade-up">
            Get Started
          </button>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <ServiceCard
                key={index}
                title={service.title}
                description={service.description}
                icon={service.icon}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Contact us today for a free consultation and estimate.
          </p>
          <button className="bg-gray-900 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-800 transition-colors">
            Contact Us
          </button>
        </div>
      </section>
    </div>
  );
};

export default Index;
