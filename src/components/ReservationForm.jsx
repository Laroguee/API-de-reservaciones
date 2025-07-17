import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { createBooking } from '../services/BookingService';
import axios from 'axios';

const BASE_URL = 'https://apibookingsaccomodations-production.up.railway.app/api/V1';

const ReservationForm = ({ onSuccess }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [accommodations, setAccommodations] = useState([]);

  useEffect(() => {
    axios.get(`${BASE_URL}/accomodations`)
      .then(res => setAccommodations(res.data))
      .catch(err => console.error('Error al cargar alojamientos', err));
  }, []);

  const onSubmit = async (data) => {
    try {
      await createBooking(data);
      alert('Reservación creada con éxito');
      if (onSuccess) onSuccess();
    } catch (error) {
      alert('Error al crear la reservación');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="reservation-form">
      <h2>Crear Nueva Reservación</h2>

      <label>Alojamiento:</label>
      <select {...register('accommodation_id', { required: true })}>
        <option value="">Selecciona un alojamiento</option>
        {accommodations.map(acc => (
          <option key={acc.id} value={acc.id}>{acc.name}</option>
        ))}
      </select>
      {errors.accommodation_id && <span>Este campo es obligatorio</span>}

      <label>Fecha de inicio:</label>
      <input
        type="date"
        {...register('start_date', { required: true })}
      />
      {errors.start_date && <span>Este campo es obligatorio</span>}

      <label>Fecha de fin:</label>
      <input
        type="date"
        {...register('end_date', { required: true })}
      />
      {errors.end_date && <span>Este campo es obligatorio</span>}

      <button type="submit">Reservar</button>
    </form>
  );
};

export default ReservationForm;
