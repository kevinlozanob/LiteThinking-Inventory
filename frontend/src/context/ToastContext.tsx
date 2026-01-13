import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, type ToastType } from '../components/atoms/Toast';

interface ToastContextType {
  // Ahora aceptamos título opcional
  showToast: (message: string, type: ToastType, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<{ id: number; message: string; type: ToastType; title?: string }[]>([]);

  const showToast = useCallback((message: string, type: ToastType, title?: string) => {
    const id = Date.now();
    // Si no mandan título, ponemos uno por defecto según el tipo
    const defaultTitle = !title ? getDefaultTitle(type) : title;
    
    setToasts((prev) => [...prev, { id, message, type, title: defaultTitle }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getDefaultTitle = (type: ToastType) => {
    switch (type) {
      case 'success': return '¡Operación Exitosa!';
      case 'error': return 'Ocurrió un error';
      case 'warning': return 'Advertencia';
      case 'info': return 'Información';
      default: return '';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Contenedor Flotante - Arriba a la derecha (Estándar Senior) */}
      <div className="fixed top-4 right-4 z-[99999] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        <div className="pointer-events-auto">
          {toasts.map((t) => (
            <Toast 
              key={t.id} 
              id={t.id} 
              title={t.title}
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