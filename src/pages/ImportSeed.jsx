import React from 'react';
import { FileSpreadsheet, Download, Upload, Database, BarChart3, Calculator } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import TemplateChooser from '../components/templates/TemplateChooser';
import { worksheetTemplates } from '../components/templates/WorksheetTemplates';

const ImportSeed = () => {
  const [isTemplateChooserOpen, setIsTemplateChooserOpen] = React.useState(false);

  const handleSelectTemplate = (template) => {
    console.log('Selected template:', template);
    // Here you would create a worksheet from the template
    // In real implementation, this would navigate to the worksheet renderer
  };

  const quickActions = [
    {
      title: 'Import CSV',
      description: 'Upload existing spreadsheets',
      icon: Upload,
      action: () => console.log('Import CSV'),
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Connect Database',
      description: 'Sync data from external sources',
      icon: Database,
      action: () => console.log('Connect database'),
      color: 'bg-green-50 text-green-600'
    },
    {
      title: 'Export Templates',
      description: 'Download worksheet templates',
      icon: Download,
      action: () => console.log('Export templates'),
      color: 'bg-purple-50 text-purple-600'
    }
  ];

  const featuredTemplates = worksheetTemplates.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Import & Seed</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Start with templates or import existing data
              </p>
            </div>
            <Button onClick={() => setIsTemplateChooserOpen(true)}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Browse All Templates
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-6 space-y-8">
        {/* Quick Actions */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4" onClick={action.action}>
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${action.color}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{action.title}</h3>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Featured Templates */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Featured Templates</h2>
            <Button 
              variant="outline" 
              onClick={() => setIsTemplateChooserOpen(true)}
            >
              View All
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredTemplates.map((template) => {
              const getIcon = (category) => {
                switch (category) {
                  case 'Financial': return BarChart3;
                  case 'Marketing': return Calculator;
                  default: return FileSpreadsheet;
                }
              };
              const IconComponent = getIcon(template.category);
              
              return (
                <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{template.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent onClick={() => handleSelectTemplate(template)}>
                    <CardDescription className="mb-3">
                      {template.description}
                    </CardDescription>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-primary">{template.category}</span>
                      <span className="text-muted-foreground">{template.estimatedTime}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Getting Started */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                New to LaneAI worksheets? Here's how to get the most out of templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="font-semibold">1. Choose a Template</h4>
                  <p className="text-sm text-muted-foreground">
                    Pick from our curated collection of business worksheets
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">2. Customize Your Data</h4>
                  <p className="text-sm text-muted-foreground">
                    Edit assumptions and inputs to match your business
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">3. Save as Draft</h4>
                  <p className="text-sm text-muted-foreground">
                    Work on your worksheet in draft mode until ready
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">4. Promote to Live</h4>
                  <p className="text-sm text-muted-foreground">
                    Make it live to track in your dashboard
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Template Chooser Modal */}
      <TemplateChooser
        isOpen={isTemplateChooserOpen}
        onClose={() => setIsTemplateChooserOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  );
};

export default ImportSeed;