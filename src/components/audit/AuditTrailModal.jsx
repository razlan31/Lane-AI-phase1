import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, User, Bot, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export const AuditTrailModal = ({ isOpen, onClose, contextId, contextType = 'all' }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (isOpen) {
      fetchAuditLogs();
    }
  }, [isOpen, contextId, contextType, filter]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('manual_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filter !== 'all') {
        query = query.eq('type', filter);
      }

      if (contextId && contextType !== 'all') {
        query = query.eq('venture_id', contextId);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;

      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'ai_suggestion':
        return <Bot className="h-4 w-4 text-blue-500" />;
      case 'user_action':
        return <User className="h-4 w-4 text-green-500" />;
      case 'system_event':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLogContent = (log) => {
    try {
      const content = typeof log.content === 'string' ? JSON.parse(log.content) : log.content;
      
      if (log.type === 'ai_suggestion') {
        return (
          <div className="space-y-2">
            <p className="font-medium">{content.suggestion_text}</p>
            <p className="text-sm text-muted-foreground">{content.reasoning}</p>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                Confidence: {Math.round(content.confidence * 100)}%
              </Badge>
              {content.accepted ? (
                <Badge variant="default" className="bg-green-100 text-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Accepted
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <XCircle className="h-3 w-3 mr-1" />
                  Dismissed
                </Badge>
              )}
            </div>
          </div>
        );
      }
      
      return <p>{content.message || log.content}</p>;
    } catch {
      return <p>{log.content}</p>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const filterTypes = [
    { value: 'all', label: 'All Events' },
    { value: 'ai_suggestion', label: 'AI Suggestions' },
    { value: 'user_action', label: 'User Actions' },
    { value: 'system_event', label: 'System Events' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Audit Trail
          </DialogTitle>
        </DialogHeader>
        
        {/* Filter Controls */}
        <div className="flex gap-2 mb-4">
          {filterTypes.map(type => (
            <Button
              key={type.value}
              variant={filter === type.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(type.value)}
            >
              {type.label}
            </Button>
          ))}
        </div>

        <ScrollArea className="h-[500px] w-full pr-4">
          {loading ? (
            <div className="text-center py-8">Loading audit trail...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No audit trail entries found.
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getLogIcon(log.type)}
                      <Badge variant="outline" className="text-xs">
                        {log.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(log.created_at)}
                    </span>
                  </div>
                  
                  <div className="ml-6">
                    {getLogContent(log)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};