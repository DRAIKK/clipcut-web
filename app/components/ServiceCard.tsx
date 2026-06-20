import type { Service } from "../types/booking";

type ServiceCardProps = {
  service: Service;
  selected: boolean;
  onSelect: (service: Service) => void;
};

export function ServiceCard({ service, selected, onSelect }: ServiceCardProps) {
  return (
    <button
      className={`w-full rounded-3xl border px-5 py-5 text-center transition duration-300 active:scale-[0.99] ${
        selected
          ? "border-green-600 bg-green-50 shadow-xl shadow-green-700/10"
          : "border-zinc-200 bg-white shadow-sm hover:border-green-200 hover:bg-green-50/40"
      }`}
      onClick={() => onSelect(service)}
      type="button"
    >
      <div className="flex min-h-24 flex-col items-center justify-center gap-2">
        <h3 className="text-lg font-black leading-tight text-zinc-950">{service.name}</h3>
        <p className="text-base font-black text-green-700">{service.price}</p>
      </div>
    </button>
  );
}
