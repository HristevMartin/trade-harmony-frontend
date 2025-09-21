import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileHeaderProps {
  title?: string;
  subtitle?: string;
  rightContent?: React.ReactNode;
  showBack?: boolean;
  onBackClick?: () => void;
  className?: string;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  subtitle,
  rightContent,
  showBack = true,
  onBackClick,
  className = ""
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
      return;
    }

    // Check if we can safely go back
    const canGoBack = window.history.length > 1;
    const isFromExternalReferrer = !document.referrer || 
      !document.referrer.includes(window.location.origin);
    
    // Root-like pages where we shouldn't show back button
    const rootPages = ['/', '/auth', '/auth/', ''];
    const isRootPage = rootPages.includes(location.pathname);

    if (isRootPage || !canGoBack || isFromExternalReferrer) {
      // Fallback to home page
      navigate('/', { replace: true });
    } else {
      // Safe to go back
      navigate(-1);
    }
  };

  // Don't show back button on root-like pages
  const rootPages = ['/', '/auth'];
  const shouldShowBack = showBack && !rootPages.includes(location.pathname);

  return (
    <header className={`sm:hidden bg-background border-b border-border ${className}`}>
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left - Back Button */}
        <div className="flex items-center min-w-0">
          {shouldShowBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackClick}
              className="hover:bg-muted -ml-2 mr-2 flex-shrink-0"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          
          {/* Title and Subtitle */}
          {(title || subtitle) && (
            <div className="min-w-0 flex-1">
              {title && (
                <h1 className="font-semibold text-base text-foreground truncate">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-xs text-muted-foreground truncate">
                  {subtitle}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right - Custom Content */}
        {rightContent && (
          <div className="flex items-center flex-shrink-0 ml-2">
            {rightContent}
          </div>
        )}
      </div>
    </header>
  );
};

export default MobileHeader;
