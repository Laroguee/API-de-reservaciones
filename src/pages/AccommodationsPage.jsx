/**
 * Página principal de gestión de alojamientos
 * 
 * Este componente muestra una cuadrícula de alojamientos disponibles con opciones para:
 * - Ver detalles de cada alojamiento
 * - Agregar nuevos alojamientos
 * - Editar alojamientos existentes
 * - Navegar a la vista de detalles
 * 
 * Utiliza el contexto de AccommodationContext para gestionar el estado de los alojamientos
 * y los componentes AccommodationForm y AccommodationDetail para los modales.
 */
import React, { useState, useCallback } from 'react';
import { useAccommodation } from '../context/AccommodationContext';
import AccommodationForm from '../components/AccommodationForm';
import AccommodationDetail from '../components/AccommodationDetail';
import '../styles/AccommodationsPage.css';

const AccommodationsPage = () => {
  // Estado y contexto
  const { accommodations, loading, fetchAccommodations } = useAccommodation();
  
  // Estados para controlar los modales y datos en edición/visualización
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccommodation, setEditingAccommodation] = useState(null);
  const [viewingAccommodation, setViewingAccommodation] = useState(null);

  /**
   * Recarga la lista de alojamientos desde el servidor
   * @async
   * @returns {Promise<void>}
   */
  const refreshAccommodations = useCallback(async () => {
    try {
      await fetchAccommodations();
    } catch (error) {
      console.error('Error al actualizar la lista de alojamientos:', error);
      // En una aplicación real, podrías mostrar un mensaje de error al usuario
    }
  }, [fetchAccommodations]);

  /**
   * Maneja la acción de editar un alojamiento
   * @param {Object} accommodation - El alojamiento a editar
   */
  const handleEdit = (accommodation) => {
    setEditingAccommodation(accommodation);
    setIsModalOpen(true);
  };

  /**
   * Muestra los detalles de un alojamiento en un modal
   * @param {Object} accommodation - El alojamiento a visualizar
   */
  const handleViewDetails = (accommodation) => {
    setViewingAccommodation(accommodation);
  };

  // Obtener las funciones del contexto
  const { addAccommodation, editAccommodation } = useAccommodation();

  /**
   * Maneja el envío del formulario de creación/edición
   * @async
   * @param {Object} formData - Datos del formulario
   */
  const handleFormSubmit = async (formData) => {
    try {
      if (editingAccommodation) {
        // Actualizar alojamiento existente
        await editAccommodation(editingAccommodation.id, formData);
      } else {
        // Crear nuevo alojamiento
        await addAccommodation(formData);
      }
      
      // Cerrar el modal y limpiar el estado de edición
      setIsModalOpen(false);
      setEditingAccommodation(null);
      
      // Recargar la lista después de un breve retraso para dar feedback visual
      setTimeout(() => {
        refreshAccommodations();
      }, 1000);
      
    } catch (error) {
      console.error('Error al guardar el alojamiento:', error);
      // En una aplicación real, mostrarías un mensaje de error al usuario
    }
  };

  // Mostrar indicador de carga mientras se cargan los datos
  if (loading) {
    return (
      <div className="loading-container" role="status" aria-live="polite">
        <div className="loading-spinner" aria-hidden="true"></div>
        <p>Cargando alojamientos...</p>
      </div>
    );
  }

  return (
    <div className="accommodations-container">
      {/* Encabezado de la página con el título y botón de acción */}
      <header className="accommodations-header">
        <h1>Gestión de Alojamientos</h1>
        <button 
          onClick={() => {
            setEditingAccommodation(null); // Asegura que estamos en modo creación
            setIsModalOpen(true);
          }}
          className="add-button"
          aria-label="Agregar nuevo alojamiento"
        >
          + Agregar Alojamiento
        </button>
      </header>

      {/* Lista de alojamientos */}
      <div className="accommodations-grid">
        {!Array.isArray(accommodations) || accommodations.length === 0 ? (
          <div key="no-accommodations" className="no-accommodations">
            <p>No hay alojamientos disponibles</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="add-button"
            >
              + Agregar tu primer alojamiento
            </button>
          </div>
        ) : (
          // Mapear la lista de alojamientos a tarjetas
          accommodations.map((accommodation, index) => (
            <div 
              key={accommodation.id || `accommodation-${index}`} 
              className="accommodation-card"
              onClick={() => handleViewDetails(accommodation)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                // Permitir activar con Enter o Espacio (accesibilidad)
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleViewDetails(accommodation);
                }
              }}
              aria-label={`Ver detalles de ${accommodation.name}`}
            >
              <div className="accommodation-image">
                <img 
                  src={accommodation.image || 'https://placehold.co/300x200/2563eb/ffffff?text=Sin+imagen'} 
                  alt={accommodation.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg width="300" height="200" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="100%25" height="100%25" fill="%23f1f5f9"/%3E%3Ctext x="50%25" y="50%25" font-family="sans-serif" font-size="16" text-anchor="middle" dominant-baseline="middle" fill="%236b7280"%3EError al cargar%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
              <div className="accommodation-details">
                <h3>{accommodation.name}</h3>
                <p className="address">{accommodation.address}</p>
                <p className="description">
                  {accommodation.description && accommodation.description.length > 100 
                    ? `${accommodation.description.substring(0, 100)}...`
                    : accommodation.description || 'Sin descripción'
                  }
                </p>
                <div className="accommodation-actions">
                  <button 
                    className="edit-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(accommodation);
                    }}
                    aria-label={`Editar ${accommodation.name}`}
                  >
                    Editar
                  </button>
                  <button 
                    className="view-details-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(accommodation);
                    }}
                    aria-label={`Ver detalles de ${accommodation.name}`}
                  >
                    Ver detalles
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de formulario (crear/editar) */}
      {isModalOpen && (
        <AccommodationForm
          key={editingAccommodation ? `edit-${editingAccommodation.id}` : 'add'}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingAccommodation(null);
          }}
          onSubmit={handleFormSubmit}
          initialData={editingAccommodation}
        />
      )}
      
      {/* Modal de detalles del alojamiento */}
      {viewingAccommodation && (
        <AccommodationDetail
          accommodation={viewingAccommodation}
          onClose={() => setViewingAccommodation(null)}
        />
      )}
    </div>
  );
};

export default AccommodationsPage;
