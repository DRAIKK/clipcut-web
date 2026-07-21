"use client";

import { StoreBadges } from "./BarberAppModal";
import { ClipcutLogo } from "./ClipcutLogo";

const APP_STORE_URL = "https://apps.apple.com/ar/app/clipcut/id6763927698";
const GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=com.clipcut.app&pcampaignid=web_share";

type AccessRequiredModalProps = {
  open: boolean;
  onClose: () => void;
  onContinueOnWeb: () => void;
};

export function AccessRequiredModal({ open, onClose, onContinueOnWeb }: AccessRequiredModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/55 p-3 backdrop-blur-sm animate-in fade-in duration-300 sm:items-center sm:p-6">
      <section aria-labelledby="access-required-title" aria-modal="true" className="relative w-full max-w-md rounded-[2rem] bg-zinc-50 p-5 text-center shadow-2xl animate-in slide-in-from-bottom-8 duration-300 sm:rounded-[2.25rem] sm:p-7" role="dialog">
        <button aria-label="Cerrar modal" className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-zinc-100 text-2xl font-black leading-none text-zinc-500 transition hover:bg-zinc-200 sm:right-7 sm:top-7" onClick={onClose} type="button">
          ×
        </button>

        <div className="flex justify-center">
          <ClipcutLogo className="h-14 w-auto object-contain" height={56} width={126} />
        </div>
        <h2 id="access-required-title" className="mt-5 text-2xl font-black tracking-tight text-zinc-950">Continuá en Clipcut</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm font-semibold leading-6 text-zinc-500">
          Iniciá sesión para reservar turnos, seguir peluqueros y explorar más.
        </p>

        <button className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#16A34A] font-black text-white shadow-xl shadow-green-600/25 transition active:scale-[0.98]" onClick={onContinueOnWeb} type="button">
          <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M3 12h18M12 3c2.1 2.4 3.2 5.4 3.2 9S14.1 18.6 12 21c-2.1-2.4-3.2-5.4-3.2-9S9.9 5.4 12 3Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
          <span>Seguir en web</span>
        </button>

        <div className="mt-6 border-t border-zinc-200 pt-5">
          <p className="text-sm font-bold text-zinc-500">También podés usar Clipcut desde tu celular.</p>
          <div className="mt-3">
            <StoreBadges appStoreHref={APP_STORE_URL} googlePlayHref={GOOGLE_PLAY_URL} />
          </div>
        </div>
      </section>
    </div>
  );
}
