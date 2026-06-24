import type { Booking } from "../types/booking";
import { LogoHeader } from "./LogoHeader";

type BookingsScreenProps = {
  bookings: Booking[];
  loading?: boolean;
};

export function BookingsScreen({ bookings, loading = false }: BookingsScreenProps) {
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

        {!loading && bookings.length === 0 ? (
          <div className="rounded-[2rem] bg-white px-5 py-14 text-center shadow-sm ring-1 ring-zinc-200">
            <p className="mx-auto max-w-xs text-base font-semibold leading-7 text-zinc-500">
              Todavía no tenés reservas confirmadas.
            </p>
          </div>
        ) : null}

        {!loading && bookings.map((booking) => (
          <article className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-zinc-200" key={booking.id}>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-green-600">{booking.status}</p>
            <h2 className="mt-2 text-xl font-black text-zinc-950">{booking.serviceName}</h2>
            <p className="mt-2 text-sm font-bold text-zinc-500">{booking.dateTime || "Horario a confirmar"}</p>
            {booking.barberName ? <p className="mt-1 text-sm font-black text-zinc-800">{booking.barberName}</p> : null}
          </article>
        ))}
      </section>
    </div>
  );
}
