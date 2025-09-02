import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Check, Save, RotateCcw, AlertCircle, X, Undo } from 'lucide-react';

// Autosave Status Component
const AutosaveStatus = ({ 
  status = 'saved', // 'saving' | 'saved' | 'error' | 'offline'
  lastSaved,
  className 
}) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'saving':
        return {
          icon: Save,
          text: 'Saving...',
          className: 'text-muted-foreground'
        };
      case 'saved':
        return {
          icon: Check,
          text: 'All changes saved',
          className: 'text-success'
        };
      case 'error':
        return {
          icon: AlertCircle,
          text: 'Save failed',
          className: 'text-destructive'
        };
      case 'offline':
        return {
          icon: AlertCircle,
          text: 'Offline - changes saved locally',
          className: 'text-warning'
        };
      default:
        return {
          icon: Save,
          text: 'Unknown status',
          className: 'text-muted-foreground'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <div className={cn("flex items-center gap-2 text-xs", config.className, className)}>
      <Icon className="h-3 w-3" />
      <span>{config.text}</span>
      {lastSaved && status === 'saved' && (
        <span className="text-muted-foreground">
          • Last saved {lastSaved}
        </span>
      )}
    </div>
  );
};

// Recovery Banner Component
const RecoveryBanner = ({ 
  isVisible, 
  onRestore, 
  onDismiss,
  recoveryData,
  className 
}) => {
  if (!isVisible) return null;

  return (
    <div className={cn(
      "bg-info/10 border border-info/20 rounded-lg p-4 mb-4",
      className
    )}>
      <div className="flex items-start gap-3">
        <RotateCcw className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="font-medium text-sm text-info mb-1">
            Recovery Available
          </div>
          <div className="text-sm text-muted-foreground mb-3">
            We found unsaved changes from {recoveryData?.timestamp || 'your last session'}. 
            Would you like to restore them?
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onRestore}>
              Restore Changes
            </Button>
            <Button size="sm" variant="ghost" onClick={onDismiss}>
              Discard
            </Button>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={onDismiss}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

// Rollback Banner Component
const RollbackBanner = ({ 
  isVisible, 
  onUndo, 
  onDismiss,
  actionDescription,
  undoTimeLeft,
  className 
}) => {
  const [timeLeft, setTimeLeft] = useState(undoTimeLeft || 10);

  useEffect(() => {
    if (!isVisible || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onDismiss?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, timeLeft, onDismiss]);

  if (!isVisible) return null;

  return (
    <div className={cn(
      "bg-card border border-border rounded-lg p-4 shadow-lg",
      className
    )}>
      <div className="flex items-center gap-3">
        <Check className="h-4 w-4 text-success" />
        <div className="flex-1">
          <span className="text-sm font-medium">
            {actionDescription || 'Action completed'}
          </span>
        </div>
        <Button size="sm" variant="outline" onClick={onUndo} className="gap-2">
          <Undo className="h-3 w-3" />
          Undo ({timeLeft}s)
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={onDismiss}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

// Toast-style notification
const SaveToast = ({ 
  isVisible, 
  type = 'success', // 'success' | 'error' | 'saving'
  message,
  onClose,
  autoHide = true,
  hideDelay = 3000
}) => {
  useEffect(() => {
    if (isVisible && autoHide && type === 'success') {
      const timer = setTimeout(() => {
        onClose?.();
      }, hideDelay);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoHide, hideDelay, type, onClose]);

  if (!isVisible) return null;

  const getToastConfig = (type) => {
    switch (type) {
      case 'success':
        return {
          icon: Check,
          className: 'bg-success/10 border-success/20 text-success'
        };
      case 'error':
        return {
          icon: AlertCircle,
          className: 'bg-destructive/10 border-destructive/20 text-destructive'
        };
      case 'saving':
        return {
          icon: Save,
          className: 'bg-muted border-border text-muted-foreground'
        };
      default:
        return {
          icon: Save,
          className: 'bg-muted border-border text-muted-foreground'
        };
    }
  };

  const config = getToastConfig(type);
  const Icon = config.icon;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
      <div className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg",
        config.className
      )}>
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">{message}</span>
        {type !== 'saving' && (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={onClose}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};

// Hook for managing autosave notifications
export const useAutosaveNotifications = () => {
  const [saveStatus, setSaveStatus] = useState('saved');
  const [lastSaved, setLastSaved] = useState(null);
  const [showRecovery, setShowRecovery] = useState(false);
  const [showRollback, setShowRollback] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastConfig, setToastConfig] = useState({});
  const [recoveryData, setRecoveryData] = useState(null);
  const [rollbackData, setRollbackData] = useState(null);

  const updateSaveStatus = (status) => {
    setSaveStatus(status);
    if (status === 'saved') {
      setLastSaved(new Date().toLocaleTimeString());
    }
  };

  const showSuccessToast = (message = 'Changes saved') => {
    setToastConfig({ type: 'success', message });
    setShowToast(true);
  };

  const showErrorToast = (message = 'Save failed') => {
    setToastConfig({ type: 'error', message });
    setShowToast(true);
  };

  const showSavingToast = (message = 'Saving changes...') => {
    setToastConfig({ type: 'saving', message });
    setShowToast(true);
  };

  const showRecoveryBanner = (data) => {
    setRecoveryData(data);
    setShowRecovery(true);
  };

  const showRollbackBanner = (actionDescription, undoCallback) => {
    setRollbackData({ actionDescription, undoCallback });
    setShowRollback(true);
  };

  return {
    saveStatus,
    lastSaved,
    showRecovery,
    showRollback,
    showToast,
    toastConfig,
    recoveryData,
    rollbackData,
    updateSaveStatus,
    showSuccessToast,
    showErrorToast,
    showSavingToast,
    showRecoveryBanner,
    showRollbackBanner,
    setShowRecovery,
    setShowRollback,
    setShowToast
  };
};

export { AutosaveStatus, RecoveryBanner, RollbackBanner, SaveToast };