import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductos, deleteProducto, downloadPDF, sendEmailReport, updateProducto, type Producto } from '../services/productoService';
import { getEmpresaByNit, type Empresa } from '../services/empresaService'; 
import { Button } from '../components/atoms/Button';
import { AddProductForm } from '../components/organisms/AddProductForm';
import { EditProductModal } from '../components/organisms/EditProductModal'; // Importar Modal
import { useAuth } from '../context/AuthContext';
import { FileText, ArrowLeft, Mail, Send, Plus, Package, Trash2, Pencil } from 'lucide-react'; // Importar Pencil
import { useToast } from '../context/ToastContext';
import { EmailModal } from '../components/atoms/EmailModal';
import { ConfirmModal } from '../components/atoms/ConfirmModal';

export default function InventoryPage() {
  const { nit } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  
  const [productos, setProductos] = useState<Producto[]>([]);
  const [empresaInfo, setEmpresaInfo] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // LOGICA MODAL EMAIL
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  // LOGICA MODAL ELIMINAR
  const [itemToDelete, setItemToDelete] = useState<{ isOpen: boolean; id: number; nombre: string }>({
    isOpen: false, id: 0, nombre: ''
  });
  const [deletingProduct, setDeletingProduct] = useState(false);

  // LOGICA MODAL EDITAR
  const [itemToEdit, setItemToEdit] = useState<Producto | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
  
  // --- HANDLERS ---

  const handleSendEmailSubmit = async (email: string) => {
    setSendingEmail(true);
    try {
        await sendEmailReport(email);
        showToast(`Reporte enviado correctamente a ${email}`, 'success'); 
        setIsEmailModalOpen(false);
    } catch (error) {
        console.error(error);
        showToast("Hubo un error enviando el correo.", 'error');
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
  };

  const confirmDeleteProduct = async () => {
    setDeletingProduct(true);
    try {
      await deleteProducto(itemToDelete.id);
      setProductos(prev => prev.filter(p => p.id !== itemToDelete.id));
      showToast("Producto eliminado correctamente", "success");
      setItemToDelete({ isOpen: false, id: 0, nombre: '' });
    } catch (error) {
      console.error(error);
      showToast("Error eliminando el producto", "error");
    } finally {
      setDeletingProduct(false);
    }
  };

  // NUEVO: Handler para actualizar producto
  const handleUpdateProduct = async (id: number, data: Partial<Producto>) => {
    try {
        const updatedProduct = await updateProducto(id, data);
        
        // Actualizar estado local
        setProductos(prev => prev.map(p => (p.id === id ? updatedProduct : p)));
        
        showToast("Producto actualizado correctamente", "success");
        setIsEditModalOpen(false);
        setItemToEdit(null);
    } catch (error) {
        console.error("Error update:", error);
        showToast("No se pudo actualizar el producto", "error");
        throw error; // Para que el modal sepa que falló
    }
  };

  const openEditModal = (producto: Producto) => {
      setItemToEdit(producto);
      setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-3 sm:p-4 md:p-8">
      
      {/* MODALES */}
      <EmailModal 
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onSubmit={handleSendEmailSubmit}
        loading={sendingEmail}
      />

      <ConfirmModal
        isOpen={itemToDelete.isOpen}
        title="Eliminar Producto"
        message={`¿Estás seguro de eliminar "${itemToDelete.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmDeleteProduct}
        onCancel={() => setItemToDelete({ isOpen: false, id: 0, nombre: '' })}
        loading={deletingProduct}
      />

      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        product={itemToEdit}
        onUpdate={handleUpdateProduct}
      />

      <div className="max-w-6xl mx-auto">
        <Button 
            onClick={() => navigate('/dashboard')} 
            className="w-full sm:w-auto px-4 mb-4 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200"
            icon={<ArrowLeft size={16}/>}
        >
            Volver a Empresas
        </Button>

        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 bg-white p-4 sm:p-6 rounded-lg shadow-sm animate-[fadeIn_0.5s_ease-out]">
          <div className="w-full lg:w-auto">
            <h1 className="text-lg sm:text-xl font-bold text-gray-800 break-words">
               {empresaInfo ? `Inventario: ${empresaInfo.nombre}` : 'Cargando empresa...'}
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm">
                NIT: {nit} {empresaInfo && `• Tel: ${empresaInfo.telefono}`}
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:flex gap-2 w-full lg:w-auto">
            <Button 
              onClick={handleDownloadPDF} 
              className="w-full sm:w-auto px-3 sm:px-4 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm" 
              icon={<FileText size={14} className="sm:w-4 sm:h-4"/>}
            >
                <span className="hidden xs:inline">PDF</span>
                <span className="xs:hidden">PDF</span>
            </Button>

            <Button 
                onClick={() => setIsEmailModalOpen(true)} 
                className="w-full sm:w-auto px-3 sm:px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm" 
                disabled={sendingEmail}
                icon={sendingEmail ? <Send size={14} className="animate-pulse"/> : <Mail size={14}/>}
            >
                {sendingEmail ? 'Enviando...' : <><span className="hidden sm:inline">Enviar</span><span className="sm:hidden">Email</span></>}
            </Button>
            
            {isAdmin && (
                <Button 
                  onClick={() => setShowForm(!showForm)} 
                  variant="primary" 
                  className="w-full sm:w-auto px-3 sm:px-4 col-span-2 sm:col-span-1 text-xs sm:text-sm"
                  icon={<Plus size={14}/>}
                >
                    {showForm ? 'Cerrar' : <><span className="hidden sm:inline">Agregar Producto</span><span className="sm:hidden">Agregar</span></>}
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

        <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="p-8 sm:p-12 text-center text-gray-500">Cargando datos...</div>
            ) : (
              <>
                {/* Vista Desktop - Tabla */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                          <tr>
                              <th className="px-4 lg:px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Código</th>
                              <th className="px-4 lg:px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Producto</th>
                              <th className="px-4 lg:px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Características</th>
                              <th className="px-4 lg:px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Precio</th>
                              {isAdmin && <th className="px-4 lg:px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Acción</th>}
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                          {productos.map(prod => (
                              <tr key={prod.id} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-4 lg:px-6 py-4 text-sm font-medium text-gray-900">{prod.codigo}</td>
                                  <td className="px-4 lg:px-6 py-4 text-sm text-gray-600">{prod.nombre}</td>
                                  <td className="px-4 lg:px-6 py-4 text-xs text-gray-500 max-w-xs truncate">{prod.caracteristicas}</td>
                                  <td className="px-4 lg:px-6 py-4 text-sm font-bold text-green-600">
                                      {Object.entries(prod.precios).map(([moneda, valor]) => (
                                          <div key={moneda} className="whitespace-nowrap">{moneda} ${valor.toLocaleString()}</div>
                                      ))}
                                  </td>
                                  {isAdmin && (
                                    <td className="px-4 lg:px-6 py-4 text-right whitespace-nowrap">
                                       <button 
                                         onClick={() => openEditModal(prod)}
                                         className="text-gray-400 hover:text-blue-600 transition-colors p-1 mr-2"
                                         title="Editar producto"
                                       >
                                         <Pencil size={18}/>
                                       </button>
                                       <button 
                                         onClick={() => setItemToDelete({ isOpen: true, id: prod.id!, nombre: prod.nombre })}
                                         className="text-gray-400 hover:text-red-600 transition-colors p-1"
                                         title="Eliminar producto"
                                       >
                                         <Trash2 size={18}/>
                                       </button>
                                    </td>
                                  )}
                              </tr>
                          ))}
                      </tbody>
                  </table>
                </div>

                {/* Vista Mobile - Cards */}
                <div className="md:hidden divide-y divide-gray-200">
                  {productos.map(prod => (
                    <div key={prod.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-gray-900">{prod.nombre}</p>
                          <p className="text-xs text-gray-500">Código: {prod.codigo}</p>
                        </div>
                        {isAdmin && (
                            <div className="flex -mt-2 -mr-2">
                                <button 
                                    onClick={() => openEditModal(prod)}
                                    className="text-gray-300 hover:text-blue-500 p-2"
                                >
                                    <Pencil size={20}/>
                                </button>
                                <button 
                                    onClick={() => setItemToDelete({ isOpen: true, id: prod.id!, nombre: prod.nombre })}
                                    className="text-gray-300 hover:text-red-500 p-2"
                                >
                                    <Trash2 size={20}/>
                                </button>
                            </div>
                        )}
                      </div>
                      <div className="flex justify-between items-end mt-2">
                          <p className="text-xs text-gray-500 line-clamp-2 w-2/3">{prod.caracteristicas}</p>
                          <div className="text-right">
                            {Object.entries(prod.precios).map(([moneda, valor]) => (
                                <p key={moneda} className="text-sm font-bold text-green-600">
                                {moneda} ${valor.toLocaleString()}
                                </p>
                            ))}
                          </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Empty State */}
                {productos.length === 0 && (
                  <div className="p-8 sm:p-10 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <Package size={32} className="opacity-20"/>
                      <p className="text-sm">Esta empresa no tiene productos registrados aún.</p>
                    </div>
                  </div>
                )}
              </>
            )}
        </div>
      </div>
    </div>
  );
}