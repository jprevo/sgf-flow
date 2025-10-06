import { type ComponentPropsWithoutRef, useEffect } from "react";

interface ModalProps extends ComponentPropsWithoutRef<"div"> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className = "",
}: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className={`
          relative z-10 w-full max-w-md mx-4 rounded-xl
          bg-[var(--color-bg-primary)] dark:bg-[var(--color-dark-bg-primary)]
          border border-[var(--color-border)] dark:border-[var(--color-dark-border)]
          shadow-2xl
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="px-6 py-4 border-b border-[var(--color-border)] dark:border-[var(--color-dark-border)]">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text-primary)]">
              {title}
            </h2>
          </div>
        )}
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
}
