import { useState } from 'react';
// CACHE BUST: Force rebuild after React import standardization
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, MessageSquare } from 'lucide-react';

export const VoiceInputButton = ({ onTranscript, disabled = false }) => {
  const [transcript, setTranscript] = useState('');
  
  const { isListening, isSupported, startListening, stopListening } = useVoiceInput((text) => {
    setTranscript(text);
    onTranscript(text);
  });

  const handleToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isListening ? "destructive" : "outline"}
        size="sm"
        onClick={handleToggle}
        disabled={disabled}
        className={`transition-all ${isListening ? 'animate-pulse' : ''}`}
      >
        {isListening ? (
          <>
            <MicOff className="w-4 h-4 mr-2" />
            Stop
          </>
        ) : (
          <>
            <Mic className="w-4 h-4 mr-2" />
            Voice
          </>
        )}
      </Button>
      
      {transcript && (
        <div className="text-xs text-muted-foreground max-w-xs truncate">
          "{transcript}"
        </div>
      )}
    </div>
  );
};