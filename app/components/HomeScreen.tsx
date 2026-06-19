import type { Barber } from "../types/booking";
import { BarberMiniCard } from "./BarberMiniCard";
import { LogoHeader } from "./LogoHeader";

type HomeScreenProps = {
  barbers: Barber[];
  onSearch: () => void;
  onSelectBarber: (barber: Barber) => void;
};

export function HomeScreen({ barbers, onSearch, onSelectBarber }: HomeScreenProps) {
  return (
    <div className="space-y-8">
      <LogoHeader />

      <section className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-[0.18em] text-zinc-900">
          Peluqueros cerca
        </h2>
        <div className="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
          {barbers.map((barber) => (
            <BarberMiniCard barber={barber} key={barber.id} onSelect={onSelectBarber} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-[0.18em] text-zinc-900">
          Clasifica tus peluqueros
        </h2>
        <div className="rounded-[2rem] bg-white p-6 text-center shadow-sm ring-1 ring-zinc-200">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-green-50 text-3xl">
            ✂
          </div>
          <h3 className="mt-5 text-2xl font-black tracking-tight text-zinc-950">
            Aún no reservaste
          </h3>
          <p className="mt-2 text-sm font-semibold text-zinc-500">
            Buscá peluqueros y reservá tu turno
          </p>
          <button
            className="mt-6 h-14 w-full rounded-2xl bg-green-600 font-black text-white shadow-xl shadow-green-600/25 transition active:scale-[0.98]"
            onClick={onSearch}
            type="button"
          >
            Buscar peluqueros
          </button>
        </div>
      </section>
    </div>
  );
}
