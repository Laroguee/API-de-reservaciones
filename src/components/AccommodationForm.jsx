/**
 * Componente de formulario para crear o editar un alojamiento
 * 
 * Este componente maneja tanto la creación como la edición de alojamientos,
 * con validación de campos y vista previa de la imagen.
 * 
 * Utiliza react-hook-form para el manejo del formulario y validaciones.
 */

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import '../styles/AccommodationForm.css';

/**
 * Componente de formulario para crear/editar alojamientos
 * 
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Indica si el modal está abierto
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onSubmit - Función que se ejecuta al enviar el formulario
 * @param {Object} [props.initialData=null] - Datos iniciales para el formulario (en modo edición)
 * @returns {JSX.Element|null} El componente del formulario o null si no está abierto
 */
const AccommodationForm = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  // Configuración del formulario con react-hook-form
  const { 
    register, 
    handleSubmit, 
    reset,
    formState: { errors },
    watch,
    setValue,
    clearErrors
  } = useForm({
    // Valores por defecto del formulario
    defaultValues: {
      name: '',
      address: '',
      description: '',
      image: ''
    },
    // Modo de validación: se valida en cada cambio
    mode: 'onChange'
  });
  
  // Observar el valor del campo de imagen para mostrar vista previa
  const imageUrl = watch('image');

  /**
   * Efecto para cargar los datos iniciales cuando el modal se abre o cambian los datos iniciales
   */
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Cargar datos del alojamiento a editar
        Object.entries(initialData).forEach(([key, value]) => {
          setValue(key, value || '');
        });
      } else {
        // Restablecer formulario para nuevo alojamiento
        reset();
      }
      // Limpiar errores al abrir el formulario
      clearErrors();
    }
  }, [initialData, isOpen, reset, setValue, clearErrors]);

  /**
   * Maneja el envío del formulario
   * @param {Object} data - Datos del formulario validados
   */
  const onFormSubmit = (data) => {
    onSubmit(data);
  };

  // No renderizar nada si el modal no está abierto
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{initialData ? 'Editar Alojamiento' : 'Agregar Alojamiento'}</h2>
          <button 
            onClick={onClose} 
            className="close-button"
            aria-label="Cerrar formulario"
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onFormSubmit)} className="accommodation-form" noValidate>
          {/* Campo de nombre */}
          <div className="form-group">
            <label htmlFor="name">Nombre *</label>
            <input
              type="text"
              id="name"
              className={`form-input ${errors.name ? 'error' : ''}`}
              aria-invalid={errors.name ? 'true' : 'false'}
              aria-required="true"
              {...register('name', { 
                required: 'El nombre es requerido',
                minLength: {
                  value: 3,
                  message: 'El nombre debe tener al menos 3 caracteres'
                },
                maxLength: {
                  value: 100,
                  message: 'El nombre no puede exceder los 100 caracteres'
                }
              })}
            />
            {errors.name && (
              <span className="error-message" role="alert" aria-live="assertive">
                {errors.name.message}
              </span>
            )}
          </div>
          
          {/* Campo de dirección */}
          <div className="form-group">
            <label htmlFor="address">Dirección *</label>
            <input
              type="text"
              id="address"
              className={`form-input ${errors.address ? 'error' : ''}`}
              aria-invalid={errors.address ? 'true' : 'false'}
              aria-required="true"
              {...register('address', { 
                required: 'La dirección es requerida',
                minLength: {
                  value: 5,
                  message: 'La dirección debe tener al menos 5 caracteres'
                },
                maxLength: {
                  value: 200,
                  message: 'La dirección no puede exceder los 200 caracteres'
                }
              })}
            />
            {errors.address && (
              <span className="error-message" role="alert" aria-live="assertive">
                {errors.address.message}
              </span>
            )}
          </div>
          
          {/* Campo de descripción */}
          <div className="form-group">
            <label htmlFor="description">Descripción *</label>
            <textarea
              id="description"
              rows="4"
              className={`form-textarea ${errors.description ? 'error' : ''}`}
              aria-invalid={errors.description ? 'true' : 'false'}
              aria-required="true"
              {...register('description', { 
                required: 'La descripción es requerida',
                minLength: {
                  value: 10,
                  message: 'La descripción debe tener al menos 10 caracteres'
                },
                maxLength: {
                  value: 1000,
                  message: 'La descripción no puede exceder los 1000 caracteres'
                }
              })}
            />
            {errors.description && (
              <span className="error-message" role="alert" aria-live="assertive">
                {errors.description.message}
              </span>
            )}
          </div>
          
          {/* Campo de URL de imagen */}
          <div className="form-group">
            <label htmlFor="image">URL de la Imagen *</label>
            <input
              type="url"
              id="image"
              placeholder="https://ejemplo.com/imagen.jpg"
              className={`form-input ${errors.image ? 'error' : ''}`}
              aria-invalid={errors.image ? 'true' : 'false'}
              aria-required="true"
              {...register('image', { 
                required: 'La URL de la imagen es requerida',
                pattern: {
                  value: /^(https?:\/\/).+\.(jpg|jpeg|png|gif|webp)$/i,
                  message: 'Por favor ingresa una URL de imagen válida (jpg, jpeg, png, gif, webp)'
                }
              })}
            />
            {errors.image && (
              <span className="error-message" role="alert" aria-live="assertive">
                {errors.image.message}
              </span>
            )}
            
            {/* Vista previa de la imagen */}
            {imageUrl && (
              <div className="image-preview">
                <p className="preview-label">Vista previa:</p>
                <img 
                  src={imageUrl} 
                  alt="Vista previa de la imagen del alojamiento" 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg width="300" height="200" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="100%25" height="100%25" fill="%23f1f5f9"/%3E%3Ctext x="50%25" y="50%25" font-family="sans-serif" font-size="14" text-anchor="middle" dominant-baseline="middle" fill="%236b7280"%3EImagen no disponible%3C/text%3E%3C/svg%3E';
                  }} 
                />
              </div>
            )}
          </div>
          
          {/* Acciones del formulario */}
          <div className="form-actions">
            <button 
              type="button" 
              onClick={onClose} 
              className="cancel-button"
              aria-label="Cancelar y cerrar el formulario"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="submit-button"
              aria-label={initialData ? 'Actualizar alojamiento' : 'Guardar nuevo alojamiento'}
            >
              {initialData ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccommodationForm;
