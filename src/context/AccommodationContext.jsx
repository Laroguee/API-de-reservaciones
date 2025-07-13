/**
 * Contexto de Alojamientos
 * 
 * Este contexto proporciona un estado global para la gestión de alojamientos en la aplicación.
 * Incluye funcionalidades para:
 * - Obtener la lista de alojamientos
 * - Agregar nuevos alojamientos
 * - Actualizar alojamientos existentes
 * - Eliminar alojamientos
 * 
 * El contexto también maneja el estado de carga y los errores relacionados con las operaciones de alojamientos.
 */

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import { 
  getAccommodations, 
  createAccommodation, 
  updateAccommodation, 
  deleteAccommodation as deleteAccommodationService 
} from '../services/AccommodationService';

// Creación del contexto
export const AccommodationContext = createContext({
  accommodations: [],
  loading: false,
  fetchAccommodations: () => {},
  addAccommodation: () => {},
  editAccommodation: () => {},
  removeAccommodation: () => {}
});

/**
 * Proveedor del contexto de alojamientos
 * 
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Componentes hijos que tendrán acceso al contexto
 * @returns {React.ReactElement} Componente proveedor del contexto
 */
export const AccommodationProvider = ({ children }) => {
  // Estado para almacenar la lista de alojamientos
  const [accommodations, setAccommodations] = useState([]);
  
  // Estado para manejar el estado de carga
  const [loading, setLoading] = useState(true);
  
  // Obtener el token de autenticación del contexto de autenticación
  const { token } = useContext(AuthContext);

  /**
   * Obtiene la lista de alojamientos desde el servidor
   * @async
   * @returns {Promise<void>}
   */
  const fetchAccommodations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAccommodations();
      setAccommodations(data);
    } catch (error) {
      console.error('Error al obtener los alojamientos:', error);
      // En una aplicación real, podrías querer mostrar este error al usuario
      throw error; // Relanzar el error para que pueda ser manejado por los componentes
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Agrega un nuevo alojamiento
   * @async
   * @param {Object} data - Datos del alojamiento a crear
   * @returns {Promise<boolean>} true si se creó correctamente, false en caso de error
   */
  const addAccommodation = async (data) => {
    try {
      const newAccommodation = await createAccommodation(data);
      setAccommodations(prev => [...prev, newAccommodation]);
      return true;
    } catch (error) {
      console.error('Error al agregar el alojamiento:', error);
      // En una aplicación real, podrías querer mostrar este error al usuario
      return false;
    }
  };

  /**
   * Actualiza un alojamiento existente
   * @async
   * @param {string|number} id - ID del alojamiento a actualizar
   * @param {Object} data - Nuevos datos del alojamiento
   * @returns {Promise<boolean>} true si se actualizó correctamente, false en caso de error
   */
  const editAccommodation = async (id, data) => {
    try {
      const updatedAccommodation = await updateAccommodation(id, data);
      setAccommodations(prev => 
        prev.map(acc => (acc.id === id ? updatedAccommodation : acc))
      );
      return true;
    } catch (error) {
      console.error('Error al actualizar el alojamiento:', error);
      // En una aplicación real, podrías querer mostrar este error al usuario
      return false;
    }
  };

  /**
   * Elimina un alojamiento
   * @async
   * @param {string|number} id - ID del alojamiento a eliminar
   * @returns {Promise<boolean>} true si se eliminó correctamente, false en caso de error
   */
  const removeAccommodation = async (id) => {
    try {
      const success = await deleteAccommodationService(id);
      if (success) {
        setAccommodations(prev => prev.filter(acc => acc.id !== id));
      }
      return success;
    } catch (error) {
      console.error('Error al eliminar el alojamiento:', error);
      // En una aplicación real, podrías querer mostrar este error al usuario
      return false;
    }
  };

  // Efecto para cargar los alojamientos cuando el token de autenticación esté disponible
  useEffect(() => {
    if (token) {
      fetchAccommodations();
    } else {
      // Si no hay token, asegurarse de que el estado de carga sea falso
      setLoading(false);
    }
  }, [token, fetchAccommodations]);

  // Valor que se proporcionará a los componentes consumidores
  const contextValue = {
    accommodations,
    loading,
    fetchAccommodations,
    addAccommodation,
    editAccommodation,
    removeAccommodation,
  };

  return (
    <AccommodationContext.Provider value={contextValue}>
      {children}
    </AccommodationContext.Provider>
  );
};

/**
 * Hook personalizado para acceder al contexto de alojamientos
 * @returns {Object} Contexto de alojamientos
 * @throws {Error} Si se usa fuera de un AccommodationProvider
 */
export const useAccommodation = () => {
  const context = useContext(AccommodationContext);
  
  if (!context) {
    throw new Error(
      'useAccommodation debe usarse dentro de un AccommodationProvider'
    );
  }
  
  return context;
};
