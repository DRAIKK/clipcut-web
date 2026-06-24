import type { Barber, Booking } from "../types/booking";
import { BarberMiniCard } from "./BarberMiniCard";
import { LogoHeader } from "./LogoHeader";

type HomeScreenProps = {
  barbers: Barber[];
  onSelectBarber: (barber: Barber) => void;
  onSearchBarbers: () => void;
  loading?: boolean;
  activeBooking?: Booking;
};

export function HomeScreen({
  barbers,
  loading = false,
  activeBooking,
  onSearchBarbers,
  onSelectBarber,
}: HomeScreenProps) {
  return (
    <div className="space-y-8">
      <LogoHeader />

      {activeBooking ? (
        <section className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-green-200">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-green-600">Tu próxima reserva</p>
          <h2 className="mt-2 text-xl font-black text-zinc-950">{activeBooking.serviceName}</h2>
          <p className="mt-2 text-sm font-bold text-zinc-500">{activeBooking.dateTime || "Horario a confirmar"}</p>
          {activeBooking.barberName ? <p className="mt-1 text-sm font-black text-zinc-800">{activeBooking.barberName}</p> : null}
        </section>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-[0.18em] text-zinc-900">
          Peluqueros cerca
        </h2>
        <div className="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
          {loading ? (
            <div className="h-44 w-36 shrink-0 rounded-[1.75rem] bg-white p-4 text-sm font-black text-zinc-400 shadow-sm ring-1 ring-zinc-200">
              Cargando...
            </div>
          ) : null}
          {!loading && barbers.length === 0 ? (
            <div className="h-44 w-36 shrink-0 rounded-[1.75rem] bg-white p-4 text-sm font-black text-zinc-400 shadow-sm ring-1 ring-zinc-200">
              No hay peluqueros disponibles.
            </div>
          ) : null}
          {barbers.map((barber) => (
            <BarberMiniCard barber={barber} key={barber.id} onSelect={onSelectBarber} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-[0.18em] text-zinc-900">
          Clasifica tus peluqueros
        </h2>
        <div className="rounded-[2rem] bg-white px-5 py-8 text-center shadow-sm ring-1 ring-zinc-200">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green-50 text-3xl ring-1 ring-green-100">
            ★
          </div>
          <h3 className="mt-5 text-xl font-black tracking-tight text-zinc-950">
            Todavía no tenés peluqueros para calificar.
          </h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-zinc-500">
            Cuando finalices una reserva, aparecerán aquí para que puedas calificarlos.
          </p>
          <button
            className="mt-5 h-12 rounded-full border border-green-200 bg-green-100 px-6 text-sm font-black text-green-700 transition active:scale-[0.98]"
            onClick={onSearchBarbers}
            type="button"
          >
            Buscar peluqueros
          </button>
        </div>
      </section>
    </div>
  );
}
