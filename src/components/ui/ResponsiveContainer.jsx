import { cn } from "../../lib/utils";

export function ResponsiveContainer({ 
  children, 
  className,
  maxWidth = "7xl",
  padding = "default",
  ...props 
}) {
  const paddingClasses = {
    none: "",
    sm: "px-4 py-2",
    default: "px-4 sm:px-6 py-4",
    lg: "px-4 sm:px-6 lg:px-8 py-6",
    xl: "px-4 sm:px-6 lg:px-8 py-8",
  };

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
    full: "max-w-full",
  };

  return (
    <div 
      className={cn(
        "mx-auto w-full",
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function ResponsiveGrid({ 
  children, 
  cols = { xs: 1, sm: 2, lg: 3 }, 
  gap = "default",
  className,
  ...props 
}) {
  const gapClasses = {
    none: "gap-0",
    sm: "gap-2",
    default: "gap-4",
    lg: "gap-6",
    xl: "gap-8",
  };

  const getColClasses = () => {
    const classes = ["grid"];
    
    if (typeof cols === 'number') {
      classes.push(`grid-cols-${cols}`);
    } else {
      if (cols.xs) classes.push(`grid-cols-${cols.xs}`);
      if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
      if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
      if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
      if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);
      if (cols['2xl']) classes.push(`2xl:grid-cols-${cols['2xl']}`);
    }

    return classes.join(' ');
  };

  return (
    <div 
      className={cn(
        getColClasses(),
        gapClasses[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function ResponsiveFlex({ 
  children, 
  direction = { xs: "column", md: "row" },
  align = "center",
  justify = "between",
  gap = "default",
  wrap = true,
  className,
  ...props 
}) {
  const gapClasses = {
    none: "gap-0",
    sm: "gap-2",
    default: "gap-4", 
    lg: "gap-6",
    xl: "gap-8",
  };

  const getDirectionClasses = () => {
    const classes = ["flex"];
    
    if (typeof direction === 'string') {
      classes.push(`flex-${direction}`);
    } else {
      if (direction.xs) classes.push(`flex-${direction.xs}`);
      if (direction.sm) classes.push(`sm:flex-${direction.sm}`);
      if (direction.md) classes.push(`md:flex-${direction.md}`);
      if (direction.lg) classes.push(`lg:flex-${direction.lg}`);
      if (direction.xl) classes.push(`xl:flex-${direction.xl}`);
    }

    if (wrap) classes.push("flex-wrap");
    if (align) classes.push(`items-${align}`);
    if (justify) classes.push(`justify-${justify}`);

    return classes.join(' ');
  };

  return (
    <div 
      className={cn(
        getDirectionClasses(),
        gapClasses[gap],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}