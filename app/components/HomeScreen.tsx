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
        <div className="rounded-[2rem] bg-white p-4 shadow-sm ring-1 ring-zinc-200">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald-400 via-green-600 to-zinc-950 text-lg font-black text-white shadow-lg shadow-green-950/15 ring-4 ring-zinc-50">
              MA
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#16A34A]">
                Reserva realizada
              </p>
              <h3 className="mt-1 truncate text-xl font-black tracking-tight text-zinc-950">
                Mateo Alvarez
              </h3>
              <div className="mt-2 flex items-center gap-1 text-2xl leading-none text-amber-400">
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
              </div>
            </div>
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-green-50 text-xl font-black text-[#16A34A] ring-1 ring-green-100">
              ✓
            </div>
          </div>

          <button
            className="mt-5 h-14 w-full rounded-2xl bg-[#16A34A] font-black text-white shadow-xl shadow-green-600/25 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:shadow-none"
            disabled={!barbers[0]}
            onClick={() => {
              if (barbers[0]) onSelectBarber(barbers[0]);
            }}
            type="button"
          >
            Ver perfil
          </button>
        </div>
      </section>
    </div>
  );
}
