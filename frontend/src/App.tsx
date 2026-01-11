import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import InventoryPage from './pages/InventoryPage';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Cargando...</div>;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Componente para redireccionar si ya está logueado
const PublicRoute = ({ children }: { children: JSX.Element }) => {
    const { isAuthenticated } = useAuth();
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }
    return children;
}
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta Pública (Login)*/}
          <Route path="/login" element={
              <PublicRoute>
                  <Login />
              </PublicRoute>
          } />
          {/* Registro */}
           <Route path="/register" element={
              <PublicRoute>
                  <Register />
              </PublicRoute>
          } />
          {/* Ruta JWT (Dashboard) */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          {/* NUEVA RUTA DINÁMICA */}
          <Route path="/dashboard/empresa/:nit" element={
            <ProtectedRoute>
              <InventoryPage />
            </ProtectedRoute>
          } />
          {/* Ruta defauly */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;