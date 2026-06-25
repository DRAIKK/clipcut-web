"use client";

import { useState } from "react";
import { AuthInput } from "./AuthInput";
import { AuthLayout } from "./AuthLayout";

type LoginScreenProps = {
  error?: string;
  loading?: boolean;
  onCreateAccount: () => void;
  onEnter: (email: string, password: string) => void;
  onGoogle: () => void;
};

type SocialButtonProps = {
  className: string;
  disabled?: boolean;
  label: string;
  onClick?: () => void;
};

function SocialButton({ className, disabled = false, label, onClick }: SocialButtonProps) {
  return (
    <button
      className={`h-14 w-full rounded-[1.15rem] text-sm font-black transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

export function LoginScreen({ error, loading = false, onCreateAccount, onEnter, onGoogle }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <AuthLayout title="Iniciar sesión">
      <div className="space-y-4">
        <AuthInput label="Correo electrónico" onChange={setEmail} type="email" value={email} />
        <AuthInput label="Contraseña" onChange={setPassword} type="password" value={password} />
      </div>

      {error ? (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold leading-5 text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <button
        className="mt-7 h-14 w-full rounded-[1.15rem] bg-green-600 text-base font-black text-white shadow-xl shadow-green-600/25 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        disabled={loading}
        onClick={() => onEnter(email, password)}
        type="button"
      >
        {loading ? "Ingresando..." : "Ingresar"}
      </button>

      <div className="my-7 flex items-center gap-4 text-xs font-bold text-zinc-400">
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
        />
        <SocialButton className="bg-zinc-950 text-white shadow-lg shadow-zinc-950/15" label="Continuar con Apple" />
      </div>

      <p className="mt-auto pt-8 text-center text-sm font-bold text-zinc-500">
        ¿No tenés cuenta?{" "}
        <button className="font-black text-green-600" onClick={onCreateAccount} type="button">
          Crear cuenta
        </button>
      </p>
    </AuthLayout>
  );
}
