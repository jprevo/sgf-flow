import { toasts, removeToast, type Toast } from "../services/toast.service";

const toastTypeClasses = {
  success: "bg-[var(--color-accent-green)] text-white",
  error: "bg-red-500 text-white",
  notice: "bg-[var(--color-accent-brown)] text-white",
};

function ToastItem({ toast }: { toast: Toast }) {
  return (
    <div
      className={`
        px-4 py-3 rounded-lg shadow-lg
        flex items-center justify-between gap-3
        min-w-[300px] max-w-md
        animate-slide-in
        ${toastTypeClasses[toast.type]}
      `}
    >
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-white/80 hover:text-white transition-colors"
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
}

export function ToastContainer() {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.value.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
