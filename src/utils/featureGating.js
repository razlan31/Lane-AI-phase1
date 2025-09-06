import { getCapabilities } from '@/utils/capabilities';

// Default stock calculators for all users
export const stockCalculators = [
  {
    id: 'roi-calculator',
    name: 'ROI Calculator',
    description: 'Calculate return on investment',
    category: 'financial',
    schema: {
      fields: [
        { id: 'initial_investment', name: 'Initial Investment', type: 'currency', required: true },
        { id: 'final_value', name: 'Final Value', type: 'currency', required: true },
        { id: 'roi_percentage', name: 'ROI %', type: 'formula', formula: '((final_value - initial_investment) / initial_investment) * 100', readonly: true }
      ]
    },
    sampleData: [
      { initial_investment: 10000, final_value: 12000, roi_percentage: 20 }
    ]
  },
  {
    id: 'breakeven-calculator',
    name: 'Breakeven Calculator',
    description: 'Calculate breakeven point',
    category: 'financial',
    schema: {
      fields: [
        { id: 'fixed_costs', name: 'Fixed Costs', type: 'currency', required: true },
        { id: 'variable_cost_per_unit', name: 'Variable Cost/Unit', type: 'currency', required: true },
        { id: 'price_per_unit', name: 'Price/Unit', type: 'currency', required: true },
        { id: 'breakeven_units', name: 'Breakeven Units', type: 'formula', formula: 'fixed_costs / (price_per_unit - variable_cost_per_unit)', readonly: true }
      ]
    },
    sampleData: [
      { fixed_costs: 50000, variable_cost_per_unit: 20, price_per_unit: 50, breakeven_units: 1667 }
    ]
  },
  {
    id: 'cashflow-forecast',
    name: 'Cashflow Forecast',
    description: 'Project future cash flows',
    category: 'planning',
    schema: {
      fields: [
        { id: 'month', name: 'Month', type: 'text', required: true },
        { id: 'cash_in', name: 'Cash In', type: 'currency', required: true },
        { id: 'cash_out', name: 'Cash Out', type: 'currency', required: true },
        { id: 'net_cashflow', name: 'Net Cashflow', type: 'formula', formula: 'cash_in - cash_out', readonly: true }
      ]
    },
    sampleData: [
      { month: 'January', cash_in: 25000, cash_out: 20000, net_cashflow: 5000 },
      { month: 'February', cash_in: 28000, cash_out: 22000, net_cashflow: 6000 }
    ]
  },
  {
    id: 'unit-economics',
    name: 'Unit Economics',
    description: 'Calculate unit-level profitability',
    category: 'business',
    schema: {
      fields: [
        { id: 'revenue_per_unit', name: 'Revenue/Unit', type: 'currency', required: true },
        { id: 'cost_per_unit', name: 'Cost/Unit', type: 'currency', required: true },
        { id: 'gross_margin', name: 'Gross Margin', type: 'formula', formula: 'revenue_per_unit - cost_per_unit', readonly: true },
        { id: 'margin_percentage', name: 'Margin %', type: 'formula', formula: '(gross_margin / revenue_per_unit) * 100', readonly: true }
      ]
    },
    sampleData: [
      { revenue_per_unit: 100, cost_per_unit: 60, gross_margin: 40, margin_percentage: 40 }
    ]
  }
];

// Default personal metrics for all users
export const defaultPersonalMetrics = [
  {
    id: 'income',
    name: 'Monthly Income',
    type: 'currency',
    category: 'financial',
    value: null,
    target: null
  },
  {
    id: 'expenses',
    name: 'Monthly Expenses',
    type: 'currency',
    category: 'financial',
    value: null,
    target: null
  },
  {
    id: 'savings',
    name: 'Total Savings',
    type: 'currency',
    category: 'financial',
    value: null,
    target: null
  },
  {
    id: 'loan_repayment',
    name: 'Monthly Loan Repayment',
    type: 'currency',
    category: 'financial',
    value: null,
    target: null
  }
];

// Feature gating helpers
export const checkFeatureAccess = (profile, feature) => {
  const capabilities = getCapabilities(profile);
  return capabilities[feature] || false;
};

export const getFeatureLimitMessage = (feature) => {
  const messages = {
    worksheets_crud: 'Upgrade to Pro to create and edit custom worksheets',
    personal_crud: 'Upgrade to Pro to add custom personal metrics',
    scratchpad_reflect_ai: 'Upgrade to Pro for AI-powered scratchpad reflection',
    founder_mode_ai: 'Upgrade to Pro for Founder Mode AI insights',
    export_enabled: 'Upgrade to Pro to export your data'
  };
  return messages[feature] || 'This feature requires a Pro plan';
};

export default { stockCalculators, defaultPersonalMetrics, checkFeatureAccess, getFeatureLimitMessage };