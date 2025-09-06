import FinancialWorksheet from './FinancialWorksheet';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, CreditCard, Home, Car, GraduationCap } from 'lucide-react';
import { calculations } from '@/utils/calculations';

const PersonalFinanceWorksheet = ({ ventureId, initialData, onSave }) => {
  const [customFields, setCustomFields] = useState(initialData?.customFields || []);
  const [finances, setFinances] = useState(initialData?.inputs || {
    monthlyIncome: '',
    monthlyExpenses: '',
    savings: '',
    loans: []
  });

  // Default loan templates
  const loanTemplates = [
    { name: 'Credit Card', icon: CreditCard, type: 'credit_card' },
    { name: 'Mortgage', icon: Home, type: 'mortgage' },
    { name: 'Auto Loan', icon: Car, type: 'auto' },
    { name: 'Student Loan', icon: GraduationCap, type: 'student' }
  ];

  const addLoan = (template) => {
    const newLoan = {
      id: Date.now(),
      name: template?.name || 'New Loan',
      type: template?.type || 'custom',
      balance: '',
      interestRate: '',
      minPayment: '',
      termMonths: ''
    };
    
    setFinances(prev => ({
      ...prev,
      loans: [...prev.loans, newLoan]
    }));
  };

  const updateLoan = (id, field, value) => {
    setFinances(prev => ({
      ...prev,
      loans: prev.loans.map(loan => 
        loan.id === id ? { ...loan, [field]: value } : loan
      )
    }));
  };

  const removeLoan = (id) => {
    setFinances(prev => ({
      ...prev,
      loans: prev.loans.filter(loan => loan.id !== id)
    }));
  };

  const addCustomField = () => {
    const newField = {
      id: Date.now(),
      name: 'New Field',
      value: '',
      type: 'income' // or 'expense'
    };
    setCustomFields(prev => [...prev, newField]);
  };

  const updateCustomField = (id, field, value) => {
    setCustomFields(prev => 
      prev.map(f => f.id === id ? { ...f, [field]: value } : f)
    );
  };

  const removeCustomField = (id) => {
    setCustomFields(prev => prev.filter(f => f.id !== id));
  };

  // Calculate totals and ratios
  const calculateResults = () => {
    const income = parseFloat(finances.monthlyIncome) || 0;
    const expenses = parseFloat(finances.monthlyExpenses) || 0;
    
    // Calculate total loan payments
    const totalLoanPayments = finances.loans.reduce((total, loan) => {
      const payment = parseFloat(loan.minPayment) || 0;
      return total + payment;
    }, 0);

    // Add custom field values
    const customIncome = customFields
      .filter(f => f.type === 'income')
      .reduce((total, f) => total + (parseFloat(f.value) || 0), 0);
    
    const customExpenses = customFields
      .filter(f => f.type === 'expense')
      .reduce((total, f) => total + (parseFloat(f.value) || 0), 0);

    const totalIncome = income + customIncome;
    const totalExpenses = expenses + customExpenses + totalLoanPayments;
    const netIncome = totalIncome - totalExpenses;
    const debtToIncomeRatio = totalIncome > 0 ? (totalLoanPayments / totalIncome) * 100 : 0;
    
    return {
      totalIncome,
      totalExpenses,
      netIncome,
      totalLoanPayments,
      debtToIncomeRatio,
      savingsRate: totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0
    };
  };

  const results = calculateResults();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Personal Finance Worksheet</h2>
        <p className="text-muted-foreground">
          Track income, expenses, loans, and custom financial fields
        </p>
      </div>

      {/* Basic Income & Expenses */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Core Finances</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="monthlyIncome">Monthly Income ($)</Label>
            <Input
              id="monthlyIncome"
              type="number"
              placeholder="5000"
              value={finances.monthlyIncome}
              onChange={(e) => setFinances(prev => ({ ...prev, monthlyIncome: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="monthlyExpenses">Monthly Expenses ($)</Label>
            <Input
              id="monthlyExpenses"
              type="number"
              placeholder="3000"
              value={finances.monthlyExpenses}
              onChange={(e) => setFinances(prev => ({ ...prev, monthlyExpenses: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="savings">Current Savings ($)</Label>
            <Input
              id="savings"
              type="number"
              placeholder="10000"
              value={finances.savings}
              onChange={(e) => setFinances(prev => ({ ...prev, savings: e.target.value }))}
            />
          </div>
        </div>
      </Card>

      {/* Loans Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Loans & Debts</h3>
          <div className="flex gap-2">
            {loanTemplates.map(template => (
              <Button
                key={template.type}
                variant="outline"
                size="sm"
                onClick={() => addLoan(template)}
                className="flex items-center gap-1"
              >
                <template.icon className="h-4 w-4" />
                {template.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {finances.loans.map(loan => (
            <div key={loan.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <Input
                  value={loan.name}
                  onChange={(e) => updateLoan(loan.id, 'name', e.target.value)}
                  className="font-medium w-48"
                  placeholder="Loan name"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLoan(loan.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor={`balance-${loan.id}`}>Balance ($)</Label>
                  <Input
                    id={`balance-${loan.id}`}
                    type="number"
                    placeholder="25000"
                    value={loan.balance}
                    onChange={(e) => updateLoan(loan.id, 'balance', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor={`rate-${loan.id}`}>Interest Rate (%)</Label>
                  <Input
                    id={`rate-${loan.id}`}
                    type="number"
                    step="0.01"
                    placeholder="5.5"
                    value={loan.interestRate}
                    onChange={(e) => updateLoan(loan.id, 'interestRate', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor={`payment-${loan.id}`}>Min Payment ($)</Label>
                  <Input
                    id={`payment-${loan.id}`}
                    type="number"
                    placeholder="500"
                    value={loan.minPayment}
                    onChange={(e) => updateLoan(loan.id, 'minPayment', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor={`term-${loan.id}`}>Term (months)</Label>
                  <Input
                    id={`term-${loan.id}`}
                    type="number"
                    placeholder="360"
                    value={loan.termMonths}
                    onChange={(e) => updateLoan(loan.id, 'termMonths', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
          
          {finances.loans.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No loans added yet. Click a loan type above to get started.
            </div>
          )}
        </div>
      </Card>

      {/* Custom Fields */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Custom Fields</h3>
          <Button onClick={addCustomField} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Field
          </Button>
        </div>

        <div className="space-y-3">
          {customFields.map(field => (
            <div key={field.id} className="flex items-center gap-4 p-3 border rounded-lg">
              <Input
                value={field.name}
                onChange={(e) => updateCustomField(field.id, 'name', e.target.value)}
                placeholder="Field name"
                className="flex-1"
              />
              <select
                value={field.type}
                onChange={(e) => updateCustomField(field.id, 'type', e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
              <Input
                type="number"
                value={field.value}
                onChange={(e) => updateCustomField(field.id, 'value', e.target.value)}
                placeholder="Amount"
                className="w-32"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeCustomField(field.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Results */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Financial Summary</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">
              ${results.netIncome.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Net Monthly Income</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {results.debtToIncomeRatio.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Debt-to-Income Ratio</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {results.savingsRate.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Savings Rate</div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-muted rounded-lg">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Total Income:</strong> ${results.totalIncome.toLocaleString()}
            </div>
            <div>
              <strong>Total Expenses:</strong> ${results.totalExpenses.toLocaleString()}
            </div>
            <div>
              <strong>Loan Payments:</strong> ${results.totalLoanPayments.toLocaleString()}
            </div>
            <div>
              <strong>Available to Save:</strong> ${Math.max(0, results.netIncome).toLocaleString()}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PersonalFinanceWorksheet;