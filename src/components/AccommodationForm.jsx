import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import '../styles/AccommodationForm.css';

const AccommodationForm = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const { 
    register, 
    handleSubmit, 
    reset,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    defaultValues: {
      name: '',
      address: '',
      description: '',
      image: ''
    }
  });

  const imageUrl = watch('image');

  useEffect(() => {
    if (initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        setValue(key, value || '');
      });
    } else {
      reset();
    }
  }, [initialData, isOpen, reset, setValue]);

  const onFormSubmit = (data) => {
    onSubmit(data);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{initialData ? 'Editar Alojamiento' : 'Agregar Alojamiento'}</h2>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit(onFormSubmit)} className="accommodation-form" noValidate>
          <div className="form-group">
            <label htmlFor="name">Nombre *</label>
            <input
              type="text"
              id="name"
              className={errors.name ? 'error' : ''}
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
            {errors.name && <span className="error-message">{errors.name.message}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="address">Dirección *</label>
            <input
              type="text"
              id="address"
              className={errors.address ? 'error' : ''}
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
            {errors.address && <span className="error-message">{errors.address.message}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Descripción *</label>
            <textarea
              id="description"
              rows="4"
              className={errors.description ? 'error' : ''}
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
            {errors.description && <span className="error-message">{errors.description.message}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="image">URL de la Imagen *</label>
            <input
              type="url"
              id="image"
              placeholder="https://ejemplo.com/imagen.jpg"
              className={errors.image ? 'error' : ''}
              {...register('image', { 
                required: 'La URL de la imagen es requerida',
                pattern: {
                  value: /^(https?:\/\/).+\.(jpg|jpeg|png|gif|webp)$/i,
                  message: 'Por favor ingresa una URL de imagen válida (jpg, jpeg, png, gif, webp)'
                }
              })}
            />
            {errors.image && <span className="error-message">{errors.image.message}</span>}
            {imageUrl && (
              <div className="image-preview">
                <img src={imageUrl} alt="Vista previa" onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg width=\"300\" height=\"200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Crect width=\"100%25\" height=\"100%25\" fill=\"%23f1f5f9\"/%3E%3Ctext x=\"50%25\" y=\"50%25\" font-family=\"sans-serif\" font-size=\"14\" text-anchor=\"middle\" dominant-baseline=\"middle\" fill=\"%236b7280\"%3EImagen no disponible%3C/text%3E%3C/svg%3E';
                }} />
              </div>
            )}
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancelar
            </button>
            <button type="submit" className="submit-button">
              {initialData ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccommodationForm;
