type SectionHeaderProps = {
  eyebrow: string;
  title: string;
};

export function SectionHeader({ eyebrow, title }: SectionHeaderProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">
        {eyebrow}
      </p>
      <h2 className="text-xl font-black tracking-tight text-zinc-950">{title}</h2>
    </div>
  );
}
