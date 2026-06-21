import type { Barber } from "../types/booking";

export function BarberAvatar({ barber, size = "md" }: { barber: Barber; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "h-14 w-14 text-sm",
    md: "h-20 w-20 text-xl",
    lg: "h-28 w-28 text-3xl",
  };

  if (barber.photoUrl) {
    return (
      <img
        alt={barber.name}
        className={`${sizes[size]} shrink-0 rounded-full object-cover shadow-lg shadow-green-950/15 ring-4 ring-white`}
        src={barber.photoUrl}
      />
    );
  }

  return (
    <div
      className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br ${barber.imageGradient} ${sizes[size]} font-black text-white shadow-lg shadow-green-950/15 ring-4 ring-white`}
    >
      {barber.initials}
    </div>
  );
}
