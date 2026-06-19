import type { TimeSlot } from "../types/booking";

type TimeSlotGridProps = {
  slots: TimeSlot[];
  selectedSlot?: TimeSlot;
  onSelect: (slot: TimeSlot) => void;
};

export function TimeSlotGrid({ slots, selectedSlot, onSelect }: TimeSlotGridProps) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {slots.map((slot) => {
        const selected = selectedSlot?.id === slot.id;

        return (
          <button
            className={`h-12 rounded-2xl text-sm font-black transition duration-300 ${
              selected
                ? "bg-green-600 text-white shadow-lg shadow-green-600/25"
                : slot.available
                  ? "bg-white text-zinc-900 ring-1 ring-zinc-200 hover:bg-green-50 hover:ring-green-200"
                  : "cursor-not-allowed bg-zinc-100 text-zinc-300 line-through"
            }`}
            disabled={!slot.available}
            key={slot.id}
            onClick={() => onSelect(slot)}
            type="button"
          >
            {slot.label}
          </button>
        );
      })}
    </div>
  );
}
