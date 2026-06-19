import type { Barber } from "../types/booking";
import { BarberAvatar } from "./BarberAvatar";
import { LogoHeader } from "./LogoHeader";

type SearchScreenProps = {
  barbers: Barber[];
  onSelectBarber: (barber: Barber) => void;
};

export function SearchScreen({ barbers, onSelectBarber }: SearchScreenProps) {
  return (
    <div className="space-y-6">
      <LogoHeader />
      <div className="rounded-[1.6rem] bg-white px-5 py-4 shadow-sm ring-1 ring-zinc-200">
        <input
          className="w-full bg-transparent text-lg font-bold text-zinc-950 outline-none placeholder:text-zinc-400"
          placeholder="Buscar peluqueros..."
          type="search"
        />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['Ubicación', 'Precio', 'Todas'].map((chip) => (
          <button
            className="rounded-full bg-white px-5 py-3 text-sm font-black text-zinc-700 shadow-sm ring-1 ring-zinc-200 first:bg-green-600 first:text-white first:ring-green-600"
            key={chip}
            type="button"
          >
            {chip}
          </button>
        ))}
      </div>
      <section className="space-y-3">
        {barbers.map((barber) => (
          <button
            className="flex w-full items-center gap-4 rounded-[1.75rem] bg-white p-4 text-left shadow-sm ring-1 ring-zinc-200 transition active:scale-[0.99]"
            key={barber.id}
            onClick={() => onSelectBarber(barber)}
            type="button"
          >
            <BarberAvatar barber={barber} size="sm" />
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-lg font-black text-zinc-950">{barber.name}</h3>
              <p className="mt-1 text-sm font-bold text-green-600">Ver perfil →</p>
            </div>
            <p className="text-sm font-black text-zinc-400">{barber.distance}</p>
          </button>
        ))}
      </section>
    </div>
  );
}
