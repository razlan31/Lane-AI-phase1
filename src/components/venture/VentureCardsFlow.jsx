import React, { useState } from "react";
import { Button } from "../ui/button";

/**
 * Venture Cards Flow
 * - Form-based venture creation
 * - Name and description inputs
 * - Cancel/Continue actions
 */
const VentureCardsFlow = ({ onCancel, onContinue }) => {
  const [ventureName, setVentureName] = useState("");
  const [description, setDescription] = useState("");

  const handleContinue = () => {
    if (!ventureName.trim()) return;
    
    const ventureData = {
      name: ventureName.trim(),
      description: description.trim() || undefined,
    };
    
    onContinue?.(ventureData);
  };

  return (
    <div className="p-8 space-y-8">
      {/* Progress Indicator */}
      <div className="w-full bg-muted rounded-full h-2">
        <div className="bg-primary h-2 rounded-full" style={{ width: "33%" }}></div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        <div className="space-y-3">
          <label className="text-lg font-medium text-foreground">
            Venture Name
          </label>
          <input
            type="text"
            className="w-full border border-border rounded-lg px-4 py-3 bg-background text-foreground placeholder:text-muted-foreground"
            value={ventureName}
            onChange={(e) => setVentureName(e.target.value)}
            placeholder="e.g., Coffee Kiosk, SaaS Platform, etc."
          />
        </div>

        <div className="space-y-3">
          <label className="text-lg font-medium text-foreground">
            Description (Optional)
          </label>
          <textarea
            className="w-full border border-border rounded-lg px-4 py-3 bg-background text-foreground placeholder:text-muted-foreground min-h-[120px] resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of your venture..."
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onCancel}
          className="px-8"
        >
          Cancel
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!ventureName.trim()}
          className="px-8"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default VentureCardsFlow;