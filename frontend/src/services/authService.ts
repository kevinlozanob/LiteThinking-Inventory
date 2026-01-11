import api from './api';


interface LoginResponse {
  access: string;
  refresh: string;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
    
    const response = await api.post<LoginResponse>('auth/login/', { email, password });
    return response.data;
};