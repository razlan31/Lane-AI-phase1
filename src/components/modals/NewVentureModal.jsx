import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Building2, Zap, DollarSign, Users, Brain, Target, TrendingUp, Clock } from 'lucide-react';

const NewVentureModal = ({ isOpen, onClose, onCreateVenture }) => {
  const [step, setStep] = useState(0);
  const [ventureData, setVentureData] = useState({
    name: '',
    type: '',
    stage: '',
    description: ''
  });

  const ventureTypes = [
    { id: 'tech_startup', label: 'Tech Startup', icon: Zap, description: 'SaaS, app, or tech platform' },
    { id: 'service_business', label: 'Service Business', icon: Users, description: 'Consulting or professional services' },
    { id: 'ecommerce', label: 'E-commerce', icon: DollarSign, description: 'Online or physical product sales' },
    { id: 'local_business', label: 'Local Business', icon: Building2, description: 'Restaurant, store, or local service' },
    { id: 'creative', label: 'Creative/Content', icon: Brain, description: 'Design, media, content creation' },
    { id: 'other', label: 'Other', icon: Target, description: 'Something else' }
  ];

  const stages = [
    { id: 'idea', label: 'Idea Stage', icon: Brain, description: 'Validating concepts and planning' },
    { id: 'mvp', label: 'MVP/Early', icon: Zap, description: 'Building or testing initial product' },
    { id: 'growth', label: 'Growth Stage', icon: TrendingUp, description: 'Scaling operations and revenue' },
    { id: 'established', label: 'Established', icon: Building2, description: 'Mature business operations' }
  ];

  const handleCreate = () => {
    // Generate starter KPIs and worksheets based on venture type
    const generatedKpis = generateStarterKpis(ventureData.type, ventureData.stage);
    const generatedWorksheets = generateStarterWorksheets(ventureData.type);
    
    const newVenture = {
      id: `venture-${Date.now()}`,
      name: ventureData.name,
      type: ventureData.type,
      stage: ventureData.stage,
      description: ventureData.description,
      createdAt: new Date(),
      kpis: generatedKpis,
      worksheets: generatedWorksheets,
      // Seed with realistic mock data
      runway: Math.floor(Math.random() * 15) + 6, // 6-20 months
      cashflow: (Math.random() - 0.7) * 20000, // Usually negative for startups
      revenue: Math.floor(Math.random() * 50000),
      burnRate: Math.floor(Math.random() * 15000) + 5000
    };

    onCreateVenture(newVenture);
    onClose();
    resetModal();
  };

  const generateStarterKpis = (type, stage) => {
    const baseKpis = [
      { name: 'Runway', value: Math.floor(Math.random() * 15) + 6, unit: 'months' },
      { name: 'Monthly Cashflow', value: (Math.random() - 0.7) * 20000, unit: 'currency' },
      { name: 'Burn Rate', value: Math.floor(Math.random() * 15000) + 5000, unit: 'currency' }
    ];

    const typeKpis = {
      tech_startup: [
        { name: 'Monthly Recurring Revenue', value: Math.floor(Math.random() * 20000), unit: 'currency' },
        { name: 'Customer Acquisition Cost', value: Math.floor(Math.random() * 500) + 50, unit: 'currency' },
        { name: 'Churn Rate', value: Math.random() * 10, unit: 'percentage' }
      ],
      service_business: [
        { name: 'Client Pipeline', value: Math.floor(Math.random() * 20) + 5, unit: 'number' },
        { name: 'Utilization Rate', value: Math.random() * 30 + 60, unit: 'percentage' },
        { name: 'Average Project Value', value: Math.floor(Math.random() * 10000) + 2000, unit: 'currency' }
      ],
      ecommerce: [
        { name: 'Conversion Rate', value: Math.random() * 5 + 1, unit: 'percentage' },
        { name: 'Average Order Value', value: Math.floor(Math.random() * 200) + 50, unit: 'currency' },
        { name: 'Inventory Turnover', value: Math.random() * 8 + 2, unit: 'number' }
      ]
    };

    return [...baseKpis, ...(typeKpis[type] || [])];
  };

  const generateStarterWorksheets = (type) => {
    const baseWorksheets = [
      { name: 'Monthly Cashflow', type: 'financial', template: 'cashflow' },
      { name: 'Expense Tracker', type: 'financial', template: 'expenses' },
      { name: 'Break-even Analysis', type: 'analysis', template: 'breakeven' }
    ];

    const typeWorksheets = {
      tech_startup: [
        { name: 'SaaS Metrics', type: 'kpi', template: 'saas_metrics' },
        { name: 'Customer Acquisition', type: 'analysis', template: 'cac_ltv' }
      ],
      service_business: [
        { name: 'Project Pipeline', type: 'tracking', template: 'project_pipeline' },
        { name: 'Hourly Rate Calculator', type: 'calculator', template: 'hourly_rate' }
      ],
      ecommerce: [
        { name: 'Inventory Management', type: 'tracking', template: 'inventory' },
        { name: 'Sales Funnel', type: 'analysis', template: 'sales_funnel' }
      ]
    };

    return [...baseWorksheets, ...(typeWorksheets[type] || [])];
  };

  const resetModal = () => {
    setStep(0);
    setVentureData({ name: '', type: '', stage: '', description: '' });
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Venture Name</label>
              <input
                type="text"
                value={ventureData.name}
                onChange={(e) => setVentureData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Coffee Kiosk, SaaS Platform, etc."
                className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
              <textarea
                value={ventureData.description}
                onChange={(e) => setVentureData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of your venture..."
                className="w-full p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                rows="3"
              />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">What type of venture is this?</h3>
            <div className="grid grid-cols-2 gap-3">
              {ventureTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <Card
                    key={type.id}
                    className={`p-3 cursor-pointer hover:shadow-md transition-all border-2 ${
                      ventureData.type === type.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                    }`}
                    onClick={() => setVentureData(prev => ({ ...prev, type: type.id }))}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">{type.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">What stage are you at?</h3>
            <div className="grid grid-cols-1 gap-3">
              {stages.map((stage) => {
                const Icon = stage.icon;
                return (
                  <Card
                    key={stage.id}
                    className={`p-3 cursor-pointer hover:shadow-md transition-all border-2 ${
                      ventureData.stage === stage.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                    }`}
                    onClick={() => setVentureData(prev => ({ ...prev, stage: stage.id }))}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">{stage.label}</div>
                        <div className="text-sm text-muted-foreground">{stage.description}</div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const canContinue = () => {
    switch (step) {
      case 0: return ventureData.name.trim();
      case 1: return ventureData.type;
      case 2: return ventureData.stage;
      default: return false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Venture</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Progress */}
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full ${
                  i <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {renderStep()}

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => step > 0 ? setStep(step - 1) : onClose()}
            >
              {step > 0 ? 'Back' : 'Cancel'}
            </Button>
            <Button
              onClick={() => step < 2 ? setStep(step + 1) : handleCreate()}
              disabled={!canContinue()}
            >
              {step < 2 ? 'Continue' : 'Create Venture'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewVentureModal;