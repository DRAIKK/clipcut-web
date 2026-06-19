import type { Barber, Service, TimeSlot } from "../types/booking";

export const mockBarber: Barber = {
  name: "Mateo Alvarez",
  description:
    "Especialista en cortes modernos, fades limpios y perfilado de barba. Agenda tu turno en segundos y vive una experiencia premium.",
  followers: "12.8k",
  address: "Av. Palermo 1842, Buenos Aires",
  rating: 4.9,
  imageGradient: "from-emerald-400 via-green-600 to-zinc-950",
};

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
