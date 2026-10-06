import { createElement, Fragment, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Título que entra palavra por palavra, subindo de trás de uma máscara.
 * O texto continua sendo texto normal para leitores de tela e buscadores.
 * Um "\n" no texto força a quebra de linha naquele ponto.
 */
export function TituloAnimado({
  texto,
  as = "h1",
  className,
  atraso = 100,
  id,
  final,
  rolagem = false,
}: {
  texto: string;
  /** colado à última palavra, entra junto com ela (ex.: o ponto final em guará) */
  final?: ReactNode;
  as?: "h1" | "h2";
  className?: string;
  /** atraso antes da primeira palavra, em ms */
  atraso?: number;
  id?: string | undefined;
  /** entra quando o bloco [data-revelar] em volta aparece na tela, em vez de ao carregar */
  rolagem?: boolean;
}) {
  // cada palavra guarda se começa uma linha nova (vinha depois de um "\n")
  const palavras = texto.split("\n").flatMap((linha, l) =>
    linha
      .split(" ")
      .filter(Boolean)
      .map((p, j) => ({ p, quebra: l > 0 && j === 0 })),
  );
  return createElement(
    as,
    {
      className: rolagem ? cn("titulo-rolagem", className) : className,
      id,
      style: { "--atraso-base": `${atraso}ms` } as CSSProperties,
    },
    palavras.map(({ p, quebra }, i) => (
      <Fragment key={i}>
        {i > 0 ? " " : null}
        {quebra && <br />}
        <span className="palavra-mascara">
          <span style={{ "--i": i } as CSSProperties}>
            {p}
            {i === palavras.length - 1 ? final : null}
          </span>
        </span>
      </Fragment>
    )),
  );
}
