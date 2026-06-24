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
    <div className="fixed inset-0 z-50 flex items-end bg-zinc-950/55 p-3 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="max-h-[88dvh] w-full overflow-y-auto rounded-[2rem] bg-white p-5 shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
        <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-zinc-200" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-zinc-950">Elige un servicio</h2>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-[#16A34A]">
              Reserva real
            </p>
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

        <div className="mt-5 rounded-3xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
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
                  selected={service?.id === item.id}
                  service={item}
                />
              ))
            : null}
        </div>

        <div className="mt-5 space-y-3">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">Método de pago</p>
          {paymentMethods.length === 0 ? (
            <div className="rounded-3xl bg-zinc-50 p-5 text-sm font-black text-zinc-500 ring-1 ring-zinc-200">
              Este peluquero todavía no configuró métodos de pago.
            </div>
          ) : null}
          {paymentMethods.map((method) => (
            <button
              className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-black ring-1 transition ${
                selectedPaymentMethod === method.id
                  ? "bg-green-50 text-green-800 ring-green-600"
                  : "bg-zinc-50 text-zinc-700 ring-zinc-200"
              }`}
              key={method.id}
              onClick={() => onSelectPaymentMethod(method.id)}
              type="button"
            >
              <span>{method.label}</span>
              <span className="grid h-5 w-5 place-items-center rounded-full border-2 border-[#16A34A]">
                {selectedPaymentMethod === method.id ? <span className="h-2.5 w-2.5 rounded-full bg-[#16A34A]" /> : null}
              </span>
            </button>
          ))}
        </div>

        {error ? <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p> : null}

        <button
          className="mt-6 h-14 w-full rounded-2xl bg-[#16A34A] font-black text-white shadow-xl shadow-green-600/25 transition disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:shadow-none"
          disabled={!canContinue}
          onClick={onConfirm}
          type="button"
        >
          {submitting ? "Creando reserva..." : "Confirmar reserva"}
        </button>
      </div>
    </div>
  );
}
