import type { Barber, Service, TimeSlot } from "../types/booking";
import { BarberAvatar } from "./BarberAvatar";
import { LogoHeader } from "./LogoHeader";

type PublicBarberProfileProps = {
  barber: Barber;
  services: Service[];
  selectedService?: Service;
  selectedSlot?: TimeSlot;
  slots: TimeSlot[];
  onSelectService: (service: Service) => void;
  onSelectSlot: (slot: TimeSlot) => void;
  onBackToSearch: () => void;
  onReserve: () => void;
  loading?: boolean;
};

const scheduleDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function formatSlotRange(slot: TimeSlot) {
  if (slot.endTime) return `${slot.label}–${slot.endTime}`;

  const [hour, minute] = slot.label.split(":").map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return slot.label;

  const start = new Date(2026, 0, 1, hour, minute);
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  const endLabel = `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`;

  return `${slot.label}–${endLabel}`;
}

export function PublicBarberProfile({
  barber,
  selectedSlot,
  slots,
  onSelectSlot,
  onBackToSearch,
  onReserve,
  loading = false,
}: PublicBarberProfileProps) {
  const availableSlots = slots.filter((slot) => slot.available);
  const ratingCount = barber.ratingCount ?? 128;

  const handleCalendarClick = (slot: TimeSlot) => {
    onSelectSlot(slot);
    onReserve();
  };

  return (
    <div className="space-y-5">
      <LogoHeader backButton={{ label: "Volver a Buscar", onClick: onBackToSearch }} />

      <section className="rounded-[2.25rem] bg-white p-5 shadow-sm ring-1 ring-zinc-200">
        <div className="flex items-start gap-4">
          <BarberAvatar barber={barber} size="md" />
          <div className="min-w-0 flex-1 pt-1">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 pr-1">
                <h1 className="truncate text-xl font-black tracking-tight text-zinc-950">
                  {barber.name}
                </h1>
              </div>
              <div className="flex shrink-0 gap-2 pt-1">
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
            <div className="mt-5 flex flex-nowrap items-center gap-3 text-sm font-black">
              <span className="whitespace-nowrap rounded-full bg-zinc-50 px-3 py-1.5 text-zinc-950 ring-1 ring-zinc-200">
                {barber.followers} seguidores
              </span>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-zinc-950 ring-1 ring-amber-100">
                <span className="text-base leading-none text-amber-500">★</span>
                <span>{barber.rating.toFixed(1)}</span>
                <span className="text-zinc-400">({ratingCount})</span>
              </span>
            </div>
          </div>
        </div>

        <p className="mt-6 text-sm font-semibold leading-6 text-zinc-500">{barber.description}</p>

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

        <div className="mt-6 space-y-3">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">Horarios disponibles</p>
          {loading ? (
            <div className="rounded-[1.35rem] bg-white p-4 text-sm font-black text-zinc-400 ring-1 ring-zinc-200">
              Cargando perfil y horarios...
            </div>
          ) : null}
          {!loading && availableSlots.length === 0 ? (
            <div className="rounded-[1.35rem] bg-white p-4 text-sm font-black text-zinc-400 ring-1 ring-zinc-200">
              Este peluquero aún no configuró sus horarios.
            </div>
          ) : null}
          {availableSlots.map((slot, index) => (
            <div
              className={`flex w-full items-center gap-3 rounded-[1.35rem] p-3 text-left ring-1 transition ${
                selectedSlot?.id === slot.id
                  ? "bg-green-50 ring-[#16A34A]"
                  : "bg-white ring-zinc-200"
              }`}
              key={slot.id}
            >
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-zinc-50 text-sm font-black text-zinc-950 ring-1 ring-zinc-200">
                {slot.day || scheduleDays[index % scheduleDays.length]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-black text-zinc-950">{formatSlotRange(slot)}</p>
                <p className="mt-1 flex items-center gap-2 text-xs font-black text-[#16A34A]">
                  <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
                  Disponible
                </p>
              </div>
              <button
                aria-label={`Elegir servicio para ${formatSlotRange(slot)}`}
                className="grid h-11 w-11 place-items-center rounded-full bg-[#16A34A] text-lg text-white shadow-lg shadow-green-600/25 transition active:scale-95"
                onClick={() => handleCalendarClick(slot)}
                type="button"
              >
                ◷
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
