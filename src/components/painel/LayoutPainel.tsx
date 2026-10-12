import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { PageShell } from "@/components/site/PageShell";

/** Moldura das telas do formulário: voltar para a lista, título e uma coluna estreita. */
export function LayoutPainel({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <PageShell>
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-5 pt-6 pb-16 md:px-12 md:pt-12 md:pb-24">
        <div className="flex flex-col gap-2">
          <Link
            to="/painel"
            className="-ml-1 inline-flex min-h-11 items-center gap-1 self-start text-legenda font-bold text-cobalto underline-offset-4 hover:underline"
          >
            <ArrowLeft className="size-4" aria-hidden /> Meus negócios
          </Link>
          <h1 className="text-t1 break-words text-cobalto">{titulo}</h1>
        </div>
        {children}
      </div>
    </PageShell>
  );
}
