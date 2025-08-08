'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Alert, type AlertProps } from './Alert';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'warning' | 'destructive' | 'info';

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss after duration (default 5 seconds)
    const duration = toast.duration || 5000;
    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
      <ToastContainer toasts={toasts} dismissToast={dismissToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC<{ 
  toasts: Toast[]; 
  dismissToast: (id: string) => void;
}> = ({ toasts, dismissToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-slide-up"
        >
          <Alert
            variant={toast.variant}
            title={toast.title}
            description={toast.description}
            onClose={() => dismissToast(toast.id)}
            className="shadow-lg"
          />
        </div>
      ))}
    </div>
  );
};

// Convenience hook for common toast patterns
export const useToastActions = () => {
  const { showToast } = useToast();

  return {
    success: (message: string, title?: string) => 
      showToast({ variant: 'success', description: message, title }),
    
    error: (message: string, title?: string) => 
      showToast({ variant: 'destructive', description: message, title: title || '오류 발생' }),
    
    warning: (message: string, title?: string) => 
      showToast({ variant: 'warning', description: message, title }),
    
    info: (message: string, title?: string) => 
      showToast({ variant: 'info', description: message, title }),
  };
};