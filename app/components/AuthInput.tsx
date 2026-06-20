type AuthInputProps = {
  label: string;
  type?: string;
  placeholder?: string;
};

export function AuthInput({ label, placeholder, type = "text" }: AuthInputProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-zinc-800">{label}</span>
      <input
        className="h-14 w-full rounded-[1.15rem] border border-zinc-200 bg-white px-4 text-base font-semibold text-zinc-950 shadow-sm shadow-zinc-950/[0.03] outline-none transition placeholder:text-zinc-300 focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
        placeholder={placeholder ?? label}
        type={type}
      />
    </label>
  );
}
