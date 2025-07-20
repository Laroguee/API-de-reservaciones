// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
// CORRECCIÓN: Apunta a LoginServices.js y no usa llaves
import LoginService from '../services/LoginServices.js'; 

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    // Esta llamada usará la función importada
    const data = await LoginService.login(email, password);
    setUser(data.user);
    setToken(data.token);
  };

  const logout = () => {
    LoginService.logout();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};