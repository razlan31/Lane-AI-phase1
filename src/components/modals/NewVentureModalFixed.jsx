import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Zap, Rocket, Target } from 'lucide-react';
import { toast } from 'sonner';

const NewVentureModalFixed = ({ isOpen, onClose, onCreateVenture }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    stage: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ventureTypes = [
    { id: 'saas', name: 'SaaS', description: 'Software as a Service', icon: Rocket },
    { id: 'ecommerce', name: 'E-commerce', description: 'Online retail business', icon: Building2 },
    { id: 'service', name: 'Service Business', description: 'Professional services', icon: Target },
    { id: 'marketplace', name: 'Marketplace', description: 'Platform connecting buyers/sellers', icon: Zap }
  ];

  const stages = [
    { id: 'idea', name: 'Idea Stage', description: 'Concept development' },
    { id: 'mvp', name: 'MVP', description: 'Minimum viable product' },
    { id: 'growth', name: 'Growth', description: 'Scaling the business' },
    { id: 'mature', name: 'Mature', description: 'Established business' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter a venture name');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create the venture data
      const ventureData = {
        id: Date.now(), // Simple ID for demo
        name: formData.name,
        description: formData.description || `A ${formData.type || 'new'} venture`,
        type: formData.type,
        stage: formData.stage,
        status: formData.stage ? 'active' : 'draft',
        runway: 12,
        cashflow: -1500,
        revenue: 5000,
        burnRate: 2500,
        created_at: new Date()
      };

      // Simulate creation delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Call the parent's create function
      if (onCreateVenture) {
        onCreateVenture(ventureData);
      }
      
      toast.success(`${formData.name} venture created successfully!`);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        type: '',
        stage: ''
      });
      
      onClose();
    } catch (error) {
      toast.error('Failed to create venture');
      console.error('Error creating venture:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickCreate = (type) => {
    const quickVentures = {
      saas: {
        name: 'My SaaS Startup',
        description: 'Building innovative software solutions',
        type: 'saas',
        stage: 'mvp'
      },
      ecommerce: {
        name: 'My Online Store',
        description: 'Selling products online',
        type: 'ecommerce',
        stage: 'idea'
      },
      service: {
        name: 'My Consulting Business',
        description: 'Providing professional services',
        type: 'service',
        stage: 'growth'
      },
      marketplace: {
        name: 'My Marketplace Platform',
        description: 'Connecting buyers and sellers',
        type: 'marketplace',
        stage: 'idea'
      }
    };

    const ventureTemplate = quickVentures[type];
    if (ventureTemplate) {
      setFormData(ventureTemplate);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Create New Venture
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Venture Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your venture name"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of your venture"
                className="mt-1"
              />
            </div>
          </div>

          {/* Quick Templates */}
          <div>
            <label className="text-sm font-medium mb-3 block">Quick Start Templates</label>
            <div className="grid grid-cols-2 gap-3">
              {ventureTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <Button
                    key={type.id}
                    type="button"
                    variant="outline"
                    onClick={() => handleQuickCreate(type.id)}
                    className="h-auto p-3 justify-start"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    <div className="text-left">
                      <div className="font-medium text-xs">{type.name}</div>
                      <div className="text-xs text-muted-foreground">{type.description}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Venture Type */}
          <div>
            <label className="text-sm font-medium mb-3 block">Venture Type</label>
            <div className="grid grid-cols-2 gap-2">
              {ventureTypes.map((type) => (
                <Button
                  key={type.id}
                  type="button"
                  variant={formData.type === type.id ? "default" : "outline"}
                  onClick={() => handleInputChange('type', type.id)}
                  className="h-8 text-xs"
                >
                  {type.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Stage */}
          <div>
            <label className="text-sm font-medium mb-3 block">Current Stage</label>
            <div className="grid grid-cols-2 gap-2">
              {stages.map((stage) => (
                <Button
                  key={stage.id}
                  type="button"
                  variant={formData.stage === stage.id ? "default" : "outline"}
                  onClick={() => handleInputChange('stage', stage.id)}
                  className="h-8 text-xs"
                >
                  {stage.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {formData.name && (
            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Preview</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <div className="font-medium">{formData.name}</div>
                {formData.description && (
                  <div className="text-muted-foreground text-xs mt-1">{formData.description}</div>
                )}
                <div className="flex gap-2 mt-2">
                  {formData.type && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {ventureTypes.find(t => t.id === formData.type)?.name}
                    </span>
                  )}
                  {formData.stage && (
                    <span className="text-xs bg-secondary/10 text-secondary-foreground px-2 py-1 rounded">
                      {stages.find(s => s.id === formData.stage)?.name}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.name.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Venture'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewVentureModalFixed;