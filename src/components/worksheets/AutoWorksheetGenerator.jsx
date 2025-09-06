import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Sparkles, Edit3, Eye, TrendingUp } from 'lucide-react';
import { DataSourceIndicator, DataSourceLegend } from './DataSourceIndicator';
import { useWorksheets } from '../../hooks/useWorksheets';
import ExcelLikeWorksheet from './ExcelLikeWorksheet';

export const AutoWorksheetGenerator = ({ ventureId, ventureName, ventureType }) => {
  const { worksheets, loading } = useWorksheets(ventureId);
  const [expandedWorksheet, setExpandedWorksheet] = useState(null);
  const [openWorksheet, setOpenWorksheet] = useState(null);

  console.log('📊 AutoWorksheetGenerator state:', { 
    ventureId, 
    worksheetsCount: worksheets?.length || 0, 
    loading,
    worksheets: worksheets?.map(w => ({ id: w.id, type: w.type })) || []
  });

  const getWorksheetIcon = (type) => {
    const icons = {
      'unit-economics': '💰',
      'cashflow': '📊',
      'location-performance': '📍',
      'customer-acquisition': '🎯',
      'seasonal-planning': '📅',
      'breakeven-analysis': '⚖️',
      'channel-performance': '📈',
      'inventory-planning': '📦',
      'market-expansion': '🌍',
      'product-performance': '🛍️',
      'project-profitability': '💼',
      'client-lifetime-value': '👤',
      'capacity-planning': '⏰',
      'pricing-strategy': '💵',
      'saas-metrics': '📱',
      'user-acquisition': '🚀',
      'product-market-fit': '🎯',
      'funding-requirements': '💸',
      'growth-projections': '📈',
      'feature-impact': '⚡'
    };
    return icons[type] || '📋';
  };

  const getWorksheetTitle = (type) => {
    const titles = {
      'unit-economics': 'Unit Economics Analysis',
      'cashflow': 'Cash Flow Management', 
      'location-performance': 'Location Performance',
      'customer-acquisition': 'Customer Acquisition',
      'seasonal-planning': 'Seasonal Planning',
      'breakeven-analysis': 'Break-even Analysis',
      'channel-performance': 'Marketing Channel Performance',
      'inventory-planning': 'Inventory Planning',
      'market-expansion': 'Market Expansion Strategy',
      'product-performance': 'Product Performance',
      'project-profitability': 'Project Profitability',
      'client-lifetime-value': 'Client Lifetime Value',
      'capacity-planning': 'Capacity Planning',
      'pricing-strategy': 'Pricing Strategy',
      'saas-metrics': 'SaaS Metrics Dashboard',
      'user-acquisition': 'User Acquisition Funnel',
      'product-market-fit': 'Product-Market Fit Analysis',
      'funding-requirements': 'Funding Requirements',
      'growth-projections': 'Growth Projections',
      'feature-impact': 'Feature Impact Analysis'
    };
    return titles[type] || type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          <h3 className="text-lg font-medium">Auto-Generated Worksheets</h3>
        </div>
        <div className="grid gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Auto-Generated Worksheets</h3>
          <Badge variant="secondary" className="ml-2">
            {worksheets.length} worksheets
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          AI-powered worksheets you didn't know you needed
        </p>
      </div>

      <DataSourceLegend />

      <div className="grid gap-4">
        {worksheets.map((worksheet) => (
          <Card 
            key={worksheet.id} 
            className="border-l-4 border-l-primary/30 hover:shadow-md transition-shadow"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getWorksheetIcon(worksheet.type)}</span>
                  <div>
                    <CardTitle className="text-base">
                      {getWorksheetTitle(worksheet.type)}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <DataSourceIndicator confidence={worksheet.confidence_level} size="sm" />
                      <span className="text-xs text-muted-foreground">
                        Based on {ventureName} data
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setExpandedWorksheet(
                      expandedWorksheet === worksheet.id ? null : worksheet.id
                    )}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {expandedWorksheet === worksheet.id ? 'Hide' : 'Preview'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setOpenWorksheet(worksheet)}
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    Open in Spreadsheet
                  </Button>
                </div>
              </div>
            </CardHeader>

            {expandedWorksheet === worksheet.id && (
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium mb-2 text-muted-foreground">Key Inputs</h5>
                    <div className="space-y-1">
                      {(() => {
                        const inputs = worksheet.inputs || {};
                        // Normalize various shapes into [label, value] pairs
                        let pairs = [];
                        if (Array.isArray(inputs)) {
                          pairs = inputs.slice(0, 4).map(f => [f.label || f.id, f.value]);
                        } else if (Array.isArray(inputs.fields)) {
                          pairs = inputs.fields.slice(0, 4).map(f => [f.label || f.id, f.value]);
                        } else {
                          pairs = Object.entries(inputs).slice(0, 4).map(([k, v]) => [k.replace(/_/g, ' '), (v && typeof v === 'object' && 'value' in v) ? v.value : v]);
                        }
                        return pairs.map(([label, val]) => (
                          <div key={label} className="flex justify-between text-sm">
                            <span className="capitalize">{label}</span>
                            <span className="font-medium">{typeof val === 'number' ? (val > 1000 ? val.toLocaleString() : val) : String(val ?? '')}</span>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium mb-2 text-muted-foreground">Key Outputs</h5>
                    <div className="space-y-1">
                      {Object.entries(worksheet.outputs || {}).slice(0, 4).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                          <span className="font-medium text-primary">
                            {typeof value === 'number' ? 
                              (value > 1000 ? value.toLocaleString() : value) : 
                              value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-muted/50 rounded-md">
                  <div className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-primary mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-foreground mb-1">Why this worksheet matters:</p>
                      <p className="text-muted-foreground">
                        {getWorksheetInsight(worksheet.type, ventureType)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {worksheets.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Auto-Generated Worksheets Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add more KPIs and data to unlock intelligent worksheet generation
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Excel-like Worksheet Modal */}
      {openWorksheet && (
        <ExcelLikeWorksheet
          worksheet={openWorksheet}
          ventureId={ventureId}
          onClose={() => setOpenWorksheet(null)}
        />
      )}
    </div>
  );
};

const getWorksheetInsight = (type, ventureType) => {
  const insights = {
    'unit-economics': 'Understand your true cost per customer and profit margins. Critical for pricing decisions.',
    'cashflow': 'Track money flow to avoid cash crunches. Essential for operational planning.',
    'location-performance': 'Optimize your location strategy and understand peak performance drivers.',
    'customer-acquisition': 'Identify your most cost-effective customer acquisition channels.',
    'seasonal-planning': 'Plan for seasonal variations in your business to maximize revenue.',
    'breakeven-analysis': 'Know exactly how many customers you need to break even.',
    'channel-performance': 'Discover which marketing channels give you the best ROI.',
    'inventory-planning': 'Optimize inventory levels to reduce carrying costs while avoiding stockouts.',
    'market-expansion': 'Evaluate new market opportunities and their potential returns.',
    'product-performance': 'Identify your most profitable products and portfolio optimization opportunities.',
    'project-profitability': 'Understand which types of projects generate the most profit for your time.',
    'client-lifetime-value': 'Know the true value of your clients and focus retention efforts.',
    'capacity-planning': 'Optimize your workload and identify when to hire or scale.',
    'pricing-strategy': 'Ensure your pricing captures maximum value while staying competitive.',
    'saas-metrics': 'Track the key metrics that determine SaaS business health and growth potential.',
    'user-acquisition': 'Optimize your user acquisition funnel for better conversion and lower costs.',
    'product-market-fit': 'Measure how well your product satisfies market demand.',
    'funding-requirements': 'Plan your funding needs and runway to achieve key milestones.',
    'growth-projections': 'Model different growth scenarios and their resource requirements.',
    'feature-impact': 'Evaluate the ROI of new features before investing development resources.'
  };
  
  return (
    <div className="space-y-6">
      {/* ... existing JSX content here ... */}
      
      {/* Excel-like Worksheet Modal */}
      {openWorksheet && (
        <ExcelLikeWorksheet
          worksheet={openWorksheet}
          ventureId={ventureId}
          onClose={() => setOpenWorksheet(null)}
        />
      )}
    </div>
  );
};

// Helper function to get insight descriptions  
const getInsightDescription = (type) => {
  const insights = {
    'unit-economics': 'Understand the fundamental economics of each customer or sale.',
    'cashflow': 'Monitor cash inflows and outflows to maintain healthy liquidity.',
    'location-performance': 'Compare performance across different locations to optimize operations.',
    'customer-acquisition': 'Track the cost and effectiveness of acquiring new customers.',
    'seasonal-planning': 'Prepare for seasonal fluctuations in demand and revenue.',
    'breakeven-analysis': 'Determine the minimum sales needed to cover all costs.',
    'channel-performance': 'Evaluate which marketing channels provide the best ROI.',
    'inventory-planning': 'Optimize inventory levels to reduce costs and avoid stockouts.',
    'market-expansion': 'Assess opportunities and risks of entering new markets.',
    'product-performance': 'Track which products drive the most revenue and profit.',
    'project-profitability': 'Understand which types of projects generate the most profit for your time.',
    'client-lifetime-value': 'Know the true value of your clients and focus retention efforts.',
    'capacity-planning': 'Optimize your workload and identify when to hire or scale.',
    'pricing-strategy': 'Ensure your pricing captures maximum value while staying competitive.',
    'saas-metrics': 'Track the key metrics that determine SaaS business health and growth potential.',
    'user-acquisition': 'Optimize your user acquisition funnel for better conversion and lower costs.',
    'product-market-fit': 'Measure how well your product satisfies market demand.',
    'funding-requirements': 'Plan your funding needs and runway to achieve key milestones.',
    'growth-projections': 'Model different growth scenarios and their resource requirements.',
    'feature-impact': 'Evaluate the ROI of new features before investing development resources.'
  };
  
  return insights[type] || 'This worksheet provides valuable insights for your business operations.';
};