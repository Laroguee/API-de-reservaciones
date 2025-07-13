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

// Configuración de localización
const locales = {
  'es': es
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

// Eventos de ejemplo
const events = [
  {
    id: 1,
    title: 'Reserva #1',
    start: new Date(2025, 6, 15, 10, 0),
    end: new Date(2025, 6, 17, 14, 0),
    status: 'confirmada'
  },
  {
    id: 2,
    title: 'Reserva #2',
    start: new Date(2025, 6, 20, 15, 0),
    end: new Date(2025, 6, 22, 11, 0),
    status: 'pendiente'
  },
];

const CalendarPage = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: ''
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const eventStyleGetter = (event) => {
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

  const handleNavigate = useCallback((newDate) => setDate(newDate), []);
  const handleView = useCallback((newView) => setView(newView), []);

  return (
    <div className="calendar-page">
      <div className="page-header">
        <div>
          <h1>Calendario de Reservaciones</h1>
          <div className="calendar-filters">
            <div className="form-group">
              <label>Desde:</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="form-input"
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
              />
            </div>
            <button className="filter-button">
              Filtrar
            </button>
          </div>
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="back-button"
        >
          Volver al Dashboard
        </button>
      </div>

      <div className="calendar-container">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          date={date}
          onNavigate={handleNavigate}
          view={view}
          onView={handleView}
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
          eventPropGetter={eventStyleGetter}
          popup
          selectable
          resizable
          defaultView="month"
          views={['month', 'week', 'day', 'agenda']}
          culture="es"
        />
      </div>
    </div>
  );
};

export default CalendarPage;
