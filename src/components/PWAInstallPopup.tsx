import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone, Share, Plus } from 'lucide-react';

interface PWAInstallPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => void;
  canInstall: boolean;
}

const PWAInstallPopup: React.FC<PWAInstallPopupProps> = ({
  isOpen,
  onClose,
  onInstall,
  canInstall
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Detect iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 300); // Wait for animation
  };

  const handleInstall = () => {
    onInstall();
    handleClose();
  };

  const handleDismissForever = () => {
    localStorage.setItem('pwa-install-dismissed', 'true');
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isVisible ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div 
        className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full mx-4 transform transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Content */}
        <div className="p-6 pt-8">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-2">
            Install Trade Harmony
          </h2>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-300 text-center mb-6 text-sm leading-relaxed">
            Get quick access to your jobs and messages. Install our app for a better mobile experience with offline support.
          </p>

          {/* Benefits */}
          <ul className="text-sm text-gray-600 dark:text-gray-300 mb-6 space-y-2">
            <li className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0" />
              Faster loading and offline access
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0" />
              Push notifications for new messages
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0" />
              Native app experience
            </li>
          </ul>

          {/* Install Instructions */}
          <div className="space-y-3">
            {canInstall && !isIOS ? (
              // Chrome/Edge Install Button
              <button
                onClick={handleInstall}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Install App
              </button>
            ) : isIOS ? (
              // iOS Installation Steps
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3 text-center">
                  Install on iPhone/iPad
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-blue-800 dark:text-blue-200">
                    <div className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold mr-3 flex-shrink-0">
                      1
                    </div>
                    <span className="mr-2">Tap the</span>
                    <Share className="w-4 h-4 mx-1 flex-shrink-0" />
                    <span className="font-medium">Share button</span>
                    <span className="ml-1">below</span>
                  </div>
                  <div className="flex items-center text-sm text-blue-800 dark:text-blue-200">
                    <div className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold mr-3 flex-shrink-0">
                      2
                    </div>
                    <span className="mr-2">Select</span>
                    <Plus className="w-4 h-4 mx-1 flex-shrink-0" />
                    <span className="font-medium">"Add to Home Screen"</span>
                  </div>
                  <div className="flex items-center text-sm text-blue-800 dark:text-blue-200">
                    <div className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold mr-3 flex-shrink-0">
                      3
                    </div>
                    <span>Tap <span className="font-medium">"Add"</span> to install</span>
                  </div>
                </div>
              </div>
            ) : (
              // Fallback for other browsers
              <div className="text-center bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  To install this app, use Chrome or Safari browser
                </p>
              </div>
            )}
            
            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
              >
                Maybe Later
              </button>
              <button
                onClick={handleDismissForever}
                className="flex-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
              >
                Don't Ask Again
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPopup;
