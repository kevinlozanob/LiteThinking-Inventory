import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductos, downloadPDF, sendEmailReport, type Producto } from '../services/productoService';
import { getEmpresaByNit, type Empresa } from '../services/empresaService'; 
import { Button } from '../components/atoms/Button';
import { AddProductForm } from '../components/organisms/AddProductForm';
import { useAuth } from '../context/AuthContext';
import { FileText, ArrowLeft, Mail, Send } from 'lucide-react'; 
import { useToast } from '../context/ToastContext';

export default function InventoryPage() {
  const { nit } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const { showToast } = useToast();
  
  // Estado
  const [productos, setProductos] = useState<Producto[]>([]);
  const [empresaInfo, setEmpresaInfo] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    if (nit) {
        cargarDataCompuesto();
    }
  }, [nit]);

  const cargarDataCompuesto = async () => {
    setLoading(true);
    try {

      const [empresaData, allProductos] = await Promise.all([
        getEmpresaByNit(nit!),
        getProductos()
      ]);
      
      setEmpresaInfo(empresaData);

      const filtrados = allProductos.filter(p => String(p.empresa) === String(nit));
      setProductos(filtrados);

    } catch (error) {
      console.error(error);
      showToast("Error cargando el inventario de la empresa", 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSendEmail = async () => {
    const email = prompt("Ingrese el correo destino:", "usuario@ejemplo.com");
    if (!email) return;

    setSendingEmail(true);
    try {
        await sendEmailReport(email);
        showToast(`Reporte enviado correctamente a ${email}`, 'success'); 
    } catch (error) {
        console.error(error);
        showToast("Hubo un error enviando el correo. Verifique la consola.", 'error');
    } finally {
        setSendingEmail(false);
    }
  };

  const handleDownloadPDF = async () => {
      try {
          await downloadPDF();
          showToast("Descarga de PDF iniciada", 'info');
      } catch (e) {
          showToast("Error descargando el PDF", 'error');
      }
  }

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

        <header className="flex justify-between items-center mb-6 bg-white p-6 rounded-lg shadow-sm animate-[fadeIn_0.5s_ease-out]">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
               {empresaInfo ? `Inventario: ${empresaInfo.nombre}` : 'Cargando empresa...'}
            </h1>
            <p className="text-gray-500 text-sm">
                NIT: {nit} {empresaInfo && `• Tel: ${empresaInfo.telefono}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleDownloadPDF} className="w-auto px-4 bg-red-600 hover:bg-red-700 text-white" icon={<FileText size={16}/>}>
                PDF Global
            </Button>

            <Button 
                onClick={handleSendEmail} 
                className="w-auto px-4 bg-blue-600 hover:bg-blue-700 text-white" 
                disabled={sendingEmail}
                icon={sendingEmail ? <Send size={16} className="animate-pulse"/> : <Mail size={16}/>}
            >
                {sendingEmail ? 'Enviando...' : 'Enviar Reporte'}
            </Button>
            
            {/* CONDICIONAL: Solo Admin puede crear productos */}
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
                    cargarDataCompuesto();
                    setShowForm(false);
                }} 
                onCancel={() => setShowForm(false)} 
            />
        )}

        {/* Tabla de Productos */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? <div className="p-12 text-center text-gray-500">Cargando datos...</div> : (
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
                            <tr key={prod.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{prod.codigo}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{prod.nombre}</td>
                                <td className="px-6 py-4 text-xs text-gray-500 max-w-xs">{prod.caracteristicas}</td>
                                <td className="px-6 py-4 text-sm font-bold text-green-600">
                                    
                                    {Object.entries(prod.precios).map(([moneda, valor]) => (
                                        <div key={moneda} className="whitespace-nowrap">{moneda} ${valor.toLocaleString()}</div>
                                    ))}
                                </td>
                            </tr>
                        ))}
                         {productos.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-10 text-center text-gray-400">
                                    <div className="flex flex-col items-center gap-2">
                                        <FileText size={32} className="opacity-20"/>
                                        <p>Esta empresa no tiene productos registrados aún.</p>
                                    </div>
                                </td>
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