import type { Barber, Booking } from "../types/booking";
import { BookingCard } from "./BookingsScreen";
import { BarberMiniCard } from "./BarberMiniCard";
import { LogoHeader } from "./LogoHeader";

type ReviewableBarber = {
  id: string;
  name: string;
  initials: string;
  photoUrl?: string;
};

type HomeScreenProps = {
  barbers: Barber[];
  bookingBarbers?: Barber[];
  onSelectBarber: (barber: Barber) => void;
  onSearchBarbers: () => void;
  loading?: boolean;
  activeBooking?: Booking;
  reviewableBarbers?: ReviewableBarber[];
  ratedBarberIds?: Record<string, number>;
  onRateBarber?: (barberId: string, rating: number) => void;
  onRequestLocation?: () => void;
  showLocationHint?: boolean;
};

export function HomeScreen({
  barbers,
  bookingBarbers = barbers,
  loading = false,
  activeBooking,
  reviewableBarbers = [],
  ratedBarberIds = {},
  onRateBarber,
  onSearchBarbers,
  onSelectBarber,
  onRequestLocation,
  showLocationHint = false,
}: HomeScreenProps) {
  return (
    <div className="space-y-4 pb-1">
      <LogoHeader />

      {activeBooking ? (
        <section className="space-y-2">
          <h2 className="px-1 text-sm font-black uppercase tracking-[0.18em] text-zinc-900">Tu próxima reserva</h2>
          <BookingCard barbers={bookingBarbers} booking={activeBooking} />
        </section>
      ) : null}

      <section className="space-y-2">
        <h2 className="text-sm font-black uppercase tracking-[0.18em] text-zinc-900">
          Peluqueros cerca
        </h2>
        {showLocationHint ? (
          <button
            className="rounded-full bg-white px-4 py-2 text-xs font-black text-green-700 shadow-sm ring-1 ring-green-100 transition active:scale-[0.98]"
            onClick={onRequestLocation}
            type="button"
          >
            Activar ubicación para ver peluqueros cerca
          </button>
        ) : null}
        <div className="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
          {loading ? (
            <div className="h-44 w-36 shrink-0 rounded-[1.75rem] bg-white p-4 text-sm font-black text-zinc-400 shadow-sm ring-1 ring-zinc-200">
              Cargando...
            </div>
          ) : null}
          {!loading && barbers.length === 0 ? (
            <div className="h-44 w-36 shrink-0 rounded-[1.75rem] bg-white p-4 text-sm font-black text-zinc-400 shadow-sm ring-1 ring-zinc-200">
              No hay peluqueros disponibles.
            </div>
          ) : null}
          {barbers.map((barber) => (
            <BarberMiniCard barber={barber} key={barber.id} onSelect={onSelectBarber} />
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-black uppercase tracking-[0.18em] text-zinc-900">
          Clasifica tus peluqueros
        </h2>
        {reviewableBarbers.length === 0 ? (
          <div className="rounded-[2rem] bg-white px-5 py-8 text-center shadow-sm ring-1 ring-zinc-200">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green-50 text-3xl ring-1 ring-green-100">
              ★
            </div>
            <h3 className="mt-5 text-xl font-black tracking-tight text-zinc-950">
              Todavía no tenés peluqueros para calificar.
            </h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-zinc-500">
              Cuando finalices una reserva, aparecerán aquí para que puedas calificarlos.
            </p>
            <button
              className="mt-5 h-12 rounded-full border border-green-200 bg-green-100 px-6 text-sm font-black text-green-700 transition active:scale-[0.98]"
              onClick={onSearchBarbers}
              type="button"
            >
              Buscar peluqueros
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {reviewableBarbers.map((barber) => {
              const rating = ratedBarberIds[barber.id];

              return (
                <article className="rounded-[2rem] bg-white px-5 py-6 text-center shadow-sm ring-1 ring-zinc-200" key={barber.id}>
                  <div className="mx-auto grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-zinc-100 text-xl font-black text-green-700 ring-1 ring-zinc-200">
                    {barber.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img alt={barber.name} className="h-full w-full object-cover" src={barber.photoUrl} />
                    ) : (
                      barber.initials
                    )}
                  </div>
                  <h3 className="mt-4 text-lg font-black text-zinc-950">{barber.name}</h3>
                  <div className="mt-3 flex justify-center gap-1" aria-label={rating ? `Calificación realizada: ${rating} estrellas` : `Calificar a ${barber.name}`}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        aria-label={`${star} estrellas`}
                        className={`text-3xl transition active:scale-95 ${rating && star <= rating ? "text-yellow-400" : "text-zinc-300"}`}
                        disabled={Boolean(rating)}
                        key={star}
                        onClick={() => onRateBarber?.(barber.id, star)}
                        type="button"
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  {rating ? <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-green-600">Ya calificaste con {rating} ★</p> : null}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
