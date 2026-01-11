import React, { useState } from 'react';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { PasswordField } from '../molecules/PasswordField';
import { register } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext'; 

export const RegisterForm = () => {
  const { showToast } = useToast(); 
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPass) {
      showToast("Las contraseñas no coinciden", 'error'); 
      return;
    }

    setLoading(true);

    try {
      await register(email, password);
      showToast("¡Cuenta creada! Inicia sesión ahora.", 'success');
      navigate('/login');
    } catch (err: any) {
      console.error("Error registro:", err);
      const msg = err.response?.data?.email?.[0] || "Error al registrarse. Intente nuevamente.";
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 sm:gap-3">
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

      <PasswordField 
        value={confirmPass} 
        onChange={(e) => setConfirmPass(e.target.value)}
        placeholder="Confirmar Contraseña"
        required
        className="h-[42px] sm:h-[46px] text-sm"
      />

      <Button type="submit" variant="primary" disabled={loading} className="mt-1.5 sm:mt-2 h-[42px] sm:h-[46px]">
        {loading ? "Creando cuenta..." : "Crear Cuenta"}
      </Button>
    </form>
  );
};