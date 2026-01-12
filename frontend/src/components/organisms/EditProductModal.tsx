import React, { useState, useEffect } from 'react';
import { X, Save, DollarSign } from 'lucide-react';
import { Button } from '../atoms/Button';
import { type Producto } from '../../services/productoService';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Producto | null;
  onUpdate: (id: number, data: Partial<Producto>) => Promise<void>;
}

export const EditProductModal = ({ isOpen, onClose, product, onUpdate }: EditProductModalProps) => {
  const [formData, setFormData] = useState<Partial<Producto>>({});
  const [loading, setLoading] = useState(false);
  
  // ESTADO SIMPLIFICADO: Una sola moneda y un solo precio
  const [currency, setCurrency] = useState('COP');
  const [price, setPrice] = useState<string | number>('');

  useEffect(() => {
    if (product) {
      setFormData({
        nombre: product.nombre,
        codigo: product.codigo,
        caracteristicas: product.caracteristicas,
      });

      // LÓGICA: Extraer el primer precio que encuentre para mostrarlo
      const precios = product.precios || {};
      const monedas = Object.keys(precios);

      if (monedas.length > 0) {
        const monedaActual = monedas[0]; // Ej: 'COP'
        setCurrency(monedaActual);
        setPrice(precios[monedaActual]);
      } else {
        setCurrency('COP'); // Default si es nuevo o no tiene precio
        setPrice('');
      }
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Construimos el objeto de precios: { "COP": 50000 }
    const finalPrice = price === '' ? 0 : parseFloat(price.toString());
    
    const preciosPayload = {
        [currency]: finalPrice
    };

    try {
      await onUpdate(product.id!, {
          nombre: formData.nombre,
          codigo: formData.codigo,
          caracteristicas: formData.caracteristicas,
          precios: preciosPayload
      });
      onClose();
    } catch (error) {
      console.error("Error al actualizar:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-[fadeIn_0.2s_ease-out] flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Editar Producto</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={24} />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto pr-2 space-y-5">
            {/* Campos Básicos */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre</label>
                <input
                    type="text"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    value={formData.nombre || ''}
                    onChange={e => setFormData({...formData, nombre: e.target.value})}
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Código</label>
                <input
                    type="text"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    value={formData.codigo || ''}
                    onChange={e => setFormData({...formData, codigo: e.target.value})}
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Características</label>
                <textarea 
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                    rows={3}
                    value={formData.caracteristicas || ''}
                    onChange={e => setFormData({...formData, caracteristicas: e.target.value})}
                />
            </div>

            {/* Sección de Precio Simplificada */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <label className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <DollarSign size={18} className="text-green-600"/> 
                    Precio y Moneda
                </label>
                
                <div className="flex gap-3">
                    {/* Lista desplegable de la moneda */}
                    <div className="w-1/3">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Moneda</label>
                        <select 
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none cursor-pointer"
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                        >
                            <option value="COP">COP</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="MXN">MXN</option>
                        </select>
                    </div>

                    {/* Input del valor */}
                    <div className="w-2/3">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Valor</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full rounded-lg border border-gray-300 pl-7 pr-4 py-2.5 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all font-semibold"
                                placeholder="0.00"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
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