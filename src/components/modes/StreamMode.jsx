import React, { useState } from 'react';
import { Activity, TrendingUp, AlertTriangle, Lightbulb, Filter, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { cn } from '../../lib/utils';

const StreamMode = ({ className }) => {
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All', icon: Activity },
    { id: 'insights', label: 'Insights', icon: Lightbulb },
    { id: 'risks', label: 'Risks', icon: AlertTriangle },
    { id: 'opportunities', label: 'Opportunities', icon: TrendingUp }
  ];

  const streamEntries = [
    {
      id: 1,
      type: 'insight',
      title: 'Customer acquisition cost decreased by 15%',
      description: 'Your marketing efficiency improved this month',
      venture: 'Coffee Kiosk',
      timestamp: '2 hours ago',
      severity: 'positive'
    },
    {
      id: 2,
      type: 'risk',
      title: 'Runway below 6 months',
      description: 'Current spending rate will exhaust funds by March',
      venture: 'Coffee Kiosk',
      timestamp: '4 hours ago',
      severity: 'warning'
    },
    {
      id: 3,
      type: 'opportunity',
      title: 'Seasonal demand spike detected',
      description: 'Holiday patterns suggest 40% revenue increase potential',
      venture: 'Coffee Kiosk',
      timestamp: '1 day ago',
      severity: 'positive'
    },
    {
      id: 4,
      type: 'insight',
      title: 'Personal expenses trending up',
      description: 'Monthly personal burn rate increased 12%',
      venture: 'Personal',
      timestamp: '2 days ago',
      severity: 'neutral'
    },
    {
      id: 5,
      type: 'opportunity',
      title: 'New market segment emerging',
      description: 'Remote workers showing 25% higher engagement',
      venture: 'Coffee Kiosk',
      timestamp: '3 days ago',
      severity: 'positive'
    }
  ];

  const getEntryIcon = (type) => {
    switch (type) {
      case 'insight': return Lightbulb;
      case 'risk': return AlertTriangle;
      case 'opportunity': return TrendingUp;
      default: return Activity;
    }
  };

  const getEntryColor = (type, severity) => {
    if (type === 'risk') return 'text-red-600';
    if (type === 'opportunity') return 'text-green-600';
    if (type === 'insight' && severity === 'positive') return 'text-blue-600';
    if (severity === 'warning') return 'text-yellow-600';
    return 'text-muted-foreground';
  };

  const getEntryBgColor = (type, severity) => {
    if (type === 'risk') return 'bg-red-50';
    if (type === 'opportunity') return 'bg-green-50';
    if (type === 'insight' && severity === 'positive') return 'bg-blue-50';
    if (severity === 'warning') return 'bg-yellow-50';
    return 'bg-muted/20';
  };

  const filteredEntries = activeFilter === 'all' 
    ? streamEntries 
    : streamEntries.filter(entry => entry.type === activeFilter);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Activity Stream</h1>
          <p className="text-muted-foreground">Real-time insights, risks, and opportunities</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex bg-muted rounded-lg p-1">
            {filters.map((filter) => {
              const Icon = filter.icon;
              return (
                <Button
                  key={filter.id}
                  variant={activeFilter === filter.id ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setActiveFilter(filter.id)}
                  className="flex items-center gap-1"
                >
                  <Icon className="h-3 w-3" />
                  {filter.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stream Timeline */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium text-foreground mb-2">No {activeFilter} entries</h3>
              <p className="text-sm text-muted-foreground text-center">
                {activeFilter === 'all' 
                  ? 'Your activity stream will appear here as data flows in'
                  : `No ${activeFilter} have been detected yet`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredEntries.map((entry) => {
            const Icon = getEntryIcon(entry.type);
            return (
              <Card key={entry.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      getEntryBgColor(entry.type, entry.severity)
                    )}>
                      <Icon className={cn(
                        "h-5 w-5",
                        getEntryColor(entry.type, entry.severity)
                      )} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{entry.title}</CardTitle>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {entry.timestamp}
                        </div>
                      </div>
                      <CardDescription className="mt-1">
                        {entry.description}
                      </CardDescription>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs px-2 py-1 bg-muted rounded-md">
                          {entry.venture}
                        </span>
                        <span className={cn(
                          "text-xs px-2 py-1 rounded-md capitalize",
                          entry.type === 'risk' && "bg-red-100 text-red-700",
                          entry.type === 'opportunity' && "bg-green-100 text-green-700",
                          entry.type === 'insight' && "bg-blue-100 text-blue-700"
                        )}>
                          {entry.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StreamMode;