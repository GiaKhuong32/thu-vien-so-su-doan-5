import { api, setToken, removeToken } from './client';

export interface LoginRequest {
  username: string;
  password: string;
}


export interface LoginResponse {
  token: string;
  user?: {
    id: string;
    username: string;
    email?: string;
  };
}


export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', credentials);
  
  if (response.token) {
    setToken(response.token);
  }
  
  return response;
}


export function logout(): void {
  removeToken();
}


export function isAuthenticated(): boolean {
  if (typeof window !== 'undefined') {
    return !!localStorage.getItem('auth_token');
  }
  return false;
}
