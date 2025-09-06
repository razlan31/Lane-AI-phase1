import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Plus, TrendingUp, Users, DollarSign, Rocket, Award } from 'lucide-react';

const TimelineEvents = ({ ventureId }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    body: '',
    kind: 'milestone',
    payload: {}
  });
  const { toast } = useToast();

  const eventTypes = [
    { value: 'funding', label: 'Funding Round', icon: DollarSign, color: 'text-green-600' },
    { value: 'launch', label: 'Product Launch', icon: Rocket, color: 'text-blue-600' },
    { value: 'hire', label: 'Key Hire', icon: Users, color: 'text-purple-600' },
    { value: 'milestone', label: 'Milestone', icon: Award, color: 'text-orange-600' },
    { value: 'partnership', label: 'Partnership', icon: TrendingUp, color: 'text-indigo-600' }
  ];

  const fetchEvents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('timeline_events')
        .select('*')
        .eq('user_id', user.id)
        .eq('venture_id', ventureId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching timeline events:', error);
      toast({
        title: "Error",
        description: "Failed to load timeline events",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('timeline_events')
        .insert({
          user_id: user.id,
          venture_id: ventureId,
          title: newEvent.title,
          body: newEvent.body,
          kind: newEvent.kind,
          payload: newEvent.payload
        });

      if (error) throw error;

      setNewEvent({ title: '', body: '', kind: 'milestone', payload: {} });
      setIsAddingEvent(false);
      fetchEvents();

      toast({
        title: "Event Added",
        description: "Timeline event has been added successfully"
      });
    } catch (error) {
      console.error('Error adding timeline event:', error);
      toast({
        title: "Error",
        description: "Failed to add timeline event",
        variant: "destructive"
      });
    }
  };

  const getEventIcon = (kind) => {
    const eventType = eventTypes.find(type => type.value === kind);
    const Icon = eventType?.icon || Award;
    return <Icon className={`h-5 w-5 ${eventType?.color || 'text-gray-600'}`} />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  useEffect(() => {
    if (ventureId) {
      fetchEvents();
    }
  }, [ventureId]);

  if (loading) {
    return <div className="text-center p-4">Loading timeline...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Timeline</h3>
        <Dialog open={isAddingEvent} onOpenChange={setIsAddingEvent}>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Timeline Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="event-type">Event Type</Label>
                <Select value={newEvent.kind} onValueChange={(value) => setNewEvent(prev => ({ ...prev, kind: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className={`h-4 w-4 ${type.color}`} />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="event-title">Title</Label>
                <Input
                  id="event-title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Closed Series A funding"
                />
              </div>
              
              <div>
                <Label htmlFor="event-description">Description</Label>
                <Textarea
                  id="event-description"
                  value={newEvent.body}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Provide details about this event..."
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddingEvent(false)}>
                  Cancel
                </Button>
                <Button onClick={addEvent} disabled={!newEvent.title}>
                  Add Event
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {events.length === 0 ? (
        <Card className="p-6 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="font-medium mb-2">No timeline events yet</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Start tracking key milestones, funding rounds, and important events for this venture.
          </p>
          <Button onClick={() => setIsAddingEvent(true)}>
            Add First Event
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {getEventIcon(event.kind)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{event.title}</h4>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(event.created_at)}
                    </span>
                  </div>
                  {event.body && (
                    <p className="text-sm text-muted-foreground mt-1">{event.body}</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimelineEvents;