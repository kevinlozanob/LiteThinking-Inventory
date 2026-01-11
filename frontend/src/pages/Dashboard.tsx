import { useAuth } from '../context/AuthContext';
import { Button } from '../components/atoms/Button';

export default function Dashboard() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Panel de Control
        </h1>
        <p className="text-gray-600 mb-6">
          Bienvenido al sistema de inventario Lite Thinking.
        </p>
        
        <div className="w-48">
          <Button onClick={logout} variant="primary">
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </div>
  );
}