import React, { useState } from 'react';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { PasswordField } from '../molecules/PasswordField';
import { login as LoginService } from '../../services/authService'; 
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const { login } = useAuth(); 
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await LoginService(email, password);
      login(data.access, data.is_admin, data.email);
      showToast(
        "Has ingresado correctamente al sistema.", 
        "success", 
        `¡Bienvenido, ${data.email.split('@')[0]}!`
      ); 
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Error login:", err);
      if (err.response?.status === 401) {
        // Feedback de Error Específico
        showToast(
          "El correo o la contraseña no coinciden.",
          "error",
          "Credenciales Incorrectas"
        );
      } else {
        // Feedback de Error de Red
        showToast(
          "No pudimos conectar con el servidor. Revisa tu internet.",
          "warning",
          "Error de Conexión"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 sm:gap-3">
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-100 text-xs p-2 sm:p-2.5 rounded text-center">
          {error}
        </div>
      )}

      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Correo electrónico"
        required
        className="h-[42px] sm:h-[46px] text-sm"
      />
      
      <PasswordField 
        value={password} 
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
        required
        className="h-[42px] sm:h-[46px] text-sm"
      />

      <Button type="submit" variant="primary" disabled={loading} className="mt-1.5 sm:mt-2 h-[42px] sm:h-[46px]">
        {loading ? "Cargando..." : "Inicia sesión"}
      </Button>
    </form>
  );
};