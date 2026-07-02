"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    window.localStorage.setItem("clipcut:payment-return", "success");
    const timeout = window.setTimeout(() => router.replace("/"), 1200);

    return () => window.clearTimeout(timeout);
  }, [router]);

  return (
    <main className="grid min-h-dvh place-items-center bg-zinc-50 px-4 text-center text-zinc-950">
      <section className="w-full max-w-sm rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-zinc-200">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green-100 text-3xl">✓</div>
        <h1 className="mt-4 text-2xl font-black tracking-tight">Pago recibido</h1>
        <p className="mt-2 text-sm font-semibold leading-6 text-zinc-500">
          Volvemos a Clipcut y actualizamos tus reservas. La confirmación aparece cuando Mercado Pago informa el pago aprobado.
        </p>
        <button className="mt-5 h-12 w-full rounded-2xl bg-green-600 font-black text-white" onClick={() => router.replace("/")} type="button">
          Volver a Clipcut
        </button>
      </section>
    </main>
  );
}
