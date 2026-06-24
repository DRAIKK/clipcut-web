export type PaymentMethodId = "transfer" | "cash";

export type PaymentMethod = {
  id: PaymentMethodId;
  label: string;
};

export type Barber = {
  id: string;
  name: string;
  description: string;
  followers: string;
  address: string;
  rating: number;
  ratingCount?: number;
  imageGradient: string;
  distance: string;
  initials: string;
  photoUrl?: string;
  paymentMethods?: PaymentMethod[];
};

export type Service = {
  id: string;
  name: string;
  duration: string;
  price: string;
  description: string;
};

export type TimeSlot = {
  id: string;
  label: string;
  available: boolean;
  day?: string;
  startTime?: string;
  endTime?: string;
};

export type BookingStatus = "pending_payment" | "cash_pending" | string;

export type Booking = {
  id: string;
  barberId: string;
  barberName?: string;
  serviceId?: string;
  serviceName: string;
  servicePrice?: number | string;
  slotId?: string;
  day?: string;
  startTime?: string;
  endTime?: string;
  dateTime: string;
  address?: string;
  status: BookingStatus;
  paymentMethod?: PaymentMethodId | string;
};
