type AppHeaderProps = {
  subtitle?: string;
};

export function AppHeader({ subtitle = "Reservas para clientes" }: AppHeaderProps) {
  return (
    <header className="relative flex items-center justify-center px-4 pb-2 pt-3 text-center">
      <div aria-hidden="true" className="absolute left-4 h-10 w-10" />
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-white/85 px-5 py-2 shadow-lg shadow-green-950/5 ring-1 ring-green-100 backdrop-blur-md">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-green-600 text-sm font-black text-white shadow-md shadow-green-600/25">
            C
          </span>
          <span className="text-2xl font-black tracking-[-0.04em] text-zinc-950">
            Clip<span className="text-green-600">cut</span>
          </span>
        </div>
        <p className="mt-2 text-xs font-bold uppercase tracking-[0.22em] text-zinc-400">
          {subtitle}
        </p>
      </div>
    </header>
  );
}
