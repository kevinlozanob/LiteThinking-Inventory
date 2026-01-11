import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/atoms/Button';
import { EmpresaList } from '../components/organisms/EmpresaList';
import { AddEmpresaForm } from '../components/organisms/AddEmpresaForm';

export default function Dashboard() {
  const { logout } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [refreshList, setRefreshList] = useState(0);

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Panel de Control</h1>
            <p className="text-gray-500 text-sm">Sistema de Inventario</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button onClick={logout} className="bg-red-50 text-red-600 hover:bg-red-100 w-auto px-6 h-[40px]">
              Cerrar Sesión
            </Button>
          </div>
        </header>

        {/* Content */}
        <main>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-700 border-l-4 border-[#E6C200] pl-3">
              Empresas Registradas
            </h2>
            
            {!showForm && (
              <div className="w-48">
                <Button onClick={() => setShowForm(true)} variant="primary">
                  + Nueva Empresa
                </Button>
              </div>
            )}
          </div>

          {/* Formulario (Condicional) */}
          {showForm && (
            <AddEmpresaForm 
              onSuccess={() => {
                setShowForm(false);
                setRefreshList(prev => prev + 1); // Recargo tablar valor
              }}
              onCancel={() => setShowForm(false)}
            />
          )}

          {/* Tabla */}
          <EmpresaList refreshTrigger={refreshList} />
        </main>

      </div>
    </div>
  );
}