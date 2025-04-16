"use client";

import * as React from "react";
import { VariantProps, cva } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const ToastProvider = React.createContext<{
  toast: (props: ToastProps) => void;
}>({
  toast: () => {},
});

export type ToastProps = {
  title?: string;
  description?: string;
  duration?: number;
  variant?: "default" | "destructive" | "success";
};

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
        success: "border-green-500 bg-green-500 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export function ToastContainer({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<(ToastProps & { id: string })[]>(
    []
  );

  const toast = (props: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...props, id }]);

    if (props.duration !== 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, props.duration || 3000);
    }
  };

  return (
    <ToastProvider.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-md">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(toastVariants({ variant: toast.variant }))}
          >
            <div className="flex-1">
              {toast.title && (
                <div className="font-semibold">{toast.title}</div>
              )}
              {toast.description && (
                <div className="text-sm opacity-90">{toast.description}</div>
              )}
            </div>
            <button
              onClick={() =>
                setToasts((prev) => prev.filter((t) => t.id !== toast.id))
              }
              className="rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        ))}
      </div>
    </ToastProvider.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastProvider);
  if (!context) {
    throw new Error("useToast must be used within a ToastContainer");
  }
  return context;
}

export const toast = (props: ToastProps) => {
  // Using alert as a fallback when context is not available
  if (typeof window !== "undefined") {
    if (props.title && props.description) {
      alert(`${props.title}\n${props.description}`);
    } else if (props.title) {
      alert(props.title);
    } else if (props.description) {
      alert(props.description);
    }
  }
};
