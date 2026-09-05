import { API_BASE_URL } from '../config/api';

const TOKEN_KEY = 'auth_token';

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {

    if (response.status === 401) {
      console.warn(`API 401 Unauthorized for ${endpoint}`);
      return [] as T; 
    }
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  const resultData = data?.Result ?? data?.result;

  if (data && typeof data === 'object' && ('Result' in data || 'result' in data)) {
    if (data.success === false) {
      throw new Error(data.message || 'API request failed');
    }
    return resultData as T;
  }

  return data as T;
}

export const api = {
  get: <T>(endpoint: string): Promise<T> => 
    apiRequest<T>(endpoint, { method: 'GET' }),
  
  post: <T>(endpoint: string, data: unknown): Promise<T> => 
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  put: <T>(endpoint: string, data: unknown): Promise<T> => 
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: <T>(endpoint: string): Promise<T> => 
    apiRequest<T>(endpoint, { method: 'DELETE' }),
  
  patch: <T>(endpoint: string, data: unknown): Promise<T> => 
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};