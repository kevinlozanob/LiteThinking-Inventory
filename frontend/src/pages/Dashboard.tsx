import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/atoms/Button';
import { EmpresaList } from '../components/organisms/EmpresaList';
import { AddEmpresaForm } from '../components/organisms/AddEmpresaForm';
import { LogOut, Plus, UserCircle, ShieldCheck, Shield } from 'lucide-react'; // <--- ICONOS NUEVOS

export default function Dashboard() {
  const { logout, isAdmin, userEmail } = useAuth(); // <--- TRAEMOS userEmail
  const [showForm, setShowForm] = useState(false);
  const [refreshList, setRefreshList] = useState(0);

  return (
    <div className="min-h-screen bg-gray-100 p-3 sm:p-4 md:p-6 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8 bg-white p-4 sm:p-6 rounded-xl shadow-sm">
          <div className="w-full md:w-auto">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">Panel de Control</h1>
            <p className="text-gray-500 text-xs sm:text-sm">Sistema de Inventario</p>
          </div>
          <div className="w-full md:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100 w-full sm:w-auto">
                <div className={`p-2 rounded-full ${isAdmin ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                    {isAdmin ? <ShieldCheck size={20}/> : <UserCircle size={20}/>}
                </div>
                <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                        {isAdmin ? 'Administrador' : 'Usuario Externo'}
                    </p>
                    <p className="text-sm font-bold text-gray-800 truncate max-w-[150px] sm:max-w-[200px]" title={userEmail || ''}>
                        {userEmail || 'Usuario'}
                    </p>
                </div>
            </div>

            <Button 
              onClick={logout} 
              className="bg-red-50 text-red-600 hover:bg-red-100 w-full sm:w-auto px-4 h-[42px]"
              icon={<LogOut size={16} />}
            >
              Salir
            </Button>
          </div>
        </header>
        {/* Content */}
        <main>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-700 border-l-4 border-[#E6C200] pl-3">
              Empresas Registradas
            </h2>
            {/* CONDICIONAL ADMIN */}
            {!showForm && isAdmin && (
              <div className="w-full sm:w-48">
                <Button onClick={() => setShowForm(true)} variant="primary" icon={<Plus size={16}/>}>
                  Nueva Empresa
                </Button>
              </div>
            )}
          </div>
          {/* Formulario (Condicional) */}
          {showForm && (
            <AddEmpresaForm 
              onSuccess={() => {
                setShowForm(false);
                setRefreshList(prev => prev + 1);
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