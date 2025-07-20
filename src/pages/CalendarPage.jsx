// src/pages/CalendarPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/CalendarPage.css';
import { FaFilter, FaPlus, FaSearch, FaTimes } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { getBookings, createBooking } from '../services/bookingService';
import { getAccommodations } from '../services/accommodationService';
import Swal from 'sweetalert2';

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
  const [isSaving, setIsSaving] = useState(false);

  // Función mejorada para transformar datos de la API a eventos del calendario
  const transformApiDataToEvents = (reservations) => {
    console.log('Transformando datos de la API:', reservations);
    
    if (!Array.isArray(reservations)) {
      console.warn('Los datos no son un array:', reservations);
      return [];
    }

    const transformedEvents = reservations.map((reservation, index) => {
      try {
        // Mapear diferentes posibles nombres de campos de la API
        const id = reservation.id || reservation.reservacionId || index;
        
        // 1. SOLUCIÓN PARA EL PROBLEMA DE NOMBRES:
        // Acceso anidado a propiedades para huésped y alojamiento
        const guestName = reservation.user?.name || 
                         reservation.guest?.name || 
                         reservation.guestName || 
                         reservation.nombreHuesped || 
                         'Sin nombre';
        
        const accommodationName = reservation.accommodation?.name || 
                                 reservation.accommodation?.nombreAlojamiento ||
                                 reservation.nombreAlojamiento || 
                                 'Alojamiento desconocido';
        
        // 2. SOLUCIÓN PARA EL PROBLEMA DE FECHAS:
        // Usar campos específicos de la API (check_in_date/check_out_date)
        let startDate = reservation.check_in_date || 
                       reservation.startDate || 
                       reservation.fechaInicio;
        
        let endDate = reservation.check_out_date || 
                     reservation.endDate || 
                     reservation.fechaFin;
        
        // Convertir fechas usando moment con formato específico
        const parseDate = (dateStr) => {
          if (!dateStr) return null;
          
          // Especificar formato esperado para evitar problemas de interpretación
          const parsed = moment(dateStr, 'YYYY-MM-DD');
          
          if (!parsed.isValid()) {
            console.warn('Fecha inválida:', dateStr);
            return null;
          }
          return parsed.toDate();
        };
        
        startDate = parseDate(startDate);
        endDate = parseDate(endDate);
        
        // Validar fechas con fallback robusto
        if (!startDate) {
          console.warn('Fecha de inicio inválida para reservación:', reservation);
          startDate = new Date();
        }
        if (!endDate) {
          console.warn('Fecha de fin inválida para reservación:', reservation);
          endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
        }
        
        // Normalizar estado
        let status = reservation.status || reservation.estado || 'PENDIENTE';
        status = status.toString().toUpperCase();
        
        // Mapear posibles valores de estado
        if (['CONFIRMADO', 'CONFIRMED'].includes(status)) status = 'CONFIRMADA';
        if (['PENDING', 'PENDIENTE'].includes(status)) status = 'PENDIENTE';
        if (['CANCELLED', 'CANCELADO'].includes(status)) status = 'CANCELADA';

        const event = {
          id,
          title: `${guestName} | ${accommodationName}`,
          start: startDate,
          end: endDate,
          status,
          guestName,
          accommodationName,
          // Guardar las fechas originales para mostrar en detalles
          startDate: reservation.check_in_date || reservation.startDate,
          endDate: reservation.check_out_date || reservation.endDate,
          originalData: reservation
        };

        console.log('Evento transformado:', event);
        return event;
        
      } catch (error) {
        console.error('Error transformando reservación:', reservation, error);
        return null;
      }
    }).filter(event => event !== null);

    console.log('Eventos finales transformados:', transformedEvents);
    return transformedEvents;
  };

  // Función para obtener reservas desde la API
  const fetchReservations = async () => {
    console.log('🔄 Iniciando fetch de reservaciones...');
    
    try {
      setLoading(true);
      setError(null);
      
      // Llamar a la API
      const reservations = await getBookings(token);
      console.log('✅ Reservaciones obtenidas de la API:', reservations);
      
      // Transformar datos
      const transformedEvents = transformApiDataToEvents(reservations);
      console.log('✅ Eventos transformados para el calendario:', transformedEvents);
      
      // Actualizar estado
      setEvents(transformedEvents);
      console.log('✅ Estado de eventos actualizado');
      
    } catch (err) {
      console.error('❌ Error al obtener reservaciones:', err);
      
      let errorMessage = 'Error al cargar las reservas';
      
      if (err.response) {
        const status = err.response.status;
        
        switch (status) {
          case 401:
            errorMessage = 'No autorizado. Por favor, inicie sesión nuevamente.';
            break;
          case 403:
            errorMessage = 'No tiene permisos para acceder a esta información.';
            break;
          case 404:
            errorMessage = 'No se encontraron reservas.';
            setEvents([]);
            setError(null);
            return;
          case 500:
          case 502:
          case 503:
            errorMessage = 'Error del servidor. Intente nuevamente más tarde.';
            break;
          default:
            if (err.response.data?.message) {
              errorMessage = err.response.data.message;
            }
        }
      } else if (err.request) {
        errorMessage = 'Error de conexión. Verifique su conexión a internet.';
      } else {
        errorMessage = `Error inesperado: ${err.message}`;
      }
      
      setError(errorMessage);
      
    } finally {
      setLoading(false);
    }
  };

  // Obtener todos los alojamientos disponibles
  const fetchAllAccommodations = async () => {
    try {
      console.log('🔄 Obteniendo alojamientos...');
      const data = await getAccommodations(token);
      console.log('✅ Alojamientos obtenidos:', data);
      setAccommodations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Error al cargar alojamientos:', err);
      setAccommodations([]);
    }
  };

  // Efecto para cargar datos iniciales
  useEffect(() => {
    console.log('🚀 Componente montado, cargando datos...');
    if (token) {
      fetchReservations();
      fetchAllAccommodations();
    } else {
      console.warn('⚠️ No hay token disponible');
    }
  }, [token]);

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
    if (statusFilter !== 'Todos los estados') {
      let filterStatus = statusFilter.toUpperCase();
      if (filterStatus === 'CONFIRMED') filterStatus = 'CONFIRMADA';
      if (filterStatus === 'PENDING') filterStatus = 'PENDIENTE';
      if (filterStatus === 'CANCELLED') filterStatus = 'CANCELADA';
      
      if (event.status !== filterStatus) {
        return false;
      }
    }
    
    return true;
  });

  // Estilizar eventos según su estado
  const eventStyleGetter = (event) => {
    let backgroundColor = '';
    let borderColor = '';
    let textColor = '#333';
    
    switch (event.status) {
      case 'PENDIENTE':
      case 'PENDING':
        backgroundColor = '#FFF3CD';
        borderColor = '#F39C12';
        break;
      case 'CONFIRMADA':
      case 'CONFIRMED':
        backgroundColor = '#D4EDDA';
        borderColor = '#28A745';
        break;
      case 'CANCELADA':
      case 'CANCELLED':
        backgroundColor = '#F8D7DA';
        borderColor = '#DC3545';
        break;
      default:
        backgroundColor = '#E9ECEF';
        borderColor = '#6C757D';
    }
    
    const style = {
      backgroundColor,
      borderLeft: `4px solid ${borderColor}`,
      borderRadius: '6px',
      color: textColor,
      border: `1px solid ${borderColor}`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '4px 8px',
      fontSize: '0.85rem',
      lineHeight: '1.3',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontWeight: '500'
    };
    
    return { style };
  };

  // Manejar clic en evento
  const handleSelectEvent = (event) => {
    console.log('📅 Evento seleccionado:', event);
    setSelectedEvent(event);
    setShowPopup(true);
  };

  // Formatear fecha en español
  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    
    const date = moment(dateString);
    return date.isValid() ? date.format('dddd, LL') : 'Fecha inválida';
  };

  // Obtener lista única de alojamientos para el filtro
  const getUniqueAccommodations = () => {
    const accommodationNames = events
      .map(event => event.accommodationName)
      .filter(name => name && name !== 'Alojamiento desconocido');
    
    return ['Todos los alojamientos', ...new Set(accommodationNames)];
  };

  // Obtener mes y año actual para el encabezado
  const currentDate = moment();
  const monthYear = currentDate.format('MMMM YYYY').charAt(0).toUpperCase() + currentDate.format('MMMM YYYY').slice(1);

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

  // Crear nueva reserva - FUNCIÓN MEJORADA
  const handleCreateReservation = async () => {
    console.log('💾 Iniciando creación de reserva...');
    
    if (!validateForm()) {
      console.log('❌ Validación fallida');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // 1. SOLUCIÓN PARA VALIDACIÓN DE FECHAS:
      // Formatear fechas en formato ISO sin hora
      const startDateISO = moment(newReservation.startDate).format('YYYY-MM-DD');
      const endDateISO = moment(newReservation.endDate).format('YYYY-MM-DD');
      
      const payload = {
        guestName: newReservation.guestName.trim(),
        startDate: startDateISO,
        endDate: endDateISO,
        accommodationId: newReservation.accommodationId
      };
      
      console.log('📤 Enviando payload:', payload);
      
      // Crear reserva
      const result = await createBooking(payload, token);
      console.log('✅ Reserva creada exitosamente:', result);
      
      // 3. SOLUCIÓN PARA MOSTRAR RESERVA INMEDIATAMENTE:
      // Estrategia dual: actualización optimista + refetch para consistencia
      
      // A. Actualización optimista con datos locales
      const accommodation = accommodations.find(a => a.id === newReservation.accommodationId);
      const tempEvent = {
        id: `temp-${Date.now()}`,
        title: `${newReservation.guestName} | ${accommodation?.name || 'Nuevo alojamiento'}`,
        start: new Date(newReservation.startDate),
        end: new Date(newReservation.endDate),
        status: 'PENDIENTE',
        guestName: newReservation.guestName,
        accommodationName: accommodation?.name || 'Nuevo alojamiento',
        startDate: startDateISO,
        endDate: endDateISO,
        originalData: { ...payload, id: `temp-${Date.now()}` }
      };
      
      setEvents(prevEvents => [...prevEvents, tempEvent]);
      
      // B. Refetch para obtener datos reales del servidor
      await fetchReservations();
      
      // Mostrar mensaje de éxito
      await Swal.fire({
        icon: 'success',
        title: '¡Reserva creada!',
        text: 'La reserva se ha creado correctamente',
        confirmButtonColor: '#2563eb',
        timer: 2000,
        timerProgressBar: true
      });
      
      // Limpiar y cerrar modal
      setShowReservationModal(false);
      setNewReservation({
        guestName: '',
        startDate: '',
        endDate: '',
        accommodationId: id || ''
      });
      setFormErrors({});
      
      console.log('✅ Proceso completado de creación finalizado');
      
    } catch (err) {
      console.error('❌ Error completo al crear la reserva:', err);
      
      // Revertir actualización optimista en caso de error
      setEvents(prevEvents => prevEvents.filter(e => !e.id.includes('temp')));
      
      let errorMessage = 'Error al crear la reserva';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.errors) {
        const serverErrors = err.response.data.errors;
        const errorMessages = Object.values(serverErrors).flat();
        errorMessage = errorMessages.join(', ');
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonColor: '#2563eb',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Función para obtener el texto del estado en español
  const getStatusText = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
      case 'PENDIENTE':
        return 'Pendiente';
      case 'CONFIRMED':
      case 'CONFIRMADA':
        return 'Confirmada';
      case 'CANCELLED':
      case 'CANCELADA':
        return 'Cancelada';
      default:
        return status || 'Desconocido';
    }
  };

  // Cerrar popup al hacer clic fuera
  const handlePopupBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowPopup(false);
    }
  };

  // Cerrar modal al hacer clic fuera
  const handleModalBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isSaving) {
      setShowReservationModal(false);
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
        {loading && (
          <div className="loading-container">
            <p className="loading-message">Cargando calendario...</p>
          </div>
        )}
        
        {error && (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button 
              className="retry-btn" 
              onClick={fetchReservations}
              disabled={loading}
            >
              Reintentar
            </button>
          </div>
        )}
        
        {!loading && !error && (
          <Calendar
            localizer={localizer}
            events={filteredEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600, minHeight: 600 }}
            eventPropGetter={eventStyleGetter}
            messages={{
              next: "Sig",
              previous: "Ant",
              today: "Hoy",
              month: "Mes",
              week: "Semana",
              day: "Día",
              agenda: "Agenda",
              noEventsInRange: "No hay eventos en este rango",
              showMore: total => `+ Ver ${total} más`
            }}
            onSelectEvent={handleSelectEvent}
            views={['month', 'week', 'day', 'agenda']}
            defaultView="month"
            popup
            popupOffset={{x: 30, y: 20}}
            components={{
              event: ({ event }) => (
                <div className="custom-event">
                  <div className="event-guest" title={event.guestName}>
                    {event.guestName}
                  </div>
                  <div className="event-accommodation" title={event.accommodationName}>
                    {event.accommodationName}
                  </div>
                </div>
              )
            }}
          />
        )}
        
        {!loading && !error && filteredEvents.length === 0 && (
          <div className="no-events-message">
            <p>No hay reservaciones que coincidan con los filtros seleccionados.</p>
          </div>
        )}
      </div>
      
      {/* Popup para detalles de reserva */}
      {showPopup && selectedEvent && (
        <div className="event-popup" onClick={handlePopupBackdropClick}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowPopup(false)}>
              <FaTimes />
            </button>
            <h3>Detalles de Reserva</h3>
            <div className="popup-details">
              <p><strong>Huésped:</strong> {selectedEvent.guestName}</p>
              <p><strong>Alojamiento:</strong> {selectedEvent.accommodationName}</p>
              <p><strong>Estado:</strong> 
                <span className={`status-badge ${selectedEvent.status.toLowerCase()}`}>
                  {getStatusText(selectedEvent.status)}
                </span>
              </p>
              <p><strong>Desde:</strong> {formatDate(selectedEvent.startDate)}</p>
              <p><strong>Hasta:</strong> {formatDate(selectedEvent.endDate)}</p>
              <p><strong>Duración:</strong> {moment(selectedEvent.endDate).diff(moment(selectedEvent.startDate), 'days')} días</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal para nueva reservación */}
      {showReservationModal && (
        <div className="reservation-modal" onClick={handleModalBackdropClick}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="close-btn" 
              onClick={() => !isSaving && setShowReservationModal(false)} 
              disabled={isSaving}
            >
              <FaTimes />
            </button>
            <h2>Nueva Reservación</h2>
            
            <div className="form-group">
              <label htmlFor="accommodationId">Alojamiento *</label>
              <select
                id="accommodationId"
                name="accommodationId"
                value={newReservation.accommodationId}
                onChange={handleReservationChange}
                className={formErrors.accommodationId ? 'error' : ''}
                disabled={isSaving}
              >
                <option value="">Seleccionar alojamiento</option>
                {accommodations.map(accommodation => (
                  <option key={accommodation.id} value={accommodation.id}>
                    {accommodation.name || accommodation.nombreAlojamiento || `Alojamiento ${accommodation.id}`}
                  </option>
                ))}
              </select>
              {formErrors.accommodationId && (
                <div className="error-message">{formErrors.accommodationId}</div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="guestName">Huésped *</label>
              <input
                id="guestName"
                type="text"
                name="guestName"
                value={newReservation.guestName}
                onChange={handleReservationChange}
                placeholder="Nombre del huésped"
                className={formErrors.guestName ? 'error' : ''}
                disabled={isSaving}
                maxLength={100}
              />
              {formErrors.guestName && (
                <div className="error-message">{formErrors.guestName}</div>
              )}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Fecha de inicio *</label>
                <input
                  id="startDate"
                  type="date"
                  name="startDate"
                  value={newReservation.startDate}
                  onChange={handleReservationChange}
                  className={formErrors.startDate ? 'error' : ''}
                  disabled={isSaving}
                  min={moment().format('YYYY-MM-DD')}
                />
                {formErrors.startDate && (
                  <div className="error-message">{formErrors.startDate}</div>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="endDate">Fecha de fin *</label>
                <input
                  id="endDate"
                  type="date"
                  name="endDate"
                  value={newReservation.endDate}
                  onChange={handleReservationChange}
                  className={formErrors.endDate ? 'error' : ''}
                  disabled={isSaving}
                  min={newReservation.startDate || moment().format('YYYY-MM-DD')}
                />
                {formErrors.endDate && (
                  <div className="error-message">{formErrors.endDate}</div>
                )}
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => !isSaving && setShowReservationModal(false)}
                disabled={isSaving}
                type="button"
              >
                Cancelar
              </button>
              <button 
                className="save-btn"
                onClick={handleCreateReservation}
                disabled={isSaving}
                type="button"
              >
                {isSaving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;