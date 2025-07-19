// src/pages/DashboardPage.jsx
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/DashboardPage.css';

const DashboardPage = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); 
  };

  if (!user || !token) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando datos del usuario...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>¡Bienvenido, {user.name}!</h1>
          <p className="user-email">{user.email}</p>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Cerrar Sesión
        </button>
      </header>

      <div className="dashboard-content">
        <div className="dashboard-actions">
          <Link to="/accommodations" className="action-button primary">
            <i className="fas fa-hotel"></i>
            <span>Gestionar Alojamientos</span>
          </Link>
          
          <Link to="/calendar" className="action-button secondary">
            <i className="fas fa-calendar-alt"></i>
            <span>Ver Calendario de Reservas</span>
          </Link>

          <Link to="/reservaciones" className="action-button tertiary">
            <i className="fas fa-book"></i>
            <span>Ver Reservaciones</span>
          </Link>

        </div>
        
        <div className="dashboard-card">
          <h2>Bienvenido al Panel de Control</h2>
          <p>Selecciona una opción del menú para comenzar a gestionar tus alojamientos o ver el calendario de reservas.</p>
        </div>

        <div className="dashboard-card token-card">
          <h3>Token de Autenticación</h3>
          <p>Este token se envía automáticamente en cada petición a la API.</p>
          <div className="token-display">
            <code>{token}</code>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(token);
                alert('Token copiado al portapapeles');
              }}
              className="copy-button"
              title="Copiar token"
            >
              <i className="far fa-copy"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;