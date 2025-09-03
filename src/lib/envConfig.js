// Environment configuration and validation
export const ENV_CONFIG = {
  // Supabase (already configured in Lovable)
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || "https://xgaclcviakwzbdzlvxwn.supabase.co",
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnYWNsY3ZpYWt3emJkemx2eHduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyODg1NTAsImV4cCI6MjA3MTg2NDU1MH0.3SzXUFYUotgZCyY6HuvfTVEgxWqq7PvtGr2mrfc672Q",
  
  // Stripe (client-side only)
  STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  
  // These will be handled via Supabase Secrets for security
  // OPENAI_API_KEY, STRIPE_SECRET_KEY, SENDGRID_API_KEY
};

// Required environment variables for client-side functionality
const REQUIRED_CLIENT_VARS = [
  { key: 'VITE_STRIPE_PUBLISHABLE_KEY', name: 'Stripe Publishable Key', description: 'Required for payment processing' }
];

// Check for missing required environment variables
export const checkRequiredEnvVars = () => {
  const missing = [];
  
  REQUIRED_CLIENT_VARS.forEach(({ key, name, description }) => {
    if (!import.meta.env[key]) {
      missing.push({ key, name, description });
    }
  });
  
  return missing;
};

// Display helpful error messages for missing environment variables
export const displayMissingEnvWarnings = () => {
  const missing = checkRequiredEnvVars();
  
  if (missing.length > 0) {
    console.group('🚨 Missing Environment Variables');
    console.log('%c⚠️ Some features may not work correctly due to missing environment variables:', 'color: orange; font-weight: bold;');
    
    missing.forEach(({ key, name, description }) => {
      console.log(`\n❌ ${name} (${key})`);
      console.log(`   Description: ${description}`);
      console.log(`   Add this to your .env.local file`);
    });
    
    console.log('\n📝 For Lovable users:');
    console.log('• Client-side keys (VITE_*): Add to .env.local file');
    console.log('• Server-side keys: Use Supabase Secrets in your edge functions');
    console.log('• See .env.local.example for the complete list');
    
    console.groupEnd();
    
    return missing;
  }
  
  return [];
};

// Helper to get environment variable with fallback and warning
export const getEnvVar = (key, fallback = null, required = false) => {
  const value = import.meta.env[key] || fallback;
  
  if (required && !value) {
    console.warn(`🚨 Required environment variable ${key} is missing!`);
    console.log(`Add ${key}=your-value-here to your .env.local file`);
  }
  
  return value;
};