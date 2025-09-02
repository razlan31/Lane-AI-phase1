import { useState } from 'react';
import { FileText, BarChart3, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

const NewReportModal = ({ isOpen, onClose, onGenerateReport }) => {
  if (!isOpen) return null;

  const reportTypes = [
    {
      id: 'financial',
      title: 'Financial Summary',
      description: 'Revenue, expenses, cashflow, and profitability analysis',
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      tag: 'Popular'
    },
    {
      id: 'performance',
      title: 'Performance Dashboard',
      description: 'KPI trends, goal tracking, and performance metrics',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      tag: 'Comprehensive'
    },
    {
      id: 'weekly',
      title: 'Weekly Brief',
      description: 'Weekly summary of key metrics and highlights',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      tag: 'Quick'
    },
    {
      id: 'custom',
      title: 'Custom Report',
      description: 'Build a custom report with AI assistance',
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      tag: 'Flexible'
    }
  ];

  const handleGenerateReport = (reportType) => {
    console.log('Generating report:', reportType);
    onGenerateReport?.(reportType);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Generate New Report</CardTitle>
              <CardDescription>Choose the type of report to generate</CardDescription>
            </div>
            <Button variant="ghost" onClick={onClose}>×</Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {reportTypes.map((reportType) => {
              const Icon = reportType.icon;
              return (
                <Card 
                  key={reportType.id}
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary"
                >
                  <CardContent 
                    className="p-4" 
                    onClick={() => handleGenerateReport(reportType)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 ${reportType.bgColor} rounded-lg`}>
                        <Icon className={`h-5 w-5 ${reportType.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{reportType.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {reportType.description}
                        </p>
                        <div className="mt-2">
                          <span className={`text-xs ${reportType.bgColor} ${reportType.color} px-2 py-1 rounded`}>
                            {reportType.tag}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewReportModal;