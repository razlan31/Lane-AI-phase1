// Comprehensive financial calculation engine for worksheets
export class FinancialEngine {
  constructor() {
    this.calculations = {
      roi: this.calculateROI.bind(this),
      cashflow: this.calculateCashflow.bind(this),
      breakeven: this.calculateBreakeven.bind(this),
      unitEconomics: this.calculateUnitEconomics.bind(this),
      loanPayment: this.calculateLoanPayment.bind(this),
      npv: this.calculateNPV.bind(this)
    };
  }

  // ROI = (Net Profit / Investment) * 100
  calculateROI(inputs) {
    const {
      initialInvestment = 0,
      totalRevenue = 0,
      totalCosts = 0,
      timeFrame = 1,
      growthRate = 0
    } = inputs;

    const investment = parseFloat(initialInvestment) || 0;
    const annualRevenue = parseFloat(totalRevenue) || 0;
    const annualCosts = parseFloat(totalCosts) || 0;
    const years = parseInt(timeFrame) || 1;
    const growth = parseFloat(growthRate) / 100 || 0;

    if (investment <= 0) {
      return { error: 'Initial investment must be greater than 0' };
    }

    let totalProfit = 0;
    let yearlyBreakdown = [];

    for (let year = 1; year <= years; year++) {
      const yearRevenue = annualRevenue * Math.pow(1 + growth, year - 1);
      const yearCosts = annualCosts * Math.pow(1 + growth, year - 1);
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

    const netProfit = totalProfit - investment;
    const roi = (netProfit / investment) * 100;
    const paybackPeriod = this.calculatePaybackPeriod(investment, yearlyBreakdown);

    return {
      roi: Math.round(roi * 100) / 100,
      totalProfit: Math.round(totalProfit * 100) / 100,
      netProfit: Math.round(netProfit * 100) / 100,
      paybackPeriod: Math.round(paybackPeriod * 100) / 100,
      yearlyBreakdown,
      breakEvenYear: yearlyBreakdown.find(y => y.cumulativeProfit >= investment)?.year || null
    };
  }

  // Cashflow = Revenues – Expenses (monthly)
  calculateCashflow(inputs) {
    const {
      monthlyRevenue = 0,
      monthlyExpenses = 0,
      months = 12,
      growthRate = 0,
      seasonality = [],
      oneTimeExpenses = []
    } = inputs;

    const revenue = parseFloat(monthlyRevenue) || 0;
    const expenses = parseFloat(monthlyExpenses) || 0;
    const period = parseInt(months) || 12;
    const growth = parseFloat(growthRate) / 100 || 0;

    let cumulativeCashflow = 0;
    let monthlyBreakdown = [];

    for (let month = 1; month <= period; month++) {
      // Apply growth
      const monthRevenue = revenue * Math.pow(1 + growth / 12, month - 1);
      let monthExpenses = expenses * Math.pow(1 + growth / 12, month - 1);

      // Apply seasonality if provided
      if (seasonality.length >= 12) {
        const seasonalIndex = seasonality[(month - 1) % 12] || 1;
        monthRevenue *= seasonalIndex;
      }

      // Add one-time expenses
      const oneTimeExpense = oneTimeExpenses.find(e => e.month === month)?.amount || 0;
      monthExpenses += oneTimeExpense;

      const monthCashflow = monthRevenue - monthExpenses;
      cumulativeCashflow += monthCashflow;

      monthlyBreakdown.push({
        month,
        revenue: Math.round(monthRevenue * 100) / 100,
        expenses: Math.round(monthExpenses * 100) / 100,
        cashflow: Math.round(monthCashflow * 100) / 100,
        cumulativeCashflow: Math.round(cumulativeCashflow * 100) / 100
      });
    }

    const averageMonthlyCashflow = cumulativeCashflow / period;
    const positiveMonths = monthlyBreakdown.filter(m => m.cashflow > 0).length;

    return {
      totalCashflow: Math.round(cumulativeCashflow * 100) / 100,
      averageMonthlyCashflow: Math.round(averageMonthlyCashflow * 100) / 100,
      positiveMonths,
      negativeMonths: period - positiveMonths,
      monthlyBreakdown,
      breakEvenMonth: monthlyBreakdown.find(m => m.cumulativeCashflow >= 0)?.month || null
    };
  }

  // Breakeven = Fixed Costs / Contribution Margin
  calculateBreakeven(inputs) {
    const {
      fixedCosts = 0,
      variableCostPerUnit = 0,
      pricePerUnit = 0,
      targetProfit = 0
    } = inputs;

    const fixed = parseFloat(fixedCosts) || 0;
    const variableCost = parseFloat(variableCostPerUnit) || 0;
    const price = parseFloat(pricePerUnit) || 0;
    const target = parseFloat(targetProfit) || 0;

    if (price <= variableCost) {
      return { error: 'Price per unit must be greater than variable cost per unit' };
    }

    const contributionMargin = price - variableCost;
    const contributionMarginRatio = (contributionMargin / price) * 100;
    
    const breakEvenUnits = Math.ceil((fixed + target) / contributionMargin);
    const breakEvenRevenue = breakEvenUnits * price;
    
    // Safety margin analysis
    const maxVariableCost = price - (fixed / breakEvenUnits);
    const maxFixedCosts = contributionMargin * breakEvenUnits;

    return {
      breakEvenUnits,
      breakEvenRevenue: Math.round(breakEvenRevenue * 100) / 100,
      contributionMargin: Math.round(contributionMargin * 100) / 100,
      contributionMarginRatio: Math.round(contributionMarginRatio * 100) / 100,
      maxVariableCost: Math.round(maxVariableCost * 100) / 100,
      maxFixedCosts: Math.round(maxFixedCosts * 100) / 100
    };
  }

  // Unit Economics = Revenue per unit – Cost per unit
  calculateUnitEconomics(inputs) {
    const {
      revenuePerUnit = 0,
      costPerUnit = 0,
      acquisitionCost = 0,
      retentionRate = 0.8,
      averageLifetime = 24
    } = inputs;

    const revenue = parseFloat(revenuePerUnit) || 0;
    const cost = parseFloat(costPerUnit) || 0;
    const cac = parseFloat(acquisitionCost) || 0;
    const retention = parseFloat(retentionRate) || 0.8;
    const lifetime = parseFloat(averageLifetime) || 24;

    const unitProfit = revenue - cost;
    const ltv = revenue * lifetime * retention;
    const ltvCacRatio = cac > 0 ? ltv / cac : 0;
    const paybackPeriod = cac > 0 ? cac / unitProfit : 0;

    return {
      unitProfit: Math.round(unitProfit * 100) / 100,
      ltv: Math.round(ltv * 100) / 100,
      cac: Math.round(cac * 100) / 100,
      ltvCacRatio: Math.round(ltvCacRatio * 100) / 100,
      paybackPeriod: Math.round(paybackPeriod * 100) / 100,
      marginPercent: revenue > 0 ? Math.round((unitProfit / revenue) * 100 * 100) / 100 : 0
    };
  }

  // Loan Payment Calculator
  calculateLoanPayment(inputs) {
    const {
      principal = 0,
      interestRate = 0,
      termMonths = 12
    } = inputs;

    const P = parseFloat(principal) || 0;
    const r = (parseFloat(interestRate) / 100) / 12; // Monthly interest rate
    const n = parseInt(termMonths) || 12;

    if (P <= 0 || r <= 0 || n <= 0) {
      return { error: 'Invalid loan parameters' };
    }

    const monthlyPayment = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayments = monthlyPayment * n;
    const totalInterest = totalPayments - P;

    return {
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalPayments: Math.round(totalPayments * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100
    };
  }

  // Net Present Value
  calculateNPV(inputs) {
    const {
      initialInvestment = 0,
      cashFlows = [],
      discountRate = 0.1
    } = inputs;

    const investment = parseFloat(initialInvestment) || 0;
    const rate = parseFloat(discountRate) || 0.1;

    if (!Array.isArray(cashFlows) || cashFlows.length === 0) {
      return { error: 'Cash flows array is required' };
    }

    let npv = -investment;
    
    cashFlows.forEach((cashFlow, index) => {
      const pv = cashFlow / Math.pow(1 + rate, index + 1);
      npv += pv;
    });

    return {
      npv: Math.round(npv * 100) / 100,
      profitable: npv > 0
    };
  }

  // Helper method for payback period calculation
  calculatePaybackPeriod(investment, yearlyBreakdown) {
    let cumulativeProfit = 0;
    
    for (let i = 0; i < yearlyBreakdown.length; i++) {
      const yearData = yearlyBreakdown[i];
      const startProfit = cumulativeProfit;
      cumulativeProfit += yearData.profit;
      
      if (cumulativeProfit >= investment) {
        const remainingAmount = investment - startProfit;
        const monthsIntoYear = (remainingAmount / yearData.profit) * 12;
        return (i + monthsIntoYear / 12);
      }
    }
    
    return yearlyBreakdown.length; // If not reached within timeframe
  }

  // Execute calculation by type
  calculate(type, inputs) {
    if (!this.calculations[type]) {
      return { error: `Unknown calculation type: ${type}` };
    }

    try {
      return this.calculations[type](inputs);
    } catch (error) {
      return { error: error.message };
    }
  }

  // Validate inputs for a calculation type
  validateInputs(type, inputs) {
    const requiredFields = {
      roi: ['initialInvestment', 'totalRevenue', 'totalCosts'],
      cashflow: ['monthlyRevenue', 'monthlyExpenses'],
      breakeven: ['fixedCosts', 'variableCostPerUnit', 'pricePerUnit'],
      unitEconomics: ['revenuePerUnit', 'costPerUnit'],
      loanPayment: ['principal', 'interestRate', 'termMonths'],
      npv: ['initialInvestment', 'cashFlows', 'discountRate']
    };

    const required = requiredFields[type] || [];
    const missing = required.filter(field => 
      inputs[field] === undefined || inputs[field] === null || inputs[field] === ''
    );

    return {
      valid: missing.length === 0,
      missing
    };
  }
}

export const financialEngine = new FinancialEngine();
export default financialEngine;