import { create } from 'zustand';
import type { LocationCoords } from '@/lib/types';

type LocationStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'error';

interface LocationState {
  coords: LocationCoords | null;
  city: string | null;
  status: LocationStatus;
  error: string | null;
  isLocating: boolean;
  setCoords: (coords: LocationCoords) => void;
  setStatus: (status: LocationStatus) => void;
  setError: (error: string | null) => void;
  requestLocation: () => void;
  updateLocation: () => void;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  coords: null,
  city: null,
  status: 'idle',
  error: null,
  isLocating: false,
  setCoords: (coords) => set({ coords, status: 'granted', error: null }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error, status: 'error' }),
  requestLocation: () => {
    get().updateLocation();
  },
  updateLocation: () => {
    if (!navigator.geolocation) {
      set({ error: 'Geolocation is not supported', status: 'error' });
      return;
    }

    set({ status: 'requesting', isLocating: true });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        set({ coords, status: 'granted', error: null });

        try {
          const res = await fetch('/api/location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(coords),
          });
          const data = await res.json();
          if (data.city) {
            set({ city: data.city });
          }
        } catch (e) {
          console.error(e);
        } finally {
          set({ isLocating: false });
        }
      },
      (err) => {
        // Fallback to default location (Koramangala, Bangalore) so the map doesn't get stuck loading forever
        const fallbackCoords = {
          latitude: 12.9352,
          longitude: 77.6245,
        };
        set({ 
          coords: fallbackCoords, 
          city: 'Koramangala, Bangalore', 
          status: 'granted', 
          error: null, 
          isLocating: false 
        });
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }
}));
