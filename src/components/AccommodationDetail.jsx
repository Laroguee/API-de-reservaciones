import React from 'react';
import '../styles/AccommodationDetail.css';

const AccommodationDetail = ({ accommodation, onClose }) => {
  if (!accommodation) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content detail-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{accommodation.name}</h2>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        
        <div className="detail-container">
          <div className="detail-image">
            <img 
              src={accommodation.image || 'https://placehold.co/500x300/2563eb/ffffff?text=Sin+imagen'} 
              alt={accommodation.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg width="500" height="300" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="100%25" height="100%25" fill="%23f1f5f9"/%3E%3Ctext x="50%25" y="50%25" font-family="sans-serif" font-size="16" text-anchor="middle" dominant-baseline="middle" fill="%236b7280"%3EImagen no disponible%3C/text%3E%3C/svg%3E';
              }}
            />
          </div>
          
          <div className="detail-info">
            <div className="info-section">
              <h3>Información del Alojamiento</h3>
              <p><strong>Dirección:</strong> {accommodation.address || 'No especificada'}</p>
              <p><strong>Descripción:</strong></p>
              <p className="description">
                {accommodation.description || 'No hay descripción disponible'}
              </p>
            </div>
            
            {accommodation.amenities && (
              <div className="info-section">
                <h3>Comodidades</h3>
                <div className="amenities-grid">
                  {accommodation.amenities.map((amenity, index) => (
                    <span key={index} className="amenity-tag">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="detail-actions">
              <button 
                onClick={onClose}
                className="close-detail-button"
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

export default AccommodationDetail;
