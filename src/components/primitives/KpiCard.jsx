import React, { useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { cn, formatNumber, formatPercentage } from '../../lib/utils';

const KpiCard = ({ 
  title, 
  value, 
  trend, 
  trendDirection, 
  state = 'neutral',
  unit = 'number',
  onClick,
  showModal = false,
  modalContent,
  className 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const CardContent = () => (
    <div 
      className={cn(
        "p-6 rounded-lg bg-card text-card-foreground shadow-sm transition-all duration-200",
        getStateClasses(),
        (onClick || showModal) && "cursor-pointer hover:shadow-md hover:scale-[1.02]",
        className
      )}
      onClick={onClick || (showModal ? () => setIsModalOpen(true) : undefined)}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {getStateIcon()}
          </div>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold">{formatValue(value)}</p>
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

  if (showModal && modalContent) {
    return (
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
    );
  }

  return <CardContent />;
};

export default KpiCard;