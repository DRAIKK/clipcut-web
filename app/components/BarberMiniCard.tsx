import type { Barber } from "../types/booking";
import { BarberAvatar } from "./BarberAvatar";

type BarberMiniCardProps = {
  barber: Barber;
  onSelect?: (barber: Barber) => void;
};

export function BarberMiniCard({ barber, onSelect }: BarberMiniCardProps) {
  return (
    <button
      className="h-44 w-36 shrink-0 overflow-hidden rounded-[1.75rem] bg-white p-4 text-left shadow-sm ring-1 ring-zinc-200 transition active:scale-[0.98]"
      onClick={() => onSelect?.(barber)}
      type="button"
    >
      <BarberAvatar barber={barber} size="sm" />
      <p
        className="mt-3 min-h-12 overflow-hidden text-base font-black leading-6 text-zinc-950"
        style={{
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: 2,
        }}
      >
        {barber.name}
      </p>
      <p className="mt-1 truncate text-sm font-bold text-zinc-400">{barber.distance}</p>
    </button>
  );
}
