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

export const downloadPDF = async (nit?: string) => {

  const response = await api.get('productos/descargar_reporte/', {
    responseType: 'blob', 
    params: { empresa: nit } 
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'inventario_reporte.pdf'); 
  
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const sendEmailReport = async (email: string, nit?: string) => {
  const response = await api.post('productos/enviar_reporte_email/', {
    email: email,
    nit: nit
  });
  return response.data;
};

export const deleteProducto = async (id: number): Promise<void> => {
  await api.delete(`productos/${id}/`);
};
export const updateProducto = async (id: number, data: Partial<Producto>): Promise<Producto> => {
  const payload = { ...data };

  if (!payload.precios || Object.keys(payload.precios).length === 0) {
      delete payload.precios;
  }

  const response = await api.patch<Producto>(`productos/${id}/`, payload);
  return response.data;
};