import { AuthTemplate } from '../components/templates/AuthTemplate';
import { RegisterForm } from '../components/organisms/RegisterForm';
import { Link } from 'react-router-dom';

export default function Register() {
  return (
    <AuthTemplate>
      <h2 className="mb-4 sm:mb-6 text-center text-lg sm:text-xl font-bold text-white">
        Crea tu cuenta
      </h2>

      <RegisterForm />

      <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-300">
        ¿Ya tienes cuenta?
        <br />
        <Link to="/login" className="font-bold hover:text-[#E6C200] underline ml-1">
          Inicia sesión aquí
        </Link>
      </div>
    </AuthTemplate>
  );
}