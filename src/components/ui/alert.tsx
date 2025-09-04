import type * as React from "react";
import { cn } from "@/lib/utils";

interface AlertProps extends React.ComponentProps<"div"> {
  variant?: "info" | "success" | "warning" | "error";
  className?: string;
}

function Alert({
  className,
  variant = "info",
  children,
  ...props
}: AlertProps) {
  const baseClasses = "alert";

  const variantClasses = {
    info: "alert-info",
    success: "alert-success",
    warning: "alert-warning",
    error: "alert-error",
  };

  const classes = cn(baseClasses, variantClasses[variant], className);

  return (
    <div role="alert" className={classes} {...props}>
      {children}
    </div>
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return <h3 className={cn("font-bold", className)} {...props} />;
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("text-sm", className)} {...props} />;
}

export { Alert, AlertTitle, AlertDescription };
