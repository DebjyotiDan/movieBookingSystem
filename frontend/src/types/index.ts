export type Role = 'USER' | 'ADMIN' | 'THEATRE_MANAGER';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  avatarUrl?: string;
  createdAt: string;
}

export interface Movie {
  id: string;
  title: string;
  synopsis: string;
  posterUrl: string;
  backdropUrl?: string;
  trailerUrl?: string;
  genres: string[];
  languages: string[];
  durationMinutes: number;
  releaseDate: string;
  rating?: number;
  voteCount?: number;
  status: 'NOW_SHOWING' | 'COMING_SOON' | 'ARCHIVED';
  cast?: Array<{ name: string; role: string; profileUrl?: string }>;
  director?: string;
}

export interface Theatre {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  amenities: string[];
  latitude?: number;
  longitude?: number;
}

export interface Screen {
  id: string;
  theatreId: string;
  name: string;
  screenType: 'STANDARD' | 'IMAX' | '4DX' | 'DOLBY_ATMOS';
  totalSeats: number;
  seatLayoutSchema?: Record<string, unknown>;
}

export interface Show {
  id: string;
  movieId: string;
  screenId: string;
  theatreId: string;
  startTime: string;
  endTime: string;
  language: string;
  format: '2D' | '3D' | 'IMAX_2D' | 'IMAX_3D' | '4DX';
  pricing: {
    STANDARD: number;
    PREMIUM: number;
    VIP: number;
  };
  movie?: Movie;
  theatre?: Theatre;
  screen?: Screen;
}

export type SeatTier = 'STANDARD' | 'PREMIUM' | 'VIP';
export type SeatStatus = 'AVAILABLE' | 'LOCKED' | 'BOOKED' | 'UNAVAILABLE';

export interface Seat {
  id: string;
  showId: string;
  row: string;
  number: number;
  seatLabel: string; // e.g. "A5"
  tier: SeatTier;
  price: number;
  status: SeatStatus;
  lockedByUserId?: string;
  lockExpiresAt?: string;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REFUNDED';

export interface Booking {
  id: string;
  bookingCode: string;
  userId: string;
  showId: string;
  totalAmount: number;
  taxAmount: number;
  convenienceFee: number;
  status: BookingStatus;
  qrCodeUrl?: string;
  seats: Seat[];
  show: Show;
  payment?: Payment;
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: 'CREATED' | 'CAPTURED' | 'FAILED' | 'REFUNDED';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentMethod?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}
