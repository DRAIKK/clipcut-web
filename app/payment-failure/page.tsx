"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PaymentFailurePage() {
  const router = useRouter();

  useEffect(() => {
    window.localStorage.setItem("clipcut:payment-return", "failure");
  }, []);

  return (
    <main className="grid min-h-dvh place-items-center bg-zinc-50 px-4 text-center text-zinc-950">
      <section className="w-full max-w-sm rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-zinc-200">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-red-50 text-3xl">!</div>
        <h1 className="mt-4 text-2xl font-black tracking-tight">No se completó el pago</h1>
        <p className="mt-2 text-sm font-semibold leading-6 text-zinc-500">
          Podés volver a Clipcut para revisar tus reservas o intentar nuevamente.
        </p>
        <button className="mt-5 h-12 w-full rounded-2xl bg-green-600 font-black text-white" onClick={() => router.replace("/")} type="button">
          Volver a Clipcut
        </button>
      </section>
    </main>
  );
}
