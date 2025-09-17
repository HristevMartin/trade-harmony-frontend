import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK!);


export default function StripeProvider({ children }: { children: React.ReactNode }) {
  return <Elements stripe={stripePromise}>{children}</Elements>;
}
