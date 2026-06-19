export type Barber = {
  id: string;
  name: string;
  description: string;
  followers: string;
  address: string;
  rating: number;
  imageGradient: string;
  distance: string;
  initials: string;
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
};

export type Booking = {
  barberName: string;
  serviceName: string;
  dateTime: string;
  address: string;
  status: string;
};
