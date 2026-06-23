type AuthInputProps = {
  label: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
};

export function AuthInput({ label, onChange, placeholder, type = "text", value }: AuthInputProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-zinc-800">{label}</span>
      <input
        className="h-14 w-full rounded-[1.15rem] border border-zinc-200 bg-white px-4 text-base font-semibold text-zinc-950 shadow-sm shadow-zinc-950/[0.03] outline-none transition placeholder:text-zinc-300 focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder ?? label}
        type={type}
        value={value}
      />
    </label>
  );
}
