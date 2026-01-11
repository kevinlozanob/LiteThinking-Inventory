import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import InventoryPage from './pages/InventoryPage';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-[#E6C200] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-gray-500 text-sm">Cargando...</p>
      </div>
    </div>
  );
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

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
          <Route path="/login" element={
              <PublicRoute>
                  <Login />
              </PublicRoute>
          } />
          <Route path="/register" element={
              <PublicRoute>
                  <Register />
              </PublicRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/empresa/:nit" element={
            <ProtectedRoute>
              <InventoryPage />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;