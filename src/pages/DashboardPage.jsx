// src/pages/DashboardPage.jsx
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  // 1. Desestructura 'token' junto con 'user' y 'logout' desde el hook useAuth
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); 
  };

  // Si por alguna razón el token no está disponible, no mostramos nada
  if (!user || !token) {
    return <p>Cargando datos del usuario...</p>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>¡Bienvenido, {user.name}!</h1>
      <p>Has iniciado sesión correctamente y tu token ha sido generado.</p>
      <p>Email: {user.email}</p>
      
      <hr />

      {/* 2. Muestra el token en la página */}
      <h3>Tu Token de Autenticación:</h3>
      <p>Este token ahora se envía automáticamente en cada petición a la API.</p>
      <pre 
        style={{ 
          backgroundColor: '#f0f0f0', 
          padding: '15px', 
          borderRadius: '5px', 
          wordWrap: 'break-word', // Para que el token no se salga del contenedor
          whiteSpace: 'pre-wrap'  // Permite que el texto largo se ajuste
        }}
      >
        {token}
      </pre>

      <button onClick={handleLogout} style={{ marginTop: '20px' }}>Cerrar Sesión</button>
    </div>
  );
};

export default DashboardPage;