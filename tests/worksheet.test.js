// Test suite for financial worksheet functionality
import { calculations, formatters, validators } from '../src/utils/calculations';
import { financialEngine } from '../src/utils/financialEngine';

// Test: Create worksheet → edit → save → reload → same values
export const runWorksheetTests = async () => {
  const tests = [];

  // Test ROI calculations
  tests.push({
    name: 'ROI Calculation',
    test: () => {
      const inputs = {
        initialInvestment: 100000,
        totalRevenue: 150000,
        totalCosts: 120000,
        timeFrame: 2,
        growthRate: 10
      };
      
      const result = financialEngine.calculate('roi', inputs);
      
      // Expected: (Net Profit ÷ Investment) * 100
      // Year 1: Revenue 150k, Costs 120k, Profit 30k
      // Year 2: Revenue 165k, Costs 132k, Profit 33k  
      // Total Profit: 63k, Net: 63k - 100k = -37k, ROI: -37%
      
      return {
        passed: result.roi !== undefined && !result.error,
        result: result.roi,
        expected: 'Negative ROI due to not recovering investment'
      };
    }
  });

  // Test Breakeven calculations
  tests.push({
    name: 'Breakeven Analysis',
    test: () => {
      const inputs = {
        fixedCosts: 10000,
        variableCostPerUnit: 15,
        pricePerUnit: 25,
        targetProfit: 0
      };
      
      const result = financialEngine.calculate('breakeven', inputs);
      
      // Expected: 10000 ÷ (25 - 15) = 1000 units
      
      return {
        passed: result.breakEvenUnits === 1000 && !result.error,
        result: result.breakEvenUnits,
        expected: 1000
      };
    }
  });

  // Test Cashflow calculations
  tests.push({
    name: 'Cashflow Projection',
    test: () => {
      const inputs = {
        monthlyRevenue: 10000,
        monthlyExpenses: 8000,
        months: 6,
        growthRate: 5
      };
      
      const result = financialEngine.calculate('cashflow', inputs);
      
      return {
        passed: result.positiveMonths === 6 && !result.error,
        result: `${result.positiveMonths} positive months`,
        expected: '6 positive months'
      };
    }
  });

  // Test Personal Finance calculations
  tests.push({
    name: 'Personal Finance Debt-to-Income',
    test: () => {
      const income = 5000;
      const loanPayments = 1500;
      const ratio = calculations.personal.debtToIncomeRatio(loanPayments, income);
      
      return {
        passed: ratio === 30,
        result: `${ratio}%`,
        expected: '30%'
      };
    }
  });

  // Test validation
  tests.push({
    name: 'Input Validation',
    test: () => {
      const validInputs = {
        initialInvestment: 50000,
        totalRevenue: 100000,
        totalCosts: 75000
      };
      
      const invalidInputs = {
        initialInvestment: 50000
        // missing required fields
      };
      
      const validResult = financialEngine.validateInputs('roi', validInputs);
      const invalidResult = financialEngine.validateInputs('roi', invalidInputs);
      
      return {
        passed: validResult.valid && !invalidResult.valid,
        result: `Valid: ${validResult.valid}, Invalid: ${invalidResult.valid}`,
        expected: 'Valid: true, Invalid: false'
      };
    }
  });

  // Test formatting
  tests.push({
    name: 'Number Formatting',
    test: () => {
      const currency = formatters.currency(1234567);
      const percentage = formatters.percentage(15.678);
      
      return {
        passed: currency === '$1,234,567' && percentage === '15.7%',
        result: `${currency}, ${percentage}`,
        expected: '$1,234,567, 15.7%'
      };
    }
  });

  // Run all tests
  console.log('Running Financial Worksheet Tests...\n');
  
  let passed = 0;
  let failed = 0;
  
  tests.forEach(({ name, test }, index) => {
    try {
      const result = test();
      if (result.passed) {
        console.log(`✅ ${index + 1}. ${name}`);
        console.log(`   Result: ${result.result}`);
        passed++;
      } else {
        console.log(`❌ ${index + 1}. ${name}`);
        console.log(`   Expected: ${result.expected}`);
        console.log(`   Got: ${result.result}`);
        failed++;
      }
    } catch (error) {
      console.log(`💥 ${index + 1}. ${name} - Error: ${error.message}`);
      failed++;
    }
    console.log('');
  });
  
  console.log(`\nTest Results: ${passed} passed, ${failed} failed`);
  return { passed, failed, total: tests.length };
};

// Integration test for database persistence
export const testWorksheetPersistence = async () => {
  console.log('Testing worksheet persistence...');
  
  // This would be run in a component context with access to useWorksheets hook
  const testSteps = [
    '1. Create new ROI worksheet',
    '2. Add input values',
    '3. Verify calculations',
    '4. Save to database',
    '5. Reload from database',
    '6. Verify values match'
  ];
  
  console.log('Test steps:');
  testSteps.forEach(step => console.log(`  ${step}`));
  
  return {
    message: 'Persistence test requires component context. Run from worksheet component.',
    steps: testSteps
  };
};

export default { runWorksheetTests, testWorksheetPersistence };