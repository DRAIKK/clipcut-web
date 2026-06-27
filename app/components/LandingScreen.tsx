"use client";

import Image from "next/image";
import { ClipcutLogo } from "./ClipcutLogo";

type LandingScreenProps = {
  onBarberClick: () => void;
  onPrivacy: () => void;
  onUseClipcut: () => void;
};

const clientSteps = ["Buscá un peluquero", "Elegí horario y servicio", "Confirmá tu reserva"];

const GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=com.clipcut.app&pcampaignid=web_share";
const APP_STORE_URL = "https://apps.apple.com/ar/app/clipcut/id6763927698";

const storeButtons = [
  {
    href: GOOGLE_PLAY_URL,
    image: "/google-play.svg",
    label: "Google Play",
  },
  {
    href: APP_STORE_URL,
    image: "/app-store.svg",
    label: "App Store",
  },
];

export function LandingScreen({ onPrivacy, onUseClipcut }: LandingScreenProps) {
  return (
    <main className="flex h-dvh justify-center overflow-y-auto bg-white px-3 text-zinc-950">
      <div className="flex h-dvh w-full max-w-[420px] flex-col overflow-y-auto bg-white sm:my-0 sm:rounded-[2.25rem]">
        <section className="flex flex-col justify-start gap-1 px-4 pb-0 pt-0.5">
          <header className="flex shrink-0 items-center justify-between gap-3 pb-0">
            <ClipcutLogo className="h-[4.6rem] w-auto object-contain" height={74} priority width={166} />
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                className="h-7 rounded-[0.75rem] bg-zinc-950 px-1.5 text-[0.64rem] font-black text-white shadow-lg shadow-zinc-950/15 transition hover:bg-zinc-800 active:scale-[0.98]"
                onClick={onPrivacy}
                type="button"
              >
                Privacidad
              </button>
              <button
                className="h-8 rounded-[0.8rem] bg-[#16A34A] px-2.5 text-[0.66rem] font-black text-white shadow-lg shadow-green-600/20 transition hover:bg-[#138a3f] active:scale-[0.98]"
                onClick={onUseClipcut}
                type="button"
              >
                Ir a Clipcut
              </button>
            </div>
          </header>

          <div className="grid grid-cols-[51%_49%] items-center gap-1.5 overflow-hidden py-1">
            <div className="relative z-10 flex min-w-0 flex-col justify-center pr-1">
              <h1 className="text-[clamp(1.38rem,7.1vw,1.9rem)] font-black leading-[0.92] tracking-[-0.07em] text-zinc-950">
                <span className="block">Gestioná tu</span>
                <span className="block">peluquería</span>
                <span className="block whitespace-nowrap text-[#16A34A]">desde tu celular</span>
              </h1>

              <p className="mt-0.5 max-w-[11rem] text-[0.7rem] font-semibold leading-[1.05rem] text-zinc-500">
                Reservas, horarios, servicios y pagos en una experiencia simple para tu peluquería.
              </p>
            </div>

            <div className="-mt-0.5 flex h-full min-w-0 items-center justify-end overflow-visible pl-1">
              <img
                alt="Vista previa de Clipcut en celular"
                className="h-[min(43.5dvh,20rem)] w-full max-w-none object-contain object-right"
                src="/clipcut-phone.png"
              />
            </div>
          </div>
        </section>

        <section className="grid gap-2 bg-white px-4 py-2">
          <article className="rounded-[1.4rem] bg-[linear-gradient(45deg,#121212_0%,#1B1B1B_100%)] p-2.5 shadow-[0_18px_45px_-22px_rgba(0,0,0,0.45),0_10px_24px_-20px_rgba(15,23,42,0.28)] ring-[0.9px] ring-[#000000]">
            <h2 className="text-lg font-black tracking-[-0.03em] text-[#16A34A]">Para clientes</h2>
            <p className="mt-0.5 text-sm font-semibold leading-[1.15rem] text-white">
              Buscá peluqueros, elegí un horario y reservá en segundos.
            </p>
          </article>

          <article className="rounded-[1.4rem] bg-[linear-gradient(45deg,#121212_0%,#1B1B1B_100%)] p-2.5 shadow-[0_18px_45px_-22px_rgba(0,0,0,0.45),0_10px_24px_-20px_rgba(15,23,42,0.28)] ring-[0.9px] ring-[#000000]">
            <h2 className="text-lg font-black tracking-[-0.03em] text-[#16A34A]">Para peluqueros</h2>
            <p className="mt-0.5 text-sm font-semibold leading-[1.15rem] text-white">
              Gestioná horarios, servicios, reservas y pagos desde la app móvil.
            </p>
          </article>

          <section className="rounded-[1.4rem] bg-[linear-gradient(45deg,#121212_0%,#1B1B1B_100%)] px-2.5 py-3.5 text-white shadow-[0_18px_45px_-22px_rgba(0,0,0,0.45),0_10px_24px_-20px_rgba(15,23,42,0.28)] ring-[0.9px] ring-[#000000]">
            <h2 className="text-lg font-black tracking-[-0.03em] text-[#16A34A]">Cómo funciona</h2>
            <ol className="mt-1 grid gap-1">
              {clientSteps.map((step, index) => (
                <li className="flex items-center gap-2.5 text-sm font-bold" key={step}>
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#16A34A] text-[#121212]">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-[1.4rem] bg-[linear-gradient(45deg,#121212_0%,#1B1B1B_100%)] p-2.5 text-center shadow-[0_18px_45px_-22px_rgba(0,0,0,0.45),0_10px_24px_-20px_rgba(15,23,42,0.28)] ring-[0.9px] ring-[#000000]">
            <h2 className="text-base font-black tracking-[-0.03em] text-[#16A34A]">Descargá Clipcut para peluqueros</h2>
            <p className="mt-0.5 text-sm font-semibold leading-[1.15rem] text-white">
              Gestioná tus horarios, reservas, clientes y pagos desde la aplicación oficial.
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-4">
              {storeButtons.map((button) => (
                <a
                  aria-label={`Descargar en ${button.label}`}
                  className="block shrink-0 transition active:scale-[0.98]"
                  href={button.href}
                  key={button.label}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Image
                    alt={`Descargar en ${button.label}`}
                    className="h-12 w-auto object-contain drop-shadow-sm"
                    height={108}
                    src={button.image}
                    width={360}
                  />
                </a>
              ))}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
