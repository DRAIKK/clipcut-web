import type { Service, TimeSlot } from "../types/booking";

type BookingModalProps = {
  open: boolean;
  service?: Service;
  slot?: TimeSlot;
  onClose: () => void;
  onConfirm: () => void;
};

export function BookingModal({ open, service, slot, onClose, onConfirm }: BookingModalProps) {
  if (!open) return null;

  const canContinue = Boolean(service && slot);

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-zinc-950/55 p-3 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full rounded-[2rem] bg-white p-5 shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
        <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-zinc-200" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-green-600">
              Reserva
            </p>
            <h2 className="mt-1 text-2xl font-black text-zinc-950">Confirmá tu turno</h2>
          </div>
          <button
            aria-label="Cerrar modal"
            className="grid h-10 w-10 place-items-center rounded-full bg-zinc-100 font-black text-zinc-500"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        <div className="mt-6 space-y-3">
          <div className="rounded-3xl bg-zinc-50 p-4">
            <p className="text-xs font-bold text-zinc-400">Servicio seleccionado</p>
            <p className="mt-1 font-black text-zinc-950">{service?.name ?? "Elegí un servicio"}</p>
          </div>
          <div className="rounded-3xl bg-zinc-50 p-4">
            <p className="text-xs font-bold text-zinc-400">Horario seleccionado</p>
            <p className="mt-1 font-black text-zinc-950">{slot?.label ?? "Elegí un horario"}</p>
          </div>
        </div>
        <button
          className="mt-6 h-14 w-full rounded-2xl bg-green-600 font-black text-white shadow-xl shadow-green-600/25 transition disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:shadow-none"
          disabled={!canContinue}
          onClick={onConfirm}
          type="button"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
