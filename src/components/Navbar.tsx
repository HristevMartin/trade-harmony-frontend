
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Paintbrush, Wrench, Zap } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
              <DropdownMenuTrigger className="text-gray-700 hover:text-indigo-600 transition-colors focus:outline-none flex items-center gap-1 group">
                <span className="relative">
                  Services
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 transform transition-transform ${isActive("/service-providers") ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-64 bg-white p-1 rounded-lg shadow-lg border border-gray-100 animate-fade-in" 
                sideOffset={8}
              >
                <div className="p-2 mb-1 text-sm font-medium text-gray-500 border-b border-gray-100">
                  Our Professional Services
                </div>
                <Link to="/service-providers">
                  <DropdownMenuItem className="flex items-center gap-3 py-3 cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-colors rounded-md">
                    <div className="p-1.5 bg-indigo-100 rounded-md text-indigo-600">
                      <Paintbrush className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">Painting Services</p>
                      <p className="text-xs text-gray-500">Professional interior & exterior painting</p>
                    </div>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem className="flex items-center gap-3 py-3 cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-colors rounded-md">
                  <div className="p-1.5 bg-yellow-100 rounded-md text-yellow-600">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Electrical Work</p>
                    <p className="text-xs text-gray-500">Licensed electrical installation & repairs</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-3 py-3 cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-colors rounded-md">
                  <div className="p-1.5 bg-blue-100 rounded-md text-blue-600">
                    <Wrench className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">Mechanical Services</p>
                    <p className="text-xs text-gray-500">Expert diagnosis & repair solutions</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <Link to="/service-providers">
                  <DropdownMenuItem className="flex justify-center py-2 text-indigo-600 hover:bg-indigo-50 font-medium cursor-pointer rounded-md">
                    View All Services
                  </DropdownMenuItem>
                </Link>
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
              <DropdownMenuContent className="w-56 bg-white rounded-lg shadow-lg border border-gray-100 animate-fade-in p-1">
                <div className="p-2 mb-1 text-sm font-medium text-gray-500 border-b border-gray-100">
                  Menu
                </div>
                <Link to="/">
                  <DropdownMenuItem className="cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-colors rounded-md py-2">
                    Home
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <div className="px-3 py-1 text-xs font-medium text-gray-500">Services</div>
                <Link to="/service-providers">
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-colors rounded-md py-2">
                    <Paintbrush className="h-4 w-4 text-indigo-600" />
                    Painting Services
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-colors rounded-md py-2">
                  <Zap className="h-4 w-4 text-yellow-600" />
                  Electrical Work
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-colors rounded-md py-2">
                  <Wrench className="h-4 w-4 text-blue-600" />
                  Mechanical Services
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <Link to="/about">
                  <DropdownMenuItem className="cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-colors rounded-md py-2">
                    About
                  </DropdownMenuItem>
                </Link>
                <Link to="/contact">
                  <DropdownMenuItem className="cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-colors rounded-md py-2">
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
