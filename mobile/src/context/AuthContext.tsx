import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setSessionExpiredHandler } from '../api/client';
import {
  getToken,
  storeToken,
  removeToken,
  getUser,
  storeUser,
  removeUser,
} from '../storage/secureStore';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionExpiredMessage: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (fullName: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  clearSessionExpiredMessage: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState<string | null>(null);

  // Configure expired session listener
  useEffect(() => {
    setSessionExpiredHandler((message: string) => {
      setUser(null);
      setToken(null);
      setSessionExpiredMessage(message);
    });
  }, []);

  // Restore session from Android Keystore / iOS Keychain
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const storedToken = await getToken();
        const storedUser = await getUser();

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);

          // Silently verify with /api/auth/me
          try {
            const res = await api.get('/auth/me');
            if (res.data.success && res.data.user) {
              setUser(res.data.user);
              await storeUser(res.data.user);
            }
          } catch (err: any) {
            // Handled by response interceptor
          }
        }
      } catch (e) {
        console.error('Failed to restore secure auth session:', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token: receivedToken, user: receivedUser } = res.data;
        await storeToken(receivedToken);
        await storeUser(receivedUser);
        setToken(receivedToken);
        setUser(receivedUser);
        setSessionExpiredMessage(null);
        return { success: true };
      }
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (err: any) {
      if (err.isNetworkError) {
        return { success: false, message: err.userFriendlyMessage };
      }
      const message = err.response?.data?.message || 'Invalid email or password';
      return { success: false, message };
    }
  };

  const register = async (fullName: string, email: string, password: string) => {
    try {
      const res = await api.post('/auth/register', { fullName, email, password });
      if (res.data.success) {
        const { token: receivedToken, user: receivedUser } = res.data;
        await storeToken(receivedToken);
        await storeUser(receivedUser);
        setToken(receivedToken);
        setUser(receivedUser);
        setSessionExpiredMessage(null);
        return { success: true };
      }
      return { success: false, message: res.data.message || 'Registration failed' };
    } catch (err: any) {
      if (err.isNetworkError) {
        return { success: false, message: err.userFriendlyMessage };
      }
      const message = err.response?.data?.message || 'Registration failed';
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout').catch(() => {});
      }
    } finally {
      await removeToken();
      await removeUser();
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        sessionExpiredMessage,
        login,
        register,
        logout,
        clearSessionExpiredMessage: () => setSessionExpiredMessage(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
