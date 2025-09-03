import { loadStripe } from '@stripe/stripe-js';
import { getEnvVar } from './envConfig';

// Get Stripe publishable key from environment
const stripePublishableKey = getEnvVar('VITE_STRIPE_PUBLISHABLE_KEY', null, true);

// Initialize Stripe (will be null if key is missing)
export const stripe = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

// Helper function to check if Stripe is configured
export const isStripeConfigured = () => {
  return !!stripePublishableKey;
};

// Helper function to get stripe instance with error handling
export const getStripe = async () => {
  if (!stripe) {
    console.error('🚨 Stripe is not configured. Please add VITE_STRIPE_PUBLISHABLE_KEY to your .env.local file');
    throw new Error('Stripe configuration missing');
  }
  
  return await stripe;
};