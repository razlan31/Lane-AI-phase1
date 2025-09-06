import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, User, Briefcase, Target, TrendingUp } from 'lucide-react';

const ConversationalOnboarding = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm Lane AI, your business intelligence assistant. I'll help you get started by learning about you and your ventures. What's your name?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: '',
    experience_level: '',
    venture_type: '',
    is_founder: false
  });
  const [currentVenture, setCurrentVenture] = useState(null);
  const { toast } = useToast();

  const sendMessage = async (userMessage) => {
    if (!userMessage.trim()) return;

    const newMessages = [
      ...messages,
      { role: 'user', content: userMessage }
    ];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Call the enhanced openai-chat function with onboarding context
      const { data, error } = await supabase.functions.invoke('openai-chat', {
        body: {
          message: userMessage,
          context: 'onboarding',
          sessionId: `onboarding_${Date.now()}`,
          onboardingStep: step,
          profileData
        }
      });

      if (error) throw error;

      const assistantResponse = data.message;
      
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: assistantResponse }
      ]);

      // Update step and profile data based on conversation
      handleStepProgression(userMessage, assistantResponse);

    } catch (error) {
      console.error('Onboarding chat error:', error);
      toast.error("Failed to process your message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepProgression = (userMessage, assistantResponse) => {
    switch (step) {
      case 1: // Name collection
        if (userMessage.trim()) {
          setProfileData(prev => ({ ...prev, full_name: userMessage.trim() }));
          setStep(2);
        }
        break;
      case 2: // Experience level
        const experience = extractExperienceLevel(userMessage);
        if (experience) {
          setProfileData(prev => ({ ...prev, experience_level: experience }));
          setStep(3);
        }
        break;
      case 3: // Venture type
        const ventureType = extractVentureType(userMessage);
        if (ventureType) {
          setProfileData(prev => ({ 
            ...prev, 
            venture_type: ventureType,
            is_founder: userMessage.toLowerCase().includes('founder') || 
                         userMessage.toLowerCase().includes('own') ||
                         userMessage.toLowerCase().includes('start')
          }));
          setStep(4);
        }
        break;
      case 4: // Complete onboarding
        completeOnboarding();
        break;
    }
  };

  const extractExperienceLevel = (message) => {
    const lower = message.toLowerCase();
    if (lower.includes('new') || lower.includes('beginner') || lower.includes('first')) return 'beginner';
    if (lower.includes('some') || lower.includes('few') || lower.includes('intermediate')) return 'intermediate';
    if (lower.includes('experienced') || lower.includes('many') || lower.includes('expert')) return 'expert';
    return 'intermediate'; // default
  };

  const extractVentureType = (message) => {
    const lower = message.toLowerCase();
    if (lower.includes('startup') || lower.includes('tech')) return 'startup';
    if (lower.includes('local') || lower.includes('restaurant') || lower.includes('shop')) return 'local_business';
    if (lower.includes('side') || lower.includes('project')) return 'side_project';
    if (lower.includes('invest') || lower.includes('portfolio')) return 'investment';
    return 'startup'; // default
  };

  const completeOnboarding = async () => {
    try {
      // Update profile with collected data
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          ...profileData,
          onboarded: true
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast.success("Welcome to Lane AI! Your profile has been set up successfully.");

      onComplete();
    } catch (error) {
      console.error('Onboarding completion error:', error);
      toast.error("Failed to complete onboarding. Please try again.");
    }
  };

  const getStepIcon = () => {
    switch (step) {
      case 1: return <User className="h-5 w-5" />;
      case 2: return <TrendingUp className="h-5 w-5" />;
      case 3: return <Briefcase className="h-5 w-5" />;
      case 4: return <Target className="h-5 w-5" />;
      default: return <MessageCircle className="h-5 w-5" />;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return "Getting to know you";
      case 2: return "Your experience";
      case 3: return "Your venture focus";
      case 4: return "Almost done!";
      default: return "Setup";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          {getStepIcon()}
          <div>
            <h1 className="text-2xl font-bold">Welcome to Lane AI</h1>
            <p className="text-muted-foreground">{getStepTitle()}</p>
          </div>
        </div>

        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  Thinking...
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your response..."
            onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)}
            disabled={isLoading}
          />
          <Button 
            onClick={() => sendMessage(input)}
            disabled={isLoading || !input.trim()}
          >
            Send
          </Button>
        </div>

        <div className="mt-4 flex justify-between text-sm text-muted-foreground">
          <span>Step {step} of 4</span>
          <span>{Math.round((step / 4) * 100)}% complete</span>
        </div>
      </Card>
    </div>
  );
};

export default ConversationalOnboarding;