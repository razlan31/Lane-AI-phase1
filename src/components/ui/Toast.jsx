import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { Button } from './button';

const toastTypes = {
  success: {
    icon: CheckCircle,
    bgColor: "bg-green-50 dark:bg-green-950",
    borderColor: "border-green-200 dark:border-green-800",
    iconColor: "text-green-600 dark:text-green-400",
    textColor: "text-green-800 dark:text-green-200",
  },
  error: {
    icon: AlertCircle,
    bgColor: "bg-red-50 dark:bg-red-950",
    borderColor: "border-red-200 dark:border-red-800",
    iconColor: "text-red-600 dark:text-red-400",
    textColor: "text-red-800 dark:text-red-200",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-yellow-50 dark:bg-yellow-950",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    iconColor: "text-yellow-600 dark:text-yellow-400",
    textColor: "text-yellow-800 dark:text-yellow-200",
  },
  info: {
    icon: Info,
    bgColor: "bg-blue-50 dark:bg-blue-950",
    borderColor: "border-blue-200 dark:border-blue-800",
    iconColor: "text-blue-600 dark:text-blue-400",
    textColor: "text-blue-800 dark:text-blue-200",
  },
};

export function Toast({ 
  id,
  type = "info", 
  title, 
  description, 
  duration = 5000,
  onRemove,
  action,
  className,
  ...props 
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const config = toastTypes[type];
  const Icon = config.icon;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleRemove();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onRemove?.(id);
    }, 200);
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border shadow-lg transition-all duration-200",
        config.bgColor,
        config.borderColor,
        isExiting ? "animate-slide-out-right" : "animate-slide-in-right",
        className
      )}
      {...props}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={cn("h-5 w-5", config.iconColor)} />
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className={cn("text-sm font-medium", config.textColor)}>
              {title}
            </p>
            {description && (
              <p className={cn("mt-1 text-sm opacity-90", config.textColor)}>
                {description}
              </p>
            )}
            {action && (
              <div className="mt-3">
                <button
                  onClick={action.onClick}
                  className={cn(
                    "text-sm font-medium underline hover:no-underline",
                    config.textColor
                  )}
                >
                  {action.label}
                </button>
              </div>
            )}
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleRemove}
              className={cn("hover:bg-white/20", config.textColor)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ToastContainer({ toasts = [], onRemoveToast, className }) {
  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none",
        className
      )}
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onRemove={onRemoveToast}
        />
      ))}
    </div>
  );
}

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const removeAllToasts = () => {
    setToasts([]);
  };

  return {
    toasts,
    addToast,
    removeToast,
    removeAllToasts,
    success: (title, description, options = {}) => 
      addToast({ type: 'success', title, description, ...options }),
    error: (title, description, options = {}) => 
      addToast({ type: 'error', title, description, ...options }),
    warning: (title, description, options = {}) => 
      addToast({ type: 'warning', title, description, ...options }),
    info: (title, description, options = {}) => 
      addToast({ type: 'info', title, description, ...options }),
  };
}