import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export function PageShell({
  children,
  transparentHeader = false,
}: {
  children: ReactNode;
  transparentHeader?: boolean;
}) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader transparent={transparentHeader} />
      <main>{children}</main>
      <SiteFooter />
      <Link
        to="/planejar"
        className="fixed right-4 bottom-4 z-40 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-lift transition-transform hover:scale-105 sm:hidden"
      >
        <Sparkles className="h-4 w-4" /> Monte minha viagem
      </Link>
    </div>
  );
}

export function PageHero({
  image,
  eyebrow,
  title,
  subtitle,
  children,
  tall = false,
}: {
  image: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  tall?: boolean;
}) {
  return (
    <section className={`relative ${tall ? "min-h-[78vh]" : "min-h-[52vh]"} flex items-end overflow-hidden`}>
      <img src={image} alt={title} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 hero-scrim" />
      <div className="relative mx-auto w-full max-w-7xl px-5 pt-32 pb-12 lg:px-8 lg:pb-16">
        {eyebrow && (
          <p className="mb-3 text-xs font-semibold tracking-[0.22em] text-white/80 uppercase">{eyebrow}</p>
        )}
        <h1 className="max-w-3xl font-display text-4xl text-white text-balance-title sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {subtitle && <p className="mt-4 max-w-2xl text-lg text-white/85">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}
