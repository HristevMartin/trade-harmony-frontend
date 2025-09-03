import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Modal from '@/components/ui/modal';
import {
  HiLockClosed,
  HiShieldCheck,
  HiCheckCircle,
  HiPhone,
  HiEnvelope,
  HiArrowRight,
  HiDocumentArrowUp
} from 'react-icons/hi2';
import { Textarea } from '@/components/ui/textarea';

interface PayToApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
  jobId: string;
  homeownerInfo?: {
    first_name: string;
    email: string;
    phone: string;
  };
}

type ModalStep = 'payment' | 'application' | 'confirmation';

const PayToApplyModal: React.FC<PayToApplyModalProps> = ({
  isOpen,
  onClose,
  jobTitle,
  jobId,
  homeownerInfo
}) => {
  const [currentStep, setCurrentStep] = useState<ModalStep>('payment');
  const [applicationText, setApplicationText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsLoading(false);
      setCurrentStep('application');
    }, 2000);
  };

  const handleApplicationSubmit = async () => {
    setIsLoading(true);
    
    // Simulate application submission
    setTimeout(() => {
      setIsLoading(false);
      setCurrentStep('confirmation');
    }, 1500);
  };

  const handleClose = () => {
    setCurrentStep('payment');
    setApplicationText('');
    onClose();
  };

  const renderPaymentStep = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center pb-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Apply for this job</h2>
        <p className="text-slate-600 text-sm">{jobTitle}</p>
        <div className="mt-3">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Application Fee: £5
          </Badge>
        </div>
      </div>

      {/* Benefits */}
      <div className="space-y-3">
        <h3 className="font-semibold text-slate-900">What you get:</h3>
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <HiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-slate-700">Gain homeowner's contact details</span>
          </div>
          <div className="flex items-start gap-3">
            <HiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-slate-700">Submit a competitive quote</span>
          </div>
          <div className="flex items-start gap-3">
            <HiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-slate-700">Increase chances of winning the job</span>
          </div>
        </div>
      </div>

      {/* Payment Form Placeholder */}
      <Card className="p-4 bg-slate-50 border-dashed border-slate-300">
        <div className="text-center space-y-3">
          <HiShieldCheck className="w-8 h-8 text-green-600 mx-auto" />
          <div>
            <p className="font-medium text-slate-900">Secure Payment</p>
            <p className="text-sm text-slate-600">Payment processed securely via Stripe</p>
          </div>
        </div>
      </Card>

      {/* Trust Signals */}
      <div className="flex items-center justify-center gap-4 text-xs text-slate-500 border-t border-slate-200 pt-4">
        <div className="flex items-center gap-1">
          <HiLockClosed className="w-3 h-3" />
          <span>Secure Payment</span>
        </div>
        <div className="flex items-center gap-1">
          <HiShieldCheck className="w-3 h-3" />
          <span>Money-back guarantee</span>
        </div>
      </div>

      {/* Action Button */}
      <Button 
        onClick={handlePayment}
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Processing...
          </div>
        ) : (
          <>
            Pay £5 & Apply
            <HiArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
    </div>
  );

  const renderApplicationStep = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center pb-4 border-b border-slate-200">
        <div className="flex items-center justify-center gap-2 mb-2">
          <HiCheckCircle className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-bold text-slate-900">Payment Successful!</h2>
        </div>
        <p className="text-slate-600 text-sm">Now submit your application for this job</p>
      </div>

      {/* Homeowner Contact Info */}
      {homeownerInfo && (
        <Card className="p-4 bg-green-50 border-green-200">
          <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
            <HiPhone className="w-4 h-4" />
            Homeowner Contact Details
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-700 font-medium">Name:</span>
              <span className="text-green-800">{homeownerInfo.first_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <HiEnvelope className="w-4 h-4 text-green-600" />
              <span className="text-green-800">{homeownerInfo.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <HiPhone className="w-4 h-4 text-green-600" />
              <span className="text-green-800">{homeownerInfo.phone}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Application Form */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-900">
          Your Application Message
        </label>
        <Textarea
          value={applicationText}
          onChange={(e) => setApplicationText(e.target.value)}
          placeholder="Introduce yourself, explain your experience, and provide a quote for this job..."
          rows={6}
          className="resize-none"
        />
        <p className="text-xs text-slate-500">
          Tip: Include your relevant experience, availability, and a competitive quote to stand out.
        </p>
      </div>

      {/* Optional File Upload */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-900">
          Attach Portfolio (Optional)
        </label>
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
          <HiDocumentArrowUp className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-600">Click to upload images of your previous work</p>
          <p className="text-xs text-slate-500 mt-1">JPG, PNG up to 5MB each</p>
        </div>
      </div>

      {/* Submit Button */}
      <Button 
        onClick={handleApplicationSubmit}
        disabled={isLoading || !applicationText.trim()}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Submitting...
          </div>
        ) : (
          'Submit Application'
        )}
      </Button>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="space-y-6 text-center">
      {/* Success Icon */}
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <HiCheckCircle className="w-10 h-10 text-green-600" />
        </div>
      </div>

      {/* Success Message */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Application Submitted!</h2>
        <p className="text-slate-600">
          Your application has been sent to the homeowner. They will review it and contact you directly if interested.
        </p>
      </div>

      {/* Next Steps */}
      <Card className="p-4 bg-blue-50 border-blue-200 text-left">
        <h3 className="font-semibold text-blue-900 mb-2">What happens next:</h3>
        <div className="space-y-1 text-sm text-blue-800">
          <p>• The homeowner will review your application</p>
          <p>• They may contact you for more details</p>
          <p>• Check your phone and email regularly</p>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button 
          onClick={handleClose}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          View More Jobs
        </Button>
        <Button 
          variant="outline"
          onClick={handleClose}
          className="w-full"
        >
          Close
        </Button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      showCloseButton={currentStep !== 'confirmation'}
    >
      {currentStep === 'payment' && renderPaymentStep()}
      {currentStep === 'application' && renderApplicationStep()}
      {currentStep === 'confirmation' && renderConfirmationStep()}
    </Modal>
  );
};

export default PayToApplyModal;