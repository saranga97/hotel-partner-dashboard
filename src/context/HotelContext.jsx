import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from './AuthContext';

const HotelContext = createContext();

export const HotelProvider = ({ children }) => {
  const { user } = useAuth();
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshHotels = useCallback(async () => {
    if (!user) {
      setHotels([]);
      setSelectedHotel(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await axiosInstance.get('/hotels/my-hotels');
      const fetched = res.data.hotels || [];
      setHotels(fetched);

      const savedId = localStorage.getItem('ceylonstay_selected_hotel_id');
      const saved = fetched.find((h) => h.hotel_id === savedId);
      const next = saved || fetched[0] || null;
      setSelectedHotel(next);
      if (next) {
        localStorage.setItem('ceylonstay_selected_hotel_id', next.hotel_id);
      } else {
        localStorage.removeItem('ceylonstay_selected_hotel_id');
      }
    } catch {
      setHotels([]);
      setSelectedHotel(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshHotels();
  }, [refreshHotels]);

  const selectHotel = useCallback((id) => {
    const hotel = hotels.find((h) => h.hotel_id === id);
    if (hotel) {
      setSelectedHotel(hotel);
      localStorage.setItem('ceylonstay_selected_hotel_id', id);
    }
  }, [hotels]);

  const removeHotel = useCallback((id) => {
    setHotels((prev) => {
      const next = prev.filter((h) => h.hotel_id !== id);
      if (selectedHotel?.hotel_id === id) {
        const fallback = next[0] || null;
        setSelectedHotel(fallback);
        if (fallback) {
          localStorage.setItem('ceylonstay_selected_hotel_id', fallback.hotel_id);
        } else {
          localStorage.removeItem('ceylonstay_selected_hotel_id');
        }
      }
      return next;
    });
  }, [selectedHotel]);

  return (
    <HotelContext.Provider value={{ hotels, selectedHotel, loading, selectHotel, removeHotel, refreshHotels }}>
      {children}
    </HotelContext.Provider>
  );
};

export const useHotel = () => useContext(HotelContext);
