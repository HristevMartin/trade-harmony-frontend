import { Link } from "react-router-dom";

const Footer = () => {
  const services = [
    { title: "Building & Construction" },
    { title: "Electrical Services" },
    { title: "Mechanical Repairs" },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 lg:py-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div>
            <h3 className="text-white font-semibold text-base mb-4">TradesPro</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/" 
                  className="text-gray-400 hover:text-gray-200 hover:underline transition-all duration-200 text-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-gray-400 hover:text-gray-200 hover:underline transition-all duration-200 text-sm"
                >
                  About
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-gray-400 hover:text-gray-200 hover:underline transition-all duration-200 text-sm"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold text-base mb-4">Services</h3>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index}>
                  <Link 
                    to={`/service-providers?service=${encodeURIComponent(service.title)}`} 
                    className="text-gray-400 hover:text-gray-200 hover:underline transition-all duration-200 text-sm"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold text-base mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="#" 
                  className="text-gray-400 hover:text-gray-200 hover:underline transition-all duration-200 text-sm"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-400 hover:text-gray-200 hover:underline transition-all duration-200 text-sm"
                >
                  Find Professionals
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-400 hover:text-gray-200 hover:underline transition-all duration-200 text-sm"
                >
                  Join as Professional
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold text-base mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>contact@tradespro.com</li>
              <li>(555) 123-4567</li>
              <li>123 Business Ave, Suite 100</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
            <p>&copy; 2024 TradesPro. All rights reserved.</p>
            <div className="flex gap-6">
              <a 
                href="#" 
                className="hover:text-gray-400 transition-colors"
              >
                Privacy Policy
              </a>
              <a 
                href="#" 
                className="hover:text-gray-400 transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 