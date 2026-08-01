import axios from 'axios';
import type { User } from './types';

const SHOP_STORAGE_KEY = 'fruit-market-shop';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? (import.meta.env.PROD ? '/api' : 'http://localhost:8000/api'),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const shopIdValue = localStorage.getItem(SHOP_STORAGE_KEY);
  const shopId = shopIdValue ? Number(shopIdValue) : null;

  if (shopId && !Number.isNaN(shopId)) {
    if (config.method === 'get' || config.method === 'delete') {
      config.params = {
        ...config.params,
        shop_id: shopId,
      };
    } else if (config.data && typeof config.data === 'object' && !(config.data instanceof FormData)) {
      config.data = {
        ...config.data,
        shop_id: shopId,
      };
    }
  }

  return config;
});

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export async function loginRequest(email: string, password: string) {
  return api.post<{ user: User; token: string }>('/login', {
    email,
    password,
  });
}

export default api;
