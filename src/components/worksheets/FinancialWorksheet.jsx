import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWorksheets } from '@/hooks/useWorksheets';
import { useToast } from '@/hooks/use-toast';
import { financialEngine } from '@/utils/financialEngine';
import { Calculator, TrendingUp, DollarSign, BarChart3 } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

const FinancialWorksheet = ({ ventureId, type = 'roi', initialData }) => {
  const [inputs, setInputs] = useState(initialData?.inputs || {});
  const [outputs, setOutputs] = useState(initialData?.outputs || null);
  const [worksheetId, setWorksheetId] = useState(initialData?.id || null);
  const { createWorksheet, updateWorksheet, calculating } = useWorksheets(ventureId);
  const { toast } = useToast();

  // Debounced inputs for auto-save
  const debouncedInputs = useDebounce(inputs, 1000);

  // Auto-calculate when inputs change
  useEffect(() => {
    if (Object.keys(inputs).length > 0) {
      calculateOutputs();
    }
  }, [inputs]);

  // Auto-save when debounced inputs change
  useEffect(() => {
    if (worksheetId && Object.keys(debouncedInputs).length > 0) {
      autoSaveWorksheet();
    }
  }, [debouncedInputs]);

  const calculateOutputs = useCallback(() => {
    const validation = financialEngine.validateInputs(type, inputs);
    if (!validation.valid) {
      setOutputs(null);
      return;
    }

    const results = financialEngine.calculate(type, inputs);
    if (results.error) {
      toast({
        title: "Calculation Error",
        description: results.error,
        variant: "destructive"
      });
      setOutputs(null);
    } else {
      setOutputs(results);
    }
  }, [inputs, type, toast]);

  const autoSaveWorksheet = async () => {
    try {
      const worksheetData = {
        type,
        inputs: debouncedInputs,
        outputs,
        confidence_level: outputs ? 'calculated' : 'draft'
      };

      if (worksheetId) {
        await updateWorksheet(worksheetId, worksheetData);
      } else {
        const result = await createWorksheet(worksheetData);
        if (result.success) {
          setWorksheetId(result.data.id);
        }
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const renderInputFields = () => {
    const fieldConfigs = {
      roi: [
        { key: 'initialInvestment', label: 'Initial Investment ($)', type: 'number', placeholder: '100000' },
        { key: 'totalRevenue', label: 'Annual Revenue ($)', type: 'number', placeholder: '200000' },
        { key: 'totalCosts', label: 'Annual Costs ($)', type: 'number', placeholder: '150000' },
        { key: 'timeFrame', label: 'Time Frame (years)', type: 'number', placeholder: '3', min: 1, max: 10 },
        { key: 'growthRate', label: 'Annual Growth Rate (%)', type: 'number', placeholder: '10', step: 0.1 }
      ],
      cashflow: [
        { key: 'monthlyRevenue', label: 'Monthly Revenue ($)', type: 'number', placeholder: '25000' },
        { key: 'monthlyExpenses', label: 'Monthly Expenses ($)', type: 'number', placeholder: '20000' },
        { key: 'months', label: 'Forecast Period (months)', type: 'number', placeholder: '12', min: 1, max: 60 },
        { key: 'growthRate', label: 'Monthly Growth Rate (%)', type: 'number', placeholder: '2', step: 0.1 }
      ],
      breakeven: [
        { key: 'fixedCosts', label: 'Fixed Costs ($)', type: 'number', placeholder: '10000' },
        { key: 'variableCostPerUnit', label: 'Variable Cost per Unit ($)', type: 'number', placeholder: '15' },
        { key: 'pricePerUnit', label: 'Price per Unit ($)', type: 'number', placeholder: '25' },
        { key: 'targetProfit', label: 'Target Profit ($)', type: 'number', placeholder: '0' }
      ],
      unitEconomics: [
        { key: 'revenuePerUnit', label: 'Revenue per Unit ($)', type: 'number', placeholder: '100' },
        { key: 'costPerUnit', label: 'Cost per Unit ($)', type: 'number', placeholder: '60' },
        { key: 'acquisitionCost', label: 'Customer Acquisition Cost ($)', type: 'number', placeholder: '50' },
        { key: 'retentionRate', label: 'Customer Retention Rate', type: 'number', placeholder: '0.8', step: 0.01, min: 0, max: 1 },
        { key: 'averageLifetime', label: 'Average Customer Lifetime (months)', type: 'number', placeholder: '24' }
      ]
    };

    const fields = fieldConfigs[type] || [];

    return (
      <div className="grid md:grid-cols-2 gap-4">
        {fields.map(field => (
          <div key={field.key}>
            <Label htmlFor={field.key}>{field.label}</Label>
            <Input
              id={field.key}
              type={field.type}
              placeholder={field.placeholder}
              value={inputs[field.key] || ''}
              onChange={(e) => handleInputChange(field.key, e.target.value)}
              min={field.min}
              max={field.max}
              step={field.step}
            />
          </div>
        ))}
      </div>
    );
  };

  const renderOutputs = () => {
    if (!outputs) return null;

    const formatCurrency = (value) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    };

    const formatPercent = (value) => {
      return `${value}%`;
    };

    switch (type) {
      case 'roi':
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{formatPercent(outputs.roi)}</div>
                <div className="text-sm text-muted-foreground">Total ROI</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{formatCurrency(outputs.netProfit)}</div>
                <div className="text-sm text-muted-foreground">Net Profit</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{outputs.paybackPeriod}</div>
                <div className="text-sm text-muted-foreground">Years to Payback</div>
              </div>
            </div>

            {outputs.yearlyBreakdown && (
              <div className="overflow-x-auto">
                <h4 className="font-medium mb-2">Yearly Breakdown</h4>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Year</th>
                      <th className="text-right p-2">Revenue</th>
                      <th className="text-right p-2">Costs</th>
                      <th className="text-right p-2">Profit</th>
                      <th className="text-right p-2">Cumulative</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outputs.yearlyBreakdown.map((year) => (
                      <tr key={year.year} className="border-b">
                        <td className="p-2">{year.year}</td>
                        <td className="text-right p-2">{formatCurrency(year.revenue)}</td>
                        <td className="text-right p-2">{formatCurrency(year.costs)}</td>
                        <td className="text-right p-2">{formatCurrency(year.profit)}</td>
                        <td className="text-right p-2">{formatCurrency(year.cumulativeProfit)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case 'cashflow':
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{formatCurrency(outputs.totalCashflow)}</div>
                <div className="text-sm text-muted-foreground">Total Cashflow</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{formatCurrency(outputs.averageMonthlyCashflow)}</div>
                <div className="text-sm text-muted-foreground">Avg Monthly</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{outputs.positiveMonths}</div>
                <div className="text-sm text-muted-foreground">Positive Months</div>
              </div>
            </div>

            {outputs.monthlyBreakdown && (
              <div className="overflow-x-auto max-h-64">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-background">
                    <tr className="border-b">
                      <th className="text-left p-2">Month</th>
                      <th className="text-right p-2">Revenue</th>
                      <th className="text-right p-2">Expenses</th>
                      <th className="text-right p-2">Cashflow</th>
                      <th className="text-right p-2">Cumulative</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outputs.monthlyBreakdown.map((month) => (
                      <tr key={month.month} className="border-b">
                        <td className="p-2">{month.month}</td>
                        <td className="text-right p-2">{formatCurrency(month.revenue)}</td>
                        <td className="text-right p-2">{formatCurrency(month.expenses)}</td>
                        <td className={`text-right p-2 ${month.cashflow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(month.cashflow)}
                        </td>
                        <td className={`text-right p-2 ${month.cumulativeCashflow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(month.cumulativeCashflow)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case 'breakeven':
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{outputs.breakEvenUnits}</div>
                <div className="text-sm text-muted-foreground">Break-even Units</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{formatCurrency(outputs.breakEvenRevenue)}</div>
                <div className="text-sm text-muted-foreground">Break-even Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{formatPercent(outputs.contributionMarginRatio)}</div>
                <div className="text-sm text-muted-foreground">Contribution Margin</div>
              </div>
            </div>
          </div>
        );

      case 'unitEconomics':
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{formatCurrency(outputs.unitProfit)}</div>
                <div className="text-sm text-muted-foreground">Unit Profit</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{outputs.ltvCacRatio.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">LTV/CAC Ratio</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{outputs.paybackPeriod}</div>
                <div className="text-sm text-muted-foreground">Payback (months)</div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Calculation results will appear here</div>;
    }
  };

  const getTitle = () => {
    const titles = {
      roi: 'ROI Calculator',
      cashflow: 'Cashflow Forecast',
      breakeven: 'Break-even Analysis',
      unitEconomics: 'Unit Economics'
    };
    return titles[type] || 'Financial Calculator';
  };

  const getIcon = () => {
    const icons = {
      roi: TrendingUp,
      cashflow: DollarSign,
      breakeven: BarChart3,
      unitEconomics: Calculator
    };
    const Icon = icons[type] || Calculator;
    return <Icon className="h-6 w-6" />;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          {getIcon()}
          <h2 className="text-2xl font-bold">{getTitle()}</h2>
        </div>
        <p className="text-muted-foreground">
          Real-time calculations with auto-save to database
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Input Parameters</h3>
        {renderInputFields()}
      </Card>

      {outputs && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Results</h3>
          {renderOutputs()}
        </Card>
      )}

      {worksheetId && (
        <div className="text-center text-sm text-muted-foreground">
          Worksheet auto-saved to database (ID: {worksheetId})
        </div>
      )}
    </div>
  );
};

export default FinancialWorksheet;