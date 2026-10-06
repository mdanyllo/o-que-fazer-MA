import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useMinhaViagem } from "@/lib/minha-viagem";
import { NAV_INFERIOR } from "./nav";

/** Barra de navegação inferior, só no celular. */
export function BottomNav() {
  const { favoritos, roteiros } = useMinhaViagem();
  const salvos = favoritos.length + roteiros.length;
  const caminho = useRouterState({ select: (st) => st.location.pathname });

  return (
    <nav
      aria-label="Navegação"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-linha bg-louca/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {NAV_INFERIOR.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="group relative flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] leading-none min-[380px]:text-[12px] font-bold tracking-tight whitespace-nowrap text-ink-suave transition-colors duration-150 data-[status=active]:text-cobalto"
            >
              {(item.to === "/" ? caminho === "/" : caminho.startsWith(item.to)) && (
                <motion.span
                  layoutId="ponto-nav-inferior"
                  aria-hidden
                  className="absolute top-1.5 size-1.5 rounded-full bg-guara"
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
              <span className="relative">
                <item.icone className="size-6" strokeWidth={2} />
                {item.to === "/minha-viagem" && salvos > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 grid min-w-4 place-items-center rounded-full bg-guara px-1 text-[10px] leading-4 text-louca">
                    {salvos}
                  </span>
                )}
              </span>
              {item.rotulo}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
