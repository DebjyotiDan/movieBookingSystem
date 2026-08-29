import { create } from 'zustand';
import { Movie, Show, Seat } from '@/types';

interface BookingState {
  selectedMovie: Movie | null;
  selectedShow: Show | null;
  selectedSeats: Seat[];
  step: 'SELECT_SEATS' | 'REVIEW' | 'PAYMENT' | 'SUCCESS';
  taxRate: number;
  convenienceFeePerTicket: number;

  setSelectedMovie: (movie: Movie | null) => void;
  setSelectedShow: (show: Show | null) => void;
  toggleSeat: (seat: Seat) => void;
  clearSeats: () => void;
  setStep: (step: BookingState['step']) => void;
  getTicketSubtotal: () => number;
  getConvenienceFee: () => number;
  getTaxAmount: () => number;
  getTotalAmount: () => number;
  resetBooking: () => void;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  selectedMovie: null,
  selectedShow: null,
  selectedSeats: [],
  step: 'SELECT_SEATS',
  taxRate: 0.18, // 18% GST
  convenienceFeePerTicket: 25, // INR 25 per seat

  setSelectedMovie: (movie) => set({ selectedMovie: movie }),
  setSelectedShow: (show) => set({ selectedShow: show, selectedSeats: [] }),

  toggleSeat: (seat) =>
    set((state) => {
      const exists = state.selectedSeats.some((s) => s.id === seat.id);
      if (exists) {
        return {
          selectedSeats: state.selectedSeats.filter((s) => s.id !== seat.id),
        };
      }
      // Maximum 10 seats per booking
      if (state.selectedSeats.length >= 10) {
        return state;
      }
      return {
        selectedSeats: [...state.selectedSeats, seat],
      };
    }),

  clearSeats: () => set({ selectedSeats: [] }),
  setStep: (step) => set({ step }),

  getTicketSubtotal: () => {
    const { selectedSeats } = get();
    return selectedSeats.reduce((acc, seat) => acc + (seat.price || 0), 0);
  },

  getConvenienceFee: () => {
    const { selectedSeats, convenienceFeePerTicket } = get();
    return selectedSeats.length * convenienceFeePerTicket;
  },

  getTaxAmount: () => {
    const subtotal = get().getTicketSubtotal();
    const fees = get().getConvenienceFee();
    return Math.round((subtotal + fees) * get().taxRate);
  },

  getTotalAmount: () => {
    return get().getTicketSubtotal() + get().getConvenienceFee() + get().getTaxAmount();
  },

  resetBooking: () =>
    set({
      selectedMovie: null,
      selectedShow: null,
      selectedSeats: [],
      step: 'SELECT_SEATS',
    }),
}));
