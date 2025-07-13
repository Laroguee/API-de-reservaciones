import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { 
  getAccommodations, 
  createAccommodation, 
  updateAccommodation, 
  deleteAccommodation as deleteAccommodationService 
} from '../services/AccommodationService';

export const AccommodationContext = createContext();

export const AccommodationProvider = ({ children }) => {
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useContext(AuthContext);

  const fetchAccommodations = async () => {
    try {
      setLoading(true);
      const data = await getAccommodations();
      setAccommodations(data);
    } catch (error) {
      console.error('Error fetching accommodations:', error);
    } finally {
      setLoading(false);
    }
  };

  const addAccommodation = async (data) => {
    try {
      const newAccommodation = await createAccommodation(data);
      setAccommodations([...accommodations, newAccommodation]);
      return true;
    } catch (error) {
      console.error('Error adding accommodation:', error);
      return false;
    }
  };

  const editAccommodation = async (id, data) => {
    try {
      const updatedAccommodation = await updateAccommodation(id, data);
      setAccommodations(accommodations.map(acc => 
        acc.id === id ? updatedAccommodation : acc
      ));
      return true;
    } catch (error) {
      console.error('Error updating accommodation:', error);
      return false;
    }
  };

  const removeAccommodation = async (id) => {
    const success = await deleteAccommodationService(id);
    if (success) {
      setAccommodations(accommodations.filter(acc => acc.id !== id));
    }
    return success;
  };

  useEffect(() => {
    if (token) {
      fetchAccommodations();
    }
  }, [token]);

  return (
    <AccommodationContext.Provider
      value={{
        accommodations,
        loading,
        fetchAccommodations,
        addAccommodation,
        editAccommodation,
        removeAccommodation,
      }}
    >
      {children}
    </AccommodationContext.Provider>
  );
};

export const useAccommodation = () => {
  const context = useContext(AccommodationContext);
  if (!context) {
    throw new Error('useAccommodation must be used within an AccommodationProvider');
  }
  return context;
};
