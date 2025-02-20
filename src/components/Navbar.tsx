
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed w-full bg-white/90 backdrop-blur-sm z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="text-xl font-semibold tracking-tight hover:text-indigo-600 transition-colors">
              TradesPro
            </Link>
          </div>
          
          <div className="hidden md:flex space-x-8">
            <Link 
              to="/" 
              className={`text-gray-700 hover:text-indigo-600 transition-colors relative group ${isActive("/") ? "text-indigo-600" : ""}`}
            >
              Home
              <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 transform transition-transform ${isActive("/") ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="text-gray-700 hover:text-indigo-600 transition-colors">
                Services
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-white">
                <Link to="/service-providers">
                  <DropdownMenuItem className="cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                    Painting Services
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem className="cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                  Electrical Work
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                  Mechanical Services
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link 
              to="/about" 
              className={`text-gray-700 hover:text-indigo-600 transition-colors relative group ${isActive("/about") ? "text-indigo-600" : ""}`}
            >
              About
              <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 transform transition-transform ${isActive("/about") ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
            </Link>
            <Link 
              to="/contact" 
              className={`text-gray-700 hover:text-indigo-600 transition-colors relative group ${isActive("/contact") ? "text-indigo-600" : ""}`}
            >
              Contact
              <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 transform transition-transform ${isActive("/contact") ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
            </Link>
          </div>

          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Menu className="h-6 w-6 text-gray-700" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-white">
                <Link to="/">
                  <DropdownMenuItem className="cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                    Home
                  </DropdownMenuItem>
                </Link>
                <Link to="/service-providers">
                  <DropdownMenuItem className="cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                    Painting Services
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem className="cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                  Electrical Work
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                  Mechanical Services
                </DropdownMenuItem>
                <Link to="/about">
                  <DropdownMenuItem className="cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                    About
                  </DropdownMenuItem>
                </Link>
                <Link to="/contact">
                  <DropdownMenuItem className="cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                    Contact
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
