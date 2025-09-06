import { useState } from 'react';
import EnhancedOnboardingWelcome from './onboarding/EnhancedOnboardingWelcome';
import OnboardingFlow from './onboarding/OnboardingFlow';

export default function Onboarding({ onComplete }) {
  const [showWelcome, setShowWelcome] = useState(true);

  if (showWelcome) {
    return (
      <EnhancedOnboardingWelcome
        onStart={() => setShowWelcome(false)}
        onSkip={onComplete}
      />
    );
  }

  return <OnboardingFlow onComplete={onComplete} />;
}
