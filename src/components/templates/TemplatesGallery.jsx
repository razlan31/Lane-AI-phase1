import { useState } from 'react';
import { FileText, TrendingUp, DollarSign, Users, Settings, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';

const TemplatesGallery = ({ isOpen, onClose, onTemplateSelected }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [useSampleData, setUseSampleData] = useState(true);

  const templates = [
    {
      id: 'freelancer-cashflow',
      title: 'Freelancer Cashflow',
      description: 'Simple cash in / cash out plan for freelancers',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      worksheets: ['Monthly Cashflow', 'Client Revenue Tracker'],
      sampleData: {
        monthlyRevenue: 5000,
        expenses: 2000,
        clients: 3
      }
    },
    {
      id: 'startup-metrics',
      title: 'Startup Metrics Dashboard',
      description: 'KPIs and growth tracking for early-stage startups',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      worksheets: ['Growth Metrics', 'Burn Rate Calculator', 'Runway Tracker'],
      sampleData: {
        monthlyUsers: 1000,
        revenue: 10000,
        burnRate: 15000
      }
    },
    {
      id: 'team-budget',
      title: 'Team Budget Planner',
      description: 'Salary, benefits, and hiring cost management',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      worksheets: ['Salary Budget', 'Hiring Costs', 'Team Growth Plan'],
      sampleData: {
        teamSize: 5,
        averageSalary: 75000,
        hiringBudget: 200000
      }
    },
    {
      id: 'service-business',
      title: 'Service Business Tracker',
      description: 'Project profitability and resource allocation',
      icon: Settings,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      worksheets: ['Project Profitability', 'Time Tracking', 'Client Analysis'],
      sampleData: {
        activeProjects: 8,
        averageProjectValue: 25000,
        utilizationRate: 0.75
      }
    }
  ];

  const handleUseTemplate = () => {
    if (!selectedTemplate || !onTemplateSelected) return;

    const templateData = {
      template: selectedTemplate,
      useSampleData,
      status: 'draft'
    };

    onTemplateSelected(templateData);
    setSelectedTemplate(null);
    setUseSampleData(true);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
          <DialogDescription>
            Select a pre-built template to get started quickly
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => {
              const Icon = template.icon;
              const isSelected = selectedTemplate?.id === template.id;
              
              return (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    isSelected ? 'ring-2 ring-primary shadow-md' : ''
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${template.bgColor}`}>
                          <Icon className={`h-5 w-5 ${template.color}`} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{template.title}</CardTitle>
                          <CardDescription className="text-sm">
                            {template.description}
                          </CardDescription>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Includes:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {template.worksheets.map((worksheet, index) => (
                          <li key={index} className="flex items-center">
                            <FileText className="h-3 w-3 mr-2" />
                            {worksheet}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Template Preview */}
          {selectedTemplate && (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-lg">Preview: {selectedTemplate.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Worksheets:</span>
                    <div className="text-muted-foreground">
                      {selectedTemplate.worksheets.length} included
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Type:</span>
                    <div className="text-muted-foreground">
                      {selectedTemplate.title.split(' ')[0]} focused
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <div className="text-muted-foreground">
                      Draft (can edit)
                    </div>
                  </div>
                </div>

                {useSampleData && selectedTemplate.sampleData && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-2">Sample data preview:</p>
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      {Object.entries(selectedTemplate.sampleData).map(([key, value]) => (
                        <div key={key}>
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                          <div className="font-medium">
                            {typeof value === 'number' && key.includes('Revenue') || key.includes('Budget') || key.includes('Salary') 
                              ? `$${value.toLocaleString()}` 
                              : value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="sample-data" 
                    checked={useSampleData}
                    onCheckedChange={setUseSampleData}
                  />
                  <label htmlFor="sample-data" className="text-sm">
                    Include sample data for demonstration
                  </label>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleUseTemplate}
              disabled={!selectedTemplate}
            >
              Use Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplatesGallery;