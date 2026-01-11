import api from './api';

export interface Producto {
  id?: number;
  codigo: string;
  nombre: string;
  caracteristicas: string;
  empresa: string; // Es el NIT de la empresa
  precios: Record<string, number>; // JSON { "USD": 100, "COP": 5000 }
}

export const getProductos = async (): Promise<Producto[]> => {
  const response = await api.get<Producto[]>('productos/');
  return response.data;
};

export const createProducto = async (data: Producto): Promise<Producto> => {
  const response = await api.post<Producto>('productos/', data);
  return response.data;
};

// Llama al endpoint de IA
export const generarDescripcionIA = async (nombre: string): Promise<string> => {
  const response = await api.post<{ descripcion: string }>('productos/generar_descripcion/', {
    nombre: nombre,
    caracteristicas: 'Genera una descripción comercial atractiva'
  });
  return response.data.descripcion;
};

// Descarga el PDF
export const downloadPDF = () => {
  // Al ser descarga de archivo, es mejor abrirlo directo en nueva pestaña
  window.open('http://127.0.0.1:8000/api/productos/descargar_reporte/', '_blank');
};