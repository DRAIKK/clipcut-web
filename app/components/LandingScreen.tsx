"use client";

import { ClipcutLogo } from "./ClipcutLogo";

type LandingScreenProps = {
  onBarberClick: () => void;
  onUseClipcut: () => void;
};

const clientSteps = ["Buscá un peluquero", "Elegí horario y servicio", "Confirmá tu reserva"];

export function LandingScreen({ onBarberClick, onUseClipcut }: LandingScreenProps) {
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

        <section className="grid flex-1 items-center gap-12 py-12 md:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)] md:gap-10 lg:gap-16 lg:py-16">
          <div className="max-w-2xl text-left">
            <h1 className="text-[clamp(2.55rem,13vw,5.75rem)] font-black leading-[0.88] tracking-[-0.075em] text-zinc-950 lg:text-[clamp(5rem,7vw,7.8rem)]">
              <span className="block whitespace-nowrap">Gestioná tu</span>
              <span className="block whitespace-nowrap">peluquería</span>
              <span className="block whitespace-nowrap text-[#16A34A]">desde tu celular</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg font-semibold leading-8 text-zinc-600 sm:text-xl sm:leading-9">
              La aplicación para peluqueros que les permite gestionar horarios, reservas, clientes y pagos desde un
              solo lugar.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                className="h-14 rounded-[1.15rem] bg-[#16A34A] px-8 text-base font-black text-white shadow-xl shadow-green-600/25 transition hover:bg-[#138a3f] active:scale-[0.98]"
                onClick={onUseClipcut}
                type="button"
              >
                Usar Clipcut
              </button>
              <button
                className="h-14 rounded-[1.15rem] border border-[#16A34A] bg-white px-8 text-base font-black text-[#16A34A] shadow-sm transition hover:bg-green-50 active:scale-[0.98]"
                onClick={onBarberClick}
                type="button"
              >
                Soy peluquero
              </button>
            </div>
          </div>

          <div className="flex min-h-[24rem] items-center justify-center md:min-h-[34rem] md:justify-end lg:min-h-[42rem]">
            <div className="relative flex h-[min(68vh,42rem)] min-h-[25rem] w-full max-w-[23rem] rotate-[5deg] items-center justify-center rounded-[2.75rem] bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 p-3 shadow-[0_3rem_6rem_rgba(15,23,42,0.24)] ring-1 ring-zinc-950/10 sm:max-w-[26rem] lg:max-w-[30rem]">
              <div className="absolute left-1/2 top-5 z-10 h-1.5 w-20 -translate-x-1/2 rounded-full bg-zinc-700" />
              <div className="grid h-full w-full place-items-center rounded-[2.25rem] bg-[linear-gradient(180deg,#f7fdf9_0%,#ffffff_48%,#dcfce7_100%)] p-8 text-center">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-[#16A34A]">Imagen PNG</p>
                  <p className="mt-4 text-2xl font-black tracking-[-0.04em] text-zinc-950">Reemplazá este espacio con tu celular</p>
                  <p className="mt-3 text-sm font-bold leading-6 text-zinc-500">Contenedor listo para una imagen vertical, inclinada y con sombra.</p>
                </div>
              </div>
              <img
                alt="Vista previa de Clipcut en celular"
                className="absolute inset-0 h-full w-full rounded-[2.75rem] object-contain"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
                src="/clipcut-phone.png"
              />
            </div>
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
