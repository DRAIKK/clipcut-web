import type { Barber, Service, TimeSlot } from "../types/booking";
import { BarberAvatar } from "./BarberAvatar";
import { LogoHeader } from "./LogoHeader";
import { ServiceCard } from "./ServiceCard";

type PublicBarberProfileProps = {
  barber: Barber;
  services: Service[];
  selectedService: Service;
  selectedSlot?: TimeSlot;
  slots: TimeSlot[];
  onSelectService: (service: Service) => void;
  onSelectSlot: (slot: TimeSlot) => void;
  onReserve: () => void;
};

const scheduleDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function formatSlotRange(slot: TimeSlot) {
  const [hour, minute] = slot.label.split(":").map(Number);
  const start = new Date(2026, 0, 1, hour, minute);
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  const endLabel = `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`;

  return `${slot.label}–${endLabel}`;
}

export function PublicBarberProfile({
  barber,
  services,
  selectedService,
  selectedSlot,
  slots,
  onSelectService,
  onSelectSlot,
  onReserve,
}: PublicBarberProfileProps) {
  const availableSlots = slots.filter((slot) => slot.available);

  return (
    <div className="space-y-5">
      <LogoHeader />

      <section className="rounded-[2.25rem] bg-white p-5 shadow-sm ring-1 ring-zinc-200">
        <div className="flex items-start gap-4">
          <BarberAvatar barber={barber} size="lg" />
          <div className="min-w-0 flex-1 pt-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-black tracking-tight text-zinc-950">
                  {barber.name}
                </h1>
                <p className="mt-1 text-sm font-extrabold text-zinc-500">
                  {barber.followers} seguidores
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  aria-label="Seguir peluquero"
                  className="grid h-10 w-10 place-items-center rounded-full bg-zinc-50 text-lg ring-1 ring-zinc-200 transition active:scale-95"
                  type="button"
                >
                  ♡
                </button>
                <button
                  aria-label="Enviar mensaje"
                  className="grid h-10 w-10 place-items-center rounded-full bg-zinc-50 text-lg ring-1 ring-zinc-200 transition active:scale-95"
                  type="button"
                >
                  ✉
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-black">
              <span className="text-amber-500">★</span>
              <span className="text-zinc-950">{barber.rating.toFixed(1)}</span>
              <span className="text-zinc-400">(128 reseñas)</span>
            </div>
            <p className="mt-2 text-sm font-black text-[#16A34A]">+54 9 11 5555-0198</p>
          </div>
        </div>

        <p className="mt-5 text-sm font-semibold leading-6 text-zinc-500">{barber.description}</p>

        <div className="mt-5 rounded-[1.5rem] bg-zinc-50 p-4 ring-1 ring-zinc-200">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-green-50 text-xl text-[#16A34A]">
              ⌖
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">Dirección</p>
              <p className="mt-1 text-sm font-black text-zinc-950">{barber.address}</p>
            </div>
          </div>
        </div>

        <div className="mt-7 text-center">
          <h2 className="text-3xl font-black tracking-tight text-zinc-950">Haz tu reserva</h2>
        </div>
        <div className="mt-5 h-px w-full bg-zinc-200" />

        <div className="mt-5 space-y-3">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">Elegí servicio</p>
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              onSelect={onSelectService}
              selected={selectedService.id === service.id}
              service={service}
            />
          ))}
        </div>

        <div className="mt-6 space-y-3">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">Horarios disponibles</p>
          {availableSlots.map((slot, index) => (
            <button
              className={`flex w-full items-center gap-3 rounded-[1.35rem] p-3 text-left ring-1 transition active:scale-[0.99] ${
                selectedSlot?.id === slot.id
                  ? "bg-green-50 ring-[#16A34A]"
                  : "bg-white ring-zinc-200"
              }`}
              key={slot.id}
              onClick={() => onSelectSlot(slot)}
              type="button"
            >
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-zinc-50 text-sm font-black text-zinc-950 ring-1 ring-zinc-200">
                {scheduleDays[index % scheduleDays.length]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-black text-zinc-950">{formatSlotRange(slot)}</p>
                <p className="mt-1 flex items-center gap-2 text-xs font-black text-[#16A34A]">
                  <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
                  Disponible
                </p>
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-full bg-[#16A34A] text-lg text-white shadow-lg shadow-green-600/25">
                ◷
              </span>
            </button>
          ))}
        </div>
      </section>

      <button
        className="h-14 w-full rounded-2xl bg-[#16A34A] font-black text-white shadow-2xl shadow-green-600/25 transition duration-300 hover:bg-green-700 active:scale-[0.98]"
        onClick={onReserve}
        type="button"
      >
        Revisar reserva
      </button>
    </div>
  );
}
