import { cn } from "../../lib/utils";
import { useState, useEffect } from "react";

export function MobileDrawer({ 
  isOpen, 
  onClose, 
  children, 
  title,
  position = "bottom",
  className 
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const positionClasses = {
    bottom: "bottom-0 left-0 right-0 rounded-t-lg animate-slide-in-bottom",
    top: "top-0 left-0 right-0 rounded-b-lg animate-slide-in-top",
    left: "top-0 left-0 bottom-0 w-80 max-w-[90vw] rounded-r-lg animate-slide-in-left",
    right: "top-0 right-0 bottom-0 w-80 max-w-[90vw] rounded-l-lg animate-slide-in-right",
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      <div className={cn(
        "absolute bg-background border-border shadow-lg",
        positionClasses[position],
        className
      )}>
        {title && (
          <div className="p-4 border-b border-border">
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
        )}
        <div className="p-4 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

export function MobileSheet({ 
  isOpen, 
  onClose, 
  children, 
  trigger,
  title,
  className 
}) {
  return (
    <>
      {trigger}
      <MobileDrawer 
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        position="bottom"
        className={className}
      >
        {children}
      </MobileDrawer>
    </>
  );
}

export function TouchFriendly({ 
  children, 
  className,
  minHeight = "44px",
  padding = "default",
  ...props 
}) {
  const paddingClasses = {
    none: "",
    sm: "p-2",
    default: "p-3",
    lg: "p-4",
  };

  return (
    <div 
      className={cn(
        "touch-manipulation select-none",
        paddingClasses[padding],
        className
      )}
      style={{ minHeight }}
      {...props}
    >
      {children}
    </div>
  );
}

export function SwipeHandler({ 
  onSwipeLeft, 
  onSwipeRight, 
  onSwipeUp, 
  onSwipeDown,
  threshold = 50,
  children,
  className,
  ...props 
}) {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchMove = (e) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > threshold;
    const isRightSwipe = distanceX < -threshold;
    const isUpSwipe = distanceY > threshold;
    const isDownSwipe = distanceY < -threshold;

    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      // Horizontal swipe
      if (isLeftSwipe && onSwipeLeft) onSwipeLeft();
      if (isRightSwipe && onSwipeRight) onSwipeRight();
    } else {
      // Vertical swipe
      if (isUpSwipe && onSwipeUp) onSwipeUp();
      if (isDownSwipe && onSwipeDown) onSwipeDown();
    }
  };

  return (
    <div
      className={cn("touch-pan-x touch-pan-y", className)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEndHandler}
      {...props}
    >
      {children}
    </div>
  );
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
}