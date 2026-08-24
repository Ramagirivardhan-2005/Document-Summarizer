import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('docu_auth_token'));
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('docu_auth_token');
      if (savedToken) {
        try {
          const res = await authService.getMe();
          setUser(res.data.user);
        } catch (error) {
          console.warn('Session expired or invalid token:', error.message);
          localStorage.removeItem('docu_auth_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authService.login({ email, password });
      const { user: loggedInUser, token: authToken } = res.data;
      localStorage.setItem('docu_auth_token', authToken);
      setToken(authToken);
      setUser(loggedInUser);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await authService.register({ name, email, password });
      const { user: registeredUser, token: authToken } = res.data;
      localStorage.setItem('docu_auth_token', authToken);
      setToken(authToken);
      setUser(registeredUser);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('docu_auth_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
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
