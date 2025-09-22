/**
 * Example usage of InstallAppButton component and usePWAInstall hook
 * 
 * This file demonstrates different ways to implement PWA install functionality
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Smartphone } from 'lucide-react';
import InstallAppButton from './InstallAppButton';
import { usePWAInstall } from '@/hooks/usePWAInstall';

// Example 1: Basic usage with default props
const BasicInstallButton = () => {
  return <InstallAppButton />;
};

// Example 2: Customized install button
const CustomInstallButton = () => {
  return (
    <InstallAppButton
      variant="outline"
      size="lg"
      className="border-primary text-primary hover:bg-primary/10"
      showIcon={false}
    >
      📱 Get the App
    </InstallAppButton>
  );
};

// Example 3: Using the hook for custom implementation
const CustomInstallImplementation = () => {
  const { canInstall, isInstalled, install, isInstalling } = usePWAInstall();

  if (isInstalled) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <Smartphone className="w-4 h-4" />
        App Installed ✓
      </div>
    );
  }

  if (!canInstall) {
    return null; // Don't show anything if can't install
  }

  return (
    <Button
      onClick={install}
      disabled={isInstalling}
      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
    >
      <Download className="w-4 h-4 mr-2" />
      {isInstalling ? 'Installing...' : 'Install JobHub'}
    </Button>
  );
};

// Example 4: Install banner component
const InstallBanner = () => {
  const { canInstall, install } = usePWAInstall();

  if (!canInstall) return null;

  return (
    <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/20 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">JH</span>
          </div>
          <div>
            <h3 className="font-semibold text-sm">Install JobHub App</h3>
            <p className="text-xs text-muted-foreground">
              Get faster access and work offline
            </p>
          </div>
        </div>
        <Button onClick={install} size="sm">
          Install
        </Button>
      </div>
    </div>
  );
};

// Example 5: Navbar integration (this is already implemented in Navbar.tsx)
const NavbarInstallButton = () => {
  return (
    <InstallAppButton 
      variant="ghost" 
      size="sm"
      className="hidden md:flex" // Desktop only
    />
  );
};

// Example 6: Mobile-optimized install button
const MobileInstallButton = () => {
  return (
    <InstallAppButton
      variant="outline"
      size="sm"
      className="w-full md:hidden" // Mobile only
    >
      📲 Add to Home Screen
    </InstallAppButton>
  );
};

export {
  BasicInstallButton,
  CustomInstallButton,
  CustomInstallImplementation,
  InstallBanner,
  NavbarInstallButton,
  MobileInstallButton
};
