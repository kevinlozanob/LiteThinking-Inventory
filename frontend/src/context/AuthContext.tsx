import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  userEmail: string | null;
  login: (token: string, isAdminRole: boolean, email: string) => void; //
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedIsAdmin = localStorage.getItem('is_admin') === 'true'; 
    const storedEmail = localStorage.getItem('user_email');
    
    if (token) {
      setIsAuthenticated(true);
      setIsAdmin(storedIsAdmin);
      setUserEmail(storedEmail);
    }
    setIsLoading(false);
  }, []);

  const login = (token: string, isAdminRole: boolean, email: string) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('is_admin', String(isAdminRole));
    localStorage.setItem('user_email', email);
    
    setIsAuthenticated(true);
    setIsAdmin(isAdminRole);
    setUserEmail(email);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('is_admin');
    localStorage.removeItem('user_email');
    
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUserEmail(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, userEmail, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
};