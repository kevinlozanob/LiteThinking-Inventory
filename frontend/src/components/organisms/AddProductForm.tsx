import React, { useState } from 'react';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { createProducto, generarDescripcionIA } from '../../services/productoService';
import { Wand2 } from 'lucide-react';

interface Props {
  empresaNit: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddProductForm = ({ empresaNit, onSuccess, onCancel }: Props) => {
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
    if (!formData.nombre) return alert("Escribe un nombre primero para usar la IA");
    
    setGeneratingAI(true);
    try {
      const desc = await generarDescripcionIA(formData.nombre);
      setFormData(prev => ({ ...prev, caracteristicas: desc }));
    } catch (err) {
      alert("Error contactando a la IA");
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
      
      onSuccess();
    } catch (err) {
      alert("Error al guardar. Revisa que el código no esté repetido.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Nuevo Producto</h3>
      
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
        <div className="md:col-span-2 relative">
          <textarea
            className="w-full p-3 pr-36 rounded border border-gray-200 focus:outline-[#E6C200] text-sm resize-none"
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
            className="absolute top-2 right-2 flex items-center gap-1 bg-purple-600 text-white text-xs px-3 py-1.5 rounded hover:bg-purple-700 disabled:opacity-50 shadow-sm z-10"
          >
            <Wand2 size={12} />
            {generatingAI ? "Generando..." : "Generar con IA"}
          </button>
        </div>

        {/* Precios */}
        <div className="flex gap-2">
            <select 
                className="rounded border border-gray-200 px-2 text-sm bg-white"
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
           <Button type="button" onClick={onCancel} className="bg-gray-300 w-auto px-4 text-gray-800">
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={loading} className="w-auto px-6">
            {loading ? "Guardando..." : "Guardar Producto"}
          </Button>
        </div>
      </form>
    </div>
  );
};