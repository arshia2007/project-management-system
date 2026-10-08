import axios from 'axios';
import { Platform } from 'react-native';
import { getToken, removeToken, removeUser } from '../storage/secureStore';

// Default backend API URL:
// - Android Emulator: 10.0.2.2 connects to host PC localhost:5000
// - iOS Simulator / Physical LAN: Change to your host machine's IP (e.g. 192.168.1.X)
export const DEFAULT_API_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

let currentBaseUrl = DEFAULT_API_URL;
let onSessionExpiredCallback: ((message: string) => void) | null = null;

export const setBaseUrl = (url: string) => {
  currentBaseUrl = url;
  api.defaults.baseURL = url;
};

export const getBaseUrl = () => currentBaseUrl;

export const setSessionExpiredHandler = (callback: (message: string) => void) => {
  onSessionExpiredCallback = callback;
};

export const api = axios.create({
  baseURL: currentBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token from Android Keystore / iOS Keychain
api.interceptors.request.use(
  async (config) => {
    config.baseURL = currentBaseUrl;
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiry and network errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Expired or invalid JWT handling
    if (error.response && error.response.status === 401) {
      const code = error.response.data?.code;
      const isExpired =
        code === 'TOKEN_EXPIRED' ||
        error.response.data?.message?.toLowerCase().includes('expired');

      await removeToken();
      await removeUser();

      if (onSessionExpiredCallback) {
        onSessionExpiredCallback(
          isExpired
            ? 'Your session has expired. Please log in again.'
            : 'Session invalid. Please log in.'
        );
      }
    }

    // Network error handling (no network connection, server down, DNS error)
    if (!error.response || error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      error.isNetworkError = true;
      error.userFriendlyMessage =
        'No network connection or backend server is unreachable. Please ensure you are connected to the network.';
    }

    return Promise.reject(error);
  }
);
