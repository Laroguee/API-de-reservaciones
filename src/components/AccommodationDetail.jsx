/**
 * Componente de detalle de alojamiento
 * 
 * Este componente muestra la información detallada de un alojamiento en un modal,
 * incluyendo imagen, dirección, descripción y comodidades.
 * 
 * Se utiliza cuando el usuario hace clic en "Ver detalles" en la lista de alojamientos.
 */

import React from 'react';
import PropTypes from 'prop-types';
import '../styles/AccommodationDetail.css';

/**
 * Componente para mostrar los detalles de un alojamiento
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.accommodation - Datos del alojamiento a mostrar
 * @param {Function} props.onClose - Función para cerrar el modal de detalles
 * @returns {JSX.Element|null} El componente de detalle o null si no hay datos
 */
const AccommodationDetail = ({ accommodation, onClose }) => {
  // No renderizar si no hay datos de alojamiento
  if (!accommodation) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="accommodation-detail-title"
    >
      <div className="modal-content detail-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="accommodation-detail-title">{accommodation.name}</h2>
          <button 
            onClick={onClose} 
            className="close-button"
            aria-label="Cerrar detalles del alojamiento"
          >
            &times;
          </button>
        </div>
        
        <div className="detail-container">
          {/* Imagen del alojamiento */}
          <figure className="detail-image">
            <img 
              src={accommodation.image || 'https://placehold.co/500x300/2563eb/ffffff?text=Sin+imagen'} 
              alt={`Imagen de ${accommodation.name}`}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg width="500" height="300" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="100%25" height="100%25" fill="%23f1f5f9"/%3E%3Ctext x="50%25" y="50%25" font-family="sans-serif" font-size="16" text-anchor="middle" dominant-baseline="middle" fill="%236b7280"%3EImagen no disponible%3C/text%3E%3C/svg%3E';
              }}
              className="accommodation-detail-img"
            />
            {!accommodation.image && (
              <figcaption className="image-caption">
                Imagen de ejemplo - {accommodation.name}
              </figcaption>
            )}
          </figure>
          
          <div className="detail-info">
            {/* Sección de información básica */}
            <section className="info-section" aria-labelledby="accommodation-info-heading">
              <h3 id="accommodation-info-heading">Información del Alojamiento</h3>
              
              <div className="info-item">
                <span className="info-label">Dirección:</span>
                <span className="info-value">
                  {accommodation.address || 'No especificada'}
                </span>
              </div>
              
              <div className="info-item">
                <h4 className="info-label">Descripción:</h4>
                <p className="description">
                  {accommodation.description || 'No hay descripción disponible'}
                </p>
              </div>
            </section>
            
            {/* Sección de comodidades */}
            {accommodation.amenities && accommodation.amenities.length > 0 && (
              <section className="info-section" aria-labelledby="amenities-heading">
                <h3 id="amenities-heading">Comodidades</h3>
                <div className="amenities-grid" role="list" aria-label="Lista de comodidades">
                  {accommodation.amenities.map((amenity, index) => (
                    <span 
                      key={index} 
                      className="amenity-tag"
                      role="listitem"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </section>
            )}
            
            {/* Acciones del detalle */}
            <div className="detail-actions">
              <button 
                onClick={onClose}
                className="close-detail-button"
                aria-label="Cerrar ventana de detalles"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Definición de tipos de propiedades
AccommodationDetail.propTypes = {
  accommodation: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string.isRequired,
    address: PropTypes.string,
    description: PropTypes.string,
    image: PropTypes.string,
    amenities: PropTypes.arrayOf(PropTypes.string)
  }),
  onClose: PropTypes.func.isRequired
};

export default AccommodationDetail;
