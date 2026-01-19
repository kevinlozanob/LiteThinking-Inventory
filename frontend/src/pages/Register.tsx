import { AuthTemplate } from '../components/templates/AuthTemplate';
import { RegisterForm } from '../components/organisms/RegisterForm';
import { Link } from 'react-router-dom';
import { SEO } from '../components/atoms/SEO';

export default function Register() {
  return (
    <AuthTemplate>
      <SEO 
        title="Crear Cuenta" 
        description="Regístrate en Lite Thinking y empieza a controlar tu inventario de manera inteligente y eficiente."
      />

      <h1 className="mb-4 sm:mb-6 text-center text-lg sm:text-xl font-bold text-white">
        Crea tu cuenta
      </h1>

      <RegisterForm />

      <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-300">
        ¿Ya tienes cuenta?
        <br />
        
        <Link 
            to="/login" 
            className="font-bold hover:text-[#E6C200] underline inline-block w-full py-3"
        >
          Inicia sesión aquí
        </Link>
      </div>
    </AuthTemplate>
  );
}