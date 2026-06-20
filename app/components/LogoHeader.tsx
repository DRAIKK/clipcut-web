import { ClipcutLogo } from "./ClipcutLogo";

export type LogoHeaderProps = {
  backButton?: {
    label: string;
    onClick: () => void;
  };
  subtitle?: string;
};

export function LogoHeader({ backButton, subtitle }: LogoHeaderProps) {
  return (
    <header className="relative flex flex-col items-center justify-center px-4 pb-4 pt-2 text-center">
      {backButton ? (
        <button
          aria-label={backButton.label}
          className="absolute left-0 top-8 grid h-11 w-11 place-items-center rounded-full border border-zinc-200 bg-white text-xl font-black text-zinc-700 shadow-sm transition active:scale-95"
          onClick={backButton.onClick}
          type="button"
        >
          ←
        </button>
      ) : null}
      <ClipcutLogo priority />
      {subtitle ? (
        <p className="mt-2 text-xs font-bold uppercase tracking-[0.22em] text-zinc-400">
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}
