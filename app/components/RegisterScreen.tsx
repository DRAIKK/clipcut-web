"use client";

import { useState } from "react";
import { AuthInput } from "./AuthInput";
import { AuthLayout } from "./AuthLayout";
import { BarberAppModal } from "./BarberAppModal";

type RegisterScreenProps = {
  error?: string;
  loading?: boolean;
  onEnter: (fullName: string, email: string, password: string) => void;
  onLogin: () => void;
};

type Role = "client";

function SocialButton({ className, label }: { className: string; label: string }) {
  return (
    <button className={`h-14 w-full rounded-[1.15rem] text-sm font-black transition active:scale-[0.98] ${className}`} type="button">
      {label}
    </button>
  );
}

export function RegisterScreen({ error, loading = false, onEnter, onLogin }: RegisterScreenProps) {
  const [role, setRole] = useState<Role>("client");
  const [barberModalOpen, setBarberModalOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <AuthLayout>
      <div className="space-y-4">
        <AuthInput label="Nombre completo" onChange={setFullName} value={fullName} />
        <AuthInput label="Correo electrónico" onChange={setEmail} type="email" value={email} />
        <AuthInput label="Contraseña" onChange={setPassword} type="password" value={password} />
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

      {error ? (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold leading-5 text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <button
        className="mt-6 h-14 w-full rounded-[1.15rem] bg-green-600 text-base font-black text-white shadow-xl shadow-green-600/25 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        disabled={loading}
        onClick={() => onEnter(fullName, email, password)}
        type="button"
      >
        {loading ? "Creando cuenta..." : "Crear cuenta"}
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

      <p className="pt-7 text-center text-sm font-bold text-zinc-500">
        ¿Ya tenés cuenta?{" "}
        <button className="font-black text-green-600" onClick={onLogin} type="button">
          Iniciar sesión
        </button>
      </p>

      <BarberAppModal onClose={() => setBarberModalOpen(false)} open={barberModalOpen} />
    </AuthLayout>
  );
}
