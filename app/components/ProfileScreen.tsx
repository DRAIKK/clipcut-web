"use client";

import { useRef, useState, type ChangeEvent } from "react";
import type { ClientProfile } from "../../lib/client-auth";
import { LogoHeader } from "./LogoHeader";

type ProfileScreenProps = {
  profile?: ClientProfile;
  onDeleteAccount: () => Promise<void>;
  onLogout: () => void;
  onRemovePhoto: () => Promise<void>;
  onUpdatePhoto: (file: File) => Promise<void>;
};

export function ProfileScreen({
  profile,
  onDeleteAccount,
  onLogout,
  onRemovePhoto,
  onUpdatePhoto,
}: ProfileScreenProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [photoMenuOpen, setPhotoMenuOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm("¿Seguro que querés eliminar tu cuenta? Esta acción no se puede deshacer.");
    if (!confirmed) return;

    setBusy(true);
    setMessage("");
    try {
      await onDeleteAccount();
    } catch (error) {
      const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
      setMessage(
        code.includes("requires-recent-login")
          ? "Por seguridad, iniciá sesión nuevamente antes de eliminar tu cuenta."
          : "No pudimos eliminar tu cuenta. Intentá nuevamente."
      );
    } finally {
      setBusy(false);
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setBusy(true);
    setMessage("");
    try {
      await onUpdatePhoto(file);
      setPhotoMenuOpen(false);
    } catch {
      setMessage("No pudimos subir la foto. Revisá los permisos de Storage.");
    } finally {
      setBusy(false);
    }
  };

  const handleRemovePhoto = async () => {
    setBusy(true);
    setMessage("");
    try {
      await onRemovePhoto();
      setPhotoMenuOpen(false);
    } catch {
      setMessage("No pudimos quitar la foto. Intentá nuevamente.");
    } finally {
      setBusy(false);
    }
  };

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
            <button className="w-full rounded-xl px-4 py-3 text-left text-sm font-black text-red-600 hover:bg-red-50" onClick={onLogout} type="button">
              Cerrar sesión
            </button>
            <button className="w-full rounded-xl px-4 py-3 text-left text-sm font-black text-red-600 hover:bg-red-50 disabled:opacity-50" disabled={busy} onClick={handleDeleteAccount} type="button">
              Eliminar cuenta
            </button>
          </div>
        ) : null}
      </div>

      <div className="flex justify-center">
        <div className="relative">
          <button
            aria-expanded={photoMenuOpen}
            aria-label="Cambiar foto de perfil"
            className="grid h-28 w-28 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-green-200 via-green-500 to-zinc-950 text-4xl font-black text-white shadow-xl shadow-green-950/15 ring-4 ring-white transition active:scale-95"
            onClick={() => setPhotoMenuOpen((open) => !open)}
            type="button"
          >
            {profile?.photoURL ? (
              <img alt="Foto de perfil" className="h-full w-full object-cover" src={profile.photoURL} />
            ) : (
              <span>{profile?.fullName?.[0]?.toUpperCase() || "C"}</span>
            )}
          </button>
          {photoMenuOpen ? (
            <div className="absolute left-[calc(100%-0.75rem)] top-3 z-10 w-44 rounded-2xl bg-white p-2 shadow-2xl shadow-zinc-950/15 ring-1 ring-zinc-200">
              <button className="w-full rounded-xl px-4 py-3 text-left text-sm font-black text-zinc-800 hover:bg-zinc-50" disabled={busy} onClick={() => fileInputRef.current?.click()} type="button">
                Cambiar foto
              </button>
              <button className="w-full rounded-xl px-4 py-3 text-left text-sm font-black text-zinc-800 hover:bg-zinc-50 disabled:opacity-50" disabled={busy || !profile?.photoURL} onClick={handleRemovePhoto} type="button">
                Quitar foto
              </button>
            </div>
          ) : null}
          <input accept="image/*" className="hidden" onChange={handleFileChange} ref={fileInputRef} type="file" />
        </div>
      </div>

      {message ? <p className="rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-600 ring-1 ring-red-100">{message}</p> : null}

      <section className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-zinc-200">
        <h2 className="text-2xl font-black text-zinc-950">Tu perfil</h2>
        <label className="mt-5 block text-sm font-black text-zinc-700" htmlFor="full-name">
          Nombre completo
        </label>
        <input
          className="mt-2 h-14 w-full rounded-2xl bg-zinc-50 px-4 text-base font-bold text-zinc-950 outline-none ring-1 ring-zinc-200 focus:ring-green-500"
          defaultValue={profile?.fullName || "Cliente Clipcut"}
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
