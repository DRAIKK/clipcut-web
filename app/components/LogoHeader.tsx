"use client";

import Image from "next/image";
import { useState } from "react";

const logoSources = ["/clipcut-logo.png", "/logo.png"];

type LogoHeaderProps = {
  subtitle?: string;
  size?: "default" | "home";
};

export function LogoHeader({ subtitle, size = "default" }: LogoHeaderProps) {
  const [logoIndex, setLogoIndex] = useState(0);
  const logoSrc = logoSources[logoIndex];
  const imageClassName = size === "home" ? "h-20 w-auto object-contain" : "h-[4.5rem] w-auto object-contain";
  const imageHeight = size === "home" ? 80 : 72;

  return (
    <header className="flex flex-col items-center px-4 pb-3 pt-2 text-center">
      {logoSrc ? (
        <Image
          alt="Clipcut"
          className={imageClassName}
          height={imageHeight}
          onError={() => setLogoIndex((current) => current + 1)}
          priority
          src={logoSrc}
          width={180}
        />
      ) : (
        <div className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 shadow-sm ring-1 ring-zinc-200">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-green-600 text-sm font-black text-white">
            C
          </span>
          <span className="text-3xl font-black tracking-[-0.05em] text-zinc-950">
            Clip<span className="text-green-600">cut</span>
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
