import { signal } from "@preact/signals-react";

export type ToastType = "success" | "error" | "notice";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export const toasts = signal<Toast[]>([]);

let toastIdCounter = 0;

export function showToast(
  message: string,
  type: ToastType = "notice",
  duration = 5000,
) {
  const id = `toast-${++toastIdCounter}`;
  const toast: Toast = { id, message, type };

  toasts.value = [...toasts.value, toast];

  setTimeout(() => {
    removeToast(id);
  }, duration);

  return id;
}

export function removeToast(id: string) {
  toasts.value = toasts.value.filter((t) => t.id !== id);
}

export function showSuccessToast(message: string, duration?: number) {
  return showToast(message, "success", duration);
}

export function showErrorToast(message: string, duration?: number) {
  return showToast(message, "error", duration);
}

export function showNoticeToast(message: string, duration?: number) {
  return showToast(message, "notice", duration);
}
