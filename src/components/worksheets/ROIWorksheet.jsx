import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

const ROIWorksheet = ({ ventureId, initialData, onSave }) => {
  const [inputs, setInputs] = useState({
    initialInvestment: initialData?.inputs?.initialInvestment || '',
    annualRevenue: initialData?.inputs?.annualRevenue || '',
    annualCosts: initialData?.inputs?.annualCosts || '',
    timeFrame: initialData?.inputs?.timeFrame || 1,
    growthRate: initialData?.inputs?.growthRate || 0
  });
  const [outputs, setOutputs] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Calculate ROI whenever inputs change
  useEffect(() => {
    calculateROI();
  }, [inputs]);

  const calculateROI = () => {
    const { initialInvestment, annualRevenue, annualCosts, timeFrame, growthRate } = inputs;
    
    if (!initialInvestment || !annualRevenue || !annualCosts) {
      setOutputs(null);
      return;
    }

    const investment = parseFloat(initialInvestment) || 0;
    const revenue = parseFloat(annualRevenue) || 0;
    const costs = parseFloat(annualCosts) || 0;
    const years = parseInt(timeFrame) || 1;
    const growth = parseFloat(growthRate) / 100 || 0;

    let totalProfit = 0;
    let yearlyBreakdown = [];

    for (let year = 1; year <= years; year++) {
      const yearRevenue = revenue * Math.pow(1 + growth, year - 1);
      const yearCosts = costs * Math.pow(1 + growth, year - 1);
      const yearProfit = yearRevenue - yearCosts;
      totalProfit += yearProfit;
      
      yearlyBreakdown.push({
        year,
        revenue: yearRevenue,
        costs: yearCosts,
        profit: yearProfit,
        cumulativeProfit: totalProfit
      });
    }

    const roi = investment > 0 ? ((totalProfit - investment) / investment) * 100 : 0;
    const paybackPeriod = calculatePaybackPeriod(investment, yearlyBreakdown);
    const breakEvenYear = yearlyBreakdown.find(y => y.cumulativeProfit >= investment)?.year || null;

    setOutputs({
      roi: roi.toFixed(2),
      totalProfit: totalProfit.toFixed(2),
      netProfit: (totalProfit - investment).toFixed(2),
      paybackPeriod: paybackPeriod.toFixed(2),
      breakEvenYear,
      yearlyBreakdown
    });
  };

  const calculatePaybackPeriod = (investment, breakdown) => {
    let cumulativeProfit = 0;
    
    for (let i = 0; i < breakdown.length; i++) {
      const yearData = breakdown[i];
      const startProfit = cumulativeProfit;
      cumulativeProfit += yearData.profit;
      
      if (cumulativeProfit >= investment) {
        const remainingAmount = investment - startProfit;
        const monthsIntoYear = (remainingAmount / yearData.profit) * 12;
        return (i + monthsIntoYear / 12);
      }
    }
    
    return breakdown.length; // If not reached within timeframe
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const saveWorksheet = async () => {
    if (!outputs) {
      toast({
        title: "Missing Data",
        description: "Please fill in all required fields before saving.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const worksheetData = {
        user_id: user.id,
        venture_id: ventureId || null,
        type: 'roi_calculator',
        inputs,
        outputs,
        confidence_level: 'calculated'
      };

      const { data, error } = await supabase
        .from('worksheets')
        .insert(worksheetData)
        .select('*')
        .maybeSingle();

      if (error) throw error;

      // Create timeline event
      await supabase
        .from('timeline_events')
        .insert({
          user_id: user.id,
          venture_id: ventureId || null,
          kind: 'artifact',
          title: 'ROI Analysis Complete',
          body: `ROI: ${outputs.roi}% over ${inputs.timeFrame} year${inputs.timeFrame > 1 ? 's' : ''}`,
          payload: {
            worksheet_id: data.id,
            roi: outputs.roi,
            investment: inputs.initialInvestment,
            type: 'roi_worksheet'
          }
        });

      toast({
        title: "Worksheet Saved",
        description: "Your ROI analysis has been saved successfully."
      });

      if (onSave) onSave(data);
    } catch (error) {
      console.error('Error saving worksheet:', error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save worksheet. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">ROI Calculator</h2>
        <p className="text-muted-foreground">Calculate return on investment over time</p>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Investment Details</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="initialInvestment">Initial Investment ($)</Label>
            <Input
              id="initialInvestment"
              type="number"
              placeholder="100000"
              value={inputs.initialInvestment}
              onChange={(e) => handleInputChange('initialInvestment', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="timeFrame">Time Frame (years)</Label>
            <Input
              id="timeFrame"
              type="number"
              min="1"
              max="10"
              value={inputs.timeFrame}
              onChange={(e) => handleInputChange('timeFrame', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="annualRevenue">Annual Revenue ($)</Label>
            <Input
              id="annualRevenue"
              type="number"
              placeholder="200000"
              value={inputs.annualRevenue}
              onChange={(e) => handleInputChange('annualRevenue', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="annualCosts">Annual Costs ($)</Label>
            <Input
              id="annualCosts"
              type="number"
              placeholder="120000"
              value={inputs.annualCosts}
              onChange={(e) => handleInputChange('annualCosts', e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="growthRate">Annual Growth Rate (%)</Label>
            <Input
              id="growthRate"
              type="number"
              min="0"
              max="100"
              step="0.1"
              placeholder="10"
              value={inputs.growthRate}
              onChange={(e) => handleInputChange('growthRate', e.target.value)}
            />
          </div>
        </div>
      </Card>

      {outputs && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Results</h3>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{outputs.roi}%</div>
              <div className="text-sm text-muted-foreground">Total ROI</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(outputs.netProfit)}
              </div>
              <div className="text-sm text-muted-foreground">Net Profit</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{outputs.paybackPeriod}</div>
              <div className="text-sm text-muted-foreground">Years to Payback</div>
            </div>
          </div>

          {outputs.breakEvenYear && (
            <div className="mb-4 p-3 bg-accent rounded-md">
              <div className="text-sm font-medium">
                Break-even in Year {outputs.breakEvenYear}
              </div>
            </div>
          )}

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
        </Card>
      )}

      <div className="flex justify-end space-x-2">
        <Button 
          onClick={saveWorksheet} 
          disabled={loading || !outputs}
          className="min-w-[120px]"
        >
          {loading ? 'Saving...' : 'Save Analysis'}
        </Button>
      </div>
    </div>
  );
};

export default ROIWorksheet;