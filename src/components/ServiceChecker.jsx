import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useOpenAIChat } from '@/hooks/useOpenAIChat';
import { isStripeConfigured } from '@/lib/stripeClient';

const ServiceChecker = () => {
  const [services, setServices] = useState({
    supabase: { status: 'checking', message: 'Checking connection...' },
    openai: { status: 'checking', message: 'Checking API...' },
    stripe: { status: 'checking', message: 'Checking configuration...' }
  });
  const { explainConcept } = useOpenAIChat();

  const checkServices = async () => {
    // Check Supabase
    try {
      const { data, error } = await supabase.auth.getSession();
      setServices(prev => ({
        ...prev,
        supabase: {
          status: 'success',
          message: '✅ Supabase client initialized and ready'
        }
      }));
    } catch (error) {
      setServices(prev => ({
        ...prev,
        supabase: {
          status: 'error',
          message: `❌ Supabase error: ${error.message}`
        }
      }));
    }

    // Check OpenAI
    try {
      const result = await explainConcept('Test connection', 'system-check');
      if (result.success) {
        setServices(prev => ({
          ...prev,
          openai: {
            status: 'success',
            message: '✅ OpenAI API initialized and responding'
          }
        }));
      } else {
        setServices(prev => ({
          ...prev,
          openai: {
            status: 'error',
            message: `❌ OpenAI error: ${result.error}`
          }
        }));
      }
    } catch (error) {
      setServices(prev => ({
        ...prev,
        openai: {
          status: 'error',
          message: `❌ OpenAI error: ${error.message}`
        }
      }));
    }

    // Check Stripe
    try {
      const stripeConfigured = isStripeConfigured();
      setServices(prev => ({
        ...prev,
        stripe: {
          status: stripeConfigured ? 'success' : 'warning',
          message: stripeConfigured 
            ? '✅ Stripe client initialized' 
            : '⚠️ Stripe publishable key missing'
        }
      }));
    } catch (error) {
      setServices(prev => ({
        ...prev,
        stripe: {
          status: 'error',
          message: `❌ Stripe error: ${error.message}`
        }
      }));
    }
  };

  useEffect(() => {
    checkServices();
  }, []);

  const getIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-400 animate-spin" />;
    }
  };

  return (
    <Card className="p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Service Integration Status</h3>
      <div className="space-y-3">
        {Object.entries(services).map(([service, { status, message }]) => (
          <div key={service} className="flex items-center gap-3">
            {getIcon(status)}
            <span className="capitalize font-medium">{service}:</span>
            <span className="text-sm text-muted-foreground">{message}</span>
          </div>
        ))}
      </div>
      <Button 
        onClick={checkServices} 
        variant="outline" 
        className="mt-4"
      >
        Recheck Services
      </Button>
    </Card>
  );
};

export default ServiceChecker;