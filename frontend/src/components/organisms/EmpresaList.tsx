import { useEffect, useState } from 'react';
import { getEmpresas, type Empresa } from '../../services/empresaService';
import { useNavigate } from 'react-router-dom';

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
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">NIT</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">NOMBRE</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ACCIÓN</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {empresas.map((empresa) => (
            <tr key={empresa.nit} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{empresa.nit}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{empresa.nombre}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  onClick={() => navigate(`/dashboard/empresa/${empresa.nit}`)}
                  className="text-[#d8b600] hover:text-[#bfa100] font-bold"
                >
                  Ver Inventario →
                </button>
              </td>
            </tr>
          ))}
          {empresas.length === 0 && (
            <tr>
              <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                No hay empresas registradas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};