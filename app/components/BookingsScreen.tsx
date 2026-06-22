import { LogoHeader } from "./LogoHeader";

export function BookingsScreen() {
  return (
    <div className="space-y-5">
      <div className="relative">
        <LogoHeader />
        <button
          aria-label="Notificaciones"
          className="absolute right-4 top-9 grid h-11 w-11 place-items-center rounded-full bg-white text-xl shadow-sm ring-1 ring-zinc-200 transition active:scale-95"
          type="button"
        >
          🔔
        </button>
      </div>

      <section className="space-y-4">
        <div className="flex items-end justify-between px-1">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#16A34A]">
              Tus turnos
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-zinc-950">
              Reservas
            </h1>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white px-5 py-10 text-center shadow-sm ring-1 ring-zinc-200">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-green-50 text-4xl ring-1 ring-green-100">
            🗓️
          </div>
          <h2 className="mt-5 text-2xl font-black tracking-tight text-zinc-950">
            Todavía no tenés reservas.
          </h2>
          <p className="mx-auto mt-2 max-w-xs text-sm font-semibold leading-6 text-zinc-500">
            Cuando reserves un turno aparecerá aquí.
          </p>
        </div>
      </section>
    </div>
  );
}
