// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import '../App.css'; 

const LoginPage = () => {
  // CORRECCIÓN: Pre-llenamos el formulario con credenciales válidas para la prueba
  const [email, setEmail] = useState('abner95@example.com');
  const [password, setPassword] = useState('$2y$12$uYSt7J5Zwqho9cUpTkWCW.I4OVojaUjwxHMBZs4DBc48xvH.6Rnxa');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard'); // Si el login es exitoso, te llevará aquí
    } catch (err) {
      // Este mensaje ahora será más preciso para el usuario
      setError('Email o contraseña incorrectos. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">➔ Iniciar Sesión</h2>
        <p className="login-subtitle">
          <i className="info-icon">ⓘ</i> Ingresa tus credenciales para acceder al sistema
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input 
              type="email" 
              id="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              required 
            />
          </div>
          
          <div className="input-group">
            <div className="password-label">
              <label htmlFor="password">Contraseña</label>
              <a href="#" className="forgot-password">¿Olvidaste tu contraseña?</a>
            </div>
            <input 
              type="password" 
              id="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="•••••"
              required 
            />
          </div>
          
          <div className="options">
            <input type="checkbox" id="remember" />
            <label htmlFor="remember">Mantener sesión iniciada</label>
          </div>

          {error && <p className="error-message">{error}</p>}
          
          <button type="submit" className="login-button">➔ Iniciar Sesión</button>
        </form>

        <p className="support-text">¿Necesitas ayuda? <a href="#">Contacta soporte</a></p>
      </div>
      <p className="footer-text">Este es un sistema seguro. Tus datos están protegidos.</p>
    </div>
  );
};

export default LoginPage;