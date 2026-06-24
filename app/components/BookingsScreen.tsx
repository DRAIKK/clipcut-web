import { LogoHeader } from "./LogoHeader";

export function BookingsScreen() {
  return (
    <div className="space-y-5">
      <LogoHeader />

      <section className="space-y-4">
        <div className="px-1 text-center">
          <h1 className="text-3xl font-black tracking-tight text-zinc-950">Mis reservas</h1>
        </div>

        <div className="rounded-[2rem] bg-white px-5 py-14 text-center shadow-sm ring-1 ring-zinc-200">
          <p className="mx-auto max-w-xs text-base font-semibold leading-7 text-zinc-500">
            Todavía no tenés reservas confirmadas.
          </p>
        </div>
      </section>
    </div>
  );
}
