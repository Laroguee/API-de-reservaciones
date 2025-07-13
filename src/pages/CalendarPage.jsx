/**
 * Página de Calendario - Muestra un calendario interactivo para gestionar reservaciones
 * 
 * Características principales:
 * - Visualización mensual, semanal y diaria
 * - Soporte para arrastrar y soltar eventos
 * - Filtros por rango de fechas
 * - Localización en español
 * - Estados de reservación (confirmada/pendiente)
 */

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/CalendarPage.css';

/**
 * Configuración de localización para el calendario
 * Incluye formato de fechas y configuración regional en español
 */
const locales = {
  'es': es
};

const localizer = dateFnsLocalizer({
  format,        // Función para formatear fechas
  parse,         // Función para parsear fechas
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }), // La semana comienza en lunes
  getDay,        // Función para obtener el día de la semana
  locales,       // Configuración regional
});

/**
 * Datos de ejemplo para las reservaciones
 * En una aplicación real, estos vendrían de una API
 * Estructura requerida:
 * - id: Identificador único
 * - title: Título del evento
 * - start: Fecha/hora de inicio
 * - end: Fecha/hora de fin
 * - status: Estado de la reservación (para estilos condicionales)
 */
const events = [
  {
    id: 1,
    title: 'Reserva #1',
    start: new Date(2025, 6, 15, 10, 0), // Año, mes (0-11), día, hora, minuto
    end: new Date(2025, 6, 17, 14, 0),
    status: 'confirmada' // Estados posibles: 'confirmada', 'pendiente', etc.
  },
  {
    id: 2,
    title: 'Reserva #2',
    start: new Date(2025, 6, 20, 15, 0),
    end: new Date(2025, 6, 22, 11, 0),
    status: 'pendiente'
  },
];

/**
 * Componente principal de la página de calendario
 * Maneja el estado y la lógica de la interfaz del calendario
 */
const CalendarPage = () => {
  // Navegación entre páginas
  const navigate = useNavigate();
  
  // Estado para controlar la fecha actual mostrada en el calendario
  const [date, setDate] = useState(new Date());
  
  // Estado para controlar la vista actual (mes, semana, día, agenda)
  const [view, setView] = useState('month');
  
  // Estado para los filtros de fecha
  const [filters, setFilters] = useState({
    startDate: '', // Fecha de inicio para filtrar
    endDate: ''    // Fecha de fin para filtrar
  });

  /**
   * Maneja los cambios en los campos de filtro
   * @param {Object} e - Evento del input
   */
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Establece los estilos para los eventos en el calendario
   * basados en su estado (confirmada/pendiente)
   * @param {Object} event - Objeto del evento
   * @returns {Object} Estilos para el evento
   */
  const eventStyleGetter = (event) => {
    // Colores basados en el estado de la reservación
    const backgroundColor = event.status === 'confirmada' ? '#3182ce' : '#ecc94b';
    
    const style = {
      backgroundColor,
      borderRadius: '4px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block',
      padding: '2px 5px',
      fontSize: '0.85rem',
    };
    return { style };
  };

  // Callbacks para la navegación del calendario
  const handleNavigate = useCallback((newDate) => setDate(newDate), []);
  const handleView = useCallback((newView) => setView(newView), []);

  return (
    <div className="calendar-page">
      {/* Encabezado con título y controles */}
      <div className="page-header">
        <div>
          <h1>Calendario de Reservaciones</h1>
          
          {/* Sección de filtros */}
          <div className="calendar-filters">
            <div className="form-group">
              <label>Desde:</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="form-input"
                aria-label="Fecha de inicio para filtrar"
              />
            </div>
            <div className="form-group">
              <label>Hasta:</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="form-input"
                aria-label="Fecha de fin para filtrar"
              />
            </div>
            <button 
              className="filter-button"
              onClick={() => {
                // TODO: Implementar lógica de filtrado
                console.log('Filtrando desde:', filters.startDate, 'hasta:', filters.endDate);
              }}
            >
              Filtrar
            </button>
          </div>
        </div>
        
        {/* Botón para volver al dashboard */}
        <button 
          onClick={() => navigate(-1)}
          className="back-button"
          aria-label="Volver al panel de control"
        >
          Volver al Dashboard
        </button>
      </div>

      {/* Contenedor principal del calendario */}
      <div className="calendar-container">
        <Calendar
          localizer={localizer}          // Configuración de localización
          events={events}               // Lista de eventos a mostrar
          startAccessor="start"         // Propiedad para la fecha de inicio
          endAccessor="end"             // Propiedad para la fecha de fin
          style={{ height: '100%' }}     // Estilo para el contenedor
          date={date}                   // Fecha actual mostrada
          onNavigate={handleNavigate}    // Manejador de navegación (mes anterior/siguiente)
          view={view}                   // Vista actual (mes/semana/día/agenda)
          onView={handleView}           // Manejador para cambiar de vista
          
          // Mensajes traducidos al español
          messages={{
            next: 'Siguiente',
            previous: 'Anterior',
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día',
            agenda: 'Agenda',
            date: 'Fecha',
            time: 'Hora',
            event: 'Evento',
            noEventsInRange: 'No hay reservas en este rango de fechas.',
          }}
          
          eventPropGetter={eventStyleGetter}  // Estilos personalizados para eventos
          popup                               // Habilita detalles emergentes
          selectable                          // Permite seleccionar rangos de tiempo
          resizable                           // Permite redimensionar eventos
          defaultView="month"                 // Vista por defecto
          views={['month', 'week', 'day', 'agenda']}  // Vistas disponibles
          culture="es"                        // Configuración regional
        />
      </div>
    </div>
  );
};

export default CalendarPage;
