import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { History, Save, GitBranch, RotateCcw, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const VersionControl = ({ 
  versions = [], 
  onCommit, 
  onRevert, 
  hasUnsavedChanges = false,
  saveStatus = 'saved',
  lastSaved = null,
  className = ""
}) => {
  const [showCommitDialog, setShowCommitDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const { toast } = useToast();

  const handleCommit = async () => {
    if (!commitMessage.trim()) {
      toast({
        title: "Commit Message Required",
        description: "Please enter a commit message to save this version.",
        variant: "destructive"
      });
      return;
    }

    const result = await onCommit?.(commitMessage);
    if (result?.success) {
      setCommitMessage('');
      setShowCommitDialog(false);
      toast({
        title: "Version Saved",
        description: `Changes committed with message: "${commitMessage}"`
      });
    }
  };

  const handleRevert = async (versionId) => {
    const result = await onRevert?.(versionId);
    if (result?.success) {
      setShowHistoryDialog(false);
      toast({
        title: "Version Restored",
        description: "Successfully reverted to the selected version."
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'committed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'deleted':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSaveStatusDisplay = () => {
    switch (saveStatus) {
      case 'saving':
        return { text: 'Saving...', color: 'text-yellow-600', icon: '⏳' };
      case 'saved':
        return { 
          text: lastSaved ? `Saved ${formatDate(lastSaved)}` : 'All changes saved', 
          color: 'text-green-600', 
          icon: '✓' 
        };
      case 'error':
        return { text: 'Save failed', color: 'text-red-600', icon: '⚠️' };
      default:
        return { text: '', color: '', icon: '' };
    }
  };

  const statusDisplay = getSaveStatusDisplay();
  const committedVersions = versions.filter(v => v.status === 'committed');
  const draftVersions = versions.filter(v => v.status === 'draft');

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Save Status */}
      {statusDisplay.text && (
        <div className={`flex items-center gap-1 text-sm ${statusDisplay.color}`}>
          <span>{statusDisplay.icon}</span>
          <span>{statusDisplay.text}</span>
        </div>
      )}

      {/* Commit Button */}
      {hasUnsavedChanges && (
        <Dialog open={showCommitDialog} onOpenChange={setShowCommitDialog}>
          <DialogTrigger asChild>
            <Button size="sm" variant="default">
              <Save className="h-4 w-4 mr-2" />
              Commit Changes
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Commit Changes
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="commit-message">Commit Message</Label>
                <Input
                  id="commit-message"
                  placeholder="Describe what you changed..."
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleCommit();
                    }
                  }}
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCommitDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCommit} disabled={!commitMessage.trim()}>
                  <Save className="h-4 w-4 mr-2" />
                  Commit
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Version History */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <History className="h-4 w-4 mr-2" />
            History ({versions.length})
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Version History
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-auto">
            {/* Drafts Section */}
            {draftVersions.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Draft Versions</h4>
                <div className="space-y-2">
                  {draftVersions.map(version => (
                    <div key={version.id} className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(version.status)}>
                            Draft v{version.version_number}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(version.updated_at)}
                          </span>
                        </div>
                        {version.content?.commit_message && (
                          <p className="text-sm mt-1 text-muted-foreground">
                            {version.content.commit_message}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevert(version.id)}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Restore
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Committed Versions Section */}
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Committed Versions</h4>
              {committedVersions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No committed versions yet</p>
                  <p className="text-sm">Save your first version to see it here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {committedVersions.map(version => (
                    <div key={version.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(version.status)}>
                            v{version.version_number}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(version.created_at)}
                          </span>
                        </div>
                        {version.content?.commit_message && (
                          <div className="flex items-start gap-2 mt-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <p className="text-sm">{version.content.commit_message}</p>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevert(version.id)}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Restore
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VersionControl;