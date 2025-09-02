import React, { useState } from 'react';
import { usePersonal } from '@/hooks/usePersonal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { KpiCard } from '@/components/primitives/KpiCard';
import { PlusCircle, Save, TrendingUp, DollarSign, Clock, Target, Calendar, Zap } from 'lucide-react';

export const PersonalPage = () => {
  const { personal, loading, createOrUpdatePersonal, generatePersonalKPIs } = usePersonal();
  const [isEditing, setIsEditing] = useState(!personal);
  const [formData, setFormData] = useState({
    savings: personal?.savings || 0,
    monthly_burn: personal?.monthly_burn || 0,
    work_hours: personal?.work_hours || 40,
    commitments: personal?.commitments || [],
    activities: personal?.activities || [],
    goals: personal?.goals || []
  });

  const [newCommitment, setNewCommitment] = useState('');
  const [newActivity, setNewActivity] = useState('');
  const [newGoal, setNewGoal] = useState('');

  const personalKPIs = generatePersonalKPIs();

  const handleSave = async () => {
    const result = await createOrUpdatePersonal(formData);
    if (result.success) {
      setIsEditing(false);
    }
  };

  const addItem = (type, value) => {
    if (!value.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], value]
    }));
    
    if (type === 'commitments') setNewCommitment('');
    if (type === 'activities') setNewActivity('');
    if (type === 'goals') setNewGoal('');
  };

  const removeItem = (type, index) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading personal data...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Personal Dashboard</h1>
          <p className="text-muted-foreground">Track your personal metrics and goals</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Personal KPIs */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Personal KPIs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {personalKPIs.map((kpi, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm">{kpi.title}</h3>
                  {kpi.unit === 'currency' && <DollarSign className="w-4 h-4 text-green-600" />}
                  {kpi.unit === 'hours' && <Clock className="w-4 h-4 text-blue-600" />}
                  {kpi.unit === 'score' && <TrendingUp className="w-4 h-4 text-purple-600" />}
                  {kpi.unit === 'count' && <Target className="w-4 h-4 text-orange-600" />}
                  {kpi.unit === 'months' && <Calendar className="w-4 h-4 text-red-600" />}
                </div>
                <div className="text-2xl font-bold">
                  {kpi.unit === 'currency' ? `$${kpi.value.toLocaleString()}` : 
                   kpi.unit === 'hours' ? `${kpi.value}h` :
                   kpi.unit === 'months' ? `${kpi.value}mo` :
                   kpi.value}
                </div>
                <Badge variant="outline" className="text-xs mt-2">
                  {kpi.confidence === 'real' ? '✅ Real' : '⚠️ Estimate'}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Financial Overview */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Financial Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Savings & Burn Rate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <label className="text-sm font-medium">Current Savings</label>
                    <Input
                      type="number"
                      value={formData.savings}
                      onChange={(e) => setFormData(prev => ({ ...prev, savings: Number(e.target.value) }))}
                      placeholder="Enter your savings"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Monthly Burn Rate</label>
                    <Input
                      type="number"
                      value={formData.monthly_burn}
                      onChange={(e) => setFormData(prev => ({ ...prev, monthly_burn: Number(e.target.value) }))}
                      placeholder="Enter monthly expenses"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span>Current Savings:</span>
                    <span className="font-medium">${(personal?.savings || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Burn:</span>
                    <span className="font-medium">${(personal?.monthly_burn || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Personal Runway:</span>
                    <span className="font-bold">
                      {personal?.savings && personal?.monthly_burn 
                        ? `${Math.round(personal.savings / personal.monthly_burn)} months`
                        : 'N/A'}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Time Allocation
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div>
                  <label className="text-sm font-medium">Work Hours per Week</label>
                  <Input
                    type="number"
                    value={formData.work_hours}
                    onChange={(e) => setFormData(prev => ({ ...prev, work_hours: Number(e.target.value) }))}
                    placeholder="Enter work hours"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Work Hours/Week:</span>
                    <span className="font-medium">{personal?.work_hours || 40}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Available Hours:</span>
                    <span className="font-medium">{168 - (personal?.work_hours || 40)}h</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Commitments, Activities, Goals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Commitments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Commitments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isEditing && (
              <div className="flex gap-2">
                <Input
                  value={newCommitment}
                  onChange={(e) => setNewCommitment(e.target.value)}
                  placeholder="Add commitment"
                  onKeyPress={(e) => e.key === 'Enter' && addItem('commitments', newCommitment)}
                />
                <Button 
                  size="sm" 
                  onClick={() => addItem('commitments', newCommitment)}
                >
                  <PlusCircle className="w-4 h-4" />
                </Button>
              </div>
            )}
            
            <div className="space-y-2">
              {formData.commitments.map((commitment, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">{commitment}</span>
                  {isEditing && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => removeItem('commitments', index)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isEditing && (
              <div className="flex gap-2">
                <Input
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  placeholder="Add activity"
                  onKeyPress={(e) => e.key === 'Enter' && addItem('activities', newActivity)}
                />
                <Button 
                  size="sm" 
                  onClick={() => addItem('activities', newActivity)}
                >
                  <PlusCircle className="w-4 h-4" />
                </Button>
              </div>
            )}
            
            <div className="space-y-2">
              {formData.activities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">{activity}</span>
                  {isEditing && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => removeItem('activities', index)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isEditing && (
              <div className="flex gap-2">
                <Input
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="Add goal"
                  onKeyPress={(e) => e.key === 'Enter' && addItem('goals', newGoal)}
                />
                <Button 
                  size="sm" 
                  onClick={() => addItem('goals', newGoal)}
                >
                  <PlusCircle className="w-4 h-4" />
                </Button>
              </div>
            )}
            
            <div className="space-y-2">
              {formData.goals.map((goal, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">{goal}</span>
                  {isEditing && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => removeItem('goals', index)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Personal Worksheets Preview */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Personal Worksheets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Budget Planner', description: 'Track income and expenses' },
            { name: 'Savings Calculator', description: 'Plan your financial runway' },
            { name: 'Time Allocation', description: 'Optimize your schedule' },
            { name: 'Work-Life Balance', description: 'Monitor your wellbeing' },
            { name: 'Personal-Venture Bridge', description: 'Align personal and business goals' }
          ].map((worksheet) => (
            <Card key={worksheet.name} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-base">{worksheet.name}</CardTitle>
                <CardDescription className="text-sm">{worksheet.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" className="w-full">
                  Open Worksheet
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};