import type { PaymentMethod, PaymentMethodId, Service } from "../types/booking";

type ServiceCardProps = {
  service: Service;
  selected: boolean;
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod?: PaymentMethodId;
  onSelect: (service: Service) => void;
  onSelectPaymentMethod: (paymentMethod: PaymentMethodId) => void;
};

export function ServiceCard({
  service,
  selected,
  paymentMethods,
  selectedPaymentMethod,
  onSelect,
  onSelectPaymentMethod,
}: ServiceCardProps) {
  const handlePaymentSelect = (paymentMethod: PaymentMethodId) => {
    onSelect(service);
    onSelectPaymentMethod(paymentMethod);
  };

  return (
    <div
      className={`w-full rounded-3xl border px-5 py-4 text-left transition duration-300 ${
        selected
          ? "border-green-600 bg-green-50 shadow-xl shadow-green-700/10"
          : "border-zinc-200 bg-white shadow-sm hover:border-green-200 hover:bg-green-50/40"
      }`}
    >
      <button className="w-full text-left active:scale-[0.99]" onClick={() => onSelect(service)} type="button">
        <div className="flex items-start justify-between gap-4">
          <h3 className="min-w-0 flex-1 text-left text-lg font-black leading-tight text-zinc-950">
            {service.name}
          </h3>
          <p className="shrink-0 text-right text-base font-black text-green-700">{service.price}</p>
        </div>
      </button>

      <div className="mt-4 grid gap-2 text-sm font-black text-zinc-700">
        {paymentMethods.length === 0 ? (
          <div className="rounded-2xl bg-zinc-50 px-4 py-3 text-zinc-500 ring-1 ring-zinc-200">
            Este peluquero todavía no configuró métodos de pago.
          </div>
        ) : null}
        {paymentMethods.map((method) => {
          const isPaymentSelected = selected && selectedPaymentMethod === method.id;

          return (
            <button
              className={`flex items-center justify-between rounded-2xl px-4 py-3 text-left ring-1 transition active:scale-[0.99] ${
                isPaymentSelected
                  ? "bg-white text-green-800 ring-green-600"
                  : "bg-zinc-50 text-zinc-700 ring-zinc-200"
              }`}
              key={method.id}
              onClick={() => handlePaymentSelect(method.id)}
              type="button"
            >
              <span>{method.id === "transfer" ? "Pago completo / Transferencia" : method.label}</span>
              <span
                className={`grid h-5 w-5 place-items-center rounded-full border-2 ${
                  isPaymentSelected ? "border-[#16A34A]" : "border-zinc-300"
                }`}
              >
                {isPaymentSelected ? <span className="h-2.5 w-2.5 rounded-full bg-[#16A34A]" /> : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
