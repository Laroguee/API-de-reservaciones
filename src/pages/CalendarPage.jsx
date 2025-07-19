// src/pages/CalendarPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/CalendarPage.css';
import { FaFilter, FaPlus, FaSearch, FaTimes } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { createBooking } from '../services/BookingService';
import { getAccommodations } from '../services/AccommodationService';
import apiClient from '../services/api';

// Configuración de moment y localización
moment.locale('es');
const localizer = momentLocalizer(moment);

const CalendarPage = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [guestSearch, setGuestSearch] = useState('');
  const [accommodationFilter, setAccommodationFilter] = useState('Todos los alojamientos');
  const [statusFilter, setStatusFilter] = useState('Todos los estados');
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [accommodations, setAccommodations] = useState([]);
  const [newReservation, setNewReservation] = useState({
    guestName: '',
    startDate: '',
    endDate: '',
    accommodationId: id || ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Función para obtener reservas desde la API
  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/reservations/accommodation/${id}`);
      
      // Transformar los datos de la API al formato requerido
      const transformedEvents = response.data.map(reservation => ({
        id: reservation.id,
        title: `${reservation.guestName}\n${reservation.accommodationName}`,
        start: new Date(reservation.startDate),
        end: new Date(reservation.endDate),
        status: reservation.status,
        guestName: reservation.guestName,
        accommodationName: reservation.accommodationName,
        startDate: reservation.startDate,
        endDate: reservation.endDate
      }));
      
      setEvents(transformedEvents);
      setError(null);
    } catch (err) {
      setError('Error al cargar las reservas');
      console.error('Error fetching reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Obtener todos los alojamientos disponibles
  const fetchAllAccommodations = async () => {
    try {
      const data = await getAccommodations();
      setAccommodations(data);
    } catch (err) {
      console.error('Error al cargar alojamientos:', err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchReservations();
    }
    fetchAllAccommodations();
  }, [id]);

  // Filtrar eventos según los filtros seleccionados
  const filteredEvents = events.filter(event => {
    // Filtro por nombre de huésped
    if (guestSearch && !event.guestName.toLowerCase().includes(guestSearch.toLowerCase())) {
      return false;
    }
    
    // Filtro por alojamiento
    if (accommodationFilter !== 'Todos los alojamientos' && 
        event.accommodationName !== accommodationFilter) {
      return false;
    }
    
    // Filtro por estado
    if (statusFilter !== 'Todos los estados' && 
        event.status !== statusFilter.toUpperCase()) {
      return false;
    }
    
    return true;
  });

  // Estilizar eventos según su estado
  const eventStyleGetter = (event) => {
    let backgroundColor = '';
    switch (event.status) {
      case 'PENDING':
        backgroundColor = '#FFF3CD'; // Amarillo pastel para pendiente
        break;
      case 'CONFIRMED':
        backgroundColor = '#D1ECF1'; // Azul claro para confirmada
        break;
      case 'CANCELLED':
        backgroundColor = '#F8D7DA'; // Rojo claro para cancelada
        break;
      default:
        backgroundColor = '#E2E3E5'; // Gris por defecto
    }
    
    const style = {
      backgroundColor,
      borderRadius: '6px',
      color: '#333',
      border: 'none',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '5px 8px',
      fontSize: '0.85rem',
      lineHeight: '1.3',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    };
    return {
      style,
    };
  };

  // Manejar clic en evento
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowPopup(true);
  };

  // Formatear fecha en español
  const formatDate = (dateString) => {
    return moment(dateString).format('LL');
  };

  // Obtener lista única de alojamientos para el filtro
  const getUniqueAccommodations = () => {
    const accommodationNames = events.map(event => event.accommodationName);
    return ['Todos los alojamientos', ...new Set(accommodationNames)];
  };

  // Obtener mes y año actual para el encabezado
  const currentDate = moment();
  const monthYear = currentDate.format('MMMM YYYY').toUpperCase();

  // Manejar cambios en el formulario de reserva
  const handleReservationChange = (e) => {
    const { name, value } = e.target;
    setNewReservation({
      ...newReservation,
      [name]: value
    });
    
    // Limpiar errores al cambiar
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  // Validar formulario
  const validateForm = () => {
    const errors = {};
    
    if (!newReservation.guestName.trim()) {
      errors.guestName = 'El nombre del huésped es obligatorio';
    }
    
    if (!newReservation.startDate) {
      errors.startDate = 'La fecha de inicio es obligatoria';
    } else if (moment(newReservation.startDate).isBefore(moment(), 'day')) {
      errors.startDate = 'La fecha no puede ser en el pasado';
    }
    
    if (!newReservation.endDate) {
      errors.endDate = 'La fecha de fin es obligatoria';
    } else if (moment(newReservation.endDate).isBefore(newReservation.startDate)) {
      errors.endDate = 'La fecha de fin debe ser posterior a la de inicio';
    }
    
    if (!newReservation.accommodationId) {
      errors.accommodationId = 'Debe seleccionar un alojamiento';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Crear nueva reserva
  const handleCreateReservation = async () => {
    if (!validateForm()) return;
    
    try {
      const payload = {
        guestName: newReservation.guestName,
        startDate: moment(newReservation.startDate).format('YYYY-MM-DD'),
        endDate: moment(newReservation.endDate).format('YYYY-MM-DD'),
        accommodationId: newReservation.accommodationId
      };
      
      await createBooking(payload);
      
      // Cerrar modal, recargar reservas y resetear formulario
      setShowReservationModal(false);
      setNewReservation({
        guestName: '',
        startDate: '',
        endDate: '',
        accommodationId: id || ''
      });
      fetchReservations();
      
      // Mostrar mensaje de éxito
      setError(null);
      
    } catch (err) {
      console.error('Error al crear la reserva:', err);
      setError('Error al crear la reserva: ' + (err.response?.data?.message || 'Intente nuevamente'));
    }
  };

  return (
    <div className="calendar-page">
      <div className="calendar-header">
        <h1>{monthYear}</h1>
        
        <div className="filters-container">
          <div className="filter-group">
            <h3>Alojamiento</h3>
            <div className="filter-select">
              <select 
                value={accommodationFilter} 
                onChange={(e) => setAccommodationFilter(e.target.value)}
              >
                {getUniqueAccommodations().map(acc => (
                  <option key={acc} value={acc}>{acc}</option>
                ))}
              </select>
              <FaFilter className="filter-icon" />
            </div>
          </div>
          
          <div className="filter-group">
            <h3>Estado</h3>
            <div className="filter-select">
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="Todos los estados">Todos los estados</option>
                <option value="CONFIRMED">Confirmada</option>
                <option value="PENDING">Pendiente</option>
                <option value="CANCELLED">Cancelada</option>
              </select>
              <FaFilter className="filter-icon" />
            </div>
          </div>
          
          <div className="filter-group search-group">
            <h3>Buscar huésped</h3>
            <div className="search-input">
              <FaSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Nombre del huésped..." 
                value={guestSearch}
                onChange={(e) => setGuestSearch(e.target.value)}
              />
            </div>
          </div>
          
          <button 
            className="new-reservation-btn"
            onClick={() => setShowReservationModal(true)}
          >
            <FaPlus /> Nueva Reservación
          </button>
        </div>
      </div>
      
      {/* Leyenda de estados */}
      <div className="legend-container">
        <div className="legend-item">
          <div className="legend-color confirmed"></div>
          <span>Confirmada</span>
        </div>
        <div className="legend-item">
          <div className="legend-color pending"></div>
          <span>Pendiente</span>
        </div>
        <div className="legend-item">
          <div className="legend-color cancelled"></div>
          <span>Cancelada</span>
        </div>
      </div>
      
      <div className="calendar-container">
        {loading && <p className="loading-message">Cargando calendario...</p>}
        {error && <p className="error-message">{error}</p>}
        
        <Calendar
          localizer={localizer}
          events={filteredEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          eventPropGetter={eventStyleGetter}
          messages={{
            next: "Sig",
            previous: "Ant",
            today: "Hoy",
            month: "Mes",
            week: "Semana",
            day: "Día",
            agenda: "Agenda"
          }}
          onSelectEvent={handleSelectEvent}
          components={{
            event: ({ event }) => (
              <div className="custom-event">
                <div className="event-guest">{event.guestName}</div>
                <div className="event-accommodation">{event.accommodationName}</div>
              </div>
            )
          }}
        />
      </div>
      
      {/* Popup para detalles de reserva */}
      {showPopup && selectedEvent && (
        <div className="event-popup">
          <div className="popup-content">
            <button className="close-btn" onClick={() => setShowPopup(false)}>×</button>
            <h3>Detalles de Reserva</h3>
            <p><strong>Huésped:</strong> {selectedEvent.guestName}</p>
            <p><strong>Alojamiento:</strong> {selectedEvent.accommodationName}</p>
            <p><strong>Estado:</strong> 
              <span className={`status-badge ${selectedEvent.status.toLowerCase()}`}>
                {selectedEvent.status === 'PENDING' ? 'Pendiente' : 
                 selectedEvent.status === 'CONFIRMED' ? 'Confirmada' : 'Cancelada'}
              </span>
            </p>
            <p><strong>Desde:</strong> {formatDate(selectedEvent.startDate)}</p>
            <p><strong>Hasta:</strong> {formatDate(selectedEvent.endDate)}</p>
          </div>
        </div>
      )}
      
      {/* Modal para nueva reservación */}
      {showReservationModal && (
        <div className="reservation-modal">
          <div className="modal-content">
            <button className="close-btn" onClick={() => setShowReservationModal(false)}>
              <FaTimes />
            </button>
            <h2>Nueva Reservación</h2>
            
            <div className="form-group">
              <label>Alojamiento</label>
              <select
                name="accommodationId"
                value={newReservation.accommodationId}
                onChange={handleReservationChange}
                className={formErrors.accommodationId ? 'error' : ''}
              >
                <option value="">Seleccionar alojamiento</option>
                {accommodations.map(accommodation => (
                  <option key={accommodation.id} value={accommodation.id}>
                    {accommodation.name}
                  </option>
                ))}
              </select>
              {formErrors.accommodationId && (
                <div className="error-message">{formErrors.accommodationId}</div>
              )}
            </div>
            
            <div className="form-group">
              <label>Huésped</label>
              <input
                type="text"
                name="guestName"
                value={newReservation.guestName}
                onChange={handleReservationChange}
                placeholder="Nombre del huésped"
                className={formErrors.guestName ? 'error' : ''}
              />
              {formErrors.guestName && <div className="error-message">{formErrors.guestName}</div>}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Fecha de inicio</label>
                <input
                  type="date"
                  name="startDate"
                  value={newReservation.startDate}
                  onChange={handleReservationChange}
                  className={formErrors.startDate ? 'error' : ''}
                />
                {formErrors.startDate && <div className="error-message">{formErrors.startDate}</div>}
              </div>
              
              <div className="form-group">
                <label>Fecha de fin</label>
                <input
                  type="date"
                  name="endDate"
                  value={newReservation.endDate}
                  onChange={handleReservationChange}
                  className={formErrors.endDate ? 'error' : ''}
                />
                {formErrors.endDate && <div className="error-message">{formErrors.endDate}</div>}
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowReservationModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="save-btn"
                onClick={handleCreateReservation}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;