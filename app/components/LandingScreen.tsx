"use client";

import { ClipcutLogo } from "./ClipcutLogo";

type LandingScreenProps = {
  onBarberClick: () => void;
  onPrivacy: () => void;
  onUseClipcut: () => void;
};

const clientSteps = ["Buscá un peluquero", "Elegí horario y servicio", "Confirmá tu reserva"];

export function LandingScreen({ onPrivacy, onUseClipcut }: LandingScreenProps) {
  return (
    <main className="min-h-dvh bg-zinc-100 px-3 py-4 text-zinc-950">
      <div className="mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-[420px] flex-col overflow-hidden rounded-[2.25rem] bg-white shadow-2xl shadow-zinc-950/10 ring-1 ring-zinc-200/80">
        <section className="flex min-h-[calc(100dvh-2rem)] flex-col px-4 pb-4 pt-5">
          <header className="flex shrink-0 items-center justify-center pb-3">
            <ClipcutLogo className="h-12 w-auto object-contain" height={48} priority width={108} />
          </header>

          <div className="grid flex-1 grid-cols-[55%_45%] items-center gap-0 overflow-hidden">
            <div className="relative z-10 flex min-w-0 flex-col justify-center pr-1">
              <h1 className="text-[clamp(2.25rem,12.1vw,3.25rem)] font-black leading-[0.88] tracking-[-0.075em] text-zinc-950">
                <span className="block">Gestioná tu</span>
                <span className="block">peluquería</span>
                <span className="block text-[#16A34A]">desde tu celular</span>
              </h1>

              <p className="mt-4 max-w-[12.5rem] text-[0.8rem] font-semibold leading-5 text-zinc-500">
                Reservas, horarios, servicios y pagos en una experiencia simple para tu peluquería.
              </p>

              <div className="mt-5 flex items-center gap-2">
                <button
                  className="h-11 rounded-[1rem] bg-[#16A34A] px-4 text-[0.82rem] font-black text-white shadow-xl shadow-green-600/25 transition hover:bg-[#138a3f] active:scale-[0.98]"
                  onClick={onUseClipcut}
                  type="button"
                >
                  Ir a Clipcut
                </button>
                <button
                  className="h-9 rounded-[0.9rem] bg-zinc-950 px-3 text-[0.7rem] font-black text-white shadow-lg shadow-zinc-950/15 transition hover:bg-zinc-800 active:scale-[0.98]"
                  onClick={onPrivacy}
                  type="button"
                >
                  Privacidad
                </button>
              </div>
            </div>

            <div className="flex h-full min-w-0 items-center justify-end overflow-visible">
              <img
                alt="Vista previa de Clipcut en celular"
                className="h-[min(74dvh,35rem)] w-[132%] max-w-none object-contain object-right"
                src="/landing-phone.png"
              />
            </div>
          </div>
        </section>

        <section className="grid gap-3 bg-zinc-50 px-4 py-5">
          <article className="rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-zinc-200/70">
            <h2 className="text-lg font-black tracking-[-0.03em] text-zinc-950">Para clientes</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-zinc-500">
              Buscá peluqueros, elegí un horario y reservá en segundos.
            </p>
          </article>

          <article className="rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-zinc-200/70">
            <h2 className="text-lg font-black tracking-[-0.03em] text-zinc-950">Para peluqueros</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-zinc-500">
              Gestioná horarios, servicios, reservas y pagos desde la app móvil.
            </p>
          </article>

          <section className="rounded-[1.5rem] bg-zinc-950 p-5 text-white shadow-xl shadow-zinc-950/10">
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
        </section>

        <footer className="flex flex-col items-center gap-2 bg-white px-4 py-5 text-xs font-bold text-zinc-500">
          <button className="transition hover:text-[#16A34A]" onClick={onPrivacy} type="button">
            Política de privacidad
          </button>
          <a className="transition hover:text-[#16A34A]" href="mailto:soporte@clipcutapp.com">Contacto</a>
        </footer>
      </div>
    </main>
  );
}
