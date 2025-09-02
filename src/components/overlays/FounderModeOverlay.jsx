import { useState } from 'react';
import { X, Plus, ArrowUp, ArrowDown, Clock, Users, Target, Flag, AlertTriangle, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

const FounderModeOverlay = ({ isOpen, onClose }) => {
  const [priorities, setPriorities] = useState([
    { id: 1, text: 'Cut unnecessary expenses', impact: 'high' },
    { id: 2, text: 'Launch marketing campaign', impact: 'medium' },
    { id: 3, text: 'Hire senior developer', impact: 'low' }
  ]);

  const [decisions, setDecisions] = useState([
    { id: 1, text: 'Should I delay product launch?', deadline: '2024-01-15', urgency: 'urgent', category: 'Product' },
    { id: 2, text: 'Expand to second location?', deadline: '2024-02-01', urgency: 'later', category: 'Business' },
    { id: 3, text: 'Cut ad budget or double down?', deadline: '2024-01-10', urgency: 'urgent', category: 'Marketing' }
  ]);

  const [compassItems, setCompassItems] = useState([
    { id: 1, text: 'New investor interest', risk: 'low', opportunity: 'high', position: { x: 75, y: 25 } },
    { id: 2, text: 'Economic downturn', risk: 'high', opportunity: 'low', position: { x: 25, y: 75 } },
    { id: 3, text: 'New supplier partnership', risk: 'low', opportunity: 'medium', position: { x: 65, y: 45 } }
  ]);

  const [newPriority, setNewPriority] = useState('');
  const [newDecision, setNewDecision] = useState('');
  const [newCompassItem, setNewCompassItem] = useState('');

  const movePriority = (index, direction) => {
    const newPriorities = [...priorities];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < newPriorities.length) {
      [newPriorities[index], newPriorities[newIndex]] = [newPriorities[newIndex], newPriorities[index]];
      setPriorities(newPriorities);
    }
  };

  const addPriority = () => {
    if (newPriority.trim()) {
      setPriorities([
        { id: Date.now(), text: newPriority, impact: 'medium' },
        ...priorities
      ]);
      setNewPriority('');
    }
  };

  const addDecision = () => {
    if (newDecision.trim()) {
      setDecisions([
        ...decisions,
        { 
          id: Date.now(), 
          text: newDecision, 
          deadline: '2024-01-30', 
          urgency: 'later', 
          category: 'General' 
        }
      ]);
      setNewDecision('');
    }
  };

  const addCompassItem = () => {
    if (newCompassItem.trim()) {
      setCompassItems([
        ...compassItems,
        { 
          id: Date.now(), 
          text: newCompassItem, 
          risk: 'medium', 
          opportunity: 'medium',
          position: { x: 50, y: 50 }
        }
      ]);
      setNewCompassItem('');
    }
  };

  const markDecisionDecided = (id) => {
    setDecisions(decisions.filter(d => d.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="h-full overflow-auto">
        <div className="min-h-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Founder Mode</h1>
              <p className="text-muted-foreground mt-1">Strategic decision cockpit</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Three Strategic Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            
            {/* Priority Stack */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Priority Stack
                </CardTitle>
                <p className="text-sm text-muted-foreground">What matters most right now</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Priority Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add new priority..."
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addPriority()}
                    className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background"
                  />
                  <Button size="sm" onClick={addPriority}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Priority Cards */}
                <div className="space-y-3">
                  {priorities.map((priority, index) => (
                    <div
                      key={priority.id}
                      className="p-3 border border-border rounded-lg bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="text-xs font-medium text-muted-foreground">
                            #{index + 1}
                          </div>
                          <span className="text-sm">{priority.text}</span>
                          <Badge 
                            variant={priority.impact === 'high' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {priority.impact}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => movePriority(index, 'up')}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => movePriority(index, 'down')}
                            disabled={index === priorities.length - 1}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Decision Queue */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flag className="h-5 w-5 text-primary" />
                  Decision Queue
                </CardTitle>
                <p className="text-sm text-muted-foreground">Pending choices requiring attention</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Decision Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add new decision..."
                    value={newDecision}
                    onChange={(e) => setNewDecision(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addDecision()}
                    className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background"
                  />
                  <Button size="sm" onClick={addDecision}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Decision Cards */}
                <div className="space-y-3">
                  {decisions.map((decision) => (
                    <div
                      key={decision.id}
                      className="p-3 border border-border rounded-lg bg-card"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <span className="text-sm font-medium">{decision.text}</span>
                          <Badge 
                            variant={decision.urgency === 'urgent' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {decision.urgency}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {decision.deadline}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {decision.category}
                          </Badge>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs h-7"
                          >
                            Research
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs h-7"
                          >
                            Schedule
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="text-xs h-7"
                            onClick={() => markDecisionDecided(decision.id)}
                          >
                            Decided
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Strategic Compass */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Strategic Compass
                </CardTitle>
                <p className="text-sm text-muted-foreground">Risk vs Opportunity matrix</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Compass Item Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add new item..."
                    value={newCompassItem}
                    onChange={(e) => setNewCompassItem(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCompassItem()}
                    className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background"
                  />
                  <Button size="sm" onClick={addCompassItem}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Compass Grid */}
                <div className="relative h-64 border border-border rounded-lg bg-muted/20">
                  {/* Grid Lines */}
                  <div className="absolute inset-0">
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-border"></div>
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border"></div>
                  </div>

                  {/* Labels */}
                  <div className="absolute top-2 left-2 text-xs text-muted-foreground">
                    High Opportunity
                  </div>
                  <div className="absolute bottom-2 left-2 text-xs text-muted-foreground">
                    Low Opportunity
                  </div>
                  <div className="absolute top-2 right-2 text-xs text-muted-foreground">
                    High Risk
                  </div>
                  <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                    Low Risk
                  </div>

                  {/* Compass Items */}
                  {compassItems.map((item) => (
                    <div
                      key={item.id}
                      className="absolute w-24 h-8 bg-primary/10 border border-primary/20 rounded text-xs p-1 cursor-move hover:bg-primary/20 transition-colors"
                      style={{
                        left: `${item.position.x}%`,
                        top: `${100 - item.position.y}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      <div className="truncate text-foreground font-medium">
                        {item.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>• High Risk + High Opportunity = Strategic Moves</div>
                  <div>• Low Risk + High Opportunity = Quick Wins</div>
                  <div>• High Risk + Low Opportunity = Avoid</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FounderModeOverlay;