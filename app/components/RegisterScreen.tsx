"use client";

import { useState } from "react";
import { AuthInput } from "./AuthInput";
import { AuthLayout } from "./AuthLayout";

type RegisterScreenProps = {
  onEnter: () => void;
  onLogin: () => void;
};

type Role = "barber" | "client";

function SocialButton({ className, label }: { className: string; label: string }) {
  return (
    <button className={`h-14 w-full rounded-[1.15rem] text-sm font-black transition active:scale-[0.98] ${className}`} type="button">
      {label}
    </button>
  );
}

export function RegisterScreen({ onEnter, onLogin }: RegisterScreenProps) {
  const [role, setRole] = useState<Role>("client");

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
                className={`h-12 rounded-[1rem] text-sm font-black transition active:scale-[0.98] ${
                  isActive ? "bg-green-600 text-white shadow-lg shadow-green-600/25" : "text-zinc-500"
                }`}
                key={option.id}
                onClick={() => setRole(option.id as Role)}
                type="button"
              >
                {option.label}
              </button>
            );
          })}
        </div>
        {role === "barber" ? (
          <div className="mt-3 rounded-[1.15rem] border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold leading-5 text-green-800">
            Los peluqueros gestionan su perfil desde la aplicación móvil de Clipcut.
          </div>
        ) : null}
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
    </AuthLayout>
  );
}
