import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { MolduraPainel } from "./MolduraPainel";

/** Classes do miolo das telas do painel e do admin (ao lado do menu lateral). */
export const conteudoPainel =
  "mx-auto flex w-full flex-col gap-8 px-5 pt-6 pb-16 md:px-8 md:pt-10 lg:px-10";

/**
 * Telas do painel: título e conteúdo na largura toda, dentro da moldura do painel.
 * `voltar`: link acima do título (padrão: "Meus negócios"); `false` tira.
 */
export function LayoutPainel({
  titulo,
  children,
  largura = "max-w-site",
  voltar = { to: "/painel", rotulo: "Meus negócios" },
}: {
  titulo: string;
  children: ReactNode;
  largura?: string;
  voltar?: { to: "/painel" | "/painel/estatisticas"; rotulo: string } | false;
}) {
  return (
    <MolduraPainel>
      <div className={`${conteudoPainel} ${largura}`}>
        <div className="flex flex-col gap-2">
          {voltar && (
            <Link
              to={voltar.to}
              className="-ml-1 inline-flex min-h-11 items-center gap-1 self-start text-legenda font-bold text-cobalto underline-offset-4 hover:underline"
            >
              <ArrowLeft className="size-4" aria-hidden /> {voltar.rotulo}
            </Link>
          )}
          <h1 className="text-t1 break-words text-cobalto">{titulo}</h1>
        </div>
        {children}
      </div>
    </MolduraPainel>
  );
}
