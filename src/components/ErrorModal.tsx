import React from 'react';
import Modal from '@/components/ui/modal';
import { HiExclamationTriangle } from 'react-icons/hi2';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  actionButton?: {
    text: string;
    onClick: () => void;
  };
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  title = "Something went wrong",
  message = "An error occurred. Please try again.",
  actionButton
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" showCloseButton={false}>
      <div className="text-center py-2 sm:py-4">
        {/* Error Icon */}
        <div className="mx-auto flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full mb-4 sm:mb-6">
          <HiExclamationTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" aria-hidden="true" />
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4 px-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-sm sm:text-base text-slate-600 mb-6 sm:mb-8 leading-relaxed px-2">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center px-2">
          {actionButton && (
            <button
              onClick={actionButton.onClick}
              className="inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors shadow-sm text-sm sm:text-base"
            >
              {actionButton.text}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ErrorModal;
