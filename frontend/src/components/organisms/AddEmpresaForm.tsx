import React, { useState } from 'react';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { createEmpresa } from '../../services/empresaService';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddEmpresaForm = ({ onSuccess, onCancel }: Props) => {
  const [formData, setFormData] = useState({ nit: '', nombre: '', direccion: '', telefono: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createEmpresa(formData);
      onSuccess();
      setFormData({ nit: '', nombre: '', direccion: '', telefono: '' });
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 403) {
        setError("No tienes permisos de Administrador para crear empresas.");
      } else {
        setError("Error al crear empresa. Revisa el NIT (puede que ya exista).");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Nueva Empresa</h3>
      
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded">{error}</div>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input 
          placeholder="NIT" 
          value={formData.nit}
          onChange={e => setFormData({...formData, nit: e.target.value})}
          required 
        />
        <Input 
          placeholder="Nombre Empresa" 
          value={formData.nombre}
          onChange={e => setFormData({...formData, nombre: e.target.value})}
          required 
        />
        <Input 
          placeholder="Dirección" 
          value={formData.direccion}
          onChange={e => setFormData({...formData, direccion: e.target.value})}
          required 
        />
        <Input 
          placeholder="Teléfono" 
          value={formData.telefono}
          onChange={e => setFormData({...formData, telefono: e.target.value})}
          required 
        />

        {/* CAMBIO AQUÍ: Contenedor Flex ajustado para no desbordar */}
        <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 mt-4">
           <Button 
            type="button"  
            onClick={onCancel} 
            variant="secondary"
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 w-full sm:w-auto px-6"
           >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={loading}
            className="w-full sm:flex-1"
          >
            {loading ? "Guardando..." : "Guardar Empresa"}
          </Button>
        </div>
      </form>
    </div>
  );
};