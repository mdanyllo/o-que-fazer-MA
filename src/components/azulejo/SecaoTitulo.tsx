import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Título de seção como na referência: H2 forte, uma frase de apoio e, opcionalmente,
 * um link à direita ("Ver todos…"). Sem etiqueta em maiúsculas acima.
 */
export function SecaoTitulo({
  titulo,
  apoio,
  acao,
  id,
  className,
}: {
  titulo: ReactNode;
  apoio?: ReactNode;
  acao?: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="flex max-w-2xl flex-col gap-2">
        <h2 id={id} className="text-t1">
          {titulo}
        </h2>
        {apoio && <p className="text-ink-suave">{apoio}</p>}
      </div>
      {acao}
    </div>
  );
}

/** Link de texto em cobalto, negrito, com alvo de 44px. */
export const linkTexto =
  "inline-flex min-h-11 items-center gap-1 font-bold text-cobalto underline-offset-4 hover:text-cobalto-forte hover:underline";
