import React, { createContext, useContext, useState } from 'react';
import { Toast, type ToastType } from '../components/atoms/Toast';

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<{ id: number; message: string; type: ToastType }[]>([]);

  const showToast = (message: string, type: ToastType) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Contenedor Flotante - Responsive */}
      <div className="fixed top-4 left-4 right-4 sm:left-auto sm:top-6 sm:right-6 z-[9999] flex flex-col items-center sm:items-end pointer-events-none">
        <div className="pointer-events-auto w-full sm:w-auto">
          {toasts.map((t) => (
            <Toast 
              key={t.id} 
              id={t.id} 
              message={t.message} 
              type={t.type} 
              onClose={removeToast} 
            />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast debe usarse dentro de un ToastProvider');
  return context;
};