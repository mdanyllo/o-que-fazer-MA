import type { ReactNode } from "react";
import { Revelar } from "@/components/movimento/Revelar";
import { TituloAnimado } from "@/components/movimento/TituloAnimado";
import { cn } from "@/lib/utils";

/**
 * Título de seção como na referência: H2 forte, uma frase de apoio e, opcionalmente,
 * um link à direita ("Ver todos…"). Sem etiqueta em maiúsculas acima.
 * Quando entra na tela, o título sobe palavra por palavra e o apoio vem logo depois.
 */
export function SecaoTitulo({
  titulo,
  apoio,
  acao,
  id,
  className,
}: {
  titulo: string;
  apoio?: ReactNode;
  acao?: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <Revelar
      variante="titulo"
      className={cn("flex flex-wrap items-end justify-between gap-4", className)}
    >
      <div className="flex max-w-2xl flex-col gap-2">
        <TituloAnimado as="h2" id={id} texto={titulo} atraso={0} rolagem className="text-t1" />
        {apoio && <p className="depois-do-titulo text-ink-suave">{apoio}</p>}
      </div>
      {acao && <div className="depois-do-titulo">{acao}</div>}
    </Revelar>
  );
}

/** Link de texto em cobalto, negrito, com alvo de 44px. */
export const linkTexto =
  "inline-flex min-h-11 items-center gap-1 font-bold text-cobalto underline-offset-4 hover:text-cobalto-forte hover:underline";
