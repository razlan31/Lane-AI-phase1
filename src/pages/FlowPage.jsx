import React, { useState } from 'react';
import { ArrowLeft, Workflow } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AutoPromotionFlow } from '@/components/flow/AutoPromotionFlow';
import { ScratchpadPanel } from '@/components/scratchpad/ScratchpadPanel';
import { ToolsPanel } from '@/components/tools/ToolsPanel';
import { BlocksBrowser } from '@/components/blocks/BlocksBrowser';
import { PlaygroundCanvas } from '@/components/playground/PlaygroundCanvas';
import { VenturePromoter } from '@/components/venture/VenturePromoter';

export const FlowPage = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState('scratchpad');
  const [showVenturePromoter, setShowVenturePromoter] = useState(false);
  const [promotionData, setPromotionData] = useState(null);

  const handleStepChange = (stepId) => {
    setCurrentStep(stepId);
  };

  const handlePromoteToVenture = (sourceData, sourceType) => {
    setPromotionData({ sourceData, sourceType });
    setShowVenturePromoter(true);
  };

  const stepComponents = {
    scratchpad: (
      <ScratchpadPanel 
        onToolSuggestion={(tool) => {
          setCurrentStep('tools');
        }}
      />
    ),
    tools: (
      <ToolsPanel 
        onBlockSuggestion={(block) => {
          setCurrentStep('blocks');
        }}
      />
    ),
    blocks: (
      <BlocksBrowser 
        onPlaygroundPromotion={() => {
          setCurrentStep('playground');
        }}
      />
    ),
    playground: (
      <PlaygroundCanvas 
        onVenturePromotion={(data) => {
          handlePromoteToVenture(data, 'playground');
        }}
      />
    ),
    venture: (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Ready to Launch!</h2>
        <p className="text-muted-foreground mb-6">
          Your business model is structured and ready to become a full venture.
        </p>
        <Button onClick={() => handlePromoteToVenture(null, 'flow')}>
          Create Venture
        </Button>
      </div>
    )
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Workflow className="h-5 w-5" />
              <h1 className="text-xl font-semibold">Auto-Promotion Flow</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Flow Overview */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="p-4">
              <AutoPromotionFlow
                currentStep={currentStep}
                onStepClick={handleStepChange}
              />
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8">
            <Tabs value={currentStep} onValueChange={setCurrentStep}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="scratchpad">Scratchpad</TabsTrigger>
                <TabsTrigger value="tools">Tools</TabsTrigger>
                <TabsTrigger value="blocks">Blocks</TabsTrigger>
                <TabsTrigger value="playground">Playground</TabsTrigger>
                <TabsTrigger value="venture">Venture</TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="scratchpad" className="mt-0">
                  {stepComponents.scratchpad}
                </TabsContent>
                
                <TabsContent value="tools" className="mt-0">
                  {stepComponents.tools}
                </TabsContent>
                
                <TabsContent value="blocks" className="mt-0">
                  {stepComponents.blocks}
                </TabsContent>
                
                <TabsContent value="playground" className="mt-0">
                  {stepComponents.playground}
                </TabsContent>
                
                <TabsContent value="venture" className="mt-0">
                  {stepComponents.venture}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Venture Promoter Modal */}
      <VenturePromoter
        isOpen={showVenturePromoter}
        onClose={() => setShowVenturePromoter(false)}
        sourceData={promotionData?.sourceData}
        sourceType={promotionData?.sourceType}
      />
    </div>
  );
};