import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// In-memory client cache (2 min reuse)
const CHAT_CACHE_TTL_MS = 120000; // 2 minutes
const chatCache = new Map(); // key -> { ts, payload }
const explainCache = new Map(); // key -> { ts, payload }

export const useOpenAIChat = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const sendMessage = useCallback(async (message, sessionId, context = 'global', modelOverride = null) => {
    const abortController = new AbortController();
    setLoading(true);
    setError(null);

    try {
      // Client-side cache: reuse within 2 minutes
      const cacheKey = `chat|${sessionId || 'default'}|${context}|${(message || '').trim()}`;
      const cached = chatCache.get(cacheKey);
      const now = Date.now();
      if (cached && (now - cached.ts) < CHAT_CACHE_TTL_MS) {
        return { success: true, data: cached.payload };
      }

      // Get current user session for auth
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError || !session) {
        throw new Error('Authentication required');
      }

      // Call OpenAI chat endpoint with abort signal
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

      if (abortController.signal.aborted) {
        throw new Error('Request was cancelled');
      }

      if (functionError) {
        throw functionError;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const payload = {
        sessionId: data.sessionId,
        message: data.message,
        model: data.model,
        usage: data.usage
      };

      // Save to client cache
      chatCache.set(cacheKey, { ts: now, payload });

      return {
        success: true,
        data: payload
      };

    } catch (err) {
      if (abortController.signal.aborted) {
        console.log('OpenAI chat request cancelled');
        return { success: false, error: 'Request cancelled' };
      }
      
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
    const abortController = new AbortController();
    setLoading(true);
    setError(null);

    try {
      // Client-side cache for explain within 2 minutes
      const cacheKey = `explain|${context}|${(question || '').trim()}|${JSON.stringify(contextData || {})}`;
      const cached = explainCache.get(cacheKey);
      const now = Date.now();
      if (cached && (now - cached.ts) < CHAT_CACHE_TTL_MS) {
        return { success: true, data: cached.payload };
      }

      // Note: explain endpoint doesn't require auth (verify_jwt = false)
      const { data, error: functionError } = await supabase.functions.invoke('openai-explain', {
        body: {
          question,
          context,
          contextData
        }
      });

      if (abortController.signal.aborted) {
        throw new Error('Request was cancelled');
      }

      if (functionError) {
        throw functionError;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const payload = {
        explanation: data.explanation,
        context: data.context,
        usage: data.usage
      };

      // Save to client cache
      explainCache.set(cacheKey, { ts: now, payload });

      return {
        success: true,
        data: payload
      };

    } catch (err) {
      if (abortController.signal.aborted) {
        console.log('OpenAI explain request cancelled');
        return { success: false, error: 'Request cancelled' };
      }
      
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