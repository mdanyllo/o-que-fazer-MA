import type { ReactNode } from "react";
import { Foto } from "@/components/azulejo/Foto";
import { cn } from "@/lib/utils";
import { BottomNav } from "./BottomNav";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

/**
 * Estrutura de toda página: link de pular, header, conteúdo, rodapé e bottom nav (celular).
 * - `semRodape`: telas de app em tela cheia (mapa).
 */
export function PageShell({
  children,
  semRodape = false,
}: {
  children: ReactNode;
  semRodape?: boolean;
  /** @deprecated o header não fica mais sobre a foto; ignorado */
  transparentHeader?: boolean;
}) {
  return (
    <div className="flex min-h-svh flex-col bg-louca">
      <a
        href="#conteudo"
        className="fixed top-2 left-2 z-[60] -translate-y-20 rounded-md bg-cobalto px-4 py-3 font-bold text-sobre-cobalto focus:translate-y-0"
      >
        Pular para o conteúdo
      </a>
      <SiteHeader />
      <main
        id="conteudo"
        tabIndex={-1}
        className={cn("flex-1 pt-16 outline-none md:pt-20", semRodape && "pb-16 md:pb-0")}
      >
        {children}
      </main>
      {!semRodape && <SiteFooter />}
      <BottomNav />
    </div>
  );
}

/** Capa de página legada (telas antigas, refeitas na etapa d). */
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
    <section className={cn("relative flex items-end", tall ? "min-h-[70svh]" : "min-h-[48svh]")}>
      <Foto src={image} alt={title} rotulo={title} prioridade className="absolute inset-0" />
      <div className="absolute inset-0 veu-foto" />
      <div className="relative mx-auto w-full max-w-7xl px-5 pt-24 pb-12 text-sobre-foto md:px-12 md:pb-16">
        {eyebrow && <p className="mb-3 text-rotulo">{eyebrow}</p>}
        <h1 className="max-w-4xl text-t1">{title}</h1>
        {subtitle && <p className="mt-4 medida text-lg">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}

/** Abertura padrão das páginas internas: título grande + apoio, sem etiqueta acima. */
export function CabecalhoPagina({
  titulo,
  apoio,
  children,
  className,
}: {
  titulo: ReactNode;
  apoio?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn("mx-auto max-w-7xl px-5 pt-10 pb-10 md:px-12 md:pt-16 md:pb-14", className)}
    >
      <h1 className="max-w-4xl text-display text-cobalto">{titulo}</h1>
      {apoio && <p className="mt-6 medida text-[1.1875rem] text-ink-suave">{apoio}</p>}
      {children}
    </section>
  );
}
