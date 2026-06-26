import type { ReactNode } from "react";
import { LogoHeader } from "./LogoHeader";

type AuthLayoutProps = {
  children: ReactNode;
  onBack?: () => void;
  title?: string;
};

export function AuthLayout({ children, onBack, title }: AuthLayoutProps) {
  return (
    <section className="flex min-h-dvh flex-col bg-zinc-50 px-4 pb-8 pt-7 text-zinc-950">
      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col">
        {onBack ? (
          <button
            aria-label="Volver a la landing"
            className="absolute left-0 top-0 z-10 grid h-11 w-11 place-items-center rounded-full bg-white text-2xl font-black leading-none text-zinc-950 shadow-sm ring-1 ring-zinc-200 transition active:scale-[0.98]"
            onClick={onBack}
            type="button"
          >
            ←
          </button>
        ) : null}
        <LogoHeader />
        {title ? (
          <h1 className="mt-5 text-center text-[2rem] font-black leading-tight tracking-[-0.045em] text-zinc-950">
            {title}
          </h1>
        ) : null}
        <div className="mt-7 flex flex-1 flex-col">{children}</div>
      </div>
    </section>
  );
}
