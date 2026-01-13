import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: number;
  title?: string;
  message: string;
  type: ToastType;
  onClose: (id: number) => void;
}

export const Toast = ({ id, title, message, type, onClose }: ToastProps) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Configuración de tiempos
  const DURATION = 5000; // 5 segundos

  useEffect(() => {
    if (isPaused) return;

    const timer = setTimeout(() => {
      handleClose();
    }, DURATION);

    return () => clearTimeout(timer);
  }, [id, isPaused]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(id), 300); // Esperar animación de salida
  };

  const variants = {
    success: {
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
      border: "border-l-green-500",
      bg: "bg-white",
      progress: "bg-green-500"
    },
    error: {
      icon: <XCircle className="w-6 h-6 text-red-500" />,
      border: "border-l-red-500",
      bg: "bg-white",
      progress: "bg-red-500"
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-yellow-500" />,
      border: "border-l-yellow-500",
      bg: "bg-white",
      progress: "bg-yellow-500"
    },
    info: {
      icon: <Info className="w-6 h-6 text-blue-500" />,
      border: "border-l-blue-500",
      bg: "bg-white",
      progress: "bg-blue-500"
    }
  };

  const currentVariant = variants[type];

  return (
    <div 
      className={`
        relative w-full max-w-sm overflow-hidden bg-white rounded-lg shadow-lg border border-gray-100 mb-3
        transition-all duration-300 ease-in-out transform
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0 animate-[slideIn_0.3s_ease-out]'}
        border-l-4 ${currentVariant.border}
      `}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="p-4 flex gap-4">
        {/* Ícono */}
        <div className="flex-shrink-0 pt-0.5">
          {currentVariant.icon}
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="text-sm font-bold text-gray-900 mb-1 leading-none">
              {title}
            </h4>
          )}
          <p className="text-sm text-gray-600 leading-snug">
            {message}
          </p>
        </div>

        {/* Botón Cerrar */}
        <button 
          onClick={handleClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1"
        >
          <X size={18} />
        </button>
      </div>

      {/* Barra de Progreso */}
      <div className="absolute bottom-0 left-0 h-1 w-full bg-gray-100">
        <div 
          className={`h-full ${currentVariant.progress} transition-all duration-100 ease-linear`}
          style={{ 
            width: '100%',
            animation: isPaused ? 'none' : `shrink ${DURATION}ms linear forwards`
          }}
        />
      </div>

      {/* Estilo inline para la animación de la barra */}
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};