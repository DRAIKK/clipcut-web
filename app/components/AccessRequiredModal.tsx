"use client";

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
      <section aria-labelledby="access-required-title" className="w-full max-w-md rounded-[2rem] bg-zinc-50 p-5 shadow-2xl animate-in slide-in-from-bottom-8 duration-300 sm:rounded-[2.25rem] sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="access-required-title" className="text-2xl font-black tracking-tight text-zinc-950">Continuá en Clipcut</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-zinc-500">
              Iniciá sesión para reservar, seguir peluqueros y administrar tus turnos.
            </p>
          </div>
          <button aria-label="Cerrar modal" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-zinc-100 text-2xl font-black leading-none text-zinc-500 transition hover:bg-zinc-200" onClick={onClose} type="button">
            ×
          </button>
        </div>

        <button className="mt-6 h-14 w-full rounded-2xl bg-[#16A34A] font-black text-white shadow-xl shadow-green-600/25 transition active:scale-[0.98]" onClick={onContinueOnWeb} type="button">
          Seguir en web
        </button>

        <div className="mt-6 border-t border-zinc-200 pt-5">
          <p className="text-sm font-bold text-zinc-500">También podés usar Clipcut desde tu celular.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <a className="flex h-12 items-center justify-center rounded-2xl bg-zinc-950 px-4 text-sm font-black text-white transition active:scale-[0.98]" href={APP_STORE_URL} rel="noopener noreferrer" target="_blank">
              Descargar en App Store
            </a>
            <a className="flex h-12 items-center justify-center rounded-2xl bg-zinc-950 px-4 text-sm font-black text-white transition active:scale-[0.98]" href={GOOGLE_PLAY_URL} rel="noopener noreferrer" target="_blank">
              Descargar en Google Play
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
