import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { AlertTriangle, CheckCircle, ArrowRight, X } from 'lucide-react';

const PromotionGate = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  itemType = 'worksheet',
  itemName,
  currentState = 'draft',
  targetState = 'live',
  impactDescription
}) => {
  const [confirmationStep, setConfirmationStep] = useState(1);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    if (confirmationStep === 1) {
      setConfirmationStep(2);
    } else {
      onConfirm();
      handleClose();
    }
  };

  const handleClose = () => {
    setConfirmationStep(1);
    setConfirmed(false);
    onClose();
  };

  const getStateColor = (state) => {
    switch (state) {
      case 'draft':
        return 'text-draft';
      case 'live':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStateIcon = (state) => {
    switch (state) {
      case 'live':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      default:
        return null;
    }
  };

  const CurrentStateIcon = getStateIcon(currentState);
  const TargetStateIcon = getStateIcon(targetState);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Promote {itemType}</DialogTitle>
          <DialogDescription>
            Confirm promotion from {currentState} to {targetState}
          </DialogDescription>
        </DialogHeader>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Promote to {targetState.charAt(0).toUpperCase() + targetState.slice(1)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* State Transition Visual */}
          <div className="flex items-center justify-center gap-4 py-4">
            <div className="text-center">
              {CurrentStateIcon && <CurrentStateIcon className={cn("h-8 w-8 mx-auto mb-2", getStateColor(currentState))} />}
              <div className={cn("text-sm font-medium capitalize", getStateColor(currentState))}>
                {currentState}
              </div>
            </div>
            
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
            
            <div className="text-center">
              {TargetStateIcon && <TargetStateIcon className={cn("h-8 w-8 mx-auto mb-2", getStateColor(targetState))} />}
              <div className={cn("text-sm font-medium capitalize", getStateColor(targetState))}>
                {targetState}
              </div>
            </div>
          </div>

          {confirmationStep === 1 ? (
            <>
              <div className="space-y-3">
                <h3 className="font-medium">
                  Are you sure you want to promote "{itemName}"?
                </h3>
                
                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <div className="text-sm font-medium">What this means:</div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Data will be marked as {targetState}</li>
                    <li>• Changes will be visible to stakeholders</li>
                    <li>• This action can be reversed later</li>
                    {impactDescription && <li>• {impactDescription}</li>}
                  </ul>
                </div>

                {targetState === 'live' && (
                  <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                    <div className="flex gap-3">
                      <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <div className="font-medium text-warning mb-1">Important</div>
                        <div className="text-muted-foreground">
                          Live data will be used for reports and stakeholder communications. 
                          Make sure all values are accurate.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleConfirm} className="flex-1">
                  Continue
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <h3 className="font-medium">Final Confirmation</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="confirm-accuracy"
                      checked={confirmed}
                      onChange={(e) => setConfirmed(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="confirm-accuracy" className="text-sm">
                      I confirm that the data is accurate and ready for {targetState} use
                    </label>
                  </div>
                </div>

                <div className="bg-info/10 border border-info/20 rounded-lg p-4">
                  <div className="text-sm">
                    <div className="font-medium mb-1">You can always revert</div>
                    <div className="text-muted-foreground">
                      If you need to make changes later, you can easily demote this back to draft status.
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setConfirmationStep(1)} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={handleConfirm} 
                  disabled={!confirmed}
                  className="flex-1"
                >
                  Promote to {targetState.charAt(0).toUpperCase() + targetState.slice(1)}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Quick promotion button component
const PromotionButton = ({ 
  currentState, 
  targetState = 'live',
  onPromote,
  disabled = false,
  size = 'sm'
}) => {
  const getButtonVariant = (state) => {
    switch (state) {
      case 'live':
        return 'live';
      case 'draft':
        return 'draft';
      default:
        return 'outline';
    }
  };

  const getButtonText = (current, target) => {
    if (current === 'draft' && target === 'live') {
      return 'Go Live';
    }
    if (current === 'live' && target === 'draft') {
      return 'Back to Draft';
    }
    return `Promote to ${target}`;
  };

  return (
    <Button
      size={size}
      variant={getButtonVariant(targetState)}
      onClick={onPromote}
      disabled={disabled}
      className="gap-2"
    >
      {targetState === 'live' && <CheckCircle className="h-3 w-3" />}
      {getButtonText(currentState, targetState)}
    </Button>
  );
};

export { PromotionGate, PromotionButton };