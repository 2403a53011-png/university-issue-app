import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('uni_auth_token');
    const savedUser = localStorage.getItem('uni_auth_user');

    if (savedToken && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        // Verify token with backend
        api.get('/auth/me')
          .then(data => {
            if (data.user) {
              setUser(data.user);
              localStorage.setItem('uni_auth_user', JSON.stringify(data.user));
            }
          })
          .catch(() => {
            // Handled by 401 interceptor
          })
          .finally(() => setLoading(false));
      } catch (e) {
        localStorage.removeItem('uni_auth_token');
        localStorage.removeItem('uni_auth_user');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }

    const handleAuthLogout = () => {
      setUser(null);
    };

    window.addEventListener('auth-logout', handleAuthLogout);
    return () => window.removeEventListener('auth-logout', handleAuthLogout);
  }, []);

  const login = async (username, password, expectedRole) => {
    const data = await api.post('/auth/login', { username, password, expectedRole });
    localStorage.setItem('uni_auth_token', data.token);
    localStorage.setItem('uni_auth_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const quickLogin = async (username, password, expectedRole) => {
    return login(username, password, expectedRole);
  };

  const logout = () => {
    localStorage.removeItem('uni_auth_token');
    localStorage.removeItem('uni_auth_user');
    setUser(null);
  };

  const updateProfile = async (formData) => {
    const data = await api.put('/auth/profile', formData);
    if (data.user) {
      setUser(data.user);
      localStorage.setItem('uni_auth_user', JSON.stringify(data.user));
    }
    return data.user;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, quickLogin, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
