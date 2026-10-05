import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Descobrir" },
  { to: "/destinos", label: "Destinos" },
  { to: "/experiencias", label: "Experiências" },
  { to: "/roteiros", label: "Roteiros" },
  { to: "/mapa", label: "Mapa" },
  { to: "/eventos", label: "Eventos" },
] as const;

export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <svg viewBox="0 0 24 24" aria-hidden className="h-6 w-6 shrink-0">
        <path
          d="M2 17c3-5 6.5-7.5 10-7.5S19 12 22 17"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <ellipse cx="12" cy="18.5" rx="4.5" ry="1.6" className="fill-turquoise" />
        <circle cx="16.5" cy="6" r="2.2" className="fill-gold" />
      </svg>
      <span className="font-display text-lg font-semibold tracking-[-0.02em] sm:text-xl">
        Descubra Maranhão
      </span>
    </span>
  );
}

/** Cabeçalho flutuante em pílula com vidro fosco. Fica por cima de qualquer hero. */
export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-3 top-2.5 z-50 mx-auto max-w-[1310px] sm:inset-x-6">
      <div className="glass flex h-[58px] items-center justify-between gap-4 rounded-full border border-white/80 pr-2 pl-5 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.18)] sm:pl-6">
        <Link to="/" className="min-w-0 text-foreground" onClick={() => setOpen(false)}>
          <BrandMark />
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-black/[0.04] hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <Link
            to="/planejar"
            className="hidden min-h-10 items-center rounded-full bg-turquoise px-5 text-sm font-medium text-turquoise-foreground shadow-pill transition-colors hover:bg-[#1ea8b0] sm:inline-flex"
          >
            Monte minha viagem
          </Link>
          <button
            type="button"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full text-foreground hover:bg-black/[0.05] lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="mt-2 rounded-3xl border border-border bg-card p-3 shadow-lift animate-rise lg:hidden">
          <ul className="flex flex-col">
            {[...nav, { to: "/empresas", label: "Empresas locais" } as const].map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-2xl px-4 py-3 text-base font-medium text-foreground hover:bg-secondary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            to="/planejar"
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-full bg-turquoise px-5 py-3 text-center text-sm font-medium text-turquoise-foreground"
          >
            Monte minha viagem
          </Link>
        </nav>
      )}
    </header>
  );
}
