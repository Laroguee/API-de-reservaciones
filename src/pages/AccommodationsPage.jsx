import React, { useState } from 'react';
import { useAccommodation } from '../context/AccommodationContext';
import AccommodationForm from '../components/AccommodationForm';
import AccommodationDetail from '../components/AccommodationDetail';
import '../styles/AccommodationsPage.css';

const AccommodationsPage = () => {
  const { accommodations, loading, fetchAccommodations } = useAccommodation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccommodation, setEditingAccommodation] = useState(null);
  const [viewingAccommodation, setViewingAccommodation] = useState(null);

  // Función para recargar los alojamientos
  const refreshAccommodations = async () => {
    try {
      await fetchAccommodations();
    } catch (error) {
      console.error('Error al actualizar la lista de alojamientos:', error);
    }
  };

  const handleEdit = (accommodation) => {
    setEditingAccommodation(accommodation);
    setIsModalOpen(true);
  };

  const handleViewDetails = (accommodation) => {
    setViewingAccommodation(accommodation);
  };

  const { addAccommodation, editAccommodation } = useAccommodation();

  const handleFormSubmit = async (formData) => {
    try {
      if (editingAccommodation) {
        await editAccommodation(editingAccommodation.id, formData);
      } else {
        await addAccommodation(formData);
      }
      // Cerrar el modal
      setIsModalOpen(false);
      setEditingAccommodation(null);
      
      // Esperar un momento para que el usuario vea el mensaje de éxito
      setTimeout(() => {
        // Recargar la lista de alojamientos
        refreshAccommodations();
      }, 1000);
      
    } catch (error) {
      console.error('Error al guardar el alojamiento:', error);
    }
  };

  // Mover el estado de carga al principio del renderizado
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando alojamientos...</p>
      </div>
    );
  }

  return (
    <div className="accommodations-container">
      <div className="accommodations-header">
        <h1>Gestión de Alojamientos</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="add-button"
        >
          + Agregar Alojamiento
        </button>
      </div>

      <div className="accommodations-grid">
        {!Array.isArray(accommodations) || accommodations.length === 0 ? (
          <div key="no-accommodations" className="no-accommodations">
            <p>No hay alojamientos disponibles</p>
          </div>
        ) : (
          // Usando el índice como respaldo si no hay ID
          accommodations.map((accommodation, index) => (
            <div 
              key={accommodation.id || `accommodation-${index}`} 
              className="accommodation-card"
              onClick={() => handleViewDetails(accommodation)}
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
                  >
                    Editar
                  </button>
                  <button 
                    className="view-details-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(accommodation);
                    }}
                  >
                    Ver detalles
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

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
