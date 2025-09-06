import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePersonal } from '@/hooks/usePersonal';
import { useToast } from '@/hooks/use-toast';
import FeatureGate from '@/components/gating/FeatureGate';
import { DollarSign, Plus, Edit3, Trash2, TrendingUp, TrendingDown, Target, PiggyBank, CreditCard, Home } from 'lucide-react';

const PersonalFinanceManager = () => {
  const [newEntry, setNewEntry] = useState({
    type: 'income',
    category: '',
    amount: '',
    description: '',
    frequency: 'monthly'
  });
  const [editingEntry, setEditingEntry] = useState(null);
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  const { 
    personalData,
    loading,
    updatePersonal,
    createPersonalEntry,
    updatePersonalEntry,
    deletePersonalEntry
  } = usePersonal();

  const { toast } = useToast();

  const predefinedCategories = {
    income: ['Salary', 'Freelance', 'Investment', 'Rental', 'Business', 'Other'],
    expense: ['Housing', 'Food', 'Transportation', 'Utilities', 'Healthcare', 'Entertainment', 'Savings', 'Other'],
    saving: ['Emergency Fund', 'Retirement', 'Investment', 'Education', 'Vacation', 'Home Down Payment', 'Other'],
    debt: ['Credit Card', 'Student Loan', 'Mortgage', 'Personal Loan', 'Auto Loan', 'Medical Debt', 'Other']
  };

  const entryTypes = [
    { key: 'income', label: 'Income', icon: TrendingUp, color: 'text-green-600' },
    { key: 'expense', label: 'Expenses', icon: TrendingDown, color: 'text-red-600' },
    { key: 'saving', label: 'Savings', icon: PiggyBank, color: 'text-blue-600' },
    { key: 'debt', label: 'Debts', icon: CreditCard, color: 'text-orange-600' }
  ];

  const handleCreateEntry = async () => {
    if (!newEntry.category || !newEntry.amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in category and amount",
        variant: "destructive"
      });
      return;
    }

    const entryData = {
      ...newEntry,
      amount: parseFloat(newEntry.amount),
      category: showCustomCategory ? customCategory : newEntry.category
    };

    const result = await createPersonalEntry(entryData);
    if (result.success) {
      toast({
        title: "Entry Added",
        description: `${entryData.type} entry created successfully`
      });
      
      // Reset form
      setNewEntry({
        type: 'income',
        category: '',
        amount: '',
        description: '',
        frequency: 'monthly'
      });
      setCustomCategory('');
      setShowCustomCategory(false);
    }
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
  };

  const handleUpdateEntry = async () => {
    if (!editingEntry.category || !editingEntry.amount) return;

    const result = await updatePersonalEntry(editingEntry.id, editingEntry);
    if (result.success) {
      toast({
        title: "Entry Updated",
        description: "Personal finance entry updated successfully"
      });
      setEditingEntry(null);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    const result = await deletePersonalEntry(entryId);
    if (result.success) {
      toast({
        title: "Entry Deleted",
        description: "Personal finance entry deleted successfully"
      });
    }
  };

  const getEntriesByType = (type) => {
    return personalData?.entries?.filter(entry => entry.type === type) || [];
  };

  const calculateTotal = (type) => {
    return getEntriesByType(type).reduce((sum, entry) => {
      const multiplier = entry.frequency === 'yearly' ? 1/12 : 
                       entry.frequency === 'weekly' ? 4.33 : 1;
      return sum + (entry.amount * multiplier);
    }, 0);
  };

  const netIncome = calculateTotal('income') - calculateTotal('expense');

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Income</p>
                <p className="text-2xl font-bold text-green-600">
                  ${calculateTotal('income').toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  ${calculateTotal('expense').toLocaleString()}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Income</p>
                <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${netIncome.toLocaleString()}
                </p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Savings</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${calculateTotal('saving').toLocaleString()}
                </p>
              </div>
              <PiggyBank className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Entry */}
      <FeatureGate feature="personal_crud">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Financial Entry
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  value={newEntry.type}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full p-2 border border-border rounded-md bg-background"
                >
                  {entryTypes.map(type => (
                    <option key={type.key} value={type.key}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                {showCustomCategory ? (
                  <div className="flex gap-1">
                    <Input
                      placeholder="Custom category"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCustomCategory(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-1">
                    <select
                      id="category"
                      value={newEntry.category}
                      onChange={(e) => {
                        if (e.target.value === 'custom') {
                          setShowCustomCategory(true);
                        } else {
                          setNewEntry(prev => ({ ...prev, category: e.target.value }));
                        }
                      }}
                      className="flex-1 p-2 border border-border rounded-md bg-background"
                    >
                      <option value="">Select category</option>
                      {predefinedCategories[newEntry.type].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="custom">+ Add Custom</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={newEntry.amount}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <select
                  id="frequency"
                  value={newEntry.frequency}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, frequency: e.target.value }))}
                  className="w-full p-2 border border-border rounded-md bg-background"
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Additional details..."
                value={newEntry.description}
                onChange={(e) => setNewEntry(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <Button onClick={handleCreateEntry} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </CardContent>
        </Card>
      </FeatureGate>

      {/* Entries by Type */}
      <Tabs defaultValue="income" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          {entryTypes.map(type => {
            const Icon = type.icon;
            const count = getEntriesByType(type.key).length;
            return (
              <TabsTrigger key={type.key} value={type.key} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {type.label} ({count})
              </TabsTrigger>
            );
          })}
        </TabsList>

        {entryTypes.map(type => (
          <TabsContent key={type.key} value={type.key}>
            <Card>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${type.color}`}>
                  <type.icon className="h-5 w-5" />
                  {type.label}
                  <Badge variant="secondary">
                    Total: ${calculateTotal(type.key).toLocaleString()}/month
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getEntriesByType(type.key).length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <type.icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No {type.label.toLowerCase()} entries yet</p>
                    <p className="text-sm">Add one above to get started</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {getEntriesByType(type.key).map(entry => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-3 border border-border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{entry.category}</h4>
                            <Badge variant="outline" className="text-xs">
                              {entry.frequency}
                            </Badge>
                          </div>
                          {entry.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {entry.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`font-semibold ${type.color}`}>
                            ${entry.amount.toLocaleString()}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditEntry(entry)}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Edit Entry Modal */}
      <Dialog open={!!editingEntry} onOpenChange={() => setEditingEntry(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Entry</DialogTitle>
          </DialogHeader>
          {editingEntry && (
            <div className="space-y-4">
              <div>
                <Label>Category</Label>
                <Input
                  value={editingEntry.category}
                  onChange={(e) => setEditingEntry(prev => ({ ...prev, category: e.target.value }))}
                />
              </div>
              <div>
                <Label>Amount ($)</Label>
                <Input
                  type="number"
                  value={editingEntry.amount}
                  onChange={(e) => setEditingEntry(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={editingEntry.description || ''}
                  onChange={(e) => setEditingEntry(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingEntry(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateEntry}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PersonalFinanceManager;