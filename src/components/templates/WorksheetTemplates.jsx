// Worksheet template definitions with Supabase-ready structure
export const worksheetTemplates = [
  {
    id: 'roi-calculator',
    title: 'ROI Calculator',
    description: 'Calculate return on investment for projects and initiatives',
    category: 'Financial',
    difficulty: 'Basic',
    estimatedTime: '5 min',
    config: {
      sheets: [
        {
          id: 'main',
          name: 'ROI Analysis',
          columns: [
            { key: 'item', label: 'Investment Item', type: 'text', editable: true },
            { key: 'initial_investment', label: 'Initial Investment', type: 'currency', editable: true },
            { key: 'annual_return', label: 'Annual Return', type: 'currency', editable: true },
            { key: 'time_period', label: 'Time Period (Years)', type: 'number', editable: true },
            { key: 'total_return', label: 'Total Return', type: 'currency', editable: false, formula: 'annual_return * time_period' },
            { key: 'roi_percentage', label: 'ROI %', type: 'percentage', editable: false, formula: '((total_return - initial_investment) / initial_investment) * 100' }
          ],
          data: [
            { item: 'Marketing Campaign', initial_investment: 10000, annual_return: 3000, time_period: 3 },
            { item: 'Equipment Purchase', initial_investment: 25000, annual_return: 8000, time_period: 5 },
            { item: 'Staff Training', initial_investment: 5000, annual_return: 2000, time_period: 2 }
          ],
          assumptions: [
            { key: 'discount_rate', label: 'Discount Rate', value: 0.05, type: 'percentage' },
            { key: 'inflation_rate', label: 'Inflation Rate', value: 0.03, type: 'percentage' }
          ]
        }
      ],
      kpis: [
        { title: 'Average ROI', formula: 'AVERAGE(roi_percentage)', unit: 'percentage' },
        { title: 'Total Investment', formula: 'SUM(initial_investment)', unit: 'currency' },
        { title: 'Total Return', formula: 'SUM(total_return)', unit: 'currency' }
      ]
    }
  },
  {
    id: 'balance-sheet',
    title: 'Balance Sheet',
    description: 'Track assets, liabilities, and equity',
    category: 'Financial',
    difficulty: 'Intermediate',
    estimatedTime: '10 min',
    config: {
      sheets: [
        {
          id: 'balance',
          name: 'Balance Sheet',
          columns: [
            { key: 'account', label: 'Account', type: 'text', editable: true },
            { key: 'category', label: 'Category', type: 'select', options: ['Assets', 'Liabilities', 'Equity'], editable: true },
            { key: 'amount', label: 'Amount', type: 'currency', editable: true }
          ],
          data: [
            { account: 'Cash', category: 'Assets', amount: 50000 },
            { account: 'Accounts Receivable', category: 'Assets', amount: 25000 },
            { account: 'Equipment', category: 'Assets', amount: 75000 },
            { account: 'Accounts Payable', category: 'Liabilities', amount: 15000 },
            { account: 'Bank Loan', category: 'Liabilities', amount: 60000 },
            { account: 'Owner Equity', category: 'Equity', amount: 75000 }
          ],
          assumptions: [
            { key: 'depreciation_rate', label: 'Equipment Depreciation Rate', value: 0.1, type: 'percentage' }
          ]
        }
      ],
      kpis: [
        { title: 'Total Assets', formula: 'SUMIF(category,"Assets",amount)', unit: 'currency' },
        { title: 'Total Liabilities', formula: 'SUMIF(category,"Liabilities",amount)', unit: 'currency' },
        { title: 'Total Equity', formula: 'SUMIF(category,"Equity",amount)', unit: 'currency' }
      ]
    }
  },
  {
    id: 'cac-calculator',
    title: 'Customer Acquisition Cost (CAC)',
    description: 'Calculate cost to acquire new customers',
    category: 'Marketing',
    difficulty: 'Basic',
    estimatedTime: '5 min',
    config: {
      sheets: [
        {
          id: 'cac',
          name: 'CAC Analysis',
          columns: [
            { key: 'channel', label: 'Marketing Channel', type: 'text', editable: true },
            { key: 'marketing_spend', label: 'Marketing Spend', type: 'currency', editable: true },
            { key: 'customers_acquired', label: 'Customers Acquired', type: 'number', editable: true },
            { key: 'cac', label: 'CAC', type: 'currency', editable: false, formula: 'marketing_spend / customers_acquired' },
            { key: 'ltv', label: 'Customer LTV', type: 'currency', editable: true },
            { key: 'ltv_cac_ratio', label: 'LTV:CAC Ratio', type: 'number', editable: false, formula: 'ltv / cac' }
          ],
          data: [
            { channel: 'Google Ads', marketing_spend: 5000, customers_acquired: 50, ltv: 500 },
            { channel: 'Facebook Ads', marketing_spend: 3000, customers_acquired: 40, ltv: 500 },
            { channel: 'Content Marketing', marketing_spend: 2000, customers_acquired: 20, ltv: 500 }
          ],
          assumptions: [
            { key: 'avg_customer_lifetime', label: 'Average Customer Lifetime (months)', value: 24, type: 'number' },
            { key: 'monthly_revenue_per_customer', label: 'Monthly Revenue per Customer', value: 50, type: 'currency' }
          ]
        }
      ],
      kpis: [
        { title: 'Blended CAC', formula: 'SUM(marketing_spend) / SUM(customers_acquired)', unit: 'currency' },
        { title: 'Average LTV:CAC Ratio', formula: 'AVERAGE(ltv_cac_ratio)', unit: 'number' },
        { title: 'Total Marketing Spend', formula: 'SUM(marketing_spend)', unit: 'currency' }
      ]
    }
  },
  {
    id: 'cashflow-projection',
    title: 'Cashflow Projection',
    description: 'Project future cash inflows and outflows',
    category: 'Financial',
    difficulty: 'Intermediate',
    estimatedTime: '10 min',
    config: {
      sheets: [
        {
          id: 'cashflow',
          name: 'Monthly Cashflow',
          columns: [
            { key: 'month', label: 'Month', type: 'text', editable: true },
            { key: 'revenue', label: 'Revenue', type: 'currency', editable: true },
            { key: 'cogs', label: 'Cost of Goods Sold', type: 'currency', editable: true },
            { key: 'operating_expenses', label: 'Operating Expenses', type: 'currency', editable: true },
            { key: 'net_income', label: 'Net Income', type: 'currency', editable: false, formula: 'revenue - cogs - operating_expenses' },
            { key: 'cumulative_cash', label: 'Cumulative Cash', type: 'currency', editable: false, formula: 'SUM(net_income)' }
          ],
          data: [
            { month: 'Jan 2024', revenue: 10000, cogs: 3000, operating_expenses: 5000 },
            { month: 'Feb 2024', revenue: 12000, cogs: 3600, operating_expenses: 5200 },
            { month: 'Mar 2024', revenue: 15000, cogs: 4500, operating_expenses: 5500 },
            { month: 'Apr 2024', revenue: 18000, cogs: 5400, operating_expenses: 5800 },
            { month: 'May 2024', revenue: 20000, cogs: 6000, operating_expenses: 6000 },
            { month: 'Jun 2024', revenue: 22000, cogs: 6600, operating_expenses: 6200 }
          ],
          assumptions: [
            { key: 'revenue_growth_rate', label: 'Monthly Revenue Growth Rate', value: 0.1, type: 'percentage' },
            { key: 'cogs_percentage', label: 'COGS as % of Revenue', value: 0.3, type: 'percentage' }
          ]
        }
      ],
      kpis: [
        { title: 'Total Revenue', formula: 'SUM(revenue)', unit: 'currency' },
        { title: 'Average Monthly Cashflow', formula: 'AVERAGE(net_income)', unit: 'currency' },
        { title: 'Runway (Months)', formula: 'cumulative_cash / ABS(MIN(net_income))', unit: 'number' }
      ]
    }
  },
  {
    id: 'burn-rate',
    title: 'Burn Rate Calculator',
    description: 'Track monthly cash burn and runway',
    category: 'Financial',
    difficulty: 'Basic',
    estimatedTime: '5 min',
    config: {
      sheets: [
        {
          id: 'burn',
          name: 'Burn Analysis',
          columns: [
            { key: 'expense_category', label: 'Expense Category', type: 'text', editable: true },
            { key: 'monthly_amount', label: 'Monthly Amount', type: 'currency', editable: true },
            { key: 'quarterly_amount', label: 'Quarterly Amount', type: 'currency', editable: false, formula: 'monthly_amount * 3' },
            { key: 'annual_amount', label: 'Annual Amount', type: 'currency', editable: false, formula: 'monthly_amount * 12' }
          ],
          data: [
            { expense_category: 'Salaries & Benefits', monthly_amount: 15000 },
            { expense_category: 'Office Rent', monthly_amount: 3000 },
            { expense_category: 'Marketing', monthly_amount: 2500 },
            { expense_category: 'Software & Tools', monthly_amount: 800 },
            { expense_category: 'Other Operating', monthly_amount: 1200 }
          ],
          assumptions: [
            { key: 'current_cash_balance', label: 'Current Cash Balance', value: 250000, type: 'currency' },
            { key: 'monthly_revenue', label: 'Monthly Revenue', value: 8000, type: 'currency' }
          ]
        }
      ],
      kpis: [
        { title: 'Monthly Burn Rate', formula: 'SUM(monthly_amount)', unit: 'currency' },
        { title: 'Net Burn Rate', formula: 'SUM(monthly_amount) - monthly_revenue', unit: 'currency' },
        { title: 'Runway (Months)', formula: 'current_cash_balance / (SUM(monthly_amount) - monthly_revenue)', unit: 'number' }
      ]
    }
  }
];

// Get template by ID
export const getTemplateById = (templateId) => {
  return worksheetTemplates.find(template => template.id === templateId);
};

// Get templates by category
export const getTemplatesByCategory = (category) => {
  return worksheetTemplates.filter(template => template.category === category);
};

// Get all categories
export const getTemplateCategories = () => {
  return [...new Set(worksheetTemplates.map(template => template.category))];
};