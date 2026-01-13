import { AxiosError } from 'axios';

interface DjangoErrorResponse {
  detail?: string;
  [key: string]: string | string[] | undefined;
}

export const getErrorMessage = (error: unknown): string => {
  if (!(error instanceof AxiosError) || !error.response) {
    return "No se pudo establecer conexión con el servidor. Verifique su red.";
  }

  const status = error.response.status;
  const data = error.response.data as DjangoErrorResponse;

  // 1. Errores de Servidor o Autenticación Crítica
  if (status >= 500) return "Error interno del sistema (500). Por favor contacte a soporte técnico.";
  if (status === 401) return "Su sesión ha expirado. Por favor inicie sesión nuevamente.";
  if (status === 403) return "No tiene permisos suficientes para realizar esta acción.";

  // 2. Errores de Validación de Django (400 Bad Request)
  if (data) {
    // Caso: Error genérico de DRF (ej: excepciones manuales)
    if (data.detail) {
      return data.detail;
    }

    const fieldKeys = Object.keys(data);
    if (fieldKeys.length > 0) {
      const fieldName = fieldKeys[0];
      const errorContent = data[fieldName];

      const fieldLabels: Record<string, string> = {
        nit: 'NIT',
        nombre: 'Nombre',
        codigo: 'Código',
        telefono: 'Teléfono',
        precio: 'Precio',
        non_field_errors: 'Validación'
      };

      const label = fieldLabels[fieldName] || fieldName.toUpperCase();
      
      if (Array.isArray(errorContent)) {
        return `${label}: ${errorContent[0]}`;
      }
      if (typeof errorContent === 'string') {
        return `${label}: ${errorContent}`;
      }
    }
  }

  return "La solicitud no pudo procesarse debido a un error desconocido.";
};