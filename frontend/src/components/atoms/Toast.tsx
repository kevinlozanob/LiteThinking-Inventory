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
    // Auto-cierre a los 4 segundos
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
    success: <CheckCircle size={20} className="text-green-500" />,
    error: <AlertCircle size={20} className="text-red-500" />,
    info: <Info size={20} className="text-blue-500" />
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-4 rounded-lg border-l-4 min-w-[320px] mb-3 transition-all animate-[slideIn_0.3s_ease-out] relative bg-white border border-gray-100 ${styles[type]}`}>
      {icons[type]}
      <div className="flex-1">
        <p className="text-sm font-semibold">{message}</p>
      </div>
      <button 
        onClick={() => onClose(id)} 
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};