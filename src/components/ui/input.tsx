import type * as React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends Omit<React.ComponentProps<"input">, "size"> {
  variant?: "bordered" | "ghost" | "filled";
  size?: "xs" | "sm" | "md" | "lg";
  color?:
    | "primary"
    | "secondary"
    | "accent"
    | "info"
    | "success"
    | "warning"
    | "error";
  label?: string;
  error?: boolean;
  className?: string;
}

function Input({
  className,
  variant = "bordered",
  size = "md",
  color,
  label,
  error = false,
  type = "text",
  id,
  ...props
}: InputProps) {
  const baseClasses = "input w-full";
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const variantClasses = {
    bordered: "input-bordered",
    ghost: "input-ghost",
    filled: "",
  };

  const sizeClasses = {
    xs: "input-xs",
    sm: "input-sm",
    md: "",
    lg: "input-lg",
  };

  const colorClasses = color
    ? {
        primary: "input-primary",
        secondary: "input-secondary",
        accent: "input-accent",
        info: "input-info",
        success: "input-success",
        warning: "input-warning",
        error: "input-error",
      }[color]
    : "";

  const classes = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    colorClasses,
    {
      "input-error": error,
    },
    className,
  );

  return (
    <div className="form-control w-full">
      {label && (
        <label className="label" htmlFor={inputId}>
          <span className="label-text font-medium">{label}</span>
        </label>
      )}
      <input type={type} className={classes} id={inputId} {...props} />
    </div>
  );
}

export { Input };
