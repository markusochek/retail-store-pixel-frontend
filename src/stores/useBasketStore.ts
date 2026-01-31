import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BasketStore {
  count: number;
  increment: () => void;
  decrement: () => void;
  setCount: (count: number) => void;
}

export const useBasketStore = create<BasketStore>()(
  persist(
    set => ({
      count: 0,
      increment: () => set(state => ({ count: state.count + 1 })),
      decrement: () => set(state => ({ count: Math.max(0, state.count - 1) })),
      setCount: count => set({ count }),
    }),
    {
      name: 'basket-storage',
    }
  )
);
