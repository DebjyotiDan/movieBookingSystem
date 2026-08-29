import { create } from 'zustand';

interface SeatLockState {
  lockExpiresAt: number | null; // timestamp in ms
  lockedSeatLabels: string[]; // labels currently held/locked
  isLocking: boolean;

  setLockTimer: (durationSeconds: number) => void;
  clearLockTimer: () => void;
  setLockedSeats: (seats: string[]) => void;
  setIsLocking: (loading: boolean) => void;
}

export const useSeatLockStore = create<SeatLockState>((set) => ({
  lockExpiresAt: null,
  lockedSeatLabels: [],
  isLocking: false,

  setLockTimer: (durationSeconds: number) =>
    set({
      lockExpiresAt: Date.now() + durationSeconds * 1000,
    }),

  clearLockTimer: () =>
    set({
      lockExpiresAt: null,
      lockedSeatLabels: [],
    }),

  setLockedSeats: (seats) => set({ lockedSeatLabels: seats }),
  setIsLocking: (loading) => set({ isLocking: loading }),
}));
