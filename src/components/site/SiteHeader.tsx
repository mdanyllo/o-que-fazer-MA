import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Descobrir" },
  { to: "/destinos", label: "Destinos" },
  { to: "/experiencias", label: "Experiências" },
  { to: "/roteiros", label: "Roteiros" },
  { to: "/mapa", label: "Mapa" },
  { to: "/eventos", label: "Eventos" },
] as const;

export function SiteHeader({ transparent = false }: { transparent?: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = !transparent || scrolled || open;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        solid ? "border-b border-border bg-background/90 backdrop-blur-md" : "bg-transparent",
      )}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3.5 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <span
            className={cn(
              "grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-colors",
              solid ? "bg-primary text-primary-foreground" : "bg-background/20 text-white backdrop-blur-sm",
            )}
          >
            <Compass className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span
              className={cn(
                "block truncate font-display text-lg leading-none font-semibold",
                solid ? "text-foreground" : "text-white",
              )}
            >
              Descubra Maranhão
            </span>
            <span
              className={cn(
                "block text-[11px] tracking-[0.18em] uppercase",
                solid ? "text-muted-foreground" : "text-white/70",
              )}
            >
              Guia de viagem
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <nav className="hidden items-center gap-1 lg:flex">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className={cn(
                  "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                  solid
                    ? "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    : "text-white/80 hover:bg-white/15 hover:text-white",
                )}
                activeProps={{
                  className: solid ? "bg-secondary text-foreground" : "bg-white/20 text-white",
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            to="/planejar"
            className="ml-2 hidden rounded-full bg-turquoise px-5 py-2.5 text-sm font-semibold text-turquoise-foreground shadow-soft transition-transform hover:scale-[1.03] sm:inline-flex"
          >
            Monte minha viagem
          </Link>

          <button
            type="button"
            aria-label="Abrir menu"
            onClick={() => setOpen((v) => !v)}
            className={cn(
              "grid h-10 w-10 place-items-center rounded-xl lg:hidden",
              solid ? "text-foreground hover:bg-secondary" : "text-white hover:bg-white/15",
            )}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-background px-5 pb-5 lg:hidden">
          <ul className="flex flex-col py-2">
            {nav.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-secondary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/empresas"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-secondary"
              >
                Empresas locais
              </Link>
            </li>
          </ul>
          <Link
            to="/planejar"
            onClick={() => setOpen(false)}
            className="block rounded-full bg-turquoise px-5 py-3 text-center text-sm font-semibold text-turquoise-foreground"
          >
            Monte minha viagem
          </Link>
        </nav>
      )}
    </header>
  );
}
