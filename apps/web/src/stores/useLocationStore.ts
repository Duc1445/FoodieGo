import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LocationState {
  lat: number;
  lng: number;
  address: string;
  setLocation: (lat: number, lng: number, address: string) => void;
}

// Default to District 1, HCMC
export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      lat: 10.7769,
      lng: 106.7009,
      address: 'District 1, Ho Chi Minh City',
      setLocation: (lat, lng, address) => set({ lat, lng, address }),
    }),
    {
      name: 'foodiego-location-storage',
    }
  )
);
