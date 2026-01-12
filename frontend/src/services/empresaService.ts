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

export const getEmpresaByNit = async (nit: string): Promise<Empresa> => {
  const response = await api.get<Empresa>(`empresas/${nit}/`);
  return response.data;
};

export const createEmpresa = async (data: Empresa): Promise<Empresa> => {
  const response = await api.post<Empresa>('empresas/', data);
  return response.data;
};

export const deleteEmpresa = async (nit: string): Promise<void> => {
  await api.delete(`empresas/${nit}/`);
};

export const updateEmpresa = async (nit: string, data: Partial<Empresa>): Promise<Empresa> => {
  const response = await api.patch<Empresa>(`empresas/${nit}/`, data);
  return response.data;
};