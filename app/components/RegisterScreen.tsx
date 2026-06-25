"use client";

import { useState } from "react";
import { AuthInput } from "./AuthInput";
import { AuthLayout } from "./AuthLayout";
import { BarberAppModal } from "./BarberAppModal";

type RegisterScreenProps = {
  error?: string;
  loading?: boolean;
  onEnter: (fullName: string, email: string, password: string) => void;
  onGoogle: () => void;
  onLogin: () => void;
};

type Role = "client";

type SocialButtonProps = {
  className: string;
  disabled?: boolean;
  label: string;
  onClick?: () => void;
  showGoogleIcon?: boolean;
};

function SocialButton({ className, disabled = false, label, onClick, showGoogleIcon = false }: SocialButtonProps) {
  return (
    <button
      className={`flex h-14 w-full items-center justify-center gap-3 rounded-[1.15rem] text-sm font-black transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {showGoogleIcon ? (
        <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
            fill="#EA4335"
          />
        </svg>
      ) : null}
      <span>{label}</span>
    </button>
  );
}

export function RegisterScreen({ error, loading = false, onEnter, onGoogle, onLogin }: RegisterScreenProps) {
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
        <SocialButton
          className="border border-zinc-200 bg-white text-zinc-950 shadow-sm"
          disabled={loading}
          label={loading ? "Conectando con Google..." : "Continuar con Google"}
          onClick={onGoogle}
          showGoogleIcon
        />
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
