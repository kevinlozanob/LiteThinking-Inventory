import { useEffect, useRef} from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthTemplate } from '../components/templates/AuthTemplate';
import { LoginForm } from '../components/organisms/LoginForm';
import { SocialLogin } from '../components/organisms/SocialLogin';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const toastShown = useRef(false);


  useEffect(() => {
    if (searchParams.get('expired') === 'true' && !toastShown.current) {
        showToast("Tu sesión ha caducado. Por favor inicia sesión nuevamente.", "info");
        toastShown.current = true;
        
        window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return (
    <AuthTemplate>
      <h2 className="mb-4 sm:mb-6 text-center text-lg sm:text-xl font-bold text-white">
        Bienvenido de nuevo
      </h2>

      <LoginForm />

      <div className="mt-3 sm:mt-4 text-center">
        <a href="#" className="text-xs sm:text-sm font-semibold text-white hover:underline hover:text-[#E6C200]">
          Crea tu nueva contraseña ahora
        </a>
      </div>

      <div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-white">
        ¿Aún no tienes tu cuenta Lite Thinking?
        <br />
        <a href="/register" className="font-bold hover:text-[#E6C200] underline">
          Crea tu cuenta
        </a>
      </div>

      <div className="mt-4 sm:mt-6 mb-3 sm:mb-4 text-center text-xs sm:text-sm text-gray-300">
        O inicia sesión usando:
      </div>

      <SocialLogin />
    </AuthTemplate>
  );
}