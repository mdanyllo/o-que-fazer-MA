import type { ReactNode } from "react";
import { conteudoPainel } from "@/components/painel/LayoutPainel";
import { MolduraPainel } from "@/components/painel/MolduraPainel";

/**
 * Telas do admin: título, ações e conteúdo dentro da moldura do painel (o menu lateral mostra
 * a parte "Equipe Azulejo" para quem é admin).
 */
export function LayoutAdmin({
  titulo,
  acoes,
  children,
  largura = "max-w-site",
}: {
  titulo: ReactNode;
  acoes?: ReactNode;
  children: ReactNode;
  largura?: string;
}) {
  return (
    <MolduraPainel>
      <div className={`${conteudoPainel} ${largura}`}>
        <header className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="min-w-0 text-t1 break-words text-cobalto">{titulo}</h1>
          {acoes}
        </header>
        {children}
      </div>
    </MolduraPainel>
  );
}
