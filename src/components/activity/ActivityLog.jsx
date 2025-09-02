import { useState } from 'react';
import { 
  Activity, 
  FileSpreadsheet, 
  Upload, 
  Download, 
  Eye, 
  Edit3, 
  Trash2,
  Clock,
  Filter,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

const ActivityLog = ({ className }) => {
  const [filter, setFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('7d');

  const filterOptions = [
    { id: 'all', label: 'All Activity' },
    { id: 'worksheets', label: 'Worksheets' },
    { id: 'imports', label: 'Imports' },
    { id: 'reports', label: 'Reports' },
    { id: 'promotions', label: 'Promotions' }
  ];

  const timeOptions = [
    { id: '24h', label: 'Last 24 hours' },
    { id: '7d', label: 'Last 7 days' },
    { id: '30d', label: 'Last 30 days' },
    { id: 'all', label: 'All time' }
  ];

  const activities = [
    {
      id: 1,
      type: 'worksheet_created',
      title: 'Created Cash Flow Worksheet',
      description: 'New worksheet for Coffee Kiosk venture',
      timestamp: '2 hours ago',
      icon: FileSpreadsheet,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 2,
      type: 'data_imported',
      title: 'Imported CSV data',
      description: 'Expense data imported for Q4 analysis',
      timestamp: '4 hours ago',
      icon: Upload,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 3,
      type: 'worksheet_promoted',
      title: 'Promoted worksheet to Live',
      description: 'Cash Flow Worksheet moved from Draft to Live',
      timestamp: '1 day ago',
      icon: Eye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 4,
      type: 'report_generated',
      title: 'Generated Monthly Report',
      description: 'Financial summary for November 2024',
      timestamp: '2 days ago',
      icon: Download,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      id: 5,
      type: 'worksheet_edited',
      title: 'Edited Revenue Projections',
      description: 'Updated Q1 2025 revenue assumptions',
      timestamp: '3 days ago',
      icon: Edit3,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      id: 6,
      type: 'worksheet_deleted',
      title: 'Deleted old worksheet',
      description: 'Removed outdated hiring plan worksheet',
      timestamp: '5 days ago',
      icon: Trash2,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(activity => {
        switch (filter) {
          case 'worksheets':
            return activity.type.includes('worksheet');
          case 'imports':
            return activity.type.includes('import');
          case 'reports':
            return activity.type.includes('report');
          case 'promotions':
            return activity.type.includes('promoted');
          default:
            return true;
        }
      });

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Activity Log</h1>
          <p className="text-muted-foreground">Track all actions across your workspace</p>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-sm border rounded-md px-2 py-1 bg-background"
            >
              {filterOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-sm border rounded-md px-2 py-1 bg-background"
            >
              {timeOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium text-foreground mb-2">No activity found</h3>
              <p className="text-sm text-muted-foreground text-center">
                No activities match the selected filters
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredActivities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <Card key={activity.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                      activity.bgColor
                    )}>
                      <Icon className={cn("h-5 w-5", activity.color)} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base truncate">
                          {activity.title}
                        </CardTitle>
                        <div className="flex items-center text-xs text-muted-foreground flex-shrink-0 ml-2">
                          <Clock className="h-3 w-3 mr-1" />
                          {activity.timestamp}
                        </div>
                      </div>
                      <CardDescription className="mt-1">
                        {activity.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })
        )}
      </div>
      
      {/* Load More */}
      {filteredActivities.length > 0 && (
        <div className="text-center">
          <Button variant="outline">
            Load more activities
          </Button>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;