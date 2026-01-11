import React, { useState } from 'react';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { createProducto, generarDescripcionIA } from '../../services/productoService';
import { Wand2 } from 'lucide-react';
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
      // objeto JSON de precios
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
    } catch (err) {
      showToast("Error al guardar. Revisa que el código no esté repetido.", 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6 animate-[fadeIn_0.3s_ease-out]">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
         Nuevo Producto
      </h3>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className="md:col-span-2 relative group">
          <textarea
            className="w-full p-3 pr-36 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#E6C200] text-sm resize-none transition-all"
            rows={3}
            placeholder="Características (Escribe manual o usa la IA →)"
            value={formData.caracteristicas}
            onChange={e => setFormData({...formData, caracteristicas: e.target.value})}
            required
          />
          <button
            type="button"
            onClick={handleAI}
            disabled={generatingAI}
            className="absolute top-3 right-3 flex items-center gap-1 bg-purple-600 text-white text-xs px-3 py-1.5 rounded-md hover:bg-purple-700 disabled:opacity-50 shadow-sm transition-all hover:shadow-md z-10"
          >
            <Wand2 size={12} className={generatingAI ? "animate-spin" : ""} />
            {generatingAI ? "Generando..." : "Generar con IA"}
          </button>
        </div>

        {/* Precios */}
        <div className="flex gap-2">
            <select 
                className="rounded border border-gray-200 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#E6C200]"
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

        <div className="md:col-span-2 flex gap-3 mt-2 justify-end">
           <Button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 w-auto px-4 text-gray-700 border border-gray-300">
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={loading} className="w-auto px-6 shadow-sm">
            {loading ? "Guardando..." : "Guardar Producto"}
          </Button>
        </div>
      </form>
    </div>
  );
};