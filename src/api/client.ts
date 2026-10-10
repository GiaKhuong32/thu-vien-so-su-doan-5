import { API_BASE_URL } from '../config/api';

const TOKEN_KEY = 'auth_token';
const AUTH_HEADER_PREFIX = import.meta.env.VITE_AUTH_HEADER_PREFIX ?? 'Bearer ';

type ApiRequestOptions = RequestInit & {
  auth?: boolean;
};

type ApiRequestBodyOptions = Omit<ApiRequestOptions, 'body'>;

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(TOKEN_KEY);
    return token && token !== 'undefined' && token !== 'null' ? token : null;
  }
  return null;
};

export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token.replace(/^Bearer\s+/i, '').trim());
  }
};

export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  if (!token) return {};

  const value = `${AUTH_HEADER_PREFIX}${token}`;

  return {
    Authorization: value,
  };
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { auth = true, headers: optionHeaders, ...requestOptions } = options;
  const url = `${API_BASE_URL}${endpoint}`;
  // Always send the token when the user is logged in, even on endpoints
  // flagged as public — the backend may still require authentication.
  const authHeaders = getAuthHeaders();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...authHeaders,
    ...(optionHeaders as Record<string, string>),
  };

  const response = await fetch(url, {
    ...requestOptions,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.message ||
      data?.Message ||
      `API Error: ${response.status} ${response.statusText}`;

    if (response.status === 401 && auth) {
      removeToken();
    }

    throw new Error(message);
  }

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
  get: <T>(endpoint: string, options?: ApiRequestOptions): Promise<T> =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, data: unknown, options?: ApiRequestOptions): Promise<T> =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    }),

  put: <T>(endpoint: string, data: unknown, options?: ApiRequestOptions): Promise<T> =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: <T>(endpoint: string, options?: ApiRequestOptions): Promise<T> =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),

  patch: <T>(endpoint: string, data: unknown, options?: ApiRequestOptions): Promise<T> =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  public: {
    get: <T>(endpoint: string, options?: ApiRequestOptions): Promise<T> =>
      apiRequest<T>(endpoint, { ...options, method: 'GET', auth: false }),

    post: <T>(endpoint: string, data: unknown, options?: ApiRequestBodyOptions): Promise<T> =>
      apiRequest<T>(endpoint, {
        ...options,
        method: 'POST',
        auth: false,
        body: JSON.stringify(data),
      }),
  },

  private: {
    get: <T>(endpoint: string, options?: ApiRequestOptions): Promise<T> =>
      apiRequest<T>(endpoint, { ...options, method: 'GET', auth: true }),

    post: <T>(endpoint: string, data: unknown, options?: ApiRequestBodyOptions): Promise<T> =>
      apiRequest<T>(endpoint, {
        ...options,
        method: 'POST',
        auth: true,
        body: JSON.stringify(data),
      }),

    put: <T>(endpoint: string, data: unknown, options?: ApiRequestBodyOptions): Promise<T> =>
      apiRequest<T>(endpoint, {
        ...options,
        method: 'PUT',
        auth: true,
        body: JSON.stringify(data),
      }),

    delete: <T>(endpoint: string, options?: ApiRequestOptions): Promise<T> =>
      apiRequest<T>(endpoint, { ...options, method: 'DELETE', auth: true }),
  },
};
