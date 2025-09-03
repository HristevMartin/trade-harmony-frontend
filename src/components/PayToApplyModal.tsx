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
      <div className="text-center pb-6 border-b border-border">
        <h2 className="text-2xl font-bold text-foreground mb-2">Apply for this job</h2>
        <p className="text-muted-foreground text-base mb-4">{jobTitle}</p>
        <div className="inline-flex items-center justify-center">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-lg font-semibold px-4 py-2">
            Application Fee: £5
          </Badge>
        </div>
      </div>

      {/* Benefits */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground text-lg">What you get:</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
            <HiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-green-800 font-medium">Gain homeowner's contact details</span>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
            <HiCheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <span className="text-blue-800 font-medium">Submit a competitive quote</span>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 border border-purple-200">
            <HiCheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <span className="text-purple-800 font-medium">Increase chances of winning the job</span>
          </div>
        </div>
      </div>

      {/* Payment Form Placeholder */}
      <Card className="p-6 bg-muted/30 border-dashed border-muted-foreground/30 rounded-xl">
        <div className="text-center space-y-4">
          <HiShieldCheck className="w-12 h-12 text-green-600 mx-auto" />
          <div>
            <p className="font-semibold text-foreground text-lg">Secure Payment</p>
            <p className="text-muted-foreground">Payment processed securely via Stripe</p>
          </div>
        </div>
      </Card>

      {/* Trust Signals */}
      <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground border-t border-border pt-4">
        <div className="flex items-center gap-2">
          <HiLockClosed className="w-4 h-4 text-green-600" />
          <span>256-bit SSL encryption</span>
        </div>
        <div className="flex items-center gap-2">
          <HiShieldCheck className="w-4 h-4 text-green-600" />
          <span>Money-back guarantee</span>
        </div>
      </div>

      {/* Action Button */}
      <Button 
        onClick={handlePayment}
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 text-lg rounded-xl min-h-[44px] hover-scale"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
            Processing payment...
          </div>
        ) : (
          <>
            🔒 Pay £5 & Continue
            <HiArrowRight className="w-5 h-5 ml-2" />
          </>
        )}
      </Button>
    </div>
  );

  const renderApplicationStep = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center pb-6 border-b border-border">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <HiCheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Payment Successful!</h2>
        </div>
        <p className="text-muted-foreground text-base">Now submit your application for this job</p>
      </div>

      {/* Homeowner Contact Info */}
      {homeownerInfo && (
        <Card className="p-5 bg-green-50 border-green-200 rounded-xl">
          <h3 className="font-semibold text-green-900 mb-4 flex items-center gap-2 text-lg">
            <HiPhone className="w-5 h-5" />
            Homeowner Contact Details
          </h3>
          <div className="space-y-3 text-base">
            <div className="flex items-center gap-3">
              <span className="text-green-700 font-medium min-w-[60px]">Name:</span>
              <span className="text-green-800 font-semibold">{homeownerInfo.first_name}</span>
            </div>
            <div className="flex items-center gap-3">
              <HiEnvelope className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-green-800">{homeownerInfo.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <HiPhone className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-green-800">{homeownerInfo.phone}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Application Form */}
      <div className="space-y-3">
        <label className="block text-base font-semibold text-foreground">
          Your Application Message
        </label>
        <Textarea
          value={applicationText}
          onChange={(e) => setApplicationText(e.target.value)}
          placeholder="Introduce yourself, explain your experience, and provide a quote for this job..."
          rows={6}
          className="resize-none text-base"
        />
        <p className="text-sm text-muted-foreground">
          💡 Include your relevant experience, availability, and a competitive quote to stand out.
        </p>
      </div>

      {/* Optional File Upload */}
      <div className="space-y-3">
        <label className="block text-base font-semibold text-foreground">
          Attach Portfolio (Optional)
        </label>
        <div className="border-2 border-dashed border-muted-foreground/30 rounded-xl p-6 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer">
          <HiDocumentArrowUp className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-base text-muted-foreground">Click to upload images of your previous work</p>
          <p className="text-sm text-muted-foreground/70 mt-1">JPG, PNG up to 5MB each</p>
        </div>
      </div>

      {/* Submit Button */}
      <Button 
        onClick={handleApplicationSubmit}
        disabled={isLoading || !applicationText.trim()}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 text-lg rounded-xl min-h-[44px] hover-scale"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Submitting application...
          </div>
        ) : (
          'Send Application'
        )}
      </Button>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="space-y-6 text-center">
      {/* Success Icon */}
      <div className="flex justify-center animate-scale-in">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center shadow-lg">
          <HiCheckCircle className="w-12 h-12 text-green-600" />
        </div>
      </div>

      {/* Success Message */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-3">Application Sent!</h2>
        <p className="text-muted-foreground text-base leading-relaxed">
          Your application has been sent to the homeowner. They will review it and contact you directly if interested.
        </p>
      </div>

      {/* Next Steps */}
      <Card className="p-5 bg-blue-50 border-blue-200 text-left rounded-xl">
        <h3 className="font-semibold text-blue-900 mb-3 text-lg">What happens next:</h3>
        <div className="space-y-2 text-base text-blue-800">
          <p>• The homeowner will review your application</p>
          <p>• They may contact you for more details</p>
          <p>• Check your phone and email regularly</p>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button 
          onClick={handleClose}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 text-lg rounded-xl min-h-[44px] hover-scale"
        >
          View More Jobs
        </Button>
        <Button 
          variant="outline"
          onClick={handleClose}
          className="w-full py-3 text-base rounded-xl min-h-[44px] hover-scale"
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