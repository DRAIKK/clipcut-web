import type { ReactNode } from "react";
import { LogoHeader } from "./LogoHeader";

type AuthLayoutProps = {
  children: ReactNode;
  title?: string;
};

export function AuthLayout({ children, title }: AuthLayoutProps) {
  return (
    <section className="flex min-h-dvh flex-col bg-zinc-50 px-4 pb-8 pt-7 text-zinc-950">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <LogoHeader />
        {title ? (
          <h1 className="mt-5 text-center text-[2rem] font-black leading-tight tracking-[-0.045em] text-zinc-950">
            {title}
          </h1>
        ) : null}
        <div className="mt-7 flex flex-1 flex-col">{children}</div>
      </div>
    </section>
  );
}
