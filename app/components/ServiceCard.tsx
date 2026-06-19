import type { Service } from "../types/booking";

type ServiceCardProps = {
  service: Service;
  selected: boolean;
  onSelect: (service: Service) => void;
};

export function ServiceCard({ service, selected, onSelect }: ServiceCardProps) {
  return (
    <button
      className={`w-full rounded-3xl border p-4 text-left transition duration-300 active:scale-[0.99] ${
        selected
          ? "border-green-600 bg-green-50 shadow-xl shadow-green-700/10"
          : "border-zinc-200 bg-white shadow-sm hover:border-green-200 hover:bg-green-50/40"
      }`}
      onClick={() => onSelect(service)}
      type="button"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-black text-zinc-950">{service.name}</h3>
          <p className="mt-1 text-sm leading-5 text-zinc-500">{service.description}</p>
        </div>
        <div className="text-right">
          <p className="font-black text-green-700">{service.price}</p>
          <p className="mt-1 text-xs font-bold text-zinc-400">{service.duration}</p>
        </div>
      </div>
    </button>
  );
}
