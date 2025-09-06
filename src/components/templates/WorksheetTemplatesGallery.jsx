import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { 
  FileText, 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Target,
  Building2,
  Zap,
  Coffee,
  Truck,
  Smartphone,
  Globe,
  Heart,
  Briefcase,
  Plus,
  Star,
  Download,
  Eye,
  Copy
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { ResponsiveGrid } from '../ui/ResponsiveContainer';

export function WorksheetTemplatesGallery({ isOpen, onClose, onSelectTemplate, className }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const categories = [
    { id: 'all', label: 'All Templates', icon: FileText },
    { id: 'financial', label: 'Financial', icon: DollarSign },
    { id: 'startup', label: 'Startup', icon: Zap },
    { id: 'saas', label: 'SaaS', icon: Globe },
    { id: 'ecommerce', label: 'E-commerce', icon: Smartphone },
    { id: 'service', label: 'Service Business', icon: Briefcase },
    { id: 'restaurant', label: 'Restaurant', icon: Coffee },
    { id: 'retail', label: 'Retail', icon: Building2 },
    { id: 'logistics', label: 'Logistics', icon: Truck },
    { id: 'healthcare', label: 'Healthcare', icon: Heart },
  ];

  const templates = [
    // Financial Templates
    {
      id: 'roi-calculator',
      name: 'ROI Calculator',
      description: 'Calculate return on investment for various scenarios',
      category: 'financial',
      difficulty: 'Beginner',
      estimatedTime: '10 min',
      icon: Calculator,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
      fields: ['initial_investment', 'expected_return', 'time_period', 'risk_factors'],
      formulas: ['roi_percentage', 'annualized_return', 'break_even_time'],
      preview: 'Interactive ROI calculation with scenario analysis',
      tags: ['investment', 'returns', 'analysis'],
      popularity: 95
    },
    {
      id: 'cashflow-projection',
      name: 'Cashflow Projection',
      description: 'Project cash inflows and outflows over time',
      category: 'financial',
      difficulty: 'Intermediate',
      estimatedTime: '20 min',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      fields: ['monthly_revenue', 'operating_expenses', 'capital_expenditure'],
      formulas: ['net_cashflow', 'cumulative_cashflow', 'runway_months'],
      preview: '12-month cashflow forecast with visual charts',
      tags: ['cashflow', 'forecasting', 'planning'],
      popularity: 88
    },
    {
      id: 'break-even-analysis',
      name: 'Break-Even Analysis',
      description: 'Determine the break-even point for your business',
      category: 'financial',
      difficulty: 'Beginner',
      estimatedTime: '15 min',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      fields: ['fixed_costs', 'variable_cost_per_unit', 'selling_price_per_unit'],
      formulas: ['break_even_units', 'break_even_revenue', 'margin_of_safety'],
      preview: 'Visual break-even chart with sensitivity analysis',
      tags: ['break-even', 'profitability', 'planning'],
      popularity: 82
    },

    // Startup Templates
    {
      id: 'startup-financial-model',
      name: 'Startup Financial Model',
      description: 'Comprehensive financial model for early-stage startups',
      category: 'startup',
      difficulty: 'Advanced',
      estimatedTime: '45 min',
      icon: Zap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
      fields: ['user_acquisition', 'revenue_per_user', 'churn_rate', 'burn_rate'],
      formulas: ['mrr_growth', 'ltv_cac_ratio', 'runway_calculation'],
      preview: '5-year startup financial projection with key metrics',
      tags: ['startup', 'growth', 'metrics', 'funding'],
      popularity: 90
    },
    {
      id: 'unit-economics',
      name: 'Unit Economics Calculator',
      description: 'Calculate customer lifetime value and acquisition costs',
      category: 'startup',
      difficulty: 'Intermediate',
      estimatedTime: '25 min',
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950',
      fields: ['customer_acquisition_cost', 'monthly_revenue_per_user', 'churn_rate'],
      formulas: ['lifetime_value', 'ltv_cac_ratio', 'payback_period'],
      preview: 'Unit economics analysis with cohort projections',
      tags: ['unit economics', 'ltv', 'cac', 'retention'],
      popularity: 85
    },

    // SaaS Templates
    {
      id: 'saas-metrics-dashboard',
      name: 'SaaS Metrics Dashboard',
      description: 'Track key SaaS metrics and growth indicators',
      category: 'saas',
      difficulty: 'Intermediate',
      estimatedTime: '30 min',
      icon: Globe,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50 dark:bg-cyan-950',
      fields: ['mrr', 'arr', 'churn_rate', 'expansion_revenue'],
      formulas: ['net_revenue_retention', 'gross_revenue_retention', 'rule_of_40'],
      preview: 'Comprehensive SaaS metrics with benchmarks',
      tags: ['saas', 'mrr', 'arr', 'retention'],
      popularity: 87
    },

    // E-commerce Templates
    {
      id: 'ecommerce-profitability',
      name: 'E-commerce Profitability',
      description: 'Analyze profitability across products and channels',
      category: 'ecommerce',
      difficulty: 'Intermediate',
      estimatedTime: '35 min',
      icon: Smartphone,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-950',
      fields: ['product_cost', 'shipping_cost', 'marketing_spend', 'return_rate'],
      formulas: ['gross_margin', 'net_margin', 'contribution_margin'],
      preview: 'Product profitability analysis with channel breakdown',
      tags: ['ecommerce', 'profitability', 'margins'],
      popularity: 78
    },

    // Service Business Templates
    {
      id: 'service-pricing-model',
      name: 'Service Pricing Model',
      description: 'Optimize pricing for service-based businesses',
      category: 'service',
      difficulty: 'Intermediate',
      estimatedTime: '25 min',
      icon: Briefcase,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50 dark:bg-teal-950',
      fields: ['hourly_rate', 'project_hours', 'overhead_costs', 'profit_margin'],
      formulas: ['project_price', 'effective_hourly_rate', 'capacity_utilization'],
      preview: 'Service pricing optimization with profitability analysis',
      tags: ['services', 'pricing', 'utilization'],
      popularity: 73
    },

    // Restaurant Templates
    {
      id: 'restaurant-economics',
      name: 'Restaurant Economics',
      description: 'Financial planning for restaurant businesses',
      category: 'restaurant',
      difficulty: 'Intermediate',
      estimatedTime: '30 min',
      icon: Coffee,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950',
      fields: ['food_cost_percentage', 'labor_cost_percentage', 'rent', 'average_check'],
      formulas: ['gross_profit_margin', 'prime_cost', 'breakeven_covers'],
      preview: 'Restaurant financial model with industry benchmarks',
      tags: ['restaurant', 'food cost', 'labor cost'],
      popularity: 68
    }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = activeCategory === 'all' || template.category === activeCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    onSelectTemplate?.(template);
    onClose();
  };

  const handlePreviewTemplate = (template, event) => {
    event.stopPropagation();
    setSelectedTemplate(template);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300';
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("max-w-7xl h-[90vh] flex flex-col", className)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Worksheet Templates Gallery
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Choose from professional templates to jumpstart your financial analysis
          </p>
        </DialogHeader>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="flex-1">
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(category.id)}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-3 w-3" />
                  {category.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto">
          <ResponsiveGrid cols={{ xs: 1, md: 2, lg: 3 }} gap="default" className="p-4">
            {filteredTemplates
              .sort((a, b) => b.popularity - a.popularity)
              .map((template, index) => {
                const Icon = template.icon;
                return (
                  <Card 
                    key={template.id}
                    className={cn(
                      "hover-lift cursor-pointer transition-all duration-200 animate-fade-in",
                      selectedTemplate?.id === template.id && "ring-2 ring-primary"
                    )}
                    style={{ animationDelay: `${index * 0.05}s` }}
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className={cn("p-3 rounded-lg", template.bgColor)}>
                          <Icon className={cn("h-6 w-6", template.color)} />
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-muted-foreground">
                            {template.popularity}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <CardDescription className="text-sm line-clamp-2">
                          {template.description}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Template Info */}
                      <div className="flex items-center justify-between text-xs">
                        <Badge className={getDifficultyColor(template.difficulty)}>
                          {template.difficulty}
                        </Badge>
                        <span className="text-muted-foreground">{template.estimatedTime}</span>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {template.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{template.tags.length - 3}
                          </Badge>
                        )}
                      </div>

                      {/* Preview */}
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {template.preview}
                      </p>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleSelectTemplate(template)}
                        >
                          Use Template
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => handlePreviewTemplate(template, e)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(template.name);
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </ResponsiveGrid>

          {filteredTemplates.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No templates found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or category filter
              </p>
              <Button onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        {/* Template Stats */}
        <div className="border-t pt-4 mt-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{filteredTemplates.length} templates available</span>
            <div className="flex gap-4">
              <span>Most Popular: {templates.reduce((max, t) => t.popularity > max.popularity ? t : max, templates[0])?.name}</span>
              <span>Categories: {categories.length - 1}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default WorksheetTemplatesGallery;