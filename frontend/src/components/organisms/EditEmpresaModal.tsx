import React, { useState, useEffect } from 'react';
import { X, Save, Building2 } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { type Empresa } from '../../services/empresaService';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/apiErrors';

interface EditEmpresaModalProps {
  isOpen: boolean;
  onClose: () => void;
  empresa: Empresa | null;
  onUpdate: (nit: string, data: Partial<Empresa>) => Promise<void>;
}

export const EditEmpresaModal = ({ isOpen, onClose, empresa, onUpdate }: EditEmpresaModalProps) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<Partial<Empresa>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (empresa) {
      setFormData({
        nit: empresa.nit,
        nombre: empresa.nombre,
        direccion: empresa.direccion,
        telefono: empresa.telefono,
      });
    }
  }, [empresa]);

  if (!isOpen || !empresa) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onUpdate(empresa.nit, {
        nombre: formData.nombre,
        direccion: formData.direccion,
        telefono: formData.telefono,
      });
      //showToast("Empresa actualizada correctamente", "success");
      onClose();
    } catch (error) {
      const msg = getErrorMessage(error);
      //showToast(msg, "error", "Error al actualizar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-[fadeIn_0.2s_ease-out]">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Building2 className="text-[#E6C200]"/> Editar Empresa 
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={24} />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* NIT Disabled */}
            <Input
                label="NIT (No editable)"
                helpText="Por seguridad e integridad de la información, el NIT no se puede modificar una vez creado."
                value={formData.nit || ''}
                disabled
                className="bg-gray-100 text-gray-500 cursor-not-allowed border-dashed"
            />

            <Input
                label="Razón Social"
                helpText="Actualice el nombre legal si hubo cambios en Cámara de Comercio."
                value={formData.nombre || ''}
                onChange={e => setFormData({...formData, nombre: e.target.value})}
                required
            />

            <Input
                label="Dirección"
                helpText="Nueva ubicación física para correspondencia."
                value={formData.direccion || ''}
                onChange={e => setFormData({...formData, direccion: e.target.value})}
                required
            />

            <Input
                label="Teléfono"
                helpText="Solo números. Mínimo 7 dígitos."
                value={formData.telefono || ''}
                onChange={e => setFormData({...formData, telefono: e.target.value})}
                required
            />

            <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                <Button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200">
                    Cancelar
                </Button>
                <Button type="submit" disabled={loading} className="flex-1" icon={<Save size={18}/>}>
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </div>
        </form>
      </div>
    </div>
  );
};