import { api, setToken, removeToken } from './client';

const VIEWER_ROLE_ID =
  import.meta.env.VITE_VIEWER_ROLE_ID ||
  'e230effe-968e-4449-9bf4-2fc240b00a94';

export interface LoginRequest {
  username: string;
  password: string;
}

interface ApiLoginRequest {
  userName: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  confirmPassword: string;
}

interface AccountRequest {
  accountName: string;
  password: string;
  userName: string;
  role: string;
}

export interface RoleResponse {
  idRole: string;
  roleName: string;
}

export interface AccountResponse {
  idAccount: string;
  accountName: string;
  password?: string;
  userName: string;
  roleEntity?: RoleResponse;
}

export interface LoginResponse {
  token: string;
  authenticated: boolean;
}

export type RegisterResponse = AccountResponse;

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  removeToken();

  const payload: ApiLoginRequest = {
    userName: credentials.username,
    password: credentials.password,
  };

  const response = await api.post<LoginResponse>('/auth/login', payload, {
    auth: false,
  });

  if (response.token) {
    setToken(response.token);
  }

  return response;
}

export async function register(credentials: RegisterRequest): Promise<RegisterResponse> {
  if (credentials.password !== credentials.confirmPassword) {
    throw new Error('Mật khẩu xác nhận không khớp');
  }

  const payload: AccountRequest = {
    accountName: credentials.username,
    userName: credentials.username,
    password: credentials.password,
    role: VIEWER_ROLE_ID,
  };

  return api.post<RegisterResponse>('/accounts', payload);
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
