"use client";

import Image from "next/image";
import { useState } from "react";

const logoSources = ["/clipcut-logo.png", "/logo.png"];

const logoClassName = "h-24 w-auto object-contain";

export type LogoHeaderProps = {
  subtitle?: string;
};

export function LogoHeader({ subtitle }: LogoHeaderProps) {
  const [logoIndex, setLogoIndex] = useState(0);
  const logoSrc = logoSources[logoIndex];

  return (
    <header className="flex flex-col items-center justify-center px-4 pb-4 pt-2 text-center">
      {logoSrc ? (
        <Image
          alt="Clipcut"
          className={logoClassName}
          height={96}
          onError={() => setLogoIndex((current) => current + 1)}
          priority
          src={logoSrc}
          width={216}
        />
      ) : (
        <div className="inline-flex h-24 items-center gap-3 rounded-full bg-white px-6 py-3 shadow-sm ring-1 ring-zinc-200">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-[#16A34A] text-lg font-black text-white">
            C
          </span>
          <span className="text-4xl font-black tracking-[-0.06em] text-zinc-950">
            Clip<span className="text-[#16A34A]">cut</span>
          </span>
        </div>
      )}
      {subtitle ? (
        <p className="mt-2 text-xs font-bold uppercase tracking-[0.22em] text-zinc-400">
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}
