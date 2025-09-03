import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useOpenAIChat = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const sendMessage = useCallback(async (message, sessionId, context = 'global', modelOverride = null) => {
    setLoading(true);
    setError(null);

    try {
      // Get current user session for auth
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError || !session) {
        throw new Error('Authentication required');
      }

      // Call OpenAI chat endpoint
      const { data, error: functionError } = await supabase.functions.invoke('openai-chat', {
        body: {
          message,
          sessionId,
          context,
          modelOverride
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (functionError) {
        throw functionError;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      return {
        success: true,
        data: {
          sessionId: data.sessionId,
          message: data.message,
          model: data.model,
          usage: data.usage
        }
      };

    } catch (err) {
      console.error('OpenAI chat error:', err);
      const errorMessage = err.message || 'Failed to send message';
      setError(errorMessage);
      
      // Show toast for rate limiting
      if (err.message?.includes('Rate limit')) {
        toast({
          title: "Rate Limited",
          description: "Please wait before sending another message.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Chat Error",
          description: errorMessage,
          variant: "destructive"
        });
      }

      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const explainConcept = useCallback(async (question, context = 'general', contextData = null) => {
    setLoading(true);
    setError(null);

    try {
      // Note: explain endpoint doesn't require auth (verify_jwt = false)
      const { data, error: functionError } = await supabase.functions.invoke('openai-explain', {
        body: {
          question,
          context,
          contextData
        }
      });

      if (functionError) {
        throw functionError;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      return {
        success: true,
        data: {
          explanation: data.explanation,
          context: data.context,
          usage: data.usage
        }
      };

    } catch (err) {
      console.error('OpenAI explain error:', err);
      const errorMessage = err.message || 'Failed to generate explanation';
      setError(errorMessage);
      
      toast({
        title: "Explanation Error",
        description: errorMessage,
        variant: "destructive"
      });

      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    sendMessage,
    explainConcept,
    loading,
    error,
    setError
  };
};