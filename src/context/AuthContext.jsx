import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminAuthApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => adminAuthApi.getCurrentAdmin());
  const [token, setToken] = useState(() => localStorage.getItem('admin_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('admin_token');
      if (!storedToken) {
        setAdmin(null);
        setToken(null);
        setIsLoading(false);
        return;
      }

      try {
        const res = await adminAuthApi.getProfile();
        if (res.success && res.admin) {
          setAdmin(res.admin);
          setToken(storedToken);
          localStorage.setItem('admin_user', JSON.stringify(res.admin));
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Session verification failed:', err.message);
        // Only clear if 401 unauthorized
        if (err.message && (err.message.includes('401') || err.message.includes('token') || err.message.includes('authorized'))) {
          logout();
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const login = async (email, password) => {
    const res = await adminAuthApi.login(email, password);
    if (res.token && res.admin) {
      setToken(res.token);
      setAdmin(res.admin);
    }
    return res;
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    adminAuthApi.logout();
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        isAuthenticated: !!token && !!admin,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      admin: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      login: async () => {},
      logout: () => {},
    };
  }
  return context;
}

