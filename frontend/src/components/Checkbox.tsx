import type { ComponentPropsWithoutRef } from "react";

interface CheckboxProps
  extends Omit<ComponentPropsWithoutRef<"input">, "type"> {
  label: string;
}

export function Checkbox({
  label,
  id,
  className = "",
  ...props
}: CheckboxProps) {
  const checkboxId =
    id || `checkbox-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input
        type="checkbox"
        id={checkboxId}
        className="
          w-4 h-4 rounded cursor-pointer
          bg-[var(--color-input-bg)]
          border-[var(--color-border)]
          text-[var(--color-accent-green)]
          focus:ring-2 focus:ring-[var(--color-accent-green)]
          transition-colors
        "
        {...props}
      />
      <label
        htmlFor={checkboxId}
        className="
          text-sm cursor-pointer select-none
          text-[var(--color-text-secondary)]
          hover:text-[var(--color-text-primary)]
          transition-colors
        "
      >
        {label}
      </label>
    </div>
  );
}
