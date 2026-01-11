import React, { useState } from 'react';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { createProducto, generarDescripcionIA } from '../../services/productoService';
import { Wand2, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface Props {
  empresaNit: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddProductForm = ({ empresaNit, onSuccess, onCancel }: Props) => {
  const { showToast } = useToast();

  const [formData, setFormData] = useState({ 
    codigo: '', 
    nombre: '', 
    caracteristicas: '',
    moneda: 'USD',
    precio: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);

  const handleAI = async () => {
    if (!formData.nombre) {
        showToast("Escribe un nombre de producto primero", 'info');
        return;
    }
    
    setGeneratingAI(true);
    try {
      const desc = await generarDescripcionIA(formData.nombre);
      setFormData(prev => ({ ...prev, caracteristicas: desc }));
      showToast("Descripción generada con IA", 'success');
    } catch (err) {
      showToast("Error contactando a la IA", 'error');
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const preciosJSON = {
        [formData.moneda]: parseFloat(formData.precio)
      };

      await createProducto({
        codigo: formData.codigo,
        nombre: formData.nombre,
        caracteristicas: formData.caracteristicas,
        empresa: empresaNit,
        precios: preciosJSON
      });
      
      showToast("Producto creado exitosamente", 'success');
      onSuccess();
    } catch (err) {
      showToast("Error al guardar. Revisa que el código no esté repetido.", 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200 mb-6 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base sm:text-lg font-bold text-gray-800">Nuevo Producto</h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 sm:hidden">
          <X size={20}/>
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Input 
          placeholder="Código Único" 
          value={formData.codigo}
          onChange={e => setFormData({...formData, codigo: e.target.value})}
          required 
        />
        <Input 
          placeholder="Nombre Producto" 
          value={formData.nombre}
          onChange={e => setFormData({...formData, nombre: e.target.value})}
          required 
        />
        
        {/* Sección IA */}
        <div className="sm:col-span-2 relative">
          <textarea
            className="w-full p-3 pb-12 sm:pb-3 sm:pr-36 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E6C200] text-sm resize-none transition-all"
            rows={3}
            placeholder="Características del producto..."
            value={formData.caracteristicas}
            onChange={e => setFormData({...formData, caracteristicas: e.target.value})}
            required
          />
          <button
            type="button"
            onClick={handleAI}
            disabled={generatingAI}
            className="absolute bottom-3 right-3 sm:top-3 sm:bottom-auto flex items-center gap-1 bg-purple-600 text-white text-xs px-3 py-1.5 rounded-md hover:bg-purple-700 disabled:opacity-50 shadow-sm transition-all hover:shadow-md"
          >
            <Wand2 size={12} className={generatingAI ? "animate-spin" : ""} />
            {generatingAI ? "Generando..." : "Generar con IA"}
          </button>
        </div>

        {/* Precios */}
        <div className="flex gap-2 sm:col-span-1">
            <select 
                className="rounded border border-gray-200 px-2 sm:px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#E6C200] min-w-[70px]"
                value={formData.moneda}
                onChange={e => setFormData({...formData, moneda: e.target.value})}
            >
                <option value="USD">USD</option>
                <option value="COP">COP</option>
                <option value="EUR">EUR</option>
            </select>
            <Input 
                placeholder="Precio" 
                type="number"
                value={formData.precio}
                onChange={e => setFormData({...formData, precio: e.target.value})}
                required 
            />
        </div>

        <div className="sm:col-span-2 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 mt-2 sm:justify-end">
          <Button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 w-full sm:w-auto px-4 text-gray-700 border border-gray-300 hidden sm:flex">
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={loading} className="w-full sm:w-auto px-6 shadow-sm">
            {loading ? "Guardando..." : "Guardar Producto"}
          </Button>
        </div>
      </form>
    </div>
  );
};