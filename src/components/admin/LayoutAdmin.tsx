import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { PageShell } from "@/components/site/PageShell";
import { ContadorEmAnalise } from "./ContadorEmAnalise";

const ITENS = [
  { to: "/admin", rotulo: "Negócios" },
  { to: "/admin/usuarios", rotulo: "Usuários" },
  { to: "/admin/novo", rotulo: "Cadastrar negócio" },
] as const;

/** "Negócios" fica ativo na lista e na página de cada negócio. */
function itemAtivo(caminho: string) {
  if (caminho.startsWith("/admin/usuarios")) return "/admin/usuarios";
  if (caminho.startsWith("/admin/novo")) return "/admin/novo";
  return "/admin";
}

/**
 * Moldura das telas do admin: a mesma casca do site, com uma faixa simples de navegação
 * (texto e sublinhado, sem competir com o visual público).
 */
export function LayoutAdmin({
  titulo,
  acoes,
  children,
  largura = "max-w-6xl",
}: {
  titulo: ReactNode;
  acoes?: ReactNode;
  children: ReactNode;
  largura?: string;
}) {
  const ativo = itemAtivo(useRouterState({ select: (s) => s.location.pathname }));
  return (
    <PageShell>
      <div className="border-b border-linha bg-areia">
        <nav
          aria-label="Administração"
          className={`mx-auto flex ${largura} items-center gap-1 overflow-x-auto px-5 md:px-12`}
        >
          <span className="mr-3 shrink-0 text-rotulo text-ink-suave">Admin</span>
          {ITENS.map((i) => (
            <Link
              key={i.to}
              to={i.to}
              // o Link marca sozinho só a rota exata; o destaque segue a seção (itemAtivo)
              activeOptions={{ exact: true, includeSearch: false }}
              data-ativo={ativo === i.to}
              className="flex min-h-12 shrink-0 items-center gap-2 border-b-2 border-transparent px-3 text-[0.9375rem] font-bold text-ink-suave hover:text-cobalto data-[ativo=true]:border-cobalto data-[ativo=true]:text-cobalto"
            >
              {i.rotulo}
              {i.to === "/admin" && <ContadorEmAnalise />}
            </Link>
          ))}
        </nav>
      </div>
      <div
        className={`mx-auto flex ${largura} flex-col gap-8 px-5 pt-8 pb-16 md:px-12 md:pt-12 md:pb-24`}
      >
        <header className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="min-w-0 text-t1 break-words text-cobalto">{titulo}</h1>
          {acoes}
        </header>
        {children}
      </div>
    </PageShell>
  );
}
