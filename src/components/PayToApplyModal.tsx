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
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/components/ui/StripeElement';
import CheckoutForm from '@/components/ui/CheckoutForm';
import { PaymentSuccessModal, ChatProvider } from '@/components/chat-first';

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

type ModalStep = 'payment' | 'success';

const PayToApplyModal: React.FC<PayToApplyModalProps> = ({
  isOpen,
  onClose,
  jobTitle,
  jobId,
  homeownerInfo
}) => {
  const [currentStep, setCurrentStep] = useState<ModalStep>('payment');
  const [isLoading, setIsLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  const userObj = JSON.parse(localStorage.getItem('auth_user') || '{}');
  const userId = userObj.id;

  const handlePayment = async () => {
    setIsLoading(true);

    const backndRequest = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/create-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        job_id: jobId,
        application_text: '',
        user_id: userId,
      }),
    });
    const data = await backndRequest.json();
    console.log('the data in here is ', data);
    setClientSecret(data.clientSecret);
    setIsLoading(false);

    if (!data.clientSecret) {
      setPayError(data.error || 'Could not start payment.');
      setIsLoading(false);
      return;
    }
  };

  const handlePaymentSuccess = () => {
    setCurrentStep('success');
    setShowPaymentSuccess(true);
  };

  const handleClose = () => {
    setCurrentStep('payment');
    setShowCelebration(false);
    setShowPaymentSuccess(false);
    onClose();
  };

  const handlePaymentSuccessClose = () => {
    setShowPaymentSuccess(false);
    handleClose();
  };

  const renderPaymentStep = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="text-center pb-4 sm:pb-6 border-b border-border">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Apply for this job</h2>
        <p className="text-muted-foreground text-sm sm:text-base mb-3 sm:mb-4 px-2">{jobTitle}</p>
        <div className="inline-flex items-center justify-center">
          <Badge variant="secondary" className="text-sm sm:text-base px-3 py-1">
            Application Fee: £5
          </Badge>
        </div>
      </div>

      {/* Benefits */}
      <div className="space-y-3 sm:space-y-4">
        <h3 className="font-semibold text-foreground text-base sm:text-lg">What you get:</h3>
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-green-50 border border-green-200">
            <HiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-green-800 font-medium text-sm sm:text-base">Gain homeowner's contact details</span>
          </div>
          <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-blue-50 border border-blue-200">
            <HiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <span className="text-blue-800 font-medium text-sm sm:text-base">Submit a competitive quote</span>
          </div>
          <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-purple-50 border border-purple-200">
            <HiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <span className="text-purple-800 font-medium text-sm sm:text-base">Increase chances of winning the job</span>
          </div>
        </div>
      </div>

      {/* Payment Form Placeholder */}
      <Card className="p-4 sm:p-6 bg-muted/30 border-dashed border-muted-foreground/30 rounded-xl">
        <div className="text-center space-y-3 sm:space-y-4">
          <HiShieldCheck className="w-10 h-10 sm:w-12 sm:h-12 text-green-600 mx-auto" />
          <div>
            <p className="font-semibold text-foreground text-base sm:text-lg">Secure Payment</p>
            <p className="text-muted-foreground text-sm sm:text-base">Payment processed securely via Stripe</p>
          </div>
        </div>
      </Card>

      {/* Trust Signals */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-muted-foreground border-t border-border pt-3 sm:pt-4">
          <div className="flex items-center gap-2">
            <HiLockClosed className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
            <span>256-bit SSL encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <HiShieldCheck className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
            <span>Money-back guarantee</span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs sm:text-sm text-muted-foreground font-medium px-2">
            You will only be charged once. No subscription fees.
          </p>
        </div>
      </div>

      {
        clientSecret && (
          <Elements stripe={stripePromise}
            options={{
              clientSecret,
              appearance: { theme: 'stripe' }
            }}
            key={clientSecret}
          >
            {/* <PaymentElement /> */}
            {payError && (
              <p className="text-red-600 text-sm mb-2">{payError}</p>
            )}

            <CheckoutForm
              onSuccess={handlePaymentSuccess}
              onError={(msg) => setPayError(msg)}
            />
          </Elements>
        )
      }

      {/* Action Button - Only show when clientSecret is not available */}
      {!clientSecret && (
        <Button
          onClick={handlePayment}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 sm:py-4 text-base sm:text-lg rounded-xl min-h-[48px] sm:min-h-[52px] hover-scale shadow-md hover:shadow-lg transition-all duration-200"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              payment loading...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <HiLockClosed className="w-5 h-5" />
              Continue to payment
            </div>
          )}
        </Button>
      )}
    </div>
  );


  const renderSuccessStep = () => (
    <div className="space-y-4 sm:space-y-6 text-center">
      {/* Success Icon */}
      <div className="flex justify-center animate-scale-in">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center shadow-lg">
          <HiCheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" />
        </div>
      </div>

      {/* Success Message */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3">Payment Complete!</h2>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed px-2">
          Your application is being processed. The chat experience will open shortly.
        </p>
      </div>
    </div>
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        size="lg"
        showCloseButton={currentStep !== 'success'}
      >
        {currentStep === 'payment' && renderPaymentStep()}
        {currentStep === 'success' && renderSuccessStep()}
      </Modal>

      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 shadow-2xl animate-scale-in">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <HiCheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Payment Complete! 🎉</h3>
              <p className="text-slate-600 mt-2">Getting your application ready...</p>
            </div>
          </div>
        </div>
      )}

      {/* New Chat-First Payment Success Modal */}
      <ChatProvider>
        <PaymentSuccessModal
          isOpen={showPaymentSuccess}
          onClose={handlePaymentSuccessClose}
          jobId={jobId}
          homeowner={{
            id: homeownerInfo?.first_name || 'homeowner_id',
            name: homeownerInfo?.first_name || 'Homeowner'
          }}
          trader={{
            id: userId || 'trader_id',
            name: 'You'
          }}
        />
      </ChatProvider>
    </>
  );
};

export default PayToApplyModal;