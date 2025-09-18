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
    setClientSecret(data.clientSecret);
    setIsLoading(false);

    if (!data.clientSecret) {
      setPayError(data.error || 'Could not start payment.');
      setIsLoading(false);
      return;
    }
  };

  const handlePaymentSuccess = async () => {
    const confirmPaidApplication = async () => {
      try {
        const request = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/create-intent`, 
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              job_id: jobId,
              application_text: 'paid',
              user_id: userId,
            }),
          }
        );

        if (!request.ok){
          const errorData = await request.json().catch(() => ({}));
          console.error('Payment confirmation failed:', errorData);
          // Continue with success flow even if confirmation fails
          // The payment was processed successfully by Stripe
        }
        
        const data = await request.json().catch(() => null);
        console.log('Payment confirmation data:', data);
      } catch (error) {
        console.error('Payment confirmation error:', error);
        // Continue with success flow - payment was processed by Stripe
      }
    };

    // Always proceed to success after Stripe payment completes
    setCurrentStep('success');
    setShowPaymentSuccess(true);
    
    // Run confirmation in background - don't block success flow
    confirmPaidApplication();
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
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="text-center pb-4 md:pb-6 border-b border-border">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">Apply for this job</h2>
        <p className="text-muted-foreground text-sm md:text-base mb-3 md:mb-4 px-2 leading-relaxed">{jobTitle}</p>
        <div className="inline-flex items-center justify-center">
          <Badge variant="secondary" className="text-sm md:text-base px-3 py-1 font-semibold">
            Application Fee: £5
          </Badge>
        </div>
      </div>

      {/* Benefits */}
      <div className="space-y-3 md:space-y-4">
        <h3 className="font-semibold text-foreground text-base md:text-lg">What you get:</h3>
        <div className="grid gap-2 md:gap-3">
          <div className="flex items-start gap-3 p-3 md:p-4 rounded-xl bg-gradient-to-r from-green-50 to-green-100 border border-green-200/80 shadow-sm">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <HiCheckCircle className="w-3 h-3 text-white" />
            </div>
            <span className="text-green-800 font-medium text-sm md:text-base">Gain homeowner's contact details</span>
          </div>
          <div className="flex items-start gap-3 p-3 md:p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200/80 shadow-sm">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <HiCheckCircle className="w-3 h-3 text-white" />
            </div>
            <span className="text-blue-800 font-medium text-sm md:text-base">Submit a competitive quote</span>
          </div>
          <div className="flex items-start gap-3 p-3 md:p-4 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200/80 shadow-sm">
            <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <HiCheckCircle className="w-3 h-3 text-white" />
            </div>
            <span className="text-purple-800 font-medium text-sm md:text-base">Increase chances of winning the job</span>
          </div>
        </div>
      </div>

      {/* Payment Form Container */}
      <Card className="p-4 md:p-6 bg-gradient-to-br from-background to-muted/30 border-2 border-dashed border-muted-foreground/20 rounded-xl">
        <div className="text-center space-y-3 md:space-y-4">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <HiShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-base md:text-lg">Secure Payment</p>
            <p className="text-muted-foreground text-sm md:text-base">Payment processed securely via Stripe</p>
          </div>
        </div>
      </Card>

      {/* Trust Signals */}
      <div className="space-y-3 md:space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-6 text-xs md:text-sm text-muted-foreground border-t border-border pt-3 md:pt-4">
          <div className="flex items-center gap-2">
            <HiLockClosed className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
            <span>256-bit SSL encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <HiShieldCheck className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
            <span>Money-back guarantee</span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs md:text-sm text-muted-foreground font-medium px-2">
            You will only be charged once. No subscription fees.
          </p>
        </div>
      </div>

      {/* Stripe Payment Element */}
      {clientSecret && (
        <div className="space-y-4">
          <Elements 
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: { 
                theme: 'stripe',
                variables: {
                  colorPrimary: 'hsl(var(--primary))',
                  colorBackground: 'hsl(var(--background))',
                  colorText: 'hsl(var(--foreground))',
                  borderRadius: '8px'
                }
              }
            }}
            key={clientSecret}
          >
            {payError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-destructive text-sm font-medium">{payError}</p>
              </div>
            )}
            <CheckoutForm
              onSuccess={handlePaymentSuccess}
              onError={(msg) => setPayError(msg)}
            />
          </Elements>
        </div>
      )}

      {/* Action Button - Only show when clientSecret is not available */}
      {!clientSecret && (
        <div className="sticky bottom-0 bg-background border-t border-border pt-4 -mb-6 -mx-4 md:-mx-6 px-4 md:px-6 pb-4 md:pb-6">
          <Button
            onClick={handlePayment}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-trust-blue to-blue-600 hover:from-trust-blue/90 hover:to-blue-600/90 text-white font-semibold py-3 md:py-4 text-base md:text-lg rounded-xl min-h-[48px] md:min-h-[52px] shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <HiLockClosed className="w-5 h-5" />
                <span>Continue to payment</span>
              </div>
            )}
          </Button>
        </div>
      )}
    </div>
  );


  const renderSuccessStep = () => (
    <div className="space-y-6 text-center animate-fade-up">
      {/* Success Icon with celebration animation */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
            <HiCheckCircle className="w-10 h-10 md:w-12 md:h-12 text-white" />
          </div>
          {/* Celebration rings */}
          <div className="absolute inset-0 rounded-full border-4 border-green-400/30 animate-ping"></div>
          <div className="absolute inset-[-8px] rounded-full border-2 border-green-300/20 animate-pulse"></div>
        </div>
      </div>

      {/* Success Message */}
      <div className="space-y-2">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">Payment Complete! 🎉</h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed px-2">
          Your application is being processed. The chat experience will open shortly.
        </p>
      </div>

      {/* Quick tip */}
      <div className="p-4 bg-muted/50 rounded-xl border border-border">
        <p className="text-xs md:text-sm text-muted-foreground">
          💡 <strong>Pro tip:</strong> You'll be able to chat directly with the homeowner and share your quote
        </p>
      </div>
    </div>
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        size="xl"
        showCloseButton={currentStep !== 'success'}
      >
        <div className="max-h-[80vh] overflow-y-auto scrollbar-hide">
          {currentStep === 'payment' && renderPaymentStep()}
          {currentStep === 'success' && renderSuccessStep()}
        </div>
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