import React, { useState } from 'react';
import Modal from '@/components/ui/modal';
import { HiCheckCircle } from 'react-icons/hi2';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  jobId?: string;
  emailSent?: boolean;
  onViewJob?: () => void;
  onCreateAccount?: () => void;
  onResendEmail?: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title = "Job Posted Successfully! 🎉",
  jobId,
  emailSent = true,
  onViewJob,
  onCreateAccount,
  onResendEmail
}) => {
  const [isResending, setIsResending] = useState(false);

  const handleResendEmail = async () => {
    if (!onResendEmail || !jobId) return;
    
    setIsResending(true);
    try {
      await onResendEmail();
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" showCloseButton={true}>
      <div className="text-center py-5 px-6">
        {/* Success Icon & Title */}
        <div className="mb-4">
          <div className="mx-auto flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
            <HiCheckCircle className="w-6 h-6 text-green-600" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            {title}
          </h3>
        </div>

        {/* Message */}
        <div className="space-y-3 mb-6">
          <p className="text-sm text-slate-700 leading-relaxed">
            Your job has been posted. Local, verified tradespeople in your area will be notified and can apply shortly.
          </p>
          
          <p className="text-xs text-slate-600">
            {emailSent 
              ? "We've sent you an email with a link to view your job anytime."
              : "Save this page to return later or create an account to manage your job."
            }
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mb-4">
          {/* Primary Button */}
          {onViewJob && (
            <button
              onClick={onViewJob}
              className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors shadow-sm text-sm"
            >
              View Job
            </button>
          )}
          
          {/* Secondary Link
          {onCreateAccount && (
            <button
              onClick={onCreateAccount}
              className="w-full text-blue-600 hover:text-blue-700 font-medium text-xs underline decoration-1 underline-offset-2 py-1.5"
            >
              Create an account to manage applications
            </button>
          )} */}
        </div>

        {/* Email Resend */}
        {emailSent && onResendEmail && jobId && (
          <div className="mb-4">
            {/* <p className="text-xs text-slate-500">
              Didn't get the email?{' '}
              <button
                onClick={handleResendEmail}
                disabled={isResending}
                className="text-blue-600 hover:text-blue-700 underline decoration-1 underline-offset-2 disabled:opacity-50"
              >
                {isResending ? 'Sending...' : 'Resend'}
              </button>
            </p> */}
          </div>
        )}

        {/* Trust Signal */}
        <div className="pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
            <span className="text-green-600">✅</span>
            Free to post — no obligation to hire
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default SuccessModal;
