"use client";

import Image from "next/image";
import { ClipcutLogo } from "./ClipcutLogo";

export const APP_STORE_URL = "#app-store";
export const GOOGLE_PLAY_URL = "#google-play";

type StoreLink = {
  href: string;
  image: string;
  label: string;
};

const defaultStoreLinks: StoreLink[] = [
  {
    href: APP_STORE_URL,
    image: "/app-store.svg",
    label: "App Store",
  },
  {
    href: GOOGLE_PLAY_URL,
    image: "/google-play.svg",
    label: "Google Play",
  },
];

function isRealUrl(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}

type StoreBadgesProps = {
  appStoreHref?: string;
  googlePlayHref?: string;
};

export function StoreBadges({
  appStoreHref = APP_STORE_URL,
  googlePlayHref = GOOGLE_PLAY_URL,
}: StoreBadgesProps) {
  const storeLinks = defaultStoreLinks.map((link) => ({
    ...link,
    href: link.label === "App Store" ? appStoreHref : googlePlayHref,
  }));

  return (
    <div className="mx-auto grid max-w-[13rem] justify-items-center gap-4">
      {storeLinks.map((link) => (
        <a
          aria-label={`Descargar en ${link.label}`}
          className="block w-40 transition active:scale-[0.98]"
          href={link.href}
          key={link.label}
          rel={isRealUrl(link.href) ? "noreferrer" : undefined}
          target={isRealUrl(link.href) ? "_blank" : undefined}
        >
          <Image
            alt={`Descargar en ${link.label}`}
            className="h-auto w-full object-contain drop-shadow-sm"
            height={96}
            src={link.image}
            width={320}
          />
        </a>
      ))}
    </div>
  );
}

export function BarberAppModal({ onClose, open }: { onClose: () => void; open: boolean }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/45 px-4 py-8 backdrop-blur-sm" role="presentation">
      <div
        aria-labelledby="barber-app-title"
        aria-modal="true"
        className="w-full max-w-sm rounded-[2rem] bg-white p-5 text-center shadow-2xl shadow-zinc-950/25 ring-1 ring-zinc-200/80"
        role="dialog"
      >
        <div className="flex justify-center">
          <ClipcutLogo className="h-16 w-auto object-contain" height={64} width={144} />
        </div>
        <h2 id="barber-app-title" className="mt-5 text-2xl font-black tracking-[-0.04em] text-zinc-950">
          Registrate como peluquero
        </h2>
        <p className="mt-3 text-sm font-bold leading-6 text-zinc-600">
          Los peluqueros deben usar la app móvil de Clipcut.
        </p>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Descargá la app para registrarte y administrar tu peluquería.
        </p>

        <div className="mt-6">
          <StoreBadges />
        </div>

        <button
          className="mt-3 h-12 w-full rounded-[1.05rem] bg-green-100 text-sm font-black text-green-700 transition active:scale-[0.98]"
          onClick={onClose}
          type="button"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
