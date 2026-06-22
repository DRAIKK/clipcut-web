import type { Barber } from "../types/booking";
import { BarberMiniCard } from "./BarberMiniCard";
import { LogoHeader } from "./LogoHeader";

type HomeScreenProps = {
  barbers: Barber[];
  onSelectBarber: (barber: Barber) => void;
  loading?: boolean;
};

export function HomeScreen({ barbers, loading = false, onSelectBarber }: HomeScreenProps) {
  return (
    <div className="space-y-8">
      <LogoHeader />

      <section className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-[0.18em] text-zinc-900">
          Peluqueros cerca
        </h2>
        <div className="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
          {loading ? (
            <div className="min-w-36 rounded-[1.75rem] bg-white p-4 text-sm font-black text-zinc-400 shadow-sm ring-1 ring-zinc-200">
              Cargando...
            </div>
          ) : null}
          {!loading && barbers.length === 0 ? (
            <div className="min-w-36 rounded-[1.75rem] bg-white p-4 text-sm font-black text-zinc-400 shadow-sm ring-1 ring-zinc-200">
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
        </div>
      </section>
    </div>
  );
}
