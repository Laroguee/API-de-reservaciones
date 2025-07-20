import React, { useEffect, useState, useContext } from 'react';
import { getBookings, cancelBooking } from '../services/BookingService';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import CreateReservationPage from './CreateReservationPage';


const MySwal = withReactContent(Swal);

const ReservationsPage = () => {
  const { token } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await getBookings(token);
      setBookings(data);
    } catch (error) {
      console.error('Error al obtener reservaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    const result = await Swal.fire({
      title: '¿Cancelar esta reservación?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No'
    });

    if (result.isConfirmed) {
      try {
        await fetch(`https://apibookingsaccomodations-production.up.railway.app/api/V1/status_booking/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'CANCELLED' })
        });
        Swal.fire('Cancelada', 'La reservación ha sido cancelada.', 'success');
        fetchBookings();
      } catch (error) {
        console.error('Error al cancelar:', error);
        Swal.fire('Error', 'No se pudo cancelar la reservación', 'error');
      }
    }
  };


  if (loading) return <p>Cargando reservaciones...</p>;

  return (
    <div className="reservations-page">
      <h1>Lista de Reservaciones</h1>
      <button onClick={CreateReservationPage}>+ Nueva Reservación</button>
      <button onClick={() => navigate(-1)} className="back-button">
        Volver al Dashboard
      </button>

      {bookings.length === 0 ? (
        <p>No hay reservaciones registradas.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Alojamiento</th>
              <th>Cliente</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.booking || 'N/A'}</td>
                <td>{booking.user || 'N/A'}</td>
                <td>{booking.check_in_date}</td>
                <td>{booking.check_out_date}</td>
                <td>{booking.status}</td>
                <td>
                  {booking.status !== 'CANCELLED' && (
                    <button onClick={() => handleCancel(booking.id)}>Cancelar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ReservationsPage;
