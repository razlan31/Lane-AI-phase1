import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { PlusCircle, Calculator, DollarSign, TrendingUp, BarChart3 } from 'lucide-react';
import { stockCalculators } from '@/utils/featureGating';

const CalculatorsModal = ({ isOpen, onClose, onSelectCalculator, capabilities }) => {
  const [customName, setCustomName] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);

  const handleStockSelect = (calculator) => {
    onSelectCalculator({ ...calculator, isStock: true });
    onClose();
  };

  const handleCustomCreate = () => {
    if (!customName.trim()) return;
    
    if (!capabilities.worksheets_crud) {
      // Show upgrade modal instead
      onClose();
      return;
    }

    const customCalculator = {
      id: `custom-${Date.now()}`,
      name: customName,
      description: 'Custom calculator',
      category: 'custom',
      schema: {
        fields: [
          { id: 'field1', name: 'Field 1', type: 'number', required: true }
        ]
      },
      sampleData: [],
      isStock: false
    };
    
    onSelectCalculator(customCalculator);
    setCustomName('');
    setShowCustomForm(false);
    onClose();
  };

  const getCategoryIcon = (category) => {
    const icons = {
      financial: DollarSign,
      planning: TrendingUp,
      business: BarChart3,
      custom: Calculator
    };
    return icons[category] || Calculator;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Choose a Calculator</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Stock Templates */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Stock Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stockCalculators.map((calculator) => {
                const Icon = getCategoryIcon(calculator.category);
                return (
                  <Card 
                    key={calculator.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleStockSelect(calculator)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <Icon className="h-6 w-6 text-primary" />
                        <Badge variant="secondary" className="text-xs">
                          {calculator.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-base">{calculator.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {calculator.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Custom Calculator */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Custom Calculator</h3>
            
            {!showCustomForm ? (
              <Card 
                className={`cursor-pointer border-dashed transition-all ${
                  capabilities.worksheets_crud 
                    ? 'hover:shadow-md hover:border-primary' 
                    : 'opacity-60 cursor-not-allowed'
                }`}
                onClick={() => capabilities.worksheets_crud && setShowCustomForm(true)}
              >
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <PlusCircle className="h-12 w-12 text-muted-foreground mb-2" />
                  <CardTitle className="text-base mb-1">Create Custom Calculator</CardTitle>
                  <CardDescription className="text-center">
                    {capabilities.worksheets_crud 
                      ? 'Build your own calculator with custom fields'
                      : 'Upgrade to Pro to create custom calculators'
                    }
                  </CardDescription>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Create Custom Calculator</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="calculator-name">Calculator Name</Label>
                    <Input
                      id="calculator-name"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="Enter calculator name"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCustomCreate} disabled={!customName.trim()}>
                      Create Calculator
                    </Button>
                    <Button variant="outline" onClick={() => setShowCustomForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CalculatorsModal;