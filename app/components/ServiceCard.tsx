import type { PaymentMethod, PaymentMethodId, Service } from "../types/booking";

type ServiceCardProps = {
  service: Service;
  selected: boolean;
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod?: PaymentMethodId;
  onSelect: (service: Service) => void;
  onSelectPaymentMethod: (paymentMethod: PaymentMethodId) => void;
};

const CLIPCUT_FEE = 300;
const DEPOSIT_PERCENTAGE = 0.3;

function parsePrice(price: string) {
  const normalized = price.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatPrice(value: number) {
  return `$${Math.round(value).toLocaleString("es-AR")}`;
}

function ScissorsIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M8.5 8.5 19 19M8.5 15.5 19 5M7 8.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm0 7a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function PaymentIcon({ method }: { method: PaymentMethodId }) {
  if (method === "deposit") {
    return (
      <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
        <path d="M4 7.5h14.5A2.5 2.5 0 0 1 21 10v7a2.5 2.5 0 0 1-2.5 2.5h-14A2.5 2.5 0 0 1 2 17V7a2.5 2.5 0 0 1 2.5-2.5H17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        <path d="M16 13.5h5" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      </svg>
    );
  }

  if (method === "cash") {
    return (
      <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
        <path d="M3 7h18v10H3V7Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
        <path d="M7 7a4 4 0 0 1-4 4m18 0a4 4 0 0 1-4-4M7 17a4 4 0 0 0-4-4m18 0a4 4 0 0 0-4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
        <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 16.5v-9Z" stroke="currentColor" strokeWidth="2" />
      <path d="M3 9h18M7 15h4" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function getMethodStyles(method: PaymentMethodId, selected: boolean) {
  const styles = {
    transfer: "border-sky-200 bg-sky-50 text-sky-700 ring-sky-100",
    deposit: "border-violet-200 bg-violet-50 text-violet-700 ring-violet-100",
    cash: "border-emerald-200 bg-emerald-50 text-emerald-700 ring-emerald-100",
  }[method];

  return `${styles} ${selected ? "ring-2" : "ring-1"}`;
}

export function ServiceCard({
  service,
  selected,
  paymentMethods,
  selectedPaymentMethod,
  onSelect,
  onSelectPaymentMethod,
}: ServiceCardProps) {
  const servicePrice = parsePrice(service.price);
  const deposit = Math.round(servicePrice * DEPOSIT_PERCENTAGE);
  const transferTotal = servicePrice + CLIPCUT_FEE;
  const depositTotal = deposit + CLIPCUT_FEE;
  const remaining = Math.max(servicePrice - deposit, 0);

  const handlePaymentSelect = (paymentMethod: PaymentMethodId) => {
    onSelect(service);
    onSelectPaymentMethod(paymentMethod);
  };

  return (
    <article
      className={`w-full rounded-[1.75rem] border bg-white p-4 text-left shadow-sm transition duration-300 sm:p-5 ${
        selected ? "border-green-300 shadow-green-700/10" : "border-zinc-200 hover:border-zinc-300"
      }`}
    >
      <button className="w-full text-left active:scale-[0.99]" onClick={() => onSelect(service)} type="button">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-zinc-100 text-zinc-600">
              <ScissorsIcon />
            </span>
            <h3 className="min-w-0 flex-1 truncate text-base font-black leading-tight text-zinc-950 sm:text-lg">
              {service.name}
            </h3>
          </div>
          <p className="shrink-0 text-right text-base font-black text-zinc-950">{service.price}</p>
        </div>
      </button>

      <div className="mt-4 grid gap-3 text-sm font-bold text-zinc-700">
        {paymentMethods.length === 0 ? (
          <div className="rounded-2xl bg-zinc-50 px-4 py-3 text-zinc-500 ring-1 ring-zinc-200">
            Este peluquero todavía no configuró métodos de pago.
          </div>
        ) : null}
        {paymentMethods.map((method) => {
          const isPaymentSelected = selected && selectedPaymentMethod === method.id;

          return (
            <button
              className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-left transition active:scale-[0.99] ${getMethodStyles(
                method.id,
                isPaymentSelected,
              )}`}
              key={method.id}
              onClick={() => handlePaymentSelect(method.id)}
              type="button"
            >
              <span className="mt-0.5 shrink-0">
                <PaymentIcon method={method.id} />
              </span>
              <span className="min-w-0 flex-1 text-zinc-800">
                {method.id === "transfer" ? (
                  <>
                    <span className="block font-black text-zinc-950">Pago completo / Transferencia</span>
                    <span className="mt-1 block text-xs leading-snug text-zinc-600">
                      Servicio {formatPrice(servicePrice)} + fee {formatPrice(CLIPCUT_FEE)} · Total {formatPrice(transferTotal)}
                    </span>
                  </>
                ) : null}
                {method.id === "deposit" ? (
                  <>
                    <span className="block font-black text-zinc-950">Pagar seña</span>
                    <span className="mt-1 block text-xs leading-snug text-zinc-600">
                      Pagás una seña ahora y el resto en la peluquería.
                    </span>
                    <span className="mt-2 grid gap-0.5 text-xs leading-snug text-zinc-600">
                      <span>Precio del servicio: {formatPrice(servicePrice)}</span>
                      <span>Seña 30%: {formatPrice(deposit)}</span>
                      <span>Fee Clipcut: {formatPrice(CLIPCUT_FEE)}</span>
                      <span className="font-black text-zinc-950">Total a pagar ahora: {formatPrice(depositTotal)}</span>
                      <span>Resto a pagar en la peluquería: {formatPrice(remaining)}</span>
                    </span>
                  </>
                ) : null}
                {method.id === "cash" ? (
                  <>
                    <span className="block font-black text-zinc-950">Efectivo</span>
                    <span className="mt-1 block text-xs leading-snug text-zinc-600">Enviar solicitud al peluquero</span>
                  </>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </article>
  );
}
