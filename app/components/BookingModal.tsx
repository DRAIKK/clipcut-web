import { useEffect, useState } from "react";
import type { PaymentMethod, PaymentMethodId, Service, TimeSlot } from "../types/booking";
import { ServiceCard } from "./ServiceCard";
import { formatSlotRange } from "./slot-format";
import { getNextSlotDateRange } from "../booking-rules";

function formatSelectedSlot(slot?: TimeSlot) {
  if (!slot) return "Elegí un horario";

  const range = getNextSlotDateRange(slot.day, slot.startTime, slot.endTime);
  if (!range) return formatSlotRange(slot);

  const date = new Date(range.startAt);
  const weekday = new Intl.DateTimeFormat("es-AR", { weekday: "long" }).format(date);
  const numericDate = new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit" }).format(date);
  return `${weekday[0]?.toUpperCase()}${weekday.slice(1)} ${numericDate} · ${formatSlotRange(slot)}`;
}

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

type BookingStep = "service" | "payment";

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
  const [step, setStep] = useState<BookingStep>("service");

  useEffect(() => {
    if (!open) setStep("service");
  }, [open]);

  if (!open) return null;

  const canContinueToPayment = Boolean(service && slot && !servicesLoading && !submitting);
  const canConfirm = Boolean(service && slot && selectedPaymentMethod && paymentMethods.length > 0 && !submitting);
  const isPaymentStep = step === "payment";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/55 p-3 backdrop-blur-sm animate-in fade-in duration-300 sm:items-center sm:p-6">
      <div className="flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] bg-zinc-50 shadow-2xl animate-in slide-in-from-bottom-8 duration-300 sm:rounded-[2.25rem]">
        <div className="relative shrink-0 border-b border-zinc-200/70 bg-white px-5 py-5 sm:px-7">
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-zinc-200 sm:hidden" />
          <h2 className="text-center text-2xl font-black text-zinc-950">{isPaymentStep ? "Elige un método de pago" : "Elige un servicio"}</h2>
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
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">Horario seleccionado</p>
            <p className="mt-1 font-black text-zinc-950">{formatSelectedSlot(slot)}</p>
            {isPaymentStep && service ? (
              <div className="mt-4 border-t border-zinc-100 pt-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">Servicio seleccionado</p>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <p className="font-black text-zinc-950">{service.name}</p>
                  <p className="shrink-0 font-black text-zinc-950">{service.price}</p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-5 space-y-3">
            {servicesLoading ? (
              <div className="rounded-3xl bg-zinc-50 p-5 text-sm font-black text-zinc-400 ring-1 ring-zinc-200">Cargando servicios...</div>
            ) : null}
            {!servicesLoading && services.length === 0 ? (
              <div className="rounded-3xl bg-zinc-50 p-5 text-sm font-black text-zinc-500 ring-1 ring-zinc-200">{emptyServicesMessage}</div>
            ) : null}
            {!servicesLoading && !isPaymentStep
              ? services.map((item) => (
                  <ServiceCard
                    key={item.id}
                    onSelect={onSelectService}
                    onSelectPaymentMethod={onSelectPaymentMethod}
                    paymentMethods={paymentMethods}
                    selected={service?.id === item.id}
                    selectedPaymentMethod={selectedPaymentMethod}
                    service={item}
                    showPaymentMethods={false}
                  />
                ))
              : null}
            {!servicesLoading && isPaymentStep && service ? (
              <ServiceCard
                onSelect={onSelectService}
                onSelectPaymentMethod={onSelectPaymentMethod}
                paymentMethods={paymentMethods}
                selected
                selectedPaymentMethod={selectedPaymentMethod}
                service={service}
                showServiceSummary={false}
              />
            ) : null}
          </div>

          {error ? <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p> : null}
        </div>

        <div className="shrink-0 border-t border-zinc-200/70 bg-white px-5 py-4 sm:px-7">
          {isPaymentStep ? (
            <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
              <button
                className="h-14 rounded-2xl bg-zinc-100 px-6 font-black text-zinc-600 transition hover:bg-zinc-200"
                disabled={submitting}
                onClick={() => setStep("service")}
                type="button"
              >
                Volver
              </button>
              <button
                className="h-14 w-full rounded-2xl bg-[#16A34A] font-black text-white shadow-xl shadow-green-600/25 transition disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:shadow-none"
                disabled={!canConfirm}
                onClick={onConfirm}
                type="button"
              >
                {submitting ? "Creando reserva..." : "Confirmar reserva"}
              </button>
            </div>
          ) : (
            <button
              className="h-14 w-full rounded-2xl bg-[#16A34A] font-black text-white shadow-xl shadow-green-600/25 transition disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:shadow-none"
              disabled={!canContinueToPayment}
              onClick={() => setStep("payment")}
              type="button"
            >
              Continuar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
