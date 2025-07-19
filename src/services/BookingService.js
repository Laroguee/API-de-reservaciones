// src/services/bookingService.js
import apiClient from './api';
import Swal from 'sweetalert2';

const BASE_URL = 'https://apibookingsaccomodations-production.up.railway.app/api/V1';

const showError = (error) => {
  console.error('Error:', error);
  const message = error.response?.data?.message || 'Ocurrió un error inesperado';
  Swal.fire({
    icon: 'error',
    title: 'Error',
    text: message,
    confirmButtonColor: '#2563eb',
  });
};

// Obtener todas las reservas
export async function getBookings() {
  try {
    const response = await apiClient.get(`${BASE_URL}/bookings`);
    return response.data;
  } catch (error) {
    showError(error);
    return [];
  }
}

// Crear nueva reserva
export async function createBooking(data) {
  try {
    const response = await apiClient.post(`${BASE_URL}/booking`, data);
    return response.data;
  } catch (error) {
    showError(error);
    throw error;
  }
}

// Cancelar reserva
export async function cancelBooking(id) {
  try {
    const response = await apiClient.patch(`${BASE_URL}/status_booking/${id}`);
    return response.data;
  } catch (error) {
    showError(error);
    throw error;
  }
}

// Verificar disponibilidad
export async function checkAvailability(accommodationId, startDate, endDate) {
  try {
    const response = await apiClient.get(`${BASE_URL}/bookings/calendar/${accommodationId}`, {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  } catch (error) {
    showError(error);
    return [];
  }
}

// Obtener todos los alojamientos (desde tu API existente)
export async function getAccommodations() {
  try {
    const response = await apiClient.get(`${BASE_URL}/accomodations`);
    return response.data.filter(accommodation => !accommodation.isDeleted);
  } catch (error) {
    showError(error);
    return [];
  }
}

// Obtener alojamiento por ID
export async function getAccommodationById(id) {
  try {
    const response = await apiClient.get(`${BASE_URL}/accomodation/${id}`);
    return response.data;
  } catch (error) {
    showError(error);
    return null;
  }
}

// Obtener reservas por alojamiento
export async function getBookingsForAccommodation(accommodationId) {
  try {
    const response = await apiClient.get(`${BASE_URL}/reservations/accommodation/${accommodationId}`);
    return response.data;
  } catch (error) {
    showError(error);
    return [];
  }
}