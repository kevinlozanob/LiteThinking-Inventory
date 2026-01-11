import api from './api';

export interface Producto {
  id?: number;
  codigo: string;
  nombre: string;
  caracteristicas: string;
  empresa: string;
  precios: Record<string, number>;
}

export const getProductos = async (): Promise<Producto[]> => {
  const response = await api.get<Producto[]>('productos/');
  return response.data;
};

export const createProducto = async (data: Producto): Promise<Producto> => {
  const response = await api.post<Producto>('productos/', data);
  return response.data;
};

export const generarDescripcionIA = async (nombre: string): Promise<string> => {
  const response = await api.post<{ descripcion: string }>('productos/generar_descripcion/', {
    nombre: nombre,
    caracteristicas: 'Genera una descripción comercial atractiva'
  });
  return response.data.descripcion;
};

export const downloadPDF = async () => {
  try {
    const response = await api.get('productos/descargar_reporte/', {
      responseType: 'blob', 
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'inventario_reporte.pdf'); // Nombre del archivo
    
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error("Error descargando PDF", error);
    alert("No se pudo descargar el PDF. Revisa permisos o conexión.");
  }
};