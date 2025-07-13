import apiClient from './api';
import Swal from 'sweetalert2';

const BASE_URL = 'https://apibookingsaccomodations-production.up.railway.app/api/V1';
const ACCOMMODATIONS_URL = `${BASE_URL}/accomodations`; // Para GET (todos) y POST (crear)
const ACCOMMODATION_URL = `${BASE_URL}/accomodation`;  // Para GET/PUT/DELETE por ID

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

export const getAccommodations = async () => {
  try {
    const response = await apiClient.get(ACCOMMODATIONS_URL);
    // Filtrar para excluir alojamientos marcados como eliminados
    if (Array.isArray(response.data)) {
      return response.data.filter(accommodation => !accommodation.isDeleted);
    }
    return response.data || [];
  } catch (error) {
    console.error('Error en getAccommodations:', error);
    showError(error);
    return [];
  }
};

export const createAccommodation = async (data) => {
  try {
    console.log('Enviando datos a la API:', data);
    const response = await apiClient.post(ACCOMMODATION_URL, data, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('Respuesta de la API:', response);
    
    if (response.status === 201 || response.status === 200) {
      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Alojamiento creado correctamente',
        confirmButtonColor: '#2563eb',
      });
      return response.data;
    } else {
      throw new Error('Error inesperado al crear el alojamiento');
    }
  } catch (error) {
    console.error('Error en createAccommodation:', error);
    showError(error);
    throw error;
  }
};

export const updateAccommodation = async (id, data) => {
  try {
    const response = await apiClient.put(`${ACCOMMODATIONS_URL}/${id}`, data, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    Swal.fire({
      icon: 'success',
      title: '¡Éxito!',
      text: 'Alojamiento actualizado correctamente',
      confirmButtonColor: '#2563eb',
    });
    
    return response.data;
  } catch (error) {
    console.error('Error en updateAccommodation:', error);
    showError(error);
    throw error;
  }
};

export const deleteAccommodation = async (id, onSuccess) => {
  try {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      // Primero obtenemos los datos actuales del alojamiento
      const response = await apiClient.get(`${ACCOMMODATION_URL}/${id}`);
      const accommodationData = response.data;
      
      // Actualizamos el estado a eliminado manteniendo todos los campos requeridos
      await apiClient.put(
        `${ACCOMMODATION_URL}/${id}`, 
        {
          ...accommodationData,
          isDeleted: true
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      
      Swal.fire({
        title: '¡Eliminado!',
        text: 'El alojamiento ha sido eliminado.',
        icon: 'success',
        confirmButtonColor: '#2563eb',
      }).then(() => {
        // Llamamos al callback de éxito si existe
        if (typeof onSuccess === 'function') {
          onSuccess();
        }
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error en deleteAccommodation:', error);
    showError(error);
    return false;
  }
};
