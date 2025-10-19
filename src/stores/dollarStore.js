import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useDollarStore = create(
  persist(
    (set) => ({
      dolarPrice: 0,
      setDolarPrice: (price) => set({ dolarPrice: Number(price) }),
    }),
    {
      name: 'dollar-storage',
    }
  )
);

export default useDollarStore;
