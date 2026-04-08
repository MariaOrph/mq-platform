"use client";

import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContextType {
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);

    const timeout = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      timeoutsRef.current.delete(id);
    }, 3000);

    timeoutsRef.current.set(id, timeout);
  }, []);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, []);

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }
  };

  const colors = {
    success: { bg: "#E8FDF7", border: "#B9F8DD", text: "#0A2E2A", icon: "\u2713" },
    error:   { bg: "#FEF2F2", border: "#FECACA", text: "#991B1B", icon: "!" },
    info:    { bg: "#E8FDF7", border: "#0AF3CD", text: "#0A2E2A", icon: "i" },
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2" style={{ pointerEvents: "none" }}>
        {toasts.map((toast) => {
          const c = colors[toast.type];
          return (
            <div
              key={toast.id}
              className="animate-slideIn flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium max-w-sm"
              style={{
                backgroundColor: c.bg,
                border: `1px solid ${c.border}`,
                color: c.text,
                pointerEvents: "auto",
              }}
              onClick={() => dismiss(toast.id)}
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ backgroundColor: c.border, color: c.text }}
              >
                {c.icon}
              </span>
              {toast.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
