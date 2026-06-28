import { useEffect, useState } from "react";
import { followBarber, isFollowingBarber, unfollowBarber } from "../../lib/firestore-followers";
import type { Barber, TimeSlot } from "../types/booking";
import { BarberAvatar } from "./BarberAvatar";
import { LogoHeader } from "./LogoHeader";
import { formatSlotRange, getSlotStartTime } from "./slot-format";

type PublicBarberProfileProps = {
  barber: Barber;
  selectedSlot?: TimeSlot;
  slots: TimeSlot[];
  onSelectSlot: (slot: TimeSlot) => void;
  onBackToSearch: () => void;
  onReserve: () => void;
  loading?: boolean;
  clientId?: string;
};

const scheduleDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const zeroBasedScheduleDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const dayOrder = new Map(scheduleDays.map((day, index) => [day, index]));
const dayAliases: Record<string, string> = {
  domingo: "Dom",
  dom: "Dom",
  jueves: "Jue",
  jue: "Jue",
  lunes: "Lun",
  lun: "Lun",
  martes: "Mar",
  mar: "Mar",
  miercoles: "Mié",
  miércoles: "Mié",
  mie: "Mié",
  mié: "Mié",
  sabado: "Sáb",
  sábado: "Sáb",
  sab: "Sáb",
  sáb: "Sáb",
  viernes: "Vie",
  vie: "Vie",
};

function getDayNumber(slot: TimeSlot) {
  if (!slot.day) return null;

  const parsedDay = Number(slot.day);
  return Number.isInteger(parsedDay) ? parsedDay : null;
}

function getDayLabels(slots: TimeSlot[]) {
  const dayNumbers = slots
    .map(getDayNumber)
    .filter((dayNumber): dayNumber is number => dayNumber !== null);
  const usesZeroBasedWeek = dayNumbers.some((dayNumber) => dayNumber === 0);

  return slots.map((slot) => {
    const dayNumber = getDayNumber(slot);

    if (dayNumber !== null) {
      const numericLabel = usesZeroBasedWeek
        ? zeroBasedScheduleDays[dayNumber]
        : scheduleDays[dayNumber - 1];

      return numericLabel ?? "";
    }

    const normalizedDay = dayAliases[slot.day?.trim().toLowerCase() ?? ""];

    return normalizedDay ?? slot.day?.trim() ?? "";
  });
}

type GroupedSlot = {
  dayLabel: string;
  slots: TimeSlot[];
};

