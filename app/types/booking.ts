export type Barber = {
  name: string;
  description: string;
  followers: string;
  address: string;
  rating: number;
  imageGradient: string;
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
