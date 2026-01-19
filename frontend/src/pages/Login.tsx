import { useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AuthTemplate } from '../components/templates/AuthTemplate';
import { LoginForm } from '../components/organisms/LoginForm';
import { SocialLogin } from '../components/organisms/SocialLogin';
import { useToast } from '../context/ToastContext';
import { SEO } from '../components/atoms/SEO';

export default function Login() {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const toastShown = useRef(false);

  useEffect(() => {
    if (searchParams.get('expired') === 'true' && !toastShown.current) {
        showToast(
            "Por seguridad, tu sesión ha cerrado automáticamente.", 
            "info", 
            "Sesión Expirada"
        );
        toastShown.current = true;
        window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return (
    <AuthTemplate>
      <SEO 
        title="Iniciar Sesión" 
        description="Ingresa a tu cuenta de Lite Thinking para gestionar tus proyectos y acceder a la plataforma de forma segura."
      />
      
      <h1 className="mb-4 sm:mb-6 text-center text-lg sm:text-xl font-bold text-white">
        Bienvenido de nuevo
      </h1>

      <LoginForm />
      <div className="mt-4 text-center">
        <button 
            type="button" 
            className="text-xs sm:text-sm font-semibold text-white hover:underline hover:text-[#E6C200] bg-transparent border-none cursor-pointer inline-block w-full py-3"
            onClick={() => showToast("Funcionalidad en desarrollo", "info")}
        >
          Crea tu nueva contraseña ahora
        </button>
      </div>
      <div className="mt-2 text-center text-xs sm:text-sm text-white">
        ¿Aún no tienes tu cuenta Lite Thinking?
        <br />
        <Link 
            to="/register" 
            className="font-bold hover:text-[#E6C200] underline inline-block w-full py-3"
        >
          Crea tu cuenta
        </Link>
      </div>

      <div className="mt-2 mb-4 text-center text-xs sm:text-sm text-gray-300">
        O inicia sesión usando:
      </div>

      <SocialLogin />
    </AuthTemplate>
  );
}