export function PublicBarberProfile({
  barber,
  selectedSlot,
  slots,
  onSelectSlot,
  onBackToSearch,
  onReserve,
  loading = false,
  clientId = "",
}: PublicBarberProfileProps) {
  const availableSlots = slots.filter((slot) => slot.available);
  const dayLabels = getDayLabels(availableSlots);
  const uniqueSlots = new Map<string, { slot: TimeSlot; dayLabel: string }>();

  availableSlots.forEach((slot, index) => {
    const dayLabel = dayLabels[index] || scheduleDays[index % scheduleDays.length];
    const slotKey = `${dayLabel}-${formatSlotRange(slot)}`;

    if (!uniqueSlots.has(slotKey)) uniqueSlots.set(slotKey, { slot, dayLabel });
  });

  const groupedSlots = Array.from(uniqueSlots.values())
    .sort((firstSlot, secondSlot) => {
      const firstDayOrder = dayOrder.get(firstSlot.dayLabel) ?? Number.MAX_SAFE_INTEGER;
      const secondDayOrder = dayOrder.get(secondSlot.dayLabel) ?? Number.MAX_SAFE_INTEGER;

      if (firstDayOrder !== secondDayOrder) return firstDayOrder - secondDayOrder;

      return getSlotStartTime(firstSlot.slot).localeCompare(getSlotStartTime(secondSlot.slot));
    })
    .reduce<GroupedSlot[]>((groups, item) => {
      const currentGroup = groups.find((group) => group.dayLabel === item.dayLabel);

      if (currentGroup) currentGroup.slots.push(item.slot);
      else groups.push({ dayLabel: item.dayLabel, slots: [item.slot] });

      return groups;
    }, []);
  const ratingCount = barber.ratingCount ?? 128;
  const initialFollowersCount = Number.parseInt(String(barber.followers ?? "0"), 10) || 0;
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(initialFollowersCount);
  const [followSaving, setFollowSaving] = useState(false);
  const [followError, setFollowError] = useState("");

  useEffect(() => {
    setFollowersCount(initialFollowersCount);
  }, [initialFollowersCount]);

  useEffect(() => {
    if (!barber.id || !clientId) {
      setIsFollowing(false);
      return;
    }

    let ignore = false;

    async function loadFollowState() {
      setFollowError("");
      try {
        const following = await isFollowingBarber(barber.id, clientId);
        if (!ignore) setIsFollowing(following);
      } catch (error) {
        console.warn("No se pudo revisar el seguimiento del peluquero.", error);
        if (!ignore) setFollowError("No pudimos revisar si seguís a este peluquero.");
      }
    }

    loadFollowState();

    return () => {
      ignore = true;
    };
  }, [barber.id, clientId]);

  const handleCalendarClick = (slot: TimeSlot) => {
    onSelectSlot(slot);
    onReserve();
  };

  const handleToggleFollow = async () => {
    if (!clientId || followSaving) return;

    const previousFollowing = isFollowing;
    const previousFollowersCount = followersCount;
    const nextFollowing = !previousFollowing;

    setFollowSaving(true);
    setFollowError("");
    setIsFollowing(nextFollowing);
    setFollowersCount(Math.max(0, previousFollowersCount + (nextFollowing ? 1 : -1)));

    try {
      if (nextFollowing) await followBarber(barber.id, clientId);
      else await unfollowBarber(barber.id, clientId);
    } catch (error) {
      console.error("follow error", error);
      console.log("barberId", barber.id);
      console.log("clientId", clientId);
      setIsFollowing(previousFollowing);
      setFollowersCount(previousFollowersCount);
      setFollowError("No pudimos actualizar el seguimiento. Intentá nuevamente.");
    } finally {
      setFollowSaving(false);
    }
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
              <button
                aria-label={isFollowing ? "Dejar de seguir peluquero" : "Seguir peluquero"}
                aria-pressed={isFollowing}
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-lg ring-1 transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${
                  isFollowing
                    ? "bg-green-50 text-green-600 ring-green-200"
                    : "bg-zinc-50 text-zinc-500 ring-zinc-200"
                }`}
                disabled={followSaving || !clientId}
                onClick={handleToggleFollow}
                type="button"
              >
                {isFollowing ? "♥" : "♡"}
              </button>
            </div>
            <div className="mt-5 flex flex-nowrap items-center gap-3 text-sm font-black">
              <span className="whitespace-nowrap rounded-full bg-zinc-50 px-3 py-1.5 text-zinc-950 ring-1 ring-zinc-200">
                {followersCount} seguidores
              </span>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-zinc-950 ring-1 ring-amber-100">
                <span className="text-base leading-none text-amber-500">★</span>
                <span>{barber.rating.toFixed(1)}</span>
                <span className="text-zinc-400">({ratingCount})</span>
              </span>
            </div>
            {followError ? <p className="mt-3 text-xs font-bold text-red-600">{followError}</p> : null}
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
          {groupedSlots.map((group) => (
            <div className="space-y-2" key={group.dayLabel}>
              <div className="inline-flex rounded-full bg-[#16A34A] px-4 py-2 text-sm font-black text-white shadow-sm shadow-green-600/20">
                {group.dayLabel}
              </div>
              <div className="space-y-2">
                {group.slots.map((slot) => (
                  <div
                    className={`flex w-full items-center gap-3 rounded-[1.35rem] p-3 text-left ring-1 transition ${
                      selectedSlot?.id === slot.id
                        ? "bg-green-50 ring-[#16A34A]"
                        : "bg-white ring-zinc-200"
                    }`}
                    key={slot.id}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-black text-zinc-950">{formatSlotRange(slot)}</p>
                      <p className="mt-1 flex items-center gap-2 text-xs font-black text-[#16A34A]">
                        <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
                        Disponible
                      </p>
                    </div>
                    <button
                      aria-label={`Elegir servicio para ${formatSlotRange(slot)}`}
                      className="grid h-11 w-11 place-items-center rounded-full bg-white text-zinc-900 shadow-lg shadow-zinc-900/10 ring-1 ring-zinc-200 transition active:scale-95"
                      onClick={() => handleCalendarClick(slot)}
                      type="button"
                    >
                      <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <path
                          d="M7 3v3M17 3v3M4.5 9.25h15M6.75 5h10.5A2.75 2.75 0 0 1 20 7.75v9.5A2.75 2.75 0 0 1 17.25 20H6.75A2.75 2.75 0 0 1 4 17.25v-9.5A2.75 2.75 0 0 1 6.75 5Z"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
