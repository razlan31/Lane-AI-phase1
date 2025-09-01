import React, { useState } from "react";
import { Button } from "../ui/button";

/**
 * Venture Cards Flow
 * - Multi-step venture creation
 * - Stage selection, type selection, name/description
 */
const VentureCardsFlow = ({ onCancel, onContinue }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    stage: "",
    type: "",
    name: "",
    description: "",
  });

  const totalSteps = 3;

  const stages = [
    {
      id: "idea",
      title: "Idea Stage",
      description: "Validating concepts and planning",
      icon: "💡",
    },
    {
      id: "mvp",
      title: "MVP/Early",
      description: "Building or testing initial product",
      icon: "⚡",
    },
    {
      id: "growth",
      title: "Growth Stage",
      description: "Scaling operations and revenue",
      icon: "📈",
    },
    {
      id: "established",
      title: "Established",
      description: "Mature business operations",
      icon: "🏢",
    },
  ];

  const types = [
    {
      id: "tech",
      title: "Tech Startup",
      description: "SaaS, app, or tech platform",
      icon: "⚡",
    },
    {
      id: "service",
      title: "Service Business",
      description: "Consulting or professional services",
      icon: "👥",
    },
    {
      id: "ecommerce",
      title: "E-commerce",
      description: "Online or physical product sales",
      icon: "$",
    },
    {
      id: "local",
      title: "Local Business",
      description: "Restaurant, store, or local service",
      icon: "🏪",
    },
    {
      id: "creative",
      title: "Creative/Content",
      description: "Design, media, content creation",
      icon: "🎨",
    },
    {
      id: "other",
      title: "Other",
      description: "Something else",
      icon: "🎯",
    },
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - create venture
      onContinue?.(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onCancel?.();
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.stage;
      case 2:
        return formData.type;
      case 3:
        return formData.name.trim();
      default:
        return false;
    }
  };

  const renderProgressBar = () => (
    <div className="flex gap-2 mb-8">
      {[1, 2, 3].map(step => (
        <div
          key={step}
          className={`flex-1 h-2 rounded-full ${
            step <= currentStep ? "bg-primary" : "bg-muted"
          }`}
        />
      ))}
    </div>
  );

  const renderStageSelection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">
        What stage are you at?
      </h2>
      <div className="space-y-3">
        {stages.map(stage => (
          <button
            key={stage.id}
            onClick={() => updateFormData("stage", stage.id)}
            className={`w-full p-4 rounded-lg border text-left flex items-center gap-4 transition-colors ${
              formData.stage === stage.id
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:bg-muted/50"
            }`}
          >
            <span className="text-2xl">{stage.icon}</span>
            <div>
              <h3 className="font-semibold text-foreground">{stage.title}</h3>
              <p className="text-muted-foreground text-sm">{stage.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderTypeSelection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">
        What type of venture is this?
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {types.map(type => (
          <button
            key={type.id}
            onClick={() => updateFormData("type", type.id)}
            className={`p-4 rounded-lg border text-left transition-colors ${
              formData.type === type.id
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:bg-muted/50"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xl text-primary">{type.icon}</span>
              <h3 className="font-semibold text-foreground">{type.title}</h3>
            </div>
            <p className="text-muted-foreground text-sm">{type.description}</p>
          </button>
        ))}
      </div>
    </div>
  );

  const renderNameForm = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-lg font-medium text-foreground">
          Venture Name
        </label>
        <input
          type="text"
          className="w-full border border-border rounded-lg px-4 py-3 bg-background text-foreground placeholder:text-muted-foreground"
          value={formData.name}
          onChange={(e) => updateFormData("name", e.target.value)}
          placeholder="e.g., Coffee Kiosk, SaaS Platform, etc."
        />
      </div>

      <div className="space-y-3">
        <label className="text-lg font-medium text-foreground">
          Description (Optional)
        </label>
        <textarea
          className="w-full border border-border rounded-lg px-4 py-3 bg-background text-foreground placeholder:text-muted-foreground min-h-[120px] resize-none"
          value={formData.description}
          onChange={(e) => updateFormData("description", e.target.value)}
          placeholder="Brief description of your venture..."
        />
      </div>
    </div>
  );

  return (
    <div className="p-8 space-y-8">
      {renderProgressBar()}

      <div className="min-h-[400px]">
        {currentStep === 1 && renderStageSelection()}
        {currentStep === 2 && renderTypeSelection()}
        {currentStep === 3 && renderNameForm()}
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          className="px-8"
        >
          {currentStep === 1 ? "Cancel" : "Back"}
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          className="px-8"
        >
          {currentStep === totalSteps ? "Create Venture" : "Continue"}
        </Button>
      </div>
    </div>
  );
};

export default VentureCardsFlow;