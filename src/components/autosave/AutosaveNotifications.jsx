import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const AutosaveStatus = ({ status, lastSaved, onRetry, className = "" }) => {
  const getStatusDisplay = () => {
    switch (status) {
      case 'saving':
        return { 
          text: 'Saving...', 
          icon: (
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ), 
          color: 'text-warning' 
        };
      case 'saved':
        return { 
          text: lastSaved ? `Saved ${formatLastSaved(lastSaved)}` : 'All changes saved', 
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ), 
          color: 'text-success' 
        };
      case 'error':
        return { 
          text: 'Failed to save', 
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ), 
          color: 'text-destructive' 
        };
      default:
        return null;
    }
  };

  const formatLastSaved = (date) => {
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const statusInfo = getStatusDisplay();

  if (!statusInfo) return null;

  return (
    <div className={`flex items-center gap-2 text-sm ${statusInfo.color} ${className}`}>
      {statusInfo.icon}
      <span>{statusInfo.text}</span>
      {status === 'error' && onRetry && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onRetry}
          className="h-auto p-1 text-xs underline"
        >
          Retry
        </Button>
      )}
    </div>
  );
};

export const RecoveryBanner = ({ 
  isVisible, 
  onRestore, 
  onDismiss, 
  recoveryData, 
  className = "" 
}) => {
  if (!isVisible) return null;

  return (
    <Card className={`border-warning bg-warning/10 p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-warning" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-foreground">Unsaved changes found</h4>
            <p className="text-sm text-muted-foreground">
              We found unsaved changes from your previous session. Would you like to restore them?
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onDismiss}>
            Discard
          </Button>
          <Button size="sm" onClick={onRestore}>
            Restore
          </Button>
        </div>
      </div>
    </Card>
  );
};

export const RollbackBanner = ({ 
  isVisible, 
  onUndo, 
  onDismiss, 
  actionDescription, 
  undoTimeLeft,
  className = "" 
}) => {
  if (!isVisible) return null;

  return (
    <Card className={`border-info bg-info/10 p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-info/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-info" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-foreground">{actionDescription}</h4>
            <p className="text-sm text-muted-foreground">
              {undoTimeLeft ? `Undo in ${undoTimeLeft}s` : 'Click undo to revert this action'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onDismiss}>
            Keep
          </Button>
          <Button size="sm" onClick={onUndo}>
            Undo
          </Button>
        </div>
      </div>
    </Card>
  );
};

export const SaveToast = ({ 
  isVisible, 
  type, 
  message, 
  onClose, 
  autoHide = true, 
  hideDelay = 3000,
  className = ""
}) => {
  const [countdown, setCountdown] = React.useState(hideDelay / 1000);

  React.useEffect(() => {
    if (!isVisible || !autoHide) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          onClose?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, autoHide, onClose]);

  React.useEffect(() => {
    if (isVisible) {
      setCountdown(hideDelay / 1000);
    }
  }, [isVisible, hideDelay]);

  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'border-success bg-success/10 text-success';
      case 'error':
        return 'border-destructive bg-destructive/10 text-destructive';
      case 'saving':
        return 'border-warning bg-warning/10 text-warning';
      default:
        return 'border-border bg-background';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'saving':
        return (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <Card className={`p-4 shadow-lg ${getTypeStyles()}`}>
        <div className="flex items-center gap-3">
          {getIcon()}
          <div className="flex-1">
            <p className="font-medium">{message}</p>
            {autoHide && countdown > 0 && (
              <p className="text-xs opacity-75">Closes in {countdown}s</p>
            )}
          </div>
          {onClose && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-auto p-1"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

// Hook for managing all autosave notifications
export const useAutosaveNotifications = () => {
  const [saveToast, setSaveToast] = React.useState({
    isVisible: false,
    type: 'success',
    message: ''
  });

  const [recoveryBanner, setRecoveryBanner] = React.useState({
    isVisible: false,
    recoveryData: null
  });

  const [rollbackBanner, setRollbackBanner] = React.useState({
    isVisible: false,
    actionDescription: '',
    undoTimeLeft: 0
  });

  const showSaveToast = (type, message) => {
    setSaveToast({
      isVisible: true,
      type,
      message
    });
  };

  const hideSaveToast = () => {
    setSaveToast(prev => ({ ...prev, isVisible: false }));
  };

  const showRecoveryBanner = (recoveryData) => {
    setRecoveryBanner({
      isVisible: true,
      recoveryData
    });
  };

  const hideRecoveryBanner = () => {
    setRecoveryBanner(prev => ({ ...prev, isVisible: false }));
  };

  const showRollbackBanner = (actionDescription, undoTimeLeft = 10) => {
    setRollbackBanner({
      isVisible: true,
      actionDescription,
      undoTimeLeft
    });
  };

  const hideRollbackBanner = () => {
    setRollbackBanner(prev => ({ ...prev, isVisible: false }));
  };

  return {
    saveToast,
    recoveryBanner,
    rollbackBanner,
    showSaveToast,
    hideSaveToast,
    showRecoveryBanner,
    hideRecoveryBanner,
    showRollbackBanner,
    hideRollbackBanner
  };
};

export default {
  AutosaveStatus,
  RecoveryBanner,
  RollbackBanner,
  SaveToast,
  useAutosaveNotifications
};