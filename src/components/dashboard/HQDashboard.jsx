import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useVentures } from '@/hooks/useVentures';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, Target, Activity } from 'lucide-react';

const HQDashboard = ({ onNavigate }) => {
  const { ventures, loading: venturesLoading } = useVentures();
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [portfolioMetrics, setPortfolioMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load recent timeline events
      const { data: events } = await supabase
        .from('timeline_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setTimelineEvents(events || []);

      // Calculate portfolio metrics
      const metrics = calculatePortfolioMetrics(ventures, events || []);
      setPortfolioMetrics(metrics);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePortfolioMetrics = (ventures, events) => {
    const totalVentures = ventures.length;
    const activeVentures = ventures.filter(v => v.status === 'active').length;
    const recentActivity = events.filter(e => {
      const eventDate = new Date(e.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return eventDate > weekAgo;
    }).length;

    // Calculate average ROI from recent ROI worksheets
    const roiEvents = events.filter(e => 
      e.payload?.type === 'roi_worksheet' && e.payload?.roi
    );
    const avgROI = roiEvents.length > 0 
      ? roiEvents.reduce((sum, e) => sum + parseFloat(e.payload.roi), 0) / roiEvents.length 
      : 0;

    return {
      totalVentures,
      activeVentures,
      recentActivity,
      avgROI: avgROI.toFixed(1)
    };
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMinutes > 0) return `${diffMinutes}m ago`;
    return 'Just now';
  };

  if (loading || venturesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI HQ</h1>
          <p className="text-muted-foreground">Your venture command center</p>
        </div>
        <Button onClick={() => onNavigate?.('ventures/new')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Venture
        </Button>
      </div>

      {/* Portfolio Metrics */}
      {portfolioMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{portfolioMetrics.totalVentures}</div>
                <div className="text-sm text-muted-foreground">Total Ventures</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{portfolioMetrics.activeVentures}</div>
                <div className="text-sm text-muted-foreground">Active Ventures</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{portfolioMetrics.avgROI}%</div>
                <div className="text-sm text-muted-foreground">Avg ROI</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{portfolioMetrics.recentActivity}</div>
                <div className="text-sm text-muted-foreground">This Week</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Ventures */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Ventures</h2>
            <Button variant="outline" size="sm" onClick={() => onNavigate?.('ventures')}>
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {ventures.slice(0, 5).map((venture) => (
              <div 
                key={venture.id} 
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                onClick={() => onNavigate?.(`ventures/${venture.id}`)}
              >
                <div>
                  <div className="font-medium">{venture.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {venture.type} • {venture.stage}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatTimeAgo(venture.created_at)}
                </div>
              </div>
            ))}
            {ventures.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No ventures yet</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => onNavigate?.('ventures/new')}
                >
                  Create Your First Venture
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Activity Timeline */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <Button variant="outline" size="sm" onClick={() => onNavigate?.('activity')}>
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {timelineEvents.slice(0, 6).map((event) => (
              <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="font-medium">{event.title}</div>
                  {event.body && (
                    <div className="text-sm text-muted-foreground">{event.body}</div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatTimeAgo(event.created_at)}
                  </div>
                </div>
              </div>
            ))}
            {timelineEvents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
                <p className="text-sm">Start by creating a venture or running an analysis</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HQDashboard;