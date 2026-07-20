"use client";

import { useEffect, useRef, useState } from "react";

const APP_STORE_URL = "https://apps.apple.com/ar/app/clipcut/id6763927698";
const GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=com.clipcut.app&pcampaignid=web_share";

export function OpenInAppButton({ barberId }: { barberId: string }) {
  const [showStoreOptions, setShowStoreOptions] = useState(false);
  const fallbackTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (fallbackTimer.current) window.clearTimeout(fallbackTimer.current);
    };
  }, []);

  const openApp = () => {
    setShowStoreOptions(false);
    window.location.assign(`clipcut://peluquero/${encodeURIComponent(barberId)}`);

    fallbackTimer.current = window.setTimeout(() => {
      if (document.visibilityState === "visible") setShowStoreOptions(true);
    }, 1500);
  };

  return (
    <div className="mt-5">
      <button
        className="h-11 rounded-full bg-zinc-100 px-4 text-sm font-black text-zinc-700 ring-1 ring-zinc-200 transition active:scale-[0.98]"
        onClick={openApp}
        type="button"
      >
        Abrir en la app
      </button>

      {showStoreOptions ? (
        <div className="mt-3 rounded-2xl bg-zinc-50 p-3 text-sm font-semibold text-zinc-600 ring-1 ring-zinc-200">
          <p>No encontramos la app de Clipcut en este dispositivo.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a className="rounded-full bg-zinc-950 px-3 py-2 text-xs font-black text-white" href={APP_STORE_URL} rel="noopener noreferrer" target="_blank">
              App Store
            </a>
            <a className="rounded-full bg-zinc-950 px-3 py-2 text-xs font-black text-white" href={GOOGLE_PLAY_URL} rel="noopener noreferrer" target="_blank">
              Google Play
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
