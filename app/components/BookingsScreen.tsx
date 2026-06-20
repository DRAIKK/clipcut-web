import { LogoHeader } from "./LogoHeader";

const mockReservations = [
  {
    id: "reserva-1",
    customerName: "Cliente 3",
    customerInitials: "C3",
    date: "Lun 22/12",
    time: "19:40 - 20:00",
    badge: "MP",
    badgeIcon: "✓",
    badgeClassName: "bg-blue-50 text-blue-700 ring-blue-100",
    avatarClassName: "from-emerald-300 via-green-500 to-zinc-900",
  },
  {
    id: "reserva-2",
    customerName: "Cliente 3",
    customerInitials: "C3",
    date: "Mié 24/12",
    time: "13:00 - 13:30",
    badge: "Efectivo",
    badgeIcon: "💵",
    badgeClassName: "bg-green-50 text-[#16A34A] ring-green-100",
    avatarClassName: "from-lime-300 via-emerald-500 to-green-900",
  },
  {
    id: "reserva-3",
    customerName: "Cliente 3",
    customerInitials: "C3",
    date: "Sáb 27/12",
    time: "18:30 - 19:00",
    badge: "MP",
    badgeIcon: "✓",
    badgeClassName: "bg-blue-50 text-blue-700 ring-blue-100",
    avatarClassName: "from-green-200 via-teal-500 to-zinc-950",
  },
];

export function BookingsScreen() {
  return (
    <div className="space-y-5">
      <div className="relative">
        <LogoHeader />
        <button
          aria-label="Notificaciones"
          className="absolute right-4 top-9 grid h-11 w-11 place-items-center rounded-full bg-white text-xl shadow-sm ring-1 ring-zinc-200 transition active:scale-95"
          type="button"
        >
          🔔
        </button>
      </div>

      <section className="space-y-4">
        <div className="flex items-end justify-between px-1">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#16A34A]">
              Agenda mock
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-zinc-950">
              Reservas
            </h1>
          </div>
          <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-black text-[#16A34A] ring-1 ring-green-100">
            {mockReservations.length} hoy
          </span>
        </div>

        <div className="space-y-3">
          {mockReservations.map((reservation) => (
            <article
              className="flex items-center gap-3 rounded-[1.75rem] bg-white p-3.5 shadow-sm ring-1 ring-zinc-200"
              key={reservation.id}
            >
              <div
                className={`grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br ${reservation.avatarClassName} text-sm font-black text-white shadow-md shadow-green-950/10 ring-4 ring-zinc-50`}
              >
                {reservation.customerInitials}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="truncate text-lg font-black tracking-tight text-zinc-950">
                    {reservation.customerName}
                  </h2>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black ring-1 ${reservation.badgeClassName}`}
                  >
                    <span>{reservation.badgeIcon}</span>
                    {reservation.badge}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-zinc-50 px-3 py-1.5 text-xs font-black text-zinc-800 ring-1 ring-zinc-200">
                    {reservation.date}
                  </span>
                  <span className="rounded-full bg-zinc-50 px-3 py-1.5 text-xs font-black text-zinc-800 ring-1 ring-zinc-200">
                    {reservation.time}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
