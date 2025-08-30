import React, { useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Info, HelpCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { cn, formatNumber, formatPercentage } from '../../lib/utils';
import { useDisplaySettings } from '../../hooks/useDisplaySettings.jsx';
import ExplainOverlay from '../overlays/ExplainOverlay';

const KpiCard = ({ 
  title, 
  description,
  value, 
  trend, 
  trendDirection, 
  state = 'neutral',
  unit = 'number',
  onClick,
  showModal = false,
  modalContent,
  className,
  size = 'default',
  showExplain = true
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExplainOpen, setIsExplainOpen] = useState(false);
  const { showPlainExplanations } = useDisplaySettings();

  const formatValue = (val) => {
    switch (unit) {
      case 'currency':
        return formatNumber(val, { style: 'currency' });
      case 'percentage':
        return formatPercentage(val);
      default:
        return formatNumber(val);
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    return trendDirection === 'up' ? 
      <TrendingUp className="h-4 w-4 text-green-500" /> : 
      <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const getStateIcon = () => {
    switch (state) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'alert':
        return <AlertTriangle className="h-4 w-4 text-alert" />;
      default:
        return null;
    }
  };

  const getStateClasses = () => {
    switch (state) {
      case 'draft':
        return 'border-l-4 border-l-draft bg-blue-50/50';
      case 'live':
        return 'border-l-4 border-l-live bg-green-50/50';
      case 'warning':
        return 'border-l-4 border-l-warning bg-yellow-50/50';
      case 'alert':
        return 'border-l-4 border-l-alert bg-red-50/50';
      default:
        return 'border border-border';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'p-3';
      case 'lg':
        return 'p-8';
      default:
        return 'p-6';
    }
  };

  const CardContent = () => (
    <div 
      className={cn(
        "rounded-lg bg-card text-card-foreground shadow-sm transition-all duration-200 relative group",
        getSizeClasses(),
        getStateClasses(),
        (onClick || showModal) && "cursor-pointer hover:shadow-md hover:scale-[1.02]",
        className
      )}
      onClick={onClick || (showModal ? () => setIsModalOpen(true) : undefined)}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">{title}</p>
                {getStateIcon()}
              </div>
              {showExplain && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExplainOpen(true);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
                >
                  <HelpCircle className="h-3 w-3 text-muted-foreground" />
                </button>
              )}
            </div>
            {description && showPlainExplanations && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <p className={cn(
              "font-bold",
              size === 'sm' ? 'text-lg' : 'text-2xl'
            )}>{formatValue(value)}</p>
            {getTrendIcon()}
          </div>
          {trend && (
            <p className="text-sm text-muted-foreground">
              {trendDirection === 'up' ? '+' : ''}{formatPercentage(trend)} from last period
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {showModal && modalContent ? (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <div>
              <CardContent />
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                {title} Details
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {modalContent}
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        <CardContent />
      )}
      
      <ExplainOverlay
        isOpen={isExplainOpen}
        onClose={() => setIsExplainOpen(false)}
        context={`${title}: ${description || 'Key performance indicator'}`}
        title={`Explain ${title}`}
      />
    </>
  );
};

export default KpiCard;