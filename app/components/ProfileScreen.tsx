"use client";

import { useState } from "react";
import { mockBarber } from "../data/mockBooking";
import { BarberAvatar } from "./BarberAvatar";
import { LogoHeader } from "./LogoHeader";

export function ProfileScreen() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="relative">
        <LogoHeader />
        <button
          aria-expanded={menuOpen}
          aria-label="Abrir menú de perfil"
          className="absolute right-4 top-9 grid h-11 w-11 place-items-center rounded-full bg-green-600 text-xl font-black text-white shadow-lg shadow-green-600/20 transition active:scale-95"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          ☰
        </button>
        {menuOpen ? (
          <div className="absolute right-4 top-24 z-10 w-48 rounded-2xl bg-white p-2 shadow-2xl shadow-zinc-950/15 ring-1 ring-zinc-200">
            <button className="w-full rounded-xl px-4 py-3 text-left text-sm font-black text-red-600 hover:bg-red-50" type="button">
              Cerrar sesión
            </button>
            <button className="w-full rounded-xl px-4 py-3 text-left text-sm font-black text-red-600 hover:bg-red-50" type="button">
              Eliminar cuenta
            </button>
          </div>
        ) : null}
      </div>

      <div className="flex justify-center">
        <BarberAvatar barber={{ ...mockBarber, initials: "C" }} size="lg" />
      </div>

      <section className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-zinc-200">
        <h2 className="text-2xl font-black text-zinc-950">Tu perfil</h2>
        <label className="mt-5 block text-sm font-black text-zinc-700" htmlFor="full-name">
          Nombre completo
        </label>
        <input
          className="mt-2 h-14 w-full rounded-2xl bg-zinc-50 px-4 text-base font-bold text-zinc-950 outline-none ring-1 ring-zinc-200 focus:ring-green-500"
          defaultValue="Clientardo"
          id="full-name"
          type="text"
        />
        <label className="mt-5 block text-sm font-black text-zinc-700" htmlFor="description">
          Descripción
        </label>
        <textarea
          className="mt-2 min-h-32 w-full resize-none rounded-2xl bg-zinc-50 p-4 text-base font-bold text-zinc-950 outline-none ring-1 ring-zinc-200 placeholder:text-zinc-400 focus:ring-green-500"
          id="description"
          placeholder="Contá sobre vos, estilos, etc."
        />
      </section>
    </div>
  );
}
