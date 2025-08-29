import React from 'react';
import { useDisplaySettings } from '../../hooks/useDisplaySettings.jsx';
import { Button } from '../ui/button';

const DisplaySettings = () => {
  const { showPlainExplanations, setShowPlainExplanations } = useDisplaySettings();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Display Preferences</h3>
        <p className="text-sm text-muted-foreground">
          Customize how information is displayed in your dashboard
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Plain explanations under KPI terms</h4>
            <p className="text-xs text-muted-foreground">
              Show simple descriptions below professional terms (e.g., "How long your money will last" under "Runway")
            </p>
          </div>
          <Button
            variant={showPlainExplanations ? "default" : "outline"}
            size="sm"
            onClick={() => setShowPlainExplanations(!showPlainExplanations)}
          >
            {showPlainExplanations ? 'On' : 'Off'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DisplaySettings;