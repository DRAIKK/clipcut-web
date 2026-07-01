import {
  getBookingStatusLabel,
  isCanceledBooking,
  isConfirmedBooking,
  isPendingCashRequest,
} from "../booking-rules";
import type { Barber, Booking } from "../types/booking";
import { LogoHeader } from "./LogoHeader";

type BookingsScreenProps = {
  bookings: Booking[];
  barbers?: Barber[];
  loading?: boolean;
};

type BookingSection = {
  title: string;
  bookings: Booking[];
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "CC";
}

function BookingCard({ booking, barbers }: { booking: Booking; barbers: Barber[] }) {
  const barber = barbers.find((candidate) => candidate.id === booking.barberId);
  const barberName = booking.barberName || barber?.name || "Peluquero Clipcut";

  return (
    <article className="flex gap-4 rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-zinc-200">
      <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full bg-zinc-100 text-sm font-black text-green-700 ring-1 ring-zinc-200">
        {barber?.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt={barberName} className="h-full w-full object-cover" src={barber.photoUrl} />
        ) : (
          barber?.initials || getInitials(barberName)
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-green-600">{getBookingStatusLabel(booking)}</p>
        <h2 className="mt-2 text-xl font-black text-zinc-950">{barberName}</h2>
        <p className="mt-1 text-sm font-black text-zinc-800">{booking.serviceName}</p>
        <p className="mt-2 text-sm font-bold text-zinc-500">{booking.dateTime || "Horario a confirmar"}</p>
      </div>
    </article>
  );
}

export function BookingsScreen({ bookings, barbers = [], loading = false }: BookingsScreenProps) {
  const sections: BookingSection[] = [
    { title: "Confirmadas", bookings: bookings.filter(isConfirmedBooking) },
    { title: "Solicitudes pendientes", bookings: bookings.filter(isPendingCashRequest) },
    { title: "Canceladas / rechazadas", bookings: bookings.filter(isCanceledBooking) },
  ];
  const hasBookings = sections.some((section) => section.bookings.length > 0);

  return (
    <div className="space-y-5">
      <LogoHeader />

      <section className="space-y-4">
        <div className="px-1 text-center">
          <h1 className="text-3xl font-black tracking-tight text-zinc-950">Mis reservas</h1>
        </div>

        {loading ? (
          <div className="rounded-[2rem] bg-white px-5 py-14 text-center shadow-sm ring-1 ring-zinc-200">
            <p className="mx-auto max-w-xs text-base font-semibold leading-7 text-zinc-500">Cargando reservas...</p>
          </div>
        ) : null}

        {!loading && !hasBookings ? (
          <div className="rounded-[2rem] bg-white px-5 py-14 text-center shadow-sm ring-1 ring-zinc-200">
            <p className="mx-auto max-w-xs text-base font-semibold leading-7 text-zinc-500">
              Todavía no tenés reservas para mostrar.
            </p>
          </div>
        ) : null}

        {!loading && sections.map((section) => (
          section.bookings.length > 0 ? (
            <div className="space-y-3" key={section.title}>
              <h2 className="px-1 text-sm font-black uppercase tracking-[0.18em] text-zinc-900">{section.title}</h2>
              {section.bookings.map((booking) => <BookingCard barbers={barbers} booking={booking} key={booking.id} />)}
            </div>
          ) : null
        ))}
      </section>
    </div>
  );
}
