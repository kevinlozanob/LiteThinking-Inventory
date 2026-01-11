import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductos, downloadPDF, type Producto } from '../services/productoService';
import { Button } from '../components/atoms/Button';
import { AddProductForm } from '../components/organisms/AddProductForm';
import { FileText, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function InventoryPage() {
  const { nit } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    cargarProductos();
  }, [nit]);

  const cargarProductos = async () => {
    try {
      const allProductos = await getProductos();
    const filtrados = allProductos.filter(p => String(p.empresa) === String(nit));
      setProductos(filtrados);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Button 
            onClick={() => navigate('/dashboard')} 
            className="w-auto px-4 mb-4 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200"
            icon={<ArrowLeft size={16}/>}
        >
            Volver a Empresas
        </Button>

        <header className="flex justify-between items-center mb-6 bg-white p-6 rounded-lg shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Inventario de Empresa</h1>
            <p className="text-gray-500 text-sm">NIT: {nit}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={downloadPDF} className="w-auto px-4 bg-red-600 hover:bg-red-700 text-white" icon={<FileText size={16}/>}>
                PDF Global
            </Button>
            
            {/* CONDICIONAL: Solo Admin ve el boton de agregar */}
            {isAdmin && (
                <Button onClick={() => setShowForm(!showForm)} variant="primary" className="w-auto px-4">
                    {showForm ? 'Cerrar Formulario' : '+ Agregar Producto'}
                </Button>
            )}
          </div>
        </header>

        {showForm && (
            <AddProductForm 
                empresaNit={nit!} 
                onSuccess={() => {
                    cargarProductos();
                    setShowForm(false);
                }} 
                onCancel={() => setShowForm(false)} 
            />
        )}

        {/* Tabla de Productos */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? <div className="p-8 text-center">Cargando...</div> : (
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Código</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Producto</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Características</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Precio</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {productos.map(prod => (
                            <tr key={prod.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm font-medium">{prod.codigo}</td>
                                <td className="px-6 py-4 text-sm">{prod.nombre}</td>
                                <td className="px-6 py-4 text-xs text-gray-500 max-w-xs">{prod.caracteristicas}</td>
                                <td className="px-6 py-4 text-sm font-bold text-green-600">
                                    
                                    {Object.entries(prod.precios).map(([moneda, valor]) => (
                                        <div key={moneda}>{moneda} ${valor}</div>
                                    ))}
                                </td>
                            </tr>
                        ))}
                         {productos.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-400">Esta empresa no tiene productos aún.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
      </div>
    </div>
  );
}