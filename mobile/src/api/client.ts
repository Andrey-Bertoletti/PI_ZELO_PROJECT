import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import * as Storage from '../utils/storage';

function resolveBaseUrl(): string {
  const fromExtra = (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)?.apiBaseUrl;
  if (fromExtra) return fromExtra;

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    // No web, usa o mesmo host que serve a página e troca a porta para 4000.
    return `${window.location.protocol}//${window.location.hostname}:4000/api/v1`;
  }
  if (Platform.OS === 'android') return 'http://10.0.2.2:4000/api/v1';

  // iOS simulator e fallback genérico
  return 'http://localhost:4000/api/v1';
}

export const API_BASE_URL: string = resolveBaseUrl();

const ACCESS_KEY = 'zero.access';
const REFRESH_KEY = 'zero.refresh';

export const tokenStore = {
  getAccess:  () => Storage.get(ACCESS_KEY),
  getRefresh: () => Storage.get(REFRESH_KEY),
  set: async (access: string, refresh: string) => {
    await Storage.set(ACCESS_KEY, access);
    await Storage.set(REFRESH_KEY, refresh);
  },
  clear: async () => {
    await Storage.remove(ACCESS_KEY);
    await Storage.remove(REFRESH_KEY);
  },
};

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
});

api.interceptors.request.use(async (config) => {
  const token = await tokenStore.getAccess();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing: Promise<string | null> | null = null;

async function refreshAccess(): Promise<string | null> {
  const refresh = await tokenStore.getRefresh();
  if (!refresh) return null;
  try {
    const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken: refresh });
    const { accessToken, refreshToken } = res.data;
    await tokenStore.set(accessToken, refreshToken);
    return accessToken;
  } catch {
    await tokenStore.clear();
    return null;
  }
}

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config as AxiosRequestConfig & { _retried?: boolean };
    if (error.response?.status === 401 && original && !original._retried) {
      original._retried = true;
      refreshing = refreshing ?? refreshAccess();
      const newToken = await refreshing;
      refreshing = null;
      if (newToken) {
        original.headers = { ...(original.headers ?? {}), Authorization: `Bearer ${newToken}` };
        return api.request(original);
      }
    }
    return Promise.reject(error);
  },
);
