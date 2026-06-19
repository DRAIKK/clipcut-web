"use client";

import { useState } from "react";
import { BarberHero } from "./components/BarberHero";
import { BookingModal } from "./components/BookingModal";
import { SectionHeader } from "./components/SectionHeader";
import { ServiceCard } from "./components/ServiceCard";
import { TimeSlotGrid } from "./components/TimeSlotGrid";
import { mockBarber, mockServices, mockTimeSlots } from "./data/mockBooking";
import type { Service, TimeSlot } from "./types/booking";

export default function Home() {
  const [selectedService, setSelectedService] = useState<Service>(mockServices[0]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot>();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  if (confirmed) {
    return (
      <main className="min-h-dvh bg-gradient-to-b from-green-50 via-white to-zinc-100 px-4 py-8 text-zinc-950">
        <section className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-md flex-col justify-center">
          <div className="rounded-[2.25rem] bg-white p-6 text-center shadow-2xl shadow-green-950/10 ring-1 ring-zinc-200/70">
            <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-green-100 text-5xl">
              ✓
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-green-600">
              Reserva confirmada
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">¡Tu turno está listo!</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-500">
              Te esperamos para {selectedService.name} a las {selectedSlot?.label}. Esta es una confirmación mock para la versión web de Clipcut.
            </p>
            <div className="mt-6 rounded-3xl bg-zinc-50 p-4 text-left">
              <p className="text-sm font-black text-zinc-950">{mockBarber.name}</p>
              <p className="mt-1 text-sm text-zinc-500">{mockBarber.address}</p>
            </div>
            <button
              className="mt-6 h-14 w-full rounded-2xl bg-green-600 font-black text-white shadow-xl shadow-green-600/25 transition active:scale-[0.98]"
              onClick={() => setConfirmed(false)}
              type="button"
            >
              Hacer otra reserva
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-gradient-to-b from-green-50 via-white to-zinc-100 px-4 py-5 text-zinc-950">
      <div className="mx-auto w-full max-w-md space-y-8 pb-24">
        <header className="flex items-center justify-between px-1 py-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-green-600">Clipcut</p>
            <p className="text-sm font-semibold text-zinc-500">Reservas para clientes</p>
          </div>
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-zinc-950 text-lg font-black text-white">
            C
          </div>
        </header>

        <BarberHero barber={mockBarber} onReserve={() => setModalOpen(true)} />

        <section className="space-y-4">
          <SectionHeader eyebrow="Servicios" title="Elegí qué querés hacerte" />
          <div className="space-y-3">
            {mockServices.map((service) => (
              <ServiceCard
                key={service.id}
                onSelect={setSelectedService}
                selected={selectedService.id === service.id}
                service={service}
              />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <SectionHeader eyebrow="Horarios" title="Turnos disponibles para hoy" />
          <TimeSlotGrid
            onSelect={setSelectedSlot}
            selectedSlot={selectedSlot}
            slots={mockTimeSlots}
          />
        </section>

        <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md bg-gradient-to-t from-white via-white to-white/0 p-4 pt-8">
          <button
            className="h-14 w-full rounded-2xl bg-green-600 font-black text-white shadow-2xl shadow-green-600/30 transition duration-300 hover:bg-green-700 active:scale-[0.98]"
            onClick={() => setModalOpen(true)}
            type="button"
          >
            Revisar reserva
          </button>
        </div>
      </div>

      <BookingModal
        onClose={() => setModalOpen(false)}
        onConfirm={() => {
          setModalOpen(false);
          setConfirmed(true);
        }}
        open={modalOpen}
        service={selectedService}
        slot={selectedSlot}
      />
    </main>
  );
}
