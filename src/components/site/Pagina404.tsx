import { Link } from "@tanstack/react-router";
import { ArrowLeft, Compass } from "lucide-react";
import { botao } from "@/components/azulejo/botao";
import { PadraoAzulejo } from "@/components/azulejo/PadraoAzulejo";
import { cn } from "@/lib/utils";
import { PageShell } from "./PageShell";

/** 404: um azulejo faltando na parede. */
export function Pagina404({
  titulo = "Essa página não está aqui",
  texto = "Pode ser um endereço antigo ou digitado errado. Volte para o começo ou veja o que fazer no Maranhão.",
}: {
  titulo?: string;
  texto?: string;
}) {
  return (
    <PageShell>
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 md:grid-cols-[1fr_1fr] md:px-8 md:py-24">
          <div className="relative z-10">
            <p className="text-rotulo text-guara">Erro 404</p>
            <h1 className="mt-4 text-display">{titulo}</h1>
            <p className="mt-6 medida text-corpo text-ink-suave">{texto}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/" className={botao({ tamanho: "lg" })}>
                <ArrowLeft /> Voltar para o início
              </Link>
              <Link to="/explorar" className={botao({ variante: "secundario", tamanho: "lg" })}>
                <Compass /> Explorar
              </Link>
            </div>
          </div>

          {/* parede de azulejos com uma peça faltando, cortada pela borda */}
          <div className="relative h-72 md:-mr-40 md:h-[30rem]" aria-hidden>
            <PadraoAzulejo azulejo={96} className="absolute inset-0" />
            <div
              className={cn(
                "absolute size-24 border-2 border-dashed border-linha bg-louca",
                "top-[96px] left-[96px] md:top-[192px] md:left-[192px]",
              )}
            />
          </div>
        </div>
      </section>
    </PageShell>
  );
}
