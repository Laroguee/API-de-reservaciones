import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AccommodationsPage from './pages/AccommodationsPage';
import CalendarPage from './pages/CalendarPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { AccommodationProvider } from './context/AccommodationContext';
import 'sweetalert2/dist/sweetalert2.min.css';

function App() {
  return (
    <AuthProvider>
      <AccommodationProvider>
        <BrowserRouter>
          <Routes>
            {/* Ruta pública de Login */}
            <Route path="/" element={<LoginPage />} />

            {/* Rutas Protegidas */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/accommodations" element={<AccommodationsPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              
              {/* Redirigir cualquier ruta no coincidente a /dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AccommodationProvider>
    </AuthProvider>
  );
}

export default App;