
import React from "react";
import { Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  return (
    <nav className="fixed w-full bg-white/90 backdrop-blur-sm z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <a href="/" className="text-xl font-semibold tracking-tight hover:text-indigo-600 transition-colors">
              TradesPro
            </a>
          </div>
          
          <div className="hidden md:flex space-x-8">
            <a href="/" className="text-gray-700 hover:text-indigo-600 transition-colors relative group">
              Home
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 transform scale-x-0 transition-transform group-hover:scale-x-100" />
            </a>
            <DropdownMenu>
              <DropdownMenuTrigger className="text-gray-700 hover:text-indigo-600 transition-colors">
                Services
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-white">
                <DropdownMenuItem className="cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                  Painting Services
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                  Electrical Work
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                  Mechanical Services
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <a href="/about" className="text-gray-700 hover:text-indigo-600 transition-colors relative group">
              About
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 transform scale-x-0 transition-transform group-hover:scale-x-100" />
            </a>
            <a href="/contact" className="text-gray-700 hover:text-indigo-600 transition-colors relative group">
              Contact
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 transform scale-x-0 transition-transform group-hover:scale-x-100" />
            </a>
          </div>

          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Menu className="h-6 w-6 text-gray-700" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-white">
                <DropdownMenuItem className="cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                  Home
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                  Painting Services
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                  Electrical Work
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                  Mechanical Services
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                  About
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                  Contact
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
