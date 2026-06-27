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
          <article className="relative overflow-hidden rounded-[1.4rem] bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.34),transparent_34%),radial-gradient(circle_at_92%_118%,rgba(15,23,42,0.18),transparent_38%),linear-gradient(135deg,rgba(255,255,255,0.18),rgba(255,255,255,0)_32%,rgba(15,23,42,0.08)_68%,rgba(255,255,255,0.12)),#3B82F6] p-2.5 shadow-[0_14px_30px_-24px_rgba(30,64,175,0.72),inset_0_1px_0_rgba(255,255,255,0.42),inset_0_-1px_0_rgba(30,64,175,0.22)] ring-[1.5px] ring-white/35 before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(115deg,transparent_16%,rgba(255,255,255,0.16)_35%,transparent_54%)] after:pointer-events-none after:absolute after:inset-px after:rounded-[1.35rem] after:shadow-[inset_0_0_18px_rgba(255,255,255,0.10)]">
            <h2 className="relative text-lg font-black tracking-[-0.03em] text-white">Para clientes</h2>
            <p className="relative mt-0.5 text-sm font-semibold leading-[1.15rem] text-white/90">
              Buscá peluqueros, elegí un horario y reservá en segundos.
            </p>
          </article>

          <article className="relative overflow-hidden rounded-[1.4rem] bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.32),transparent_34%),radial-gradient(circle_at_92%_118%,rgba(5,46,22,0.18),transparent_38%),linear-gradient(135deg,rgba(255,255,255,0.16),rgba(255,255,255,0)_32%,rgba(5,46,22,0.10)_68%,rgba(255,255,255,0.11)),#16A34A] p-2.5 shadow-[0_14px_30px_-24px_rgba(21,128,61,0.74),inset_0_1px_0_rgba(255,255,255,0.40),inset_0_-1px_0_rgba(5,46,22,0.20)] ring-[1.5px] ring-white/35 before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(115deg,transparent_16%,rgba(255,255,255,0.15)_35%,transparent_54%)] after:pointer-events-none after:absolute after:inset-px after:rounded-[1.35rem] after:shadow-[inset_0_0_18px_rgba(255,255,255,0.09)]">
            <h2 className="relative text-lg font-black tracking-[-0.03em] text-white">Para peluqueros</h2>
            <p className="relative mt-0.5 text-sm font-semibold leading-[1.15rem] text-white/90">
              Gestioná horarios, servicios, reservas y pagos desde la app móvil.
            </p>
          </article>

          <section className="relative overflow-hidden rounded-[1.4rem] bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.44),transparent_34%),radial-gradient(circle_at_92%_118%,rgba(113,63,18,0.18),transparent_40%),linear-gradient(135deg,rgba(255,255,255,0.20),rgba(255,255,255,0)_34%,rgba(113,63,18,0.08)_70%,rgba(255,255,255,0.14)),#FACC15] px-2.5 py-3.5 text-zinc-950 shadow-[0_14px_30px_-24px_rgba(161,98,7,0.68),inset_0_1px_0_rgba(255,255,255,0.56),inset_0_-1px_0_rgba(113,63,18,0.16)] ring-[1.5px] ring-white/45 before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(115deg,transparent_16%,rgba(255,255,255,0.18)_35%,transparent_54%)] after:pointer-events-none after:absolute after:inset-px after:rounded-[1.35rem] after:shadow-[inset_0_0_18px_rgba(255,255,255,0.12)]">
            <h2 className="relative text-lg font-black tracking-[-0.03em]">Cómo funciona</h2>
            <ol className="relative mt-1 grid gap-1">
              {clientSteps.map((step, index) => (
                <li className="flex items-center gap-2.5 text-sm font-bold" key={step}>
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-zinc-950 text-[#FACC15]">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-[1.4rem] bg-white p-2.5 text-center shadow-sm ring-[1.5px] ring-zinc-200/70">
            <h2 className="text-base font-black tracking-[-0.03em] text-zinc-950">Descargá Clipcut para peluqueros</h2>
            <p className="mt-0.5 text-sm font-semibold leading-[1.15rem] text-zinc-500">
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
