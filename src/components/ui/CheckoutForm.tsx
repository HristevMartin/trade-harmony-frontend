import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import {
  HiLockClosed,
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
        payment_method_data: {
          billing_details: {
            name: 'Customer', // Required when billingDetails is set to 'never'
            email: null,
            phone: null,
            address: {
              line1: null,
              line2: null,
              city: null,
              state: null,
              postal_code: null,
              country: null,
            }
          }
        }
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
      <PaymentElement 
        options={{
          fields: {
            billingDetails: 'never'
          }
        }}
      />
      <Button
        type="submit"
        disabled={!stripe || submitting}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl min-h-[44px]"
      >
        {submitting ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Loading checkout...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <HiLockClosed className="w-5 h-5" />
            <span>Pay £5</span>
          </div>
        )}
      </Button>
    </form>
  );
};

export default CheckoutForm;


