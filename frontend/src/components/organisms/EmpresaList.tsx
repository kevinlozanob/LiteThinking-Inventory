import { useEffect, useState } from 'react';
import { getEmpresas, deleteEmpresa, updateEmpresa, type Empresa } from '../../services/empresaService';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Building2, Trash2, Pencil, MapPin, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ConfirmModal } from '../atoms/ConfirmModal';
import { EditEmpresaModal } from './EditEmpresaModal';

interface EmpresaListProps {
  refreshTrigger: number;
}

export const EmpresaList = ({ refreshTrigger }: EmpresaListProps) => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; nit: string; nombre: string }>({
    isOpen: false, nit: '', nombre: ''
  });
  const [deleting, setDeleting] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [empresaToEdit, setEmpresaToEdit] = useState<Empresa | null>(null);
  
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
      showToast("Error cargando empresas", "error");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (e: React.MouseEvent, empresa: Empresa) => {
    e.stopPropagation();
    setEmpresaToEdit(empresa);
    setEditModalOpen(true);
  };

  const handleUpdateEmpresa = async (nit: string, data: Partial<Empresa>) => {
    try {
        const updated = await updateEmpresa(nit, data);
        setEmpresas(prev => prev.map(emp => emp.nit === nit ? updated : emp));
        showToast("Empresa actualizada", "success");
        setEditModalOpen(false);
        setEmpresaToEdit(null);
    } catch (error) {
        showToast("Error al actualizar", "error");
    }
  };

  const openDeleteModal = (e: React.MouseEvent, nit: string, nombre: string) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, nit, nombre });
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteEmpresa(deleteModal.nit);
      setEmpresas(prev => prev.filter(emp => emp.nit !== deleteModal.nit));
      showToast("Empresa eliminada", "success");
      setDeleteModal({ isOpen: false, nit: '', nombre: '' });
    } catch (error) {
      showToast("Error al eliminar", "error");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return (
      <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-[#E6C200] border-t-transparent rounded-full animate-spin"></div>
      </div>
  );

  return (
    <>
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Eliminar Empresa"
        message={`¿Borrar "${deleteModal.nombre}" y todo su inventario?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, nit: '', nombre: '' })}
        loading={deleting}
      />

      <EditEmpresaModal 
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        empresa={empresaToEdit}
        onUpdate={handleUpdateEmpresa}
      />

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        
        {/* DESKTOP TABLE */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Empresa / NIT</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Contacto</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {empresas.map((empresa) => (
                <tr 
                    key={empresa.nit} 
                    className="group hover:bg-[#FFFDF0] transition-colors duration-200 cursor-pointer"
                    onClick={() => navigate(`/dashboard/empresa/${empresa.nit}`)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-[#E6C200] group-hover:text-black transition-colors">
                            <Building2 size={18}/>
                        </div>
                        <div>
                            <div className="text-sm font-bold text-gray-900">{empresa.nombre}</div>
                            <div className="text-xs text-gray-400 font-mono">{empresa.nit}</div>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 flex flex-col gap-1">
                        <span className="flex items-center gap-1.5"><MapPin size={12} className="text-gray-400"/> {empresa.direccion}</span>
                        <span className="flex items-center gap-1.5"><Phone size={12} className="text-gray-400"/> {empresa.telefono}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {isAdmin && (
                        <>
                            <button onClick={(e) => openEditModal(e, empresa)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
                                <Pencil size={16}/>
                            </button>
                            <button onClick={(e) => openDeleteModal(e, empresa.nit, empresa.nombre)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all">
                                <Trash2 size={16}/>
                            </button>
                        </>
                      )}
                      <button className="p-2 text-[#E6C200] hover:bg-yellow-50 rounded-full">
                         <ChevronRight size={20}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS*/}
        <div className="sm:hidden flex flex-col gap-3 p-3 bg-gray-50">
          {empresas.map((empresa) => (
            <div 
              key={empresa.nit} 
              onClick={() => navigate(`/dashboard/empresa/${empresa.nit}`)}
              className="bg-white p-4 rounded-xl shadow-sm border border-transparent hover:border-[#E6C200] transition-all duration-300 active:scale-[0.98]"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#E6C200]/20 rounded-xl flex items-center justify-center text-[#998100]">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{empresa.nombre}</h3>
                    <p className="text-xs text-gray-500 font-mono">{empresa.nit}</p>
                  </div>
                </div>
                {isAdmin && (
                    <button onClick={(e) => openDeleteModal(e, empresa.nit, empresa.nombre)} className="text-gray-300 p-1">
                        <XIconMini />
                    </button>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-3 pl-1">
                  <span className="flex items-center gap-1"><MapPin size={12}/> {empresa.direccion}</span>
                  <span className="flex items-center gap-1"><Phone size={12}/> {empresa.telefono}</span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs font-semibold text-[#E6C200]">Ver Inventario</span>
                  <div className="bg-gray-50 p-1 rounded-full">
                    <ChevronRight size={16} className="text-gray-400"/>
                  </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {empresas.length === 0 && (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 size={32} className="text-gray-300"/>
            </div>
            <p className="text-gray-500 font-medium">No hay empresas registradas.</p>
            {isAdmin && <p className="text-xs text-gray-400 mt-1">Dale click al botón "Nueva Empresa" arriba.</p>}
          </div>
        )}
      </div>
    </>
  );
};

const XIconMini = () => <Trash2 size={16} className="hover:text-red-500 transition-colors"/>