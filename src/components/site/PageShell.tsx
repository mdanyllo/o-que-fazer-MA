import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { Eyebrow } from "./cards";

export function PageShell({
  children,
  floatingCta = true,
}: {
  children: ReactNode;
  floatingCta?: boolean;
}) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
      {floatingCta && (
        <Link
          to="/planejar"
          className="fixed right-4 bottom-4 z-40 inline-flex items-center gap-2 rounded-full bg-turquoise px-5 py-3.5 text-sm font-medium text-turquoise-foreground shadow-lift transition-transform hover:scale-105 sm:hidden"
        >
          <Sparkles className="h-4 w-4" /> Monte minha viagem
        </Link>
      )}
    </div>
  );
}

/** Moldura da foto de topo: imagem com cantos amplos, recuada das bordas da tela. */
export function HeroFrame({
  image,
  alt,
  className,
  children,
}: {
  image: string;
  alt: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <section className="px-2 pt-19.5 sm:px-3 sm:pt-21">
      <div
        className={`relative mx-auto flex max-w-350 items-end overflow-hidden rounded-3xl sm:rounded-4xl ${className ?? ""}`}
      >
        <img src={image} alt={alt} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 hero-scrim" />
        <div className="relative w-full">{children}</div>
      </div>
    </section>
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
    <HeroFrame image={image} alt={title} className={tall ? "min-h-[72vh]" : "min-h-[46vh]"}>
      <div className="mx-auto max-w-7xl px-6 pt-24 pb-10 sm:px-10 sm:pb-12 lg:pb-14">
        {eyebrow && <Eyebrow tone="dark">{eyebrow}</Eyebrow>}
        <h1 className="mt-4 max-w-3xl font-display text-4xl text-white text-balance-title sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 max-w-2xl text-base text-white/80 text-pretty sm:text-lg">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </HeroFrame>
  );
}
