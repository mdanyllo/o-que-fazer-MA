import { Fragment } from "react";
import { cn } from "@/lib/utils";

/**
 * Faixa em movimento lento com nomes de cidades e experiências (decorativa).
 * Para no hover; com movimento reduzido fica parada.
 */
export function FaixaMovimento({ itens, className }: { itens: string[]; className?: string }) {
  const lista = (
    <>
      {itens.map((t) => (
        <Fragment key={t}>
          <span className="whitespace-nowrap">{t}</span>
          <span aria-hidden className="size-2.5 shrink-0 rounded-full bg-guara" />
        </Fragment>
      ))}
    </>
  );
  return (
    <div aria-hidden className={cn("overflow-hidden border-y border-linha py-5", className)}>
      <div className="faixa-movimento flex w-max items-center gap-8 pr-8 font-display text-[clamp(1.5rem,1.2rem+1.2vw,2.25rem)] font-semibold text-cobalto">
        {lista}
        {lista}
      </div>
    </div>
  );
}
