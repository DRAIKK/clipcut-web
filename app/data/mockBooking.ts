import type { Barber, Booking, Service, TimeSlot } from "../types/booking";

export const mockBarber: Barber = {
  id: "mateo-alvarez",
  name: "Mateo Alvarez",
  description:
    "Especialista en cortes modernos, fades limpios y perfilado de barba. Agenda tu turno en segundos y vive una experiencia premium.",
  followers: "12.8k",
  address: "Av. Palermo 1842, Buenos Aires",
  rating: 4.9,
  ratingCount: 128,
  imageGradient: "from-emerald-400 via-green-600 to-zinc-950",
  distance: "1.2 km",
  distanceKm: 1.2,
  coordinates: { latitude: -34.5875, longitude: -58.4245 },
  initials: "MA",
};

export const nearbyBarbers: Barber[] = [
  mockBarber,
  {
    id: "nico-fades",
    name: "Nico Fades",
    description: "Cortes urbanos, perfilado y diseños con terminación prolija.",
    followers: "8.4k",
    address: "Gorriti 5120, Palermo",
    rating: 4.8,
    imageGradient: "from-lime-300 via-emerald-500 to-green-900",
    distance: "0.9 km",
    distanceKm: 0.85,
    coordinates: { latitude: -34.5829, longitude: -58.4332 },
    initials: "NF",
  },
  {
    id: "tomi-barber",
    name: "Tomi Barber",
    description: "Barbería moderna para cortes clásicos, fades y barba.",
    followers: "6.1k",
    address: "Honduras 4211, Buenos Aires",
    rating: 4.7,
    imageGradient: "from-green-300 via-teal-600 to-zinc-900",
    distance: "2.4 km",
    distanceKm: 2.4,
    coordinates: { latitude: -34.5962, longitude: -58.4218 },
    initials: "TB",
  },
];

export const searchBarbers: Barber[] = [
  ...nearbyBarbers,
  {
    id: "leo-style",
    name: "Leo Style",
    description: "Color, tijera y cortes con asesoría de imagen.",
    followers: "9.7k",
    address: "Serrano 1444, Palermo Soho",
    rating: 4.9,
    imageGradient: "from-emerald-200 via-green-500 to-black",
    distance: "3.1 km",
    distanceKm: 3.1,
    coordinates: { latitude: -34.5881, longitude: -58.4351 },
    initials: "LS",
  },
];

export const mockServices: Service[] = [
  {
    id: "fade-premium",
    name: "Corte fade premium",
    duration: "45 min",
    price: "$8.500",
    description: "Degradado, lavado rápido y styling final.",
  },
  {
    id: "barba-clasica",
    name: "Barba clásica",
    duration: "25 min",
    price: "$4.200",
    description: "Perfilado con navaja y terminación precisa.",
  },
  {
    id: "combo-total",
    name: "Corte + barba",
    duration: "70 min",
    price: "$11.900",
    description: "Servicio completo para renovar tu look.",
  },
];

export const mockTimeSlots: TimeSlot[] = [
  { id: "slot-1000", label: "10:00", available: true },
  { id: "slot-1030", label: "10:30", available: true },
  { id: "slot-1100", label: "11:00", available: false },
  { id: "slot-1130", label: "11:30", available: true },
  { id: "slot-1200", label: "12:00", available: true },
  { id: "slot-1630", label: "16:30", available: true },
  { id: "slot-1700", label: "17:00", available: false },
  { id: "slot-1730", label: "17:30", available: true },
];

export const mockActiveBooking: Booking = {
  id: "booking-mateo-active",
  barberId: mockBarber.id,
  barberName: "Mateo Alvarez",
  serviceName: "Corte fade premium",
  dateTime: "Hoy, 16:30 hs",
  address: "Av. Palermo 1842, Buenos Aires",
  status: "Confirmada",
};
