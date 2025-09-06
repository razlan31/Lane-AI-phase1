import { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  Activity,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import KpiCard from '../primitives/KpiCard';
import { cn } from '../../lib/utils';

const AdminUsageDashboard = ({ className }) => {
  const [timeRange, setTimeRange] = useState('30d');
  const [isVisible, setIsVisible] = useState(false);

  // Check if admin mode should be visible (env flag simulation)
  const isAdminMode = process.env.NODE_ENV === 'development' || window.location.search.includes('admin=true');

  if (!isAdminMode) {
    return (
      <div className={cn("flex items-center justify-center min-h-[400px]", className)}>
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <EyeOff className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium text-foreground mb-2">Admin Access Required</h3>
            <p className="text-sm text-muted-foreground text-center">
              This dashboard is only available in development mode or with admin access
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const timeOptions = [
    { id: '7d', label: 'Last 7 days' },
    { id: '30d', label: 'Last 30 days' },
    { id: '90d', label: 'Last 90 days' },
    { id: '1y', label: 'Last year' }
  ];

  const overviewMetrics = [
    {
      title: "Total Users",
      description: "All registered users across plans",
      value: 1247,
      unit: "number",
      trend: 12,
      trendDirection: "up"
    },
    {
      title: "Active Users",
      description: "Users who logged in this month",
      value: 892,
      unit: "number",
      trend: 8,
      trendDirection: "up"
    },
    {
      title: "Monthly Revenue",
      description: "Total subscription revenue",
      value: 18450,
      unit: "currency",
      trend: 15,
      trendDirection: "up"
    },
    {
      title: "Churn Rate",
      description: "Users who cancelled this month",
      value: 3.2,
      unit: "percentage",
      trend: 0.8,
      trendDirection: "down",
      state: "warning"
    }
  ];

  const planBreakdown = [
    { plan: 'Free', users: 756, revenue: 0, percentage: 60.6 },
    { plan: 'Founders', users: 312, revenue: 2808, percentage: 25.0 },
    { plan: 'Pro', users: 179, revenue: 2685, percentage: 14.4 }
  ];

  const usageMetrics = [
    { metric: 'Worksheets Created', value: 2456, change: '+18%' },
    { metric: 'Reports Generated', value: 1234, change: '+25%' },
    { metric: 'CSV Imports', value: 567, change: '+12%' },
    { metric: 'Dashboard Views', value: 8903, change: '+8%' },
    { metric: 'AI Chat Messages', value: 4567, change: '+45%' }
  ];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with visibility toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Usage Dashboard</h1>
          <p className="text-muted-foreground">Admin analytics and user metrics</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsVisible(!isVisible)}
          >
            {isVisible ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {isVisible ? 'Hide Data' : 'Show Data'}
          </Button>
          
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

      {!isVisible ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <EyeOff className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium text-foreground mb-2">Data Hidden</h3>
            <p className="text-sm text-muted-foreground text-center">
              Click "Show Data" to view admin metrics
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Overview Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {overviewMetrics.map((metric, index) => (
              <KpiCard
                key={index}
                title={metric.title}
                description={metric.description}
                value={metric.value}
                unit={metric.unit}
                trend={metric.trend}
                trendDirection={metric.trendDirection}
                state={metric.state}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Plan Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Users by Plan
                </CardTitle>
                <CardDescription>Distribution across subscription tiers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {planBreakdown.map((plan, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-3 h-3 rounded-full",
                          plan.plan === 'Free' && "bg-gray-400",
                          plan.plan === 'Founders' && "bg-blue-500",
                          plan.plan === 'Pro' && "bg-purple-500"
                        )} />
                        <div>
                          <div className="font-medium">{plan.plan}</div>
                          <div className="text-sm text-muted-foreground">
                            {plan.users} users ({plan.percentage}%)
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          ${plan.revenue.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          /month
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Usage Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Feature Usage
                </CardTitle>
                <CardDescription>Activity across core features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {usageMetrics.map((usage, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="font-medium">{usage.metric}</div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {usage.value.toLocaleString()}
                        </span>
                        <span className={cn(
                          "text-sm flex items-center gap-1",
                          usage.change.startsWith('+') 
                            ? "text-green-600" 
                            : "text-red-600"
                        )}>
                          {usage.change.startsWith('+') 
                            ? <TrendingUp className="h-3 w-3" />
                            : <TrendingDown className="h-3 w-3" />
                          }
                          {usage.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Revenue Trends
              </CardTitle>
              <CardDescription>Monthly revenue growth over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Simple Revenue Chart using CSS bars */}
                <div className="space-y-3">
                  {[
                    { month: 'Jan', revenue: 15000, growth: 12 },
                    { month: 'Feb', revenue: 18500, growth: 23 },
                    { month: 'Mar', revenue: 22000, growth: 19 },
                    { month: 'Apr', revenue: 25500, growth: 16 },
                    { month: 'May', revenue: 28000, growth: 10 },
                    { month: 'Jun', revenue: 32000, growth: 14 }
                  ].map((data, index) => (
                    <div key={data.month} className="flex items-center gap-3">
                      <span className="text-sm font-medium w-8">{data.month}</span>
                      <div className="flex-1 bg-muted rounded-full h-6 relative overflow-hidden">
                        <div 
                          className="bg-primary h-full transition-all duration-1000 ease-out rounded-full flex items-center justify-end pr-2"
                          style={{ 
                            width: `${(data.revenue / 32000) * 100}%`,
                            animationDelay: `${index * 0.1}s`
                          }}
                        >
                          <span className="text-xs text-white font-medium">
                            ${(data.revenue / 1000).toFixed(0)}k
                          </span>
                        </div>
                      </div>
                      <span className={`text-xs font-medium w-12 ${data.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        +{data.growth}%
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-green-600">$32k</div>
                      <div className="text-xs text-muted-foreground">Current MRR</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-blue-600">+16%</div>
                      <div className="text-xs text-muted-foreground">Growth Rate</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-600">$158k</div>
                      <div className="text-xs text-muted-foreground">YTD Revenue</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AdminUsageDashboard;