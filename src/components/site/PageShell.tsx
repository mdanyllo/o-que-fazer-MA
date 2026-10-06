import type { CSSProperties, ReactNode } from "react";
import { TituloAnimado } from "@/components/movimento/TituloAnimado";
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
}) {
  return (
    <div className="flex min-h-svh flex-col overflow-x-clip bg-louca">
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

/**
 * Abertura padrão das páginas internas: título grande entrando palavra por palavra
 * e o texto de apoio logo depois. Sem etiqueta acima do título.
 */
export function CabecalhoPagina({
  titulo,
  apoio,
  children,
  className,
}: {
  titulo: string;
  apoio?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn("mx-auto max-w-7xl px-5 pt-10 pb-10 md:px-12 md:pt-16 md:pb-14", className)}
    >
      <TituloAnimado texto={titulo} className="max-w-4xl text-display text-pretty text-cobalto" />
      {apoio && (
        <p
          className="entra mt-6 medida text-[1.1875rem] text-ink-suave"
          style={{ "--atraso": `${200 + titulo.split(" ").length * 70}ms` } as CSSProperties}
        >
          {apoio}
        </p>
      )}
      {children && (
        <div
          className="entra"
          style={{ "--atraso": `${300 + titulo.split(" ").length * 70}ms` } as CSSProperties}
        >
          {children}
        </div>
      )}
    </section>
  );
}
