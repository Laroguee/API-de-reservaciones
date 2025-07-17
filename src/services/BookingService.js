import axios from 'axios';

const BASE_URL = 'https://apibookingsaccomodations-production.up.railway.app/api/V1';

export async function getBookings(token) {
  const response = await axios.get(`${BASE_URL}/bookings`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
}

export async function createBooking(token, data) {
  const response = await axios.post(`${BASE_URL}/booking`, data, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
}

export async function cancelBooking(token, id) {
  const response = await axios.patch(`${BASE_URL}/status_booking/${id}`, null, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
}

export async function checkAvailability(token, accommodationId, startDate, endDate) {
  const response = await axios.get(`${BASE_URL}/bookings/calendar/${accommodationId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    },
    params: {
      start_date: startDate,
      end_date: endDate
    }
  });
  return response.data;
}
