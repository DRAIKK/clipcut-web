"use client";

import Image from "next/image";
import { useState } from "react";
import { AuthInput } from "./AuthInput";
import { AuthLayout } from "./AuthLayout";

type RegisterScreenProps = {
  onEnter: () => void;
  onLogin: () => void;
};

type Role = "client";

type StoreLink = {
  href: string;
  image: string;
  label: string;
};

const appStoreUrl = "#app-store";
const googlePlayUrl = "#google-play";

const storeLinks: StoreLink[] = [
  {
    href: appStoreUrl,
    image: "/app-store.svg",
    label: "App Store",
  },
  {
    href: googlePlayUrl,
    image: "/google-play.svg",
    label: "Google Play",
  },
];

function SocialButton({ className, label }: { className: string; label: string }) {
  return (
    <button className={`h-14 w-full rounded-[1.15rem] text-sm font-black transition active:scale-[0.98] ${className}`} type="button">
      {label}
    </button>
  );
}

function BarberRegistrationModal({ onClose, open }: { onClose: () => void; open: boolean }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/45 px-4 py-8 backdrop-blur-sm" role="presentation">
      <div
        aria-labelledby="barber-registration-title"
        aria-modal="true"
        className="w-full max-w-sm rounded-[2rem] bg-white p-5 text-center shadow-2xl shadow-zinc-950/25 ring-1 ring-zinc-200/80"
        role="dialog"
      >
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-green-100 text-3xl shadow-inner shadow-green-600/10">
          ✂️
        </div>
        <h2 id="barber-registration-title" className="mt-5 text-2xl font-black tracking-[-0.04em] text-zinc-950">
          Registrate como peluquero
        </h2>
        <p className="mt-3 text-sm font-bold leading-6 text-zinc-600">
          Los peluqueros gestionan su perfil desde la aplicación móvil de Clipcut.
        </p>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Descargá la app para registrarte y administrar tu peluquería.
        </p>

        <div className="mx-auto mt-6 grid max-w-[17rem] justify-items-center gap-3 sm:max-w-none sm:grid-cols-2">
          {storeLinks.map((link) => (
            <a
              aria-label={`Descargar en ${link.label}`}
              className="block w-48 transition active:scale-[0.98]"
              href={link.href}
              key={link.label}
            >
              <Image
                alt={`Descargar en ${link.label}`}
                className="h-auto w-full object-contain drop-shadow-sm"
                height={108}
                src={link.image}
                width={360}
              />
            </a>
          ))}
        </div>

        <button
          className="mt-3 h-12 w-full rounded-[1.05rem] bg-green-100 text-sm font-black text-green-700 transition active:scale-[0.98]"
          onClick={onClose}
          type="button"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

export function RegisterScreen({ onEnter, onLogin }: RegisterScreenProps) {
  const [role, setRole] = useState<Role>("client");
  const [barberModalOpen, setBarberModalOpen] = useState(false);

  return (
    <AuthLayout>
      <div className="space-y-4">
        <AuthInput label="Nombre completo" />
        <AuthInput label="Correo electrónico" type="email" />
        <AuthInput label="Contraseña" type="password" />
      </div>

      <div className="mt-5">
        <p className="mb-2 text-sm font-black text-zinc-800">Selector de rol</p>
        <div className="grid grid-cols-2 gap-3 rounded-[1.35rem] bg-white p-1.5 shadow-sm ring-1 ring-zinc-200">
          {[
            { id: "barber", label: "Peluquero" },
            { id: "client", label: "Cliente" },
          ].map((option) => {
            const isActive = role === option.id;

            return (
              <button
                aria-pressed={isActive}
                className={`h-12 rounded-[1rem] text-sm font-black transition active:scale-[0.98] ${
                  isActive ? "bg-green-600 text-white shadow-lg shadow-green-600/25" : "text-zinc-500"
                }`}
                key={option.id}
                onClick={() => {
                  if (option.id === "barber") {
                    setBarberModalOpen(true);
                    return;
                  }

                  setRole("client");
                }}
                type="button"
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <button
        className="mt-6 h-14 w-full rounded-[1.15rem] bg-green-600 text-base font-black text-white shadow-xl shadow-green-600/25 transition active:scale-[0.98]"
        onClick={onEnter}
        type="button"
      >
        Crear cuenta
      </button>

      <div className="my-6 flex items-center gap-4 text-xs font-bold text-zinc-400">
        <span className="h-px flex-1 bg-zinc-200" />
        <span>o continuar con</span>
        <span className="h-px flex-1 bg-zinc-200" />
      </div>

      <div className="space-y-3">
        <SocialButton className="border border-zinc-200 bg-white text-zinc-950 shadow-sm" label="Continuar con Google" />
        <SocialButton className="bg-zinc-950 text-white shadow-lg shadow-zinc-950/15" label="Continuar con Apple" />
      </div>

      <button
        className="mt-3 h-14 w-full rounded-[1.15rem] bg-green-100 text-sm font-black text-green-700 transition active:scale-[0.98]"
        onClick={onEnter}
        type="button"
      >
        Ingresar como invitado
      </button>

      <p className="pt-7 text-center text-sm font-bold text-zinc-500">
        ¿Ya tenés cuenta?{" "}
        <button className="font-black text-green-600" onClick={onLogin} type="button">
          Iniciar sesión
        </button>
      </p>

      <BarberRegistrationModal onClose={() => setBarberModalOpen(false)} open={barberModalOpen} />
    </AuthLayout>
  );
}
