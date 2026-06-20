"use client";

import Image from "next/image";
import { useState } from "react";

const logoSources = ["/clipcut-logo.png", "/logo.png"];

export type ClipcutLogoProps = {
  className?: string;
  height?: number;
  priority?: boolean;
  width?: number;
};

export function ClipcutLogo({
  className = "h-24 w-auto object-contain",
  height = 96,
  priority = false,
  width = 216,
}: ClipcutLogoProps) {
  const [logoIndex, setLogoIndex] = useState(0);
  const logoSrc = logoSources[logoIndex];

  if (!logoSrc) {
    return (
      <div className="inline-flex h-24 items-center gap-3 rounded-full bg-white px-6 py-3 shadow-sm ring-1 ring-zinc-200">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-[#16A34A] text-lg font-black text-white">
          C
        </span>
        <span className="text-4xl font-black tracking-[-0.06em] text-zinc-950">
          Clip<span className="text-[#16A34A]">cut</span>
        </span>
      </div>
    );
  }

  return (
    <Image
      alt="Clipcut"
      className={className}
      height={height}
      onError={() => setLogoIndex((current) => current + 1)}
      priority={priority}
      src={logoSrc}
      width={width}
    />
  );
}
