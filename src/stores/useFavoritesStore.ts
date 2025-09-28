import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesStore {
  count: number;
  increment: () => void;
  decrement: () => void;
  setCount: (count: number) => void;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    set => ({
      count: 0,
      increment: () => set(state => ({ count: state.count + 1 })),
      decrement: () => set(state => ({ count: Math.max(0, state.count - 1) })),
      setCount: count => set({ count }),
    }),
    {
      name: 'favorites-storage',
    }
  )
);
