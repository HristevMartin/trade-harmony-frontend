import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import {
  HiLockClosed,
  HiShieldCheck,
  HiCheckCircle,
  HiPhone,
  HiEnvelope,
  HiArrowRight,
  HiDocumentArrowUp
} from 'react-icons/hi2';

interface CheckoutFormProps {
  onSuccess: () => void;
  onError: (msg: string) => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    onError('');

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: `${window.location.origin}/payment-result`,
      },
    });

    setSubmitting(false);

    if (error) {
      onError(error.message || 'Payment failed. Please try again.');
      return;
    }

    if (
      paymentIntent?.status === 'succeeded' ||
      paymentIntent?.status === 'requires_capture' ||
      paymentIntent?.status === 'processing'
    ) {
      onSuccess();
    } else {
      onError(`Payment status: ${paymentIntent?.status ?? 'unknown'}`);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || submitting}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl min-h-[44px]"
      >
        {submitting ? 'Processing…' :
          <label>
            
            <HiLockClosed className="w-5 h-5 mr-2" />
            Pay £5
          </label>

        }
      </Button>
    </form>
  );
};

export default CheckoutForm;


