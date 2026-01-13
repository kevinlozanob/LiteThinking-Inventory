import React, { useState } from 'react';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { createEmpresa } from '../../services/empresaService';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/apiErrors';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddEmpresaForm = ({ onSuccess, onCancel }: Props) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ nit: '', nombre: '', direccion: '', telefono: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createEmpresa(formData);
      showToast("La empresa ha sido registrada exitosamente.", "success", "Operación Exitosa");
      onSuccess();
      setFormData({ nit: '', nombre: '', direccion: '', telefono: '' });
    } catch (err: any) {
      const message = getErrorMessage(err);
      showToast(message, "error", "Error de Validación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6 shadow-sm animate-[fadeIn_0.3s_ease-out]">
      <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-2">
         <h3 className="text-lg font-bold text-gray-800">Registrar Nueva Empresa</h3>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <Input 
          label="NIT"
          helpText="Escriba SOLO números y guiones. No use puntos, espacios ni letras. Ejemplo válido: 900123456-1"
          placeholder="Ej: 900123456-1" 
          value={formData.nit}
          onChange={e => setFormData({...formData, nit: e.target.value})}
          required 
        />

        <Input 
          label="Razón Social"
          helpText="Nombre legal completo registrado en Cámara de Comercio. Evite abreviaturas informales."
          placeholder="Ej: Tech Solutions S.A.S" 
          value={formData.nombre}
          onChange={e => setFormData({...formData, nombre: e.target.value})}
          required 
        />

        <Input 
          label="Dirección"
          helpText="Ubicación física para correspondencia. Incluya la ciudad si es una sede nacional."
          placeholder="Ej: Calle 100 # 15-20, Bogotá" 
          value={formData.direccion}
          onChange={e => setFormData({...formData, direccion: e.target.value})}
          required 
        />

        <Input 
          label="Teléfono"
          helpText="Solo dígitos numéricos. NO use paréntesis, espacios ni guiones. Mínimo 7 números."
          placeholder="Ej: 3001234567" 
          value={formData.telefono}
          onChange={e => setFormData({...formData, telefono: e.target.value})}
          required 
        />

        <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 mt-4 pt-2 border-t border-gray-100">
           <Button 
            type="button"  
            onClick={onCancel} 
            variant="secondary"
            className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 w-full sm:w-auto px-6"
           >
            Cancelar Operación
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={loading}
            className="w-full sm:flex-1 shadow-md hover:shadow-lg transition-shadow"
          >
            {loading ? "Validando integridad..." : "Guardar Registro"}
          </Button>
        </div>
      </form>
    </div>
  );
};