import type { Barber } from "../types/booking";

type BarberHeroProps = {
  barber: Barber;
  onReserve: () => void;
};

export function BarberHero({ barber, onReserve }: BarberHeroProps) {
  return (
    <section className="overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-green-950/10 ring-1 ring-zinc-200/70">
      <div
        className={`relative h-80 bg-gradient-to-br ${barber.imageGradient} p-5 text-white`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.35),transparent_28%),linear-gradient(to_top,rgba(0,0,0,0.7),transparent_55%)]" />
        <div className="relative flex items-center justify-between">
          <span className="rounded-full bg-white/20 px-4 py-2 text-xs font-bold backdrop-blur-md">
            Clipcut Pro
          </span>
          <span className="rounded-full bg-black/30 px-4 py-2 text-xs font-bold backdrop-blur-md">
            ★ {barber.rating}
          </span>
        </div>
        <div className="absolute bottom-5 left-5 right-5">
          <div className="mb-4 h-24 w-24 rounded-[2rem] border-4 border-white/70 bg-white/20 shadow-xl backdrop-blur-md" />
          <h1 className="text-4xl font-black tracking-tight">{barber.name}</h1>
          <p className="mt-2 max-w-sm text-sm leading-6 text-white/85">
            {barber.description}
          </p>
        </div>
      </div>
      <div className="space-y-5 p-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-3xl bg-green-50 p-4">
            <p className="text-2xl font-black text-zinc-950">{barber.followers}</p>
            <p className="text-xs font-semibold text-zinc-500">seguidores</p>
          </div>
          <div className="rounded-3xl bg-zinc-100 p-4">
            <p className="text-2xl font-black text-zinc-950">Hoy</p>
            <p className="text-xs font-semibold text-zinc-500">turnos disponibles</p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-3xl bg-zinc-50 p-4 text-sm font-semibold text-zinc-700">
          <span className="text-lg">📍</span>
          <span>{barber.address}</span>
        </div>
        <button
          className="h-14 w-full rounded-2xl bg-green-600 text-base font-black text-white shadow-xl shadow-green-600/25 transition duration-300 hover:-translate-y-0.5 hover:bg-green-700 active:scale-[0.98]"
          onClick={onReserve}
          type="button"
        >
          Reservar
        </button>
      </div>
    </section>
  );
}
