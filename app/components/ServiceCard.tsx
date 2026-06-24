import type { Service } from "../types/booking";

type ServiceCardProps = {
  service: Service;
  selected: boolean;
  onSelect: (service: Service) => void;
};

export function ServiceCard({ service, selected, onSelect }: ServiceCardProps) {
  return (
    <button
      className={`w-full rounded-3xl border px-5 py-4 text-left transition duration-300 active:scale-[0.99] ${
        selected
          ? "border-green-600 bg-green-50 shadow-xl shadow-green-700/10"
          : "border-zinc-200 bg-white shadow-sm hover:border-green-200 hover:bg-green-50/40"
      }`}
      onClick={() => onSelect(service)}
      type="button"
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="min-w-0 flex-1 text-left text-lg font-black leading-tight text-zinc-950">
          {service.name}
        </h3>
        <p className="shrink-0 text-right text-base font-black text-green-700">{service.price}</p>
      </div>
      <div className="mt-4 grid gap-2 text-sm font-black text-zinc-700">
        <div className="flex items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3 ring-1 ring-zinc-200">
          <span>Pago completo / Transferencia</span>
          <span className="grid h-5 w-5 place-items-center rounded-full border-2 border-[#16A34A]">
            {selected ? <span className="h-2.5 w-2.5 rounded-full bg-[#16A34A]" /> : null}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3 ring-1 ring-zinc-200">
          <span>Efectivo</span>
          <span className="h-5 w-5 rounded-full border-2 border-zinc-300" />
        </div>
      </div>
    </button>
  );
}
