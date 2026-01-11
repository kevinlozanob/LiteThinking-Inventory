import { AuthTemplate } from '../components/templates/AuthTemplate';
import { LoginForm } from '../components/organisms/LoginForm';
import { SocialLogin } from '../components/organisms/SocialLogin';

export default function Login() {
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