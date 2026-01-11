import React, { useState } from 'react';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { PasswordField } from '../molecules/PasswordField';
import { register } from '../../services/authService';
import { useNavigate } from 'react-router-dom';

export const RegisterForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPass) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      await register(email, password);
      alert("¡Cuenta creada correctamente! Ahora inicia sesión.");
      navigate('/login');
    } catch (err: any) {
      console.error("Error registro:", err);
      const msg = err.response?.data?.email?.[0] || "Error al registrarse. Intente nuevamente.";
      setError(msg);
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

      <PasswordField 
        value={confirmPass} 
        onChange={(e) => setConfirmPass(e.target.value)}
        placeholder="Confirmar Contraseña"
        required
      />

      <Button type="submit" variant="primary" disabled={loading} className='mt-2'>
        {loading ? "Creando cuenta..." : "Crear Cuenta"}
      </Button>
    </form>
  );
};