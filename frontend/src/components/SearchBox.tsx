import type { ComponentPropsWithoutRef } from "react";

interface SearchBoxProps extends ComponentPropsWithoutRef<"input"> {
  label?: string;
}

export function SearchBox({ label, className = "", ...props }: SearchBoxProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">
          {label}
        </label>
      )}
      <input
        type="text"
        className="
          w-full px-3 py-2 rounded-lg
          bg-[var(--color-input-bg)] dark:bg-[var(--color-dark-input-bg)]
          border border-[var(--color-border)] dark:border-[var(--color-dark-border)]
          text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]
          placeholder-[var(--color-text-secondary)] dark:placeholder-[var(--color-dark-text-secondary)]
          focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-green)] dark:focus:ring-[var(--color-dark-accent-green)]
          transition-all duration-200
        "
        {...props}
      />
    </div>
  );
}
