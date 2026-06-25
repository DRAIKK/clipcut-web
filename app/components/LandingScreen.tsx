"use client";

import { ClipcutLogo } from "./ClipcutLogo";

type LandingScreenProps = {
  onBarberClick: () => void;
  onUseClipcut: () => void;
};

const clientSteps = ["Buscá un peluquero", "Elegí horario y servicio", "Confirmá tu reserva"];

export function LandingScreen({ onBarberClick, onUseClipcut }: LandingScreenProps) {
  return (
    <main className="min-h-dvh bg-[linear-gradient(180deg,#f7fdf9_0%,#ffffff_42%,#f4f4f5_100%)] px-4 py-6 text-zinc-950">
      <div className="mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-md flex-col">
        <header className="flex justify-center pt-2">
          <ClipcutLogo className="h-20 w-auto object-contain" height={80} priority width={180} />
        </header>

        <section className="flex flex-1 flex-col justify-center py-8 text-center">
          <div className="rounded-[2.25rem] bg-white p-6 shadow-2xl shadow-green-950/10 ring-1 ring-zinc-200/70">
            <p className="mx-auto w-fit rounded-full bg-green-50 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#16A34A]">
              Turnos cerca tuyo
            </p>
            <h1 className="mt-5 text-4xl font-black tracking-[-0.06em] text-zinc-950">
              Reservá tu turno con peluqueros cerca
            </h1>
            <p className="mt-4 text-base font-semibold leading-7 text-zinc-600">
              Clipcut conecta clientes con peluqueros para reservar cortes, elegir horarios y pagar de forma simple.
            </p>

            <div className="mt-7 grid gap-3">
              <button
                className="h-14 rounded-[1.15rem] bg-[#16A34A] text-base font-black text-white shadow-xl shadow-green-600/25 transition active:scale-[0.98]"
                onClick={onUseClipcut}
                type="button"
              >
                Usar Clipcut
              </button>
              <button
                className="h-14 rounded-[1.15rem] border border-zinc-200 bg-white text-base font-black text-zinc-950 shadow-sm transition active:scale-[0.98]"
                onClick={onBarberClick}
                type="button"
              >
                Soy peluquero
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-4 text-left">
            <article className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-zinc-200/70">
              <h2 className="text-lg font-black tracking-[-0.03em] text-zinc-950">Para clientes</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-zinc-500">
                Buscá peluqueros, elegí un horario y reservá en segundos.
              </p>
            </article>

            <article className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-zinc-200/70">
              <h2 className="text-lg font-black tracking-[-0.03em] text-zinc-950">Para peluqueros</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-zinc-500">
                Gestioná horarios, servicios, reservas y pagos desde la app móvil.
              </p>
            </article>

            <section className="rounded-[1.75rem] bg-zinc-950 p-5 text-white shadow-xl shadow-zinc-950/10">
              <h2 className="text-lg font-black tracking-[-0.03em]">Cómo funciona</h2>
              <ol className="mt-4 grid gap-3">
                {clientSteps.map((step, index) => (
                  <li className="flex items-center gap-3 text-sm font-bold" key={step}>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#16A34A] text-white">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pb-2 text-xs font-bold text-zinc-500">
          <a className="transition hover:text-[#16A34A]" href="/terms">Términos y condiciones</a>
          <a className="transition hover:text-[#16A34A]" href="/privacy">Política de privacidad</a>
          <a className="transition hover:text-[#16A34A]" href="mailto:soporte@clipcutapp.com">Contacto</a>
        </footer>
      </div>
    </main>
  );
}
