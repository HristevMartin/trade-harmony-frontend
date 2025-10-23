import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Modal from '@/components/ui/modal';
import {
  HiLockClosed,
  HiShieldCheck,
  HiCheckCircle,
} from 'react-icons/hi2';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/components/ui/StripeElement';
import CheckoutForm from '@/components/ui/CheckoutForm';
import { PaymentSuccessModal } from '@/components/chat-first';

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
      }
    };

    const increaseJobApplicationCount = async () => {
      const request = await fetch(`${import.meta.env.VITE_API_URL}/travel/job-application-counter/${jobId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId }) });

      if (!request.ok) {
        throw new Error('Failed to increase job application count');
      }

      let response = await request.json();
      console.log('Increase job application count response:', response);
      return response;
    }

    setCurrentStep('success');
    setShowPaymentSuccess(true);
    
    // Run confirmation in background - don't block success flow
    confirmPaidApplication();
    increaseJobApplicationCount();
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
    <div className="space-y-5">
      {/* Header */}
      <div className="text-center pb-5 border-b border-gray-200">
        <h2 id="apply-modal-title" className="text-xl font-semibold text-gray-900 mb-2">Apply for this job</h2>
        <p className="text-gray-600 text-sm leading-relaxed mb-4">{jobTitle}</p>
        <div className="inline-flex items-center border border-gray-200 bg-white rounded-full px-3 py-1.5 text-sm text-gray-900 font-medium">
          Application Fee: £5
        </div>
      </div>

      {/* Benefits */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 text-base">What you get:</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-7 w-7 rounded-full border border-gray-200 bg-white text-emerald-600 flex items-center justify-center flex-shrink-0">
              <HiCheckCircle className="w-4 h-4" />
            </div>
            <span className="text-gray-700 text-sm">Submit a competitive quote</span>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-7 w-7 rounded-full border border-gray-200 bg-white text-emerald-600 flex items-center justify-center flex-shrink-0">
              <HiCheckCircle className="w-4 h-4" />
            </div>
            <span className="text-gray-700 text-sm">Increase chances of winning the job</span>
          </div>
        </div>
      </div>

      {/* Trust Card */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
        <div className="flex items-center justify-center gap-2">
          <div className="h-10 w-10 rounded-full bg-jobhub-successBg text-emerald-600 flex items-center justify-center">
            <HiShieldCheck className="w-6 h-6" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900 text-sm">Secure Payment</p>
            <p className="text-gray-600 text-xs">Powered by Stripe</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-600 border-t border-gray-200 pt-3">
          <div className="flex items-center gap-1.5">
            <HiLockClosed className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-bit SSL encryption</span>
          </div>
          <div className="flex items-center gap-1.5">
            <HiShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Money-back guarantee</span>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="rounded-lg border border-gray-200 bg-jobhub-infoBg px-3 py-2">
        <p className="text-jobhub-blue text-xs text-center">
          You will only be charged once. No subscription fees.
        </p>
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
                  colorPrimary: '#1D4ED8',
                  colorBackground: '#FFFFFF',
                  colorText: '#111827',
                  borderRadius: '12px'
                }
              },
            }}
            key={clientSecret}
          >
            {payError && (
              <div className="p-3 bg-jobhub-dangerBg border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm font-medium">{payError}</p>
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
        <Button
          onClick={handlePayment}
          disabled={isLoading}
          className="w-full bg-jobhub-blue text-white hover:bg-jobhub-blue/90 focus:ring-2 focus:ring-jobhub-blue/30 h-11 rounded-xl font-semibold"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Loading...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <HiLockClosed className="w-5 h-5" />
              <span>Continue to payment</span>
            </div>
          )}
        </Button>
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
        size="lg"
        showCloseButton={currentStep !== 'success'}
        titleId="apply-modal-title"
        bodyId="apply-modal-body"
      >
        <div id="apply-modal-body">
          {currentStep === 'payment' && renderPaymentStep()}
          {currentStep === 'success' && renderSuccessStep()}
        </div>
      </Modal>

      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lift animate-scale-in">
            <div className="text-center">
              <div className="w-20 h-20 bg-jobhub-successBg rounded-full flex items-center justify-center mx-auto mb-4">
                <HiCheckCircle className="w-12 h-12 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Payment Complete! 🎉</h3>
              <p className="text-gray-600 mt-2">Getting your application ready...</p>
            </div>
          </div>
        </div>
      )}

      {/* New Chat-First Payment Success Modal */}
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
    </>
  );
};

export default PayToApplyModal;