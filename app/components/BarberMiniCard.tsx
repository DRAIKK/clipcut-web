import type { Barber } from "../types/booking";
import { BarberAvatar } from "./BarberAvatar";

type BarberMiniCardProps = {
  barber: Barber;
  onSelect?: (barber: Barber) => void;
};

export function BarberMiniCard({ barber, onSelect }: BarberMiniCardProps) {
  return (
    <button
      className="min-w-36 rounded-[1.75rem] bg-white p-4 text-left shadow-sm ring-1 ring-zinc-200 transition active:scale-[0.98]"
      onClick={() => onSelect?.(barber)}
      type="button"
    >
      <BarberAvatar barber={barber} size="sm" />
      <p className="mt-3 font-black text-zinc-950">{barber.name}</p>
      <p className="mt-1 text-sm font-bold text-zinc-400">{barber.distance}</p>
    </button>
  );
}
