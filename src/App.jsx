import React, { useState, useEffect } from 'react';
import { TooltipProvider } from './components/ui/tooltip';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simple loading delay to test basic rendering
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-4">Loading LaneAI...</div>
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-center mb-8">LaneAI - Phase 1</h1>
          <div className="text-center">
            <p className="text-lg text-muted-foreground mb-4">
              App is loading... If you see this, the basic React structure is working.
            </p>
            <div className="bg-card border border-border rounded-lg p-6 max-w-md mx-auto">
              <h2 className="text-xl font-semibold mb-4">Test Components</h2>
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90">
                Test Button
              </button>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default App;