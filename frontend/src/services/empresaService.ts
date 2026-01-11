import api from './api';

export interface Empresa {
  nit: string;
  nombre: string;
  direccion: string;
  telefono: string;
}

export const getEmpresas = async (): Promise<Empresa[]> => {
  const response = await api.get<Empresa[]>('empresas/');
  return response.data;
};

export const createEmpresa = async (data: Empresa): Promise<Empresa> => {
  const response = await api.post<Empresa>('empresas/', data);
  return response.data;
};