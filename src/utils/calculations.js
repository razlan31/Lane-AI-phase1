// Modular calculations utility for financial worksheets
// All formulas are kept in this centralized file

export const calculations = {
  // ROI Formula: (Net Profit ÷ Investment) * 100
  roi: {
    formula: (netProfit, investment) => {
      if (investment <= 0) return 0;
      return ((netProfit / investment) * 100);
    },
    validate: (inputs) => {
      const required = ['initialInvestment', 'totalRevenue', 'totalCosts'];
      return required.every(field => inputs[field] !== undefined && inputs[field] !== '');
    }
  },

  // Breakeven Formula: Fixed Costs ÷ (Unit Price - Unit Variable Cost)
  breakeven: {
    formula: (fixedCosts, unitPrice, unitVariableCost) => {
      const contributionMargin = unitPrice - unitVariableCost;
      if (contributionMargin <= 0) return Infinity;
      return Math.ceil(fixedCosts / contributionMargin);
    },
    validate: (inputs) => {
      const required = ['fixedCosts', 'pricePerUnit', 'variableCostPerUnit'];
      return required.every(field => inputs[field] !== undefined && inputs[field] !== '');
    }
  },

  // Cashflow Formula: inflow - outflow + cumulative balance
  cashflow: {
    formula: (inflow, outflow, previousBalance = 0) => {
      return inflow - outflow + previousBalance;
    },
    validate: (inputs) => {
      const required = ['monthlyRevenue', 'monthlyExpenses'];
      return required.every(field => inputs[field] !== undefined && inputs[field] !== '');
    }
  },

  // Personal Finance Calculations
  personal: {
    // Monthly loan payment formula
    loanPayment: (principal, annualRate, termMonths) => {
      if (annualRate === 0) return principal / termMonths;
      const monthlyRate = annualRate / 100 / 12;
      return principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
             (Math.pow(1 + monthlyRate, termMonths) - 1);
    },
    
    // Net income calculation
    netIncome: (grossIncome, taxes, deductions) => {
      return grossIncome - taxes - deductions;
    },
    
    // Debt-to-income ratio
    debtToIncomeRatio: (totalDebtPayments, grossIncome) => {
      if (grossIncome <= 0) return 0;
      return (totalDebtPayments / grossIncome) * 100;
    },

    validate: (inputs) => {
      // More flexible validation for personal finance
      return Object.keys(inputs).length > 0;
    }
  },

  // Unit Economics
  unitEconomics: {
    // Customer Lifetime Value
    ltv: (avgRevenue, avgLifetime, retentionRate) => {
      return avgRevenue * avgLifetime * retentionRate;
    },
    
    // LTV to CAC ratio
    ltvCacRatio: (ltv, cac) => {
      if (cac <= 0) return 0;
      return ltv / cac;
    },
    
    validate: (inputs) => {
      const required = ['revenuePerUnit', 'costPerUnit'];
      return required.every(field => inputs[field] !== undefined && inputs[field] !== '');
    }
  },

  // Valuation Methods
  valuation: {
    // DCF simplified
    dcf: (cashFlows, discountRate, terminalValue = 0) => {
      let npv = 0;
      cashFlows.forEach((cf, index) => {
        npv += cf / Math.pow(1 + discountRate, index + 1);
      });
      if (terminalValue > 0) {
        npv += terminalValue / Math.pow(1 + discountRate, cashFlows.length);
      }
      return npv;
    },
    
    // Revenue multiple
    revenueMultiple: (revenue, multiple) => {
      return revenue * multiple;
    },
    
    validate: (inputs) => {
      return inputs.revenue !== undefined || inputs.cashFlows !== undefined;
    }
  }
};

// Helper functions for formatting and validation
export const formatters = {
  currency: (value, locale = 'en-US', currency = 'USD') => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  },

  percentage: (value, decimals = 1) => {
    return `${Number(value).toFixed(decimals)}%`;
  },

  number: (value, decimals = 2) => {
    return Number(value).toFixed(decimals);
  }
};

// Field validation utilities
export const validators = {
  required: (value) => value !== undefined && value !== null && value !== '',
  
  positive: (value) => Number(value) > 0,
  
  range: (value, min, max) => {
    const num = Number(value);
    return num >= min && num <= max;
  },
  
  percentage: (value) => {
    const num = Number(value);
    return num >= 0 && num <= 100;
  }
};

export default calculations;