import React, { useState } from 'react';
import { Mail, X } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
  loading?: boolean;
}

export const EmailModal = ({ isOpen, onClose, onSubmit, loading = false }: EmailModalProps) => {
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
        onSubmit(email);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop con blur */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Modal Card */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-[fadeIn_0.2s_ease-out]">
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100">
            <Mail size={24} className="text-blue-600" />
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Enviar Reporte PDF</h3>
        <p className="text-sm text-gray-500 text-center mb-6">
          Ingresa el correo electrónico donde deseas recibir el reporte de inventario adjunto.
        </p>

        <form onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="nombre@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mb-4"
            autoFocus
          />
          
          <div className="flex gap-3">
            <Button 
                type="button" 
                onClick={onClose} 
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"
            >
              Cancelar
            </Button>
            <Button 
                type="submit" 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200" 
                disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};