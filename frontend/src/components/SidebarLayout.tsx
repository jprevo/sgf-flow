import type { ReactNode } from "react";
import { ThemeToggle } from "./ThemeToggle";

interface SidebarLayoutProps {
  children: ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  return (
    <div
      className="
        w-80 h-full flex flex-col
        min-w-80
        bg-[var(--color-bg-secondary)]
        border-r border-[var(--color-border)]
        shadow-lg
      "
    >
      <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          SGF Flow
        </h1>
        <ThemeToggle />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">{children}</div>
    </div>
  );
}
