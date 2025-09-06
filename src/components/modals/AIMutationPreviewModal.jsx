import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AIMutationPreviewModal = ({
  open,
  onOpenChange,
  proposedAction, // { action, resourceType, payload, validation }
  selectedRole,
}) => {
  const { toast } = useToast();
  const [applying, setApplying] = useState(false);

  if (!proposedAction) return null;

  const humanSummary = () => {
    const { action, resourceType, payload } = proposedAction;
    if (action === 'create_idea') {
      return `Create a new idea titled "${payload?.title || 'Untitled'}" in ${resourceType}.`;
    }
    if (action === 'journal_entry' || (resourceType === 'personal_journal')) {
      return `Add a new journal entry${payload?.mood ? ` (mood: ${payload.mood})` : ''}.`;
    }
    if (action === 'create_note') {
      return `Create a scratchpad note with ${payload?.text?.length || 0} characters.`;
    }
    return `Apply action "${action}" to ${resourceType}.`;
  };

  const handleConfirm = async () => {
    try {
      setApplying(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('ai-meta-apply', {
        body: {
          role: selectedRole || 'assistant',
          action: proposedAction.action,
          payload: proposedAction.payload,
          confirm: true
        },
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (error || data?.error) {
        throw new Error(error?.message || data?.error || 'Failed to apply');
      }

      toast.success('AI suggestion applied successfully');
      onOpenChange(false);
    } catch (e) {
      toast.error(`Apply failed: ${e.message}`);
    } finally {
      setApplying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>AI Proposed Change</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{selectedRole || 'assistant'}</Badge>
            <Badge>{proposedAction.action}</Badge>
            <Badge variant="outline">{proposedAction.resourceType}</Badge>
            {proposedAction.validation && (
              <Badge className={proposedAction.validation.allowed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {proposedAction.validation.allowed ? 'Allowed' : 'Blocked'}
              </Badge>
            )}
          </div>

          <Card className="p-3 text-sm">
            {humanSummary()}
          </Card>

          <details className="text-sm">
            <summary className="cursor-pointer">View JSON payload</summary>
            <pre className="mt-2 p-2 bg-muted rounded overflow-auto text-xs">
              {JSON.stringify(proposedAction.payload, null, 2)}
            </pre>
          </details>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={!proposedAction.validation?.allowed || applying}>
              {applying ? 'Applying...' : 'Confirm'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIMutationPreviewModal;