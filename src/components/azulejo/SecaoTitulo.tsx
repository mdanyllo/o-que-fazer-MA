import type { ReactNode } from "react";
import { Revelar } from "@/components/movimento/Revelar";
import { TituloAnimado } from "@/components/movimento/TituloAnimado";
import { cn } from "@/lib/utils";

/**
 * Título de seção como na referência: H2 forte, uma frase de apoio e, opcionalmente,
 * um link à direita, na base do título ("Ver todos… →"). Sem etiqueta em maiúsculas acima.
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
      className={cn(
        "grid gap-x-6 gap-y-2 md:grid-cols-[minmax(0,1fr)_auto] md:items-baseline-last",
        className,
      )}
    >
      <TituloAnimado
        as="h2"
        id={id}
        texto={titulo}
        atraso={0}
        rolagem
        className="max-w-2xl text-t1"
      />
      {/* no desktop o link fica na linha do título, alinhado à base dele */}
      {acao && <div className="depois-do-titulo order-last md:order-none">{acao}</div>}
      {apoio && <p className="depois-do-titulo max-w-2xl text-ink-suave md:col-start-1">{apoio}</p>}
    </Revelar>
  );
}

/** Link de texto em cobalto, negrito, com alvo de 44px. */
export const linkTexto =
  "inline-flex min-h-11 items-center gap-1 font-bold text-cobalto underline-offset-4 hover:text-cobalto-forte hover:underline";
