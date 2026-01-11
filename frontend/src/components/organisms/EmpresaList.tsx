import { useEffect, useState } from 'react';
import { getEmpresas, type Empresa } from '../../services/empresaService';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Building2 } from 'lucide-react';

interface EmpresaListProps {
  refreshTrigger: number;
}

export const EmpresaList = ({ refreshTrigger }: EmpresaListProps) => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    cargarEmpresas();
  }, [refreshTrigger]);

  const cargarEmpresas = async () => {
    try {
      const data = await getEmpresas();
      setEmpresas(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4 text-center">Cargando empresas...</div>;

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
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
                  <button 
                    onClick={() => navigate(`/dashboard/empresa/${empresa.nit}`)}
                    className="text-[#d8b600] hover:text-[#bfa100] font-bold inline-flex items-center gap-1"
                  >
                    Ver Inventario <ChevronRight size={16}/>
                  </button>
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
                <div className="w-10 h-10 bg-[#E6C200]/10 rounded-full flex items-center justify-center">
                  <Building2 size={20} className="text-[#d8b600]"/>
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{empresa.nombre}</p>
                  <p className="text-xs text-gray-500">NIT: {empresa.nit}</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-400"/>
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
  );
};