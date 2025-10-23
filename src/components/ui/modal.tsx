import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  closeable?: boolean;
  footer?: React.ReactNode;
  titleId?: string;
  bodyId?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeable = true,
  footer,
  titleId = 'modal-title',
  bodyId = 'modal-body'
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Focus trap and accessibility
  useEffect(() => {
    if (!isOpen) return;

    // Store previously focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Focus modal after animation
    const timeout = setTimeout(() => {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements && focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }, 100);

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeable) {
        onClose();
      }
    };

    // Focus trap
    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleTab);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTab);
      document.body.style.overflow = 'unset';

      // Return focus to previous element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, closeable, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-xs sm:max-w-sm',
    md: 'max-w-sm sm:max-w-md',
    lg: 'max-w-md sm:max-w-lg',
    xl: 'max-w-lg sm:max-w-2xl'
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeable) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4 sm:p-6 bg-black/30 backdrop-blur-sm animate-fade-in"
      style={{ zIndex: 9999 }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={bodyId}
    >
      <div 
        ref={modalRef}
        className={`relative w-full ${sizeClasses[size]} bg-white rounded-2xl border border-gray-200 shadow-subtle transform transition-all duration-300 ease-out max-h-[90vh] flex flex-col animate-scale-in`}
        role="document"
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 md:p-8 pb-4 flex-shrink-0">
            {title && (
              <h2 
                id={titleId}
                className="text-xl font-semibold text-gray-900"
              >
                {title}
              </h2>
            )}
            {showCloseButton && closeable && (
              <button
                onClick={onClose}
                className="rounded-full p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-jobhub-blue/40"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div 
          id={bodyId}
          className={`px-6 md:px-8 overflow-y-auto flex-1 ${title || showCloseButton ? '' : 'pt-6 md:pt-8'} ${footer ? '' : 'pb-6 md:pb-8'}`}
        >
          {children}
        </div>

        {/* Optional Sticky Footer */}
        {footer && (
          <div className="sticky bottom-0 -mx-0 px-6 md:px-8 py-4 bg-white/95 backdrop-blur-sm border-t border-gray-200 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
