import type { ReactNode } from "react";
import { Foto } from "@/components/azulejo/Foto";
import { cn } from "@/lib/utils";
import { BottomNav } from "./BottomNav";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

/**
 * Estrutura de toda página: link de pular, header, conteúdo, rodapé e bottom nav (celular).
 * - `sobreFoto`: a página começa com uma foto grande; o header fica transparente por cima.
 * - `semRodape`: telas de app em tela cheia (mapa).
 */
export function PageShell({
  children,
  sobreFoto = false,
  transparentHeader = false,
  semRodape = false,
}: {
  children: ReactNode;
  sobreFoto?: boolean;
  /** @deprecated nome antigo de `sobreFoto`, usado pelas telas que serão refeitas */
  transparentHeader?: boolean;
  semRodape?: boolean;
}) {
  const foto = sobreFoto || transparentHeader;
  return (
    <div className="flex min-h-svh flex-col bg-louca">
      <a
        href="#conteudo"
        className="fixed top-2 left-2 z-[60] -translate-y-20 rounded-md bg-cobalto px-4 py-3 font-bold text-sobre-cobalto focus:translate-y-0"
      >
        Pular para o conteúdo
      </a>
      <SiteHeader sobreFoto={foto} />
      <main
        id="conteudo"
        tabIndex={-1}
        className={cn(
          "flex-1 outline-none",
          !foto && "pt-16 md:pt-18",
          semRodape && "pb-16 md:pb-0",
        )}
      >
        {children}
      </main>
      {!semRodape && <SiteFooter />}
      <BottomNav />
    </div>
  );
}

/** Capa de página com foto que sangra até a borda e título sobre véu escuro. */
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
    <section className={cn("relative flex items-end", tall ? "min-h-[78svh]" : "min-h-[56svh]")}>
      <Foto src={image} alt={title} rotulo={title} prioridade className="absolute inset-0" />
      <div className="absolute inset-0 veu-foto" />
      <div className="relative mx-auto w-full max-w-7xl px-4 pt-32 pb-12 text-sobre-foto md:px-8 md:pb-16">
        {eyebrow && <p className="mb-3 text-rotulo">{eyebrow}</p>}
        <h1 className="max-w-4xl text-t1 md:text-display">{title}</h1>
        {subtitle && <p className="mt-4 medida text-lg">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}
