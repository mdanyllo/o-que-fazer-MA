import type { ReactNode } from "react";
import { PageShell } from "@/components/site/PageShell";

/**
 * Termos e privacidade. O texto é PROVISÓRIO: precisa de revisão jurídica antes do lançamento,
 * e a página diz isso logo no começo.
 */
export function PaginaLegal({
  titulo,
  atualizado,
  children,
}: {
  titulo: string;
  atualizado: string;
  children: ReactNode;
}) {
  return (
    <PageShell>
      <article className="mx-auto flex max-w-3xl flex-col gap-8 px-5 pt-10 pb-16 md:px-12 md:pt-16 md:pb-24">
        <header className="flex flex-col gap-4">
          <p
            role="note"
            className="self-start rounded-sm bg-ouro px-3 py-1 text-rotulo text-sobre-ouro"
          >
            Rascunho para revisão jurídica
          </p>
          <h1 className="text-t1 text-cobalto">{titulo}</h1>
          <p className="text-legenda text-ink-suave">
            Versão provisória de {atualizado}. Este texto ainda não vale como documento final.
          </p>
        </header>
        <div className="flex flex-col gap-8 [&_h2]:text-t3 [&_li]:ml-5 [&_li]:list-disc [&_p]:medida [&_section]:flex [&_section]:flex-col [&_section]:gap-3 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1">
          {children}
        </div>
      </article>
    </PageShell>
  );
}
