
import { Building, Info, User } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-900">About TradesPro</h1>
        
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-md p-8 transform transition-transform hover:scale-105">
            <img
              src="photo-1721322800607-8c38375eef04"
              alt="Our Workspace"
              className="w-full h-48 object-cover rounded-lg mb-6"
            />
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Building className="text-indigo-600" />
              Our Story
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Founded in 2024, TradesPro has been connecting skilled professionals with clients who need their expertise. 
              We believe in making home improvements and repairs accessible to everyone while ensuring the highest quality of service.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8 transform transition-transform hover:scale-105">
            <img
              src="photo-1487058792275-0ad4aaf24ca7"
              alt="Our Technology"
              className="w-full h-48 object-cover rounded-lg mb-6"
            />
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Info className="text-indigo-600" />
              Our Mission
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We're committed to revolutionizing the trades industry by providing a seamless platform that connects skilled professionals 
              with clients. Our mission is to ensure quality, reliability, and satisfaction in every service provided.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-16">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <User className="text-indigo-600" />
            Our Team
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <img
                src="photo-1581092795360-fd1ca04f0952"
                alt="Team Member"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="font-semibold text-lg">John Doe</h3>
              <p className="text-gray-600">Founder & CEO</p>
            </div>
            <div className="text-center">
              <img
                src="photo-1485827404703-89b55fcc595e"
                alt="Team Member"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="font-semibold text-lg">Jane Smith</h3>
              <p className="text-gray-600">Operations Director</p>
            </div>
            <div className="text-center">
              <img
                src="photo-1581092795360-fd1ca04f0952"
                alt="Team Member"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="font-semibold text-lg">Mike Johnson</h3>
              <p className="text-gray-600">Technical Lead</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
