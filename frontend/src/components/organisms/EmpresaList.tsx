import { useEffect, useState } from 'react';
import { getEmpresas, deleteEmpresa, type Empresa } from '../../services/empresaService';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Building2, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ConfirmModal } from '../atoms/ConfirmModal';

interface EmpresaListProps {
  refreshTrigger: number;
}

export const EmpresaList = ({ refreshTrigger }: EmpresaListProps) => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; nit: string; nombre: string }>({
    isOpen: false,
    nit: '',
    nombre: ''
  });
  const [deleting, setDeleting] = useState(false);
  
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    cargarEmpresas();
  }, [refreshTrigger]);

  const cargarEmpresas = async () => {
    try {
      const data = await getEmpresas();
      setEmpresas(data);
    } catch (err) {
      console.error(err);
      showToast("Error cargando las empresas", "error");
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal de confirmación
  const openDeleteModal = (e: React.MouseEvent, nit: string, nombre: string) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, nit, nombre });
  };

  // Cerrar modal
  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, nit: '', nombre: '' });
  };

  // Ejecutar eliminación
  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteEmpresa(deleteModal.nit);
      setEmpresas(prev => prev.filter(emp => emp.nit !== deleteModal.nit));
      showToast("Empresa eliminada correctamente", "success");
      closeDeleteModal();
    } catch (error) {
      console.error(error);
      showToast("No se pudo eliminar la empresa. Intente nuevamente.", "error");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="p-4 text-center text-gray-400">Cargando empresas...</div>;

  return (
    <>
      {/* Modal de Confirmación */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Eliminar Empresa"
        message={`¿Estás seguro de eliminar "${deleteModal.nombre}"? Esta acción eliminará todos sus productos y no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
        loading={deleting}
      />

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        {/* Vista Desktop - Tabla */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">NIT</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">NOMBRE</th>
                <th className="px-4 md:px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">ACCIÓN</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {empresas.map((empresa) => (
                <tr key={empresa.nit} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{empresa.nit}</td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{empresa.nombre}</td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end items-center gap-3">
                      <button 
                        onClick={() => navigate(`/dashboard/empresa/${empresa.nit}`)}
                        className="text-[#d8b600] hover:text-[#bfa100] font-bold inline-flex items-center gap-1 transition-colors"
                      >
                        Ver Inventario <ChevronRight size={16}/>
                      </button>
                      
                      {isAdmin && (
                        <button 
                          onClick={(e) => openDeleteModal(e, empresa.nit, empresa.nombre)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1"
                          title="Eliminar Empresa"
                        >
                          <Trash2 size={18}/>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Vista Mobile - Cards */}
        <div className="sm:hidden divide-y divide-gray-200">
          {empresas.map((empresa) => (
            <div 
              key={empresa.nit} 
              onClick={() => navigate(`/dashboard/empresa/${empresa.nit}`)}
              className="p-4 hover:bg-gray-50 transition-colors cursor-pointer active:bg-gray-100"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#E6C200]/10 rounded-full flex items-center justify-center shrink-0">
                    <Building2 size={20} className="text-[#d8b600]"/>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{empresa.nombre}</p>
                    <p className="text-xs text-gray-500">NIT: {empresa.nit}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {isAdmin && (
                    <button 
                      onClick={(e) => openDeleteModal(e, empresa.nit, empresa.nombre)}
                      className="text-gray-300 hover:text-red-500 p-2"
                    >
                      <Trash2 size={20}/>
                    </button>
                  )}
                  <ChevronRight size={20} className="text-gray-400"/>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {empresas.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">
            <Building2 size={32} className="mx-auto mb-2 opacity-20"/>
            <p>No hay empresas registradas.</p>
          </div>
        )}
      </div>
    </>
  );
};