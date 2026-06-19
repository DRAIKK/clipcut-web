import type { Booking } from "../types/booking";
import { LogoHeader } from "./LogoHeader";

type BookingsScreenProps = {
  booking: Booking;
};

export function BookingsScreen({ booking }: BookingsScreenProps) {
  return (
    <div className="space-y-6">
      <LogoHeader />
      <section className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-zinc-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-green-600">
              Reserva activa
            </p>
            <h2 className="mt-2 text-2xl font-black text-zinc-950">{booking.barberName}</h2>
          </div>
          <span className="rounded-full bg-green-50 px-4 py-2 text-xs font-black text-green-700">
            {booking.status}
          </span>
        </div>
        <div className="mt-5 space-y-3 text-sm font-bold text-zinc-600">
          <p className="rounded-2xl bg-zinc-50 p-4"><span className="text-zinc-950">Servicio:</span> {booking.serviceName}</p>
          <p className="rounded-2xl bg-zinc-50 p-4"><span className="text-zinc-950">Fecha y hora:</span> {booking.dateTime}</p>
          <p className="rounded-2xl bg-zinc-50 p-4"><span className="text-zinc-950">Dirección:</span> {booking.address}</p>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button className="h-12 rounded-2xl bg-green-600 font-black text-white" type="button">
            Ver detalle
          </button>
          <button className="h-12 rounded-2xl bg-red-50 font-black text-red-600" type="button">
            Cancelar
          </button>
        </div>
      </section>
    </div>
  );
}
