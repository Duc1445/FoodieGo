import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LocationState {
  lat: number;
  lng: number;
  address: string;
  setLocation: (lat: number, lng: number, address: string) => void;
}

// Default to Hai Chau, Da Nang
export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      lat: 16.0544,
      lng: 108.2022,
      address: 'Hai Chau, Da Nang',
      setLocation: (lat, lng, address) => set({ lat, lng, address }),
    }),
    {
      name: 'foodiego-location-storage',
    }
  )
);
