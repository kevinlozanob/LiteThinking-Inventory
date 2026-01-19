import { Link } from "react-router-dom";
import { AlertTriangle, Home } from "lucide-react";
import { SEO } from "../components/atoms/SEO";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <SEO
        title="Página no encontrada"
        description="Error 404 - La página que buscas no existe."
      />

      <div className="text-center max-w-lg">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center animate-bounce">
            <AlertTriangle size={48} className="text-[#E6C200]" />
          </div>
        </div>

        <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          ¡Ups! Te perdiste en el inventario.
        </h2>
        <p className="text-gray-600 mb-8">
          Estás perdido. No pasa nada, vuelve al inicio.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 bg-[#E6C200] hover:bg-[#D4B200] text-black font-bold py-3 px-8 rounded-lg transition-all shadow-md hover:shadow-lg h-[48px]"
        >
          <Home size={20} />
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
