import type { PaymentMethod, PaymentMethodId, Service, TimeSlot } from "../types/booking";
import { ServiceCard } from "./ServiceCard";
import { formatSlotRange } from "./slot-format";

type BookingModalProps = {
  open: boolean;
  service?: Service;
  services: Service[];
  servicesLoading?: boolean;
  emptyServicesMessage?: string;
  slot?: TimeSlot;
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod?: PaymentMethodId;
  error?: string;
  submitting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onSelectPaymentMethod: (paymentMethod: PaymentMethodId) => void;
  onSelectService: (service: Service) => void;
};

export function BookingModal({
  open,
  service,
  services,
  servicesLoading = false,
  emptyServicesMessage = "Este peluquero todavía no agregó servicios.",
  slot,
  paymentMethods,
  selectedPaymentMethod,
  error = "",
  submitting = false,
  onClose,
  onConfirm,
  onSelectPaymentMethod,
  onSelectService,
}: BookingModalProps) {
  if (!open) return null;

  const canContinue = Boolean(service && slot && selectedPaymentMethod && paymentMethods.length > 0 && !submitting);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/55 p-3 backdrop-blur-sm animate-in fade-in duration-300 sm:items-center sm:p-6">
      <div className="flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] bg-zinc-50 shadow-2xl animate-in slide-in-from-bottom-8 duration-300 sm:rounded-[2.25rem]">
        <div className="relative shrink-0 border-b border-zinc-200/70 bg-white px-5 py-5 sm:px-7">
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-zinc-200 sm:hidden" />
          <h2 className="text-center text-2xl font-black text-zinc-950">Elige un servicio</h2>
          <button
            aria-label="Cerrar modal"
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-zinc-100 text-2xl font-black leading-none text-zinc-500 transition hover:bg-zinc-200"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
          <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-zinc-200">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">
              Horario seleccionado
            </p>
            <p className="mt-1 font-black text-zinc-950">{slot ? formatSlotRange(slot) : "Elegí un horario"}</p>
          </div>

          <div className="mt-5 space-y-3">
            {servicesLoading ? (
              <div className="rounded-3xl bg-zinc-50 p-5 text-sm font-black text-zinc-400 ring-1 ring-zinc-200">
                Cargando servicios...
              </div>
            ) : null}
            {!servicesLoading && services.length === 0 ? (
              <div className="rounded-3xl bg-zinc-50 p-5 text-sm font-black text-zinc-500 ring-1 ring-zinc-200">
                {emptyServicesMessage}
              </div>
            ) : null}
            {!servicesLoading
              ? services.map((item) => (
                <ServiceCard
                  key={item.id}
                  onSelect={onSelectService}
                  onSelectPaymentMethod={onSelectPaymentMethod}
                  paymentMethods={paymentMethods}
                  selected={service?.id === item.id}
                  selectedPaymentMethod={selectedPaymentMethod}
                  service={item}
                />
              ))
              : null}
          </div>

          {error ? <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p> : null}
        </div>

        <div className="shrink-0 border-t border-zinc-200/70 bg-white px-5 py-4 sm:px-7">
          <button
            className="h-14 w-full rounded-2xl bg-[#16A34A] font-black text-white shadow-xl shadow-green-600/25 transition disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:shadow-none"
            disabled={!canContinue}
            onClick={onConfirm}
            type="button"
          >
            {submitting ? "Creando reserva..." : "Confirmar reserva"}
          </button>
          <button
            className="mx-auto mt-3 block px-6 py-2 text-sm font-black text-zinc-500 transition hover:text-zinc-800"
            onClick={onClose}
            type="button"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
