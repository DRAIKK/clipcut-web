"use client";

import { ClipcutLogo } from "./ClipcutLogo";

type LandingScreenProps = {
  onBarberClick: () => void;
  onUseClipcut: () => void;
};

const clientSteps = ["Buscá un peluquero", "Elegí horario y servicio", "Confirmá tu reserva"];

export function LandingScreen({ onUseClipcut }: LandingScreenProps) {
  return (
    <main className="min-h-dvh overflow-hidden bg-white px-4 py-5 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] w-full max-w-7xl flex-col">
        <header className="flex items-center justify-between gap-4 py-2">
          <ClipcutLogo className="h-14 w-auto object-contain sm:h-16" height={64} priority width={144} />
          <button
            className="h-11 rounded-full bg-[#16A34A] px-5 text-sm font-black text-white shadow-lg shadow-green-600/20 transition hover:bg-[#138a3f] active:scale-[0.98] sm:h-12 sm:px-6 sm:text-base"
            onClick={onUseClipcut}
            type="button"
          >
            Usar Clipcut
          </button>
        </header>

        <section className="grid flex-1 grid-cols-[minmax(0,0.5fr)_minmax(0,0.5fr)] items-center gap-3 py-5 sm:gap-6 sm:py-8 md:gap-10 lg:gap-16 lg:py-12">
          <div className="flex h-full max-w-2xl flex-col justify-center text-left">
            <h1 className="text-[clamp(2.25rem,11.8vw,5.75rem)] font-black leading-[0.86] tracking-[-0.075em] text-zinc-950 md:text-[clamp(4.75rem,7vw,7.8rem)]">
              <span className="block whitespace-nowrap">Gestioná tu</span>
              <span className="block whitespace-nowrap">peluquería</span>
              <span className="block whitespace-nowrap text-[#16A34A]">desde tu celular</span>
            </h1>

            <button
              className="mt-7 h-13 w-fit rounded-[1.1rem] bg-[#16A34A] px-6 text-sm font-black text-white shadow-xl shadow-green-600/25 transition hover:bg-[#138a3f] active:scale-[0.98] sm:mt-9 sm:h-14 sm:px-8 sm:text-base"
              onClick={onUseClipcut}
              type="button"
            >
              Ir a Clipcut
            </button>
          </div>

          <div className="flex h-full min-h-[calc(100dvh-13rem)] items-center justify-end sm:min-h-[32rem] md:min-h-[38rem] lg:min-h-[44rem]">
            <img
              alt="Vista previa de Clipcut en celular"
              className="h-[min(72vh,42rem)] min-h-[24rem] w-full object-contain object-right sm:h-[min(76vh,46rem)] lg:h-[min(78vh,50rem)]"
              src="/clipcut-phone.png"
            />
          </div>
        </section>

        <div className="mx-auto grid w-full max-w-md gap-4 pb-10 text-left md:max-w-5xl md:grid-cols-3">
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

        <footer className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pb-2 text-xs font-bold text-zinc-500">
          <a className="transition hover:text-[#16A34A]" href="/terms">Términos y condiciones</a>
          <a className="transition hover:text-[#16A34A]" href="/privacy">Política de privacidad</a>
          <a className="transition hover:text-[#16A34A]" href="mailto:soporte@clipcutapp.com">Contacto</a>
        </footer>
      </div>
    </main>
  );
}
