import type { ComponentPropsWithoutRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-accent-green)] hover:bg-[var(--color-accent-green-hover)] text-white dark:bg-[var(--color-dark-accent-green)] dark:hover:bg-[var(--color-dark-accent-green-hover)]",
  secondary:
    "bg-[var(--color-accent-brown)] hover:opacity-90 text-white dark:bg-[var(--color-dark-accent-brown)]",
  ghost:
    "bg-transparent hover:bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] dark:hover:bg-[var(--color-dark-bg-tertiary)] dark:text-[var(--color-dark-text-primary)]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

export function Button({
  variant = "secondary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        rounded-lg font-medium transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        shadow-sm hover:shadow-md
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
