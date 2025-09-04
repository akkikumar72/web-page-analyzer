import type * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.ComponentProps<"div"> {
  variant?:
    | "neutral"
    | "primary"
    | "secondary"
    | "accent"
    | "ghost"
    | "outline";
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

function Badge({
  className,
  variant = "neutral",
  size = "md",
  ...props
}: BadgeProps) {
  const baseClasses = "badge";

  const variantClasses = {
    neutral: "",
    primary: "badge-primary",
    secondary: "badge-secondary",
    accent: "badge-accent",
    ghost: "badge-ghost",
    outline: "badge-outline",
  };

  const sizeClasses = {
    xs: "badge-xs",
    sm: "badge-sm",
    md: "",
    lg: "badge-lg",
  };

  const classes = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className,
  );

  return <div className={classes} {...props} />;
}

export { Badge };
