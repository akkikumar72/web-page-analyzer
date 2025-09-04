import type * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ComponentProps<"button"> {
  variant?:
    | "primary"
    | "secondary"
    | "accent"
    | "ghost"
    | "link"
    | "outline"
    | "error"
    | "warning"
    | "success"
    | "info";
  size?: "xs" | "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

function Button({
  className,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  children,
  ...props
}: ButtonProps) {
  const baseClasses = "btn";

  const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    accent: "btn-accent",
    ghost: "btn-ghost",
    link: "btn-link",
    outline: "btn-outline",
    error: "btn-error",
    warning: "btn-warning",
    success: "btn-success",
    info: "btn-info",
  };

  const sizeClasses = {
    xs: "btn-xs",
    sm: "btn-sm",
    md: "",
    lg: "btn-lg",
  };

  const classes = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    {
      loading: loading,
      "btn-disabled": disabled,
    },
    className,
  );

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && (
        <span className="loading loading-spinner loading-sm mr-2"></span>
      )}
      {children}
    </button>
  );
}

export { Button };
