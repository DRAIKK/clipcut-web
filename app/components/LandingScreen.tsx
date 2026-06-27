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
                className="grid h-7 w-[3.7rem] place-items-center rounded-[0.75rem] bg-[linear-gradient(45deg,#232323_0%,#2C2C2C_100%)] px-0.5 text-center text-[0.52rem] font-black leading-none text-white shadow-lg shadow-zinc-950/15 transition hover:bg-[#2C2C2C] active:scale-[0.98]"
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

          <div className="-mt-7 grid grid-cols-[51%_49%] items-center gap-1.5 overflow-hidden py-1">
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

        <section className="relative grid flex-1 justify-items-center gap-2 bg-[#232323] px-4 pb-4 pt-4">
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute -top-14 left-0 h-14 w-full text-[#232323]"
            preserveAspectRatio="none"
            viewBox="0 0 420 56"
          >
            <path
              d="M0 36C48 12 88 4 132 16C178 29 204 55 252 42C305 27 330 0 420 14V56H0V36Z"
              fill="currentColor"
            />
          </svg>
          <article className="relative z-10 w-[90%] rounded-[1.4rem] bg-[linear-gradient(45deg,#232323_0%,#2C2C2C_100%)] p-[0.5625rem] shadow-[0_18px_45px_-22px_rgba(0,0,0,0.45),0_10px_24px_-20px_rgba(15,23,42,0.28)] ring-1 ring-white/5">
            <h2 className="text-[1.0125rem] font-black tracking-[-0.03em] text-[#16A34A]">Para clientes</h2>
            <p className="mt-0.5 text-[0.7875rem] font-semibold leading-[1.035rem] text-[#E5E5E5]">
              Buscá peluqueros, elegí un horario y reservá en segundos.
            </p>
          </article>

          <article className="relative z-10 w-[90%] rounded-[1.4rem] bg-[linear-gradient(45deg,#232323_0%,#2C2C2C_100%)] p-[0.5625rem] shadow-[0_18px_45px_-22px_rgba(0,0,0,0.45),0_10px_24px_-20px_rgba(15,23,42,0.28)] ring-1 ring-white/5">
            <h2 className="text-[1.0125rem] font-black tracking-[-0.03em] text-[#16A34A]">Para peluqueros</h2>
            <p className="mt-0.5 text-[0.7875rem] font-semibold leading-[1.035rem] text-[#E5E5E5]">
              Gestioná horarios, servicios, reservas y pagos desde la app móvil.
            </p>
          </article>

          <section className="relative z-10 w-[90%] rounded-[1.4rem] bg-[linear-gradient(45deg,#232323_0%,#2C2C2C_100%)] px-[0.5625rem] py-[0.7875rem] text-[#E5E5E5] shadow-[0_18px_45px_-22px_rgba(0,0,0,0.45),0_10px_24px_-20px_rgba(15,23,42,0.28)] ring-1 ring-white/5">
            <h2 className="text-[1.0125rem] font-black tracking-[-0.03em] text-[#16A34A]">Cómo funciona</h2>
            <ol className="mt-[0.225rem] grid gap-[0.225rem]">
              {clientSteps.map((step, index) => (
                <li className="flex items-center gap-[0.5625rem] text-[0.7875rem] font-bold" key={step}>
                  <span className="grid h-[1.35rem] w-[1.35rem] shrink-0 place-items-center rounded-full bg-[#16A34A] text-[#121212]">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="relative z-10 w-[90%] rounded-[1.4rem] bg-[linear-gradient(45deg,#232323_0%,#2C2C2C_100%)] p-[0.5625rem] text-center shadow-[0_18px_45px_-22px_rgba(0,0,0,0.45),0_10px_24px_-20px_rgba(15,23,42,0.28)] ring-1 ring-white/5">
            <h2 className="text-[0.9rem] font-black tracking-[-0.03em] text-[#16A34A]">Descargá Clipcut para peluqueros</h2>
            <p className="mt-0.5 text-[0.7875rem] font-semibold leading-[1.035rem] text-[#E5E5E5]">
              Gestioná tus horarios, reservas, clientes y pagos desde la aplicación oficial.
            </p>
            <div className="mt-[0.675rem] flex flex-wrap items-center justify-center gap-[0.9rem]">
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
                    className="h-[2.7rem] w-auto object-contain drop-shadow-sm"
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
