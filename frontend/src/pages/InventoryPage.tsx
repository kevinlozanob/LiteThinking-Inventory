import { useEffect, useState, Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductos, deleteProducto, downloadPDF, sendEmailReport, updateProducto, type Producto } from '../services/productoService';
import { getEmpresaByNit, type Empresa } from '../services/empresaService'; 
import { Button } from '../components/atoms/Button';
import { AddProductForm } from '../components/organisms/AddProductForm';
import { EditProductModal } from '../components/organisms/EditProductModal';
import { useAuth } from '../context/AuthContext';
import { FileText, ArrowLeft, Mail, Send, Plus, Package, Trash2, Pencil, Upload, Loader2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { EmailModal } from '../components/atoms/EmailModal';
import { ConfirmModal } from '../components/atoms/ConfirmModal';
import { ChatWidget } from '../components/organisms/ChatWidget';
import { SEO } from '../components/atoms/SEO';

const BulkUploadModal = lazy(() => 
  import('../components/organisms/BulkUploadModal').then(module => ({ default: module.BulkUploadModal }))
);

export default function InventoryPage() {
  const { nit } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  
  const [productos, setProductos] = useState<Producto[]>([]);
  const [empresaInfo, setEmpresaInfo] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const [itemToDelete, setItemToDelete] = useState<{ isOpen: boolean; id: number; nombre: string }>({
    isOpen: false, id: 0, nombre: ''
  });
  const [deletingProduct, setDeletingProduct] = useState(false);

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
      const [empresaData, productosYaFiltrados] = await Promise.all([
        getEmpresaByNit(nit!),
        getProductos(nit!)
      ]);
      
      setEmpresaInfo(empresaData);
      setProductos(productosYaFiltrados); 
    } catch (error) {
      console.error(error);
      showToast("Error cargando el inventario de la empresa", 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSendEmailSubmit = async (email: string) => {
    setSendingEmail(true);
    try {
        await sendEmailReport(email, nit);
        showToast(`El PDF ha sido enviado a ${email}.`, 'success', "¡Correo Enviado!"); 
        setIsEmailModalOpen(false);
    } catch (error) {
        showToast("El servicio de correo falló.", 'error', "Error de Envío");
    } finally {
        setSendingEmail(false);
    }
  };

  const handleDownloadPDF = async () => {
      try {
          await downloadPDF(nit);
          showToast("Descarga de PDF iniciada", 'info');
      } catch (e) {
          showToast("Error descargando el PDF", 'error');
      }
  };

  const confirmDeleteProduct = async () => {
    setDeletingProduct(true);
    try {
      await deleteProducto(itemToDelete.id!); 
      setProductos(prev => prev.filter(p => p.id !== itemToDelete.id));
      showToast("El producto se eliminó.", "info", "Eliminado");
      setItemToDelete({ isOpen: false, id: 0, nombre: '' });
    } catch (error) {
      showToast("No se pudo eliminar el item.", "error");
    } finally {
      setDeletingProduct(false);
    }
  };

  const handleUpdateProduct = async (id: number, data: Partial<Producto>) => {
    try {
        const updatedProduct = await updateProducto(id, data);
        setProductos(prev => prev.map(p => (p.id === id ? updatedProduct : p)));
        showToast("Producto actualizado correctamente", "success");
        setIsEditModalOpen(false);
        setItemToEdit(null);
    } catch (error) {
        showToast("No se pudo actualizar el producto", "error");
    }
  };

  const openEditModal = (producto: Producto) => {
      setItemToEdit(producto);
      setIsEditModalOpen(true);
  };

  const pageTitle = empresaInfo ? `Inventario: ${empresaInfo.nombre}` : 'Cargando Inventario...';

  return (
    <main className="min-h-screen bg-gray-100 p-3 sm:p-4 md:p-8 pb-32">
      <SEO 
        title={pageTitle}
        description={`Gestión de inventario detallada para la empresa ${empresaInfo?.nombre || ''}.`}
      />

      <EmailModal 
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onSubmit={handleSendEmailSubmit}
        loading={sendingEmail}
      />

      <ConfirmModal
        isOpen={itemToDelete.isOpen}
        title="Eliminar Producto"
        message={`¿Estás seguro de eliminar "${itemToDelete.nombre}"?`}
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

      {isBulkModalOpen && (
        <Suspense fallback={
            <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/20 backdrop-blur-sm">
                 <div className="bg-white p-4 rounded-full shadow-xl">
                    <Loader2 className="w-8 h-8 text-[#E6C200] animate-spin" />
                 </div>
            </div>
        }>
          <BulkUploadModal 
            isOpen={isBulkModalOpen}
            onClose={() => setIsBulkModalOpen(false)}
            empresaNit={nit!}
            onSuccess={() => { cargarDataCompuesto(); }}
          />
        </Suspense>
      )}

      <div className="max-w-6xl mx-auto">
        <Button 
            onClick={() => navigate('/dashboard')} 
            variant="outline"
            className="w-full sm:w-auto px-4 mb-4 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 h-[48px]"
            icon={<ArrowLeft size={16}/>}
            aria-label="Volver al panel de empresas"
        >
            Volver a Empresas
        </Button>

        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 bg-white p-4 sm:p-6 rounded-lg shadow-sm animate-[fadeIn_0.5s_ease-out]">
          <div className="w-full lg:w-auto">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 break-words">
               {empresaInfo ? `Inventario: ${empresaInfo.nombre}` : 'Cargando empresa...'}
            </h1>
            <p className="text-gray-700 text-xs sm:text-sm font-medium"> 
                NIT: {nit} {empresaInfo && `• Tel: ${empresaInfo.telefono}`}
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:flex gap-2 w-full lg:w-auto">
            <Button 
              variant="danger"
              onClick={handleDownloadPDF} 
              className="w-full sm:w-auto px-3 sm:px-4 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm h-[48px]" 
              icon={<FileText size={14} className="sm:w-4 sm:h-4"/>}
              aria-label="Descargar reporte en PDF"
            >
                <span className="hidden xs:inline">PDF</span>
                <span className="xs:hidden">PDF</span>
            </Button>

            <Button 
                onClick={() => setIsEmailModalOpen(true)} 
                className="w-full sm:w-auto px-3 sm:px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm h-[48px]" 
                disabled={sendingEmail}
                icon={sendingEmail ? <Send size={14} className="animate-pulse"/> : <Mail size={14}/>}
                aria-label="Enviar reporte por correo"
            >
                {sendingEmail ? 'Enviando...' : <><span className="hidden sm:inline">Enviar</span><span className="sm:hidden">Email</span></>}
            </Button>
            
            {isAdmin && (
                <>
                    <Button
                        onClick={() => setIsBulkModalOpen(true)}
                        className="w-full sm:w-auto px-3 sm:px-4 bg-green-700 hover:bg-green-800 text-white text-xs sm:text-sm h-[48px]"
                        icon={<Upload size={14} />}
                        aria-label="Cargar inventario desde Excel"
                    >
                         <span className="hidden sm:inline">Excel</span>
                         <span className="sm:hidden">Excel</span>
                    </Button>

                    <Button 
                      onClick={() => setShowForm(!showForm)} 
                      variant="primary" 
                      className="w-full sm:w-auto px-3 sm:px-4 col-span-2 sm:col-span-1 text-xs sm:text-sm h-[48px]"
                      icon={<Plus size={14}/>}
                      aria-label={showForm ? "Cerrar formulario" : "Agregar nuevo producto"}
                    >
                        {showForm ? 'Cerrar' : <><span className="hidden sm:inline">Agregar Producto</span><span className="sm:hidden">Agregar</span></>}
                    </Button>
                </>
            )}
          </div>
        </header>

        {showForm && (
            <AddProductForm 
                empresaNit={nit!} 
                onSuccess={() => { cargarDataCompuesto(); setShowForm(false); }} 
                onCancel={() => setShowForm(false)} 
            />
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="p-8 sm:p-12 text-center text-gray-500">Cargando datos...</div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                          <tr>
                              <th className="px-4 lg:px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase">Código</th>
                              <th className="px-4 lg:px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase">Producto</th>
                              <th className="px-4 lg:px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase">Características</th>
                              <th className="px-4 lg:px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase">Precio</th>
                              {isAdmin && <th className="px-4 lg:px-6 py-3 text-right text-xs font-bold text-gray-800 uppercase">Acción</th>}
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                          {productos.map(prod => (
                              <tr key={prod.id} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-4 lg:px-6 py-4 text-sm font-medium text-gray-900">{prod.codigo}</td>
                                  <td className="px-4 lg:px-6 py-4 text-sm text-gray-900">{prod.nombre}</td>
                                  <td className="px-4 lg:px-6 py-4 text-xs text-gray-700 max-w-xs truncate">{prod.caracteristicas}</td>
                                  
                                  <td className="px-4 lg:px-6 py-4 text-sm font-bold text-green-700">
                                      {(() => {
                                          const precios = prod.precios || {};
                                          if (precios['COP']) {
                                              return <div className="whitespace-nowrap">COP ${precios['COP'].toLocaleString()}</div>;
                                          }
                                          const keys = Object.keys(precios);
                                          if (keys.length > 0) {
                                              const k = keys[0];
                                              return <div className="whitespace-nowrap">{k} ${precios[k].toLocaleString()}</div>;
                                          }
                                          return <div className="whitespace-nowrap">$ 0</div>;
                                      })()}
                                  </td>

                                  {isAdmin && (
                                    <td className="px-4 lg:px-6 py-4 text-right whitespace-nowrap">
                                       <button 
                                         onClick={() => openEditModal(prod)}
                                         className="text-gray-600 hover:text-blue-700 hover:bg-blue-50 transition-all p-3 rounded-full mr-2"
                                         title="Editar producto"
                                         aria-label={`Editar producto ${prod.nombre}`}
                                       >
                                         <Pencil size={20}/>
                                       </button>
                                       <button 
                                         onClick={() => setItemToDelete({ isOpen: true, id: prod.id!, nombre: prod.nombre })}
                                         className="text-gray-600 hover:text-red-700 hover:bg-red-50 transition-all p-3 rounded-full"
                                         title="Eliminar producto"
                                         aria-label={`Eliminar producto ${prod.nombre}`}
                                       >
                                         <Trash2 size={20}/>
                                       </button>
                                    </td>
                                  )}
                              </tr>
                          ))}
                      </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-gray-200">
                  {productos.map(prod => (
                    <div key={prod.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h2 className="font-bold text-gray-900 text-base">{prod.nombre}</h2>
                          <p className="text-xs text-gray-700 font-mono mt-0.5">Código: {prod.codigo}</p>
                        </div>
                        {isAdmin && (
                            <div className="flex -mt-2 -mr-2 gap-1">
                                <button 
                                    onClick={() => openEditModal(prod)}
                                    className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-4 rounded-full transition-all"
                                    aria-label={`Editar ${prod.nombre}`}
                                >
                                    <Pencil size={20}/>
                                </button>
                                <button 
                                    onClick={() => setItemToDelete({ isOpen: true, id: prod.id!, nombre: prod.nombre })}
                                    className="text-gray-600 hover:text-red-600 hover:bg-red-50 p-4 rounded-full transition-all"
                                    aria-label={`Eliminar ${prod.nombre}`}
                                >
                                    <Trash2 size={20}/>
                                </button>
                            </div>
                        )}
                      </div>
                      <div className="flex justify-between items-end mt-2">
                          <p className="text-xs text-gray-700 line-clamp-2 w-2/3">{prod.caracteristicas}</p>
                          
                          <div className="text-right">
                             {(() => {
                                  const precios = prod.precios || {};
                                  if (precios['COP']) {
                                      return <p className="text-sm font-bold text-green-700">COP ${precios['COP'].toLocaleString()}</p>;
                                  }
                                  const keys = Object.keys(precios);
                                  if (keys.length > 0) {
                                      return <p className="text-sm font-bold text-green-700">{keys[0]} ${precios[keys[0]].toLocaleString()}</p>;
                                  }
                                  return null;
                              })()}
                          </div>
                      </div>
                    </div>
                  ))}
                </div>

                {productos.length === 0 && (
                  <div className="p-8 sm:p-10 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Package size={32} className="opacity-50"/>
                      <p className="text-sm">Esta empresa no tiene productos registrados aún.</p>
                    </div>
                  </div>
                )}
              </>
            )}
        </div>
      </div>
      
      {nit && <ChatWidget empresaNit={nit} />}
      
    </main>
  );
}