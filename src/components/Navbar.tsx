
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
            <a href="/" className="text-xl font-semibold tracking-tight">
              TradesPro
            </a>
          </div>
          
          <div className="hidden md:flex space-x-8">
            <a href="/" className="text-gray-700 hover:text-gray-900 transition-colors">
              Home
            </a>
            <DropdownMenu>
              <DropdownMenuTrigger className="text-gray-700 hover:text-gray-900 transition-colors">
                Services
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-white">
                <DropdownMenuItem className="cursor-pointer">
                  Painting Services
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  Electrical Work
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  Mechanical Services
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <a href="/about" className="text-gray-700 hover:text-gray-900 transition-colors">
              About
            </a>
            <a href="/contact" className="text-gray-700 hover:text-gray-900 transition-colors">
              Contact
            </a>
          </div>

          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Menu className="h-6 w-6 text-gray-700" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-white">
                <DropdownMenuItem className="cursor-pointer">
                  Home
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  Painting Services
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  Electrical Work
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  Mechanical Services
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  About
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
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
