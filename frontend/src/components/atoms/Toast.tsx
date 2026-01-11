import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  id: number;
  message: string;
  type: ToastType;
  onClose: (id: number) => void;
}

export const Toast = ({ id, message, type, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 4000);

    return () => clearTimeout(timer);
  }, [id, onClose]);

  const styles = {
    success: "bg-white border-green-500 text-gray-800 shadow-[0_4px_12px_rgba(34,197,94,0.15)]",
    error: "bg-white border-red-500 text-gray-800 shadow-[0_4px_12px_rgba(239,68,68,0.15)]",
    info: "bg-white border-blue-500 text-gray-800 shadow-[0_4px_12px_rgba(59,130,246,0.15)]"
  };

  const icons = {
    success: <CheckCircle size={18} className="text-green-500 flex-shrink-0" />,
    error: <AlertCircle size={18} className="text-red-500 flex-shrink-0" />,
    info: <Info size={18} className="text-blue-500 flex-shrink-0" />
  };

  return (
    <div className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-4 rounded-lg border-l-4 w-[calc(100vw-2rem)] sm:w-auto sm:min-w-[320px] max-w-[400px] mb-2 sm:mb-3 transition-all animate-[slideIn_0.3s_ease-out] relative bg-white border border-gray-100 ${styles[type]}`}>
      {icons[type]}
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-semibold truncate">{message}</p>
      </div>
      <button 
        onClick={() => onClose(id)} 
        className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
      >
        <X size={16} />
      </button>
    </div>
  );
};