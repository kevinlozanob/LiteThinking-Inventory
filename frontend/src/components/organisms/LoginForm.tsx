import React, { useState } from 'react';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { PasswordField } from '../molecules/PasswordField';
import { login as LoginService } from '../../services/authService'; 
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth(); 
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await LoginService(email, password);
      
      // AQUI EL CAMBIO: Pasamos el token Y el estado de admin
      login(data.access, data.is_admin);
      
      navigate('/dashboard');
      
    } catch (err: any) {
      console.error("Error login:", err);

      if (err.response?.status === 401) {
        setError("Correo o contraseña incorrectos.");
      } else {
        setError("Error de conexión. Intente más tarde.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-100 text-xs p-2 rounded text-center">
          {error}
        </div>
      )}

      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Correo electrónico"
        required
      />
      
      <PasswordField 
        value={password} 
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
        required
      />

      <Button type="submit" variant="primary" disabled={loading} className='mt-2'>
        {loading ? "Cargando..." : "Inicia sesión"}
      </Button>
    </form>
  );
};