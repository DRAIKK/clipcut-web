import type { Barber } from "../types/booking";

const defaultAvatarSrc = "/default-avatar.svg";

function getAvatarSrc(photoUrl?: string) {
  return photoUrl?.trim() || defaultAvatarSrc;
}

export function BarberAvatar({ barber, size = "md" }: { barber: Barber; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "h-14 w-14 text-sm",
    md: "h-20 w-20 text-xl",
    lg: "h-28 w-28 text-3xl",
  };

  return (
    <img
      alt={barber.photoUrl?.trim() ? barber.name : "Avatar por defecto"}
      className={`${sizes[size]} shrink-0 rounded-full bg-green-50 object-cover shadow-lg shadow-green-950/15 ring-4 ring-white`}
      src={getAvatarSrc(barber.photoUrl)}
    />
  );
}
