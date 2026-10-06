import { createElement, Fragment, type CSSProperties } from "react";

/**
 * Título que entra palavra por palavra, subindo de trás de uma máscara.
 * O texto continua sendo texto normal para leitores de tela e buscadores.
 */
export function TituloAnimado({
  texto,
  as = "h1",
  className,
  atraso = 100,
  id,
}: {
  texto: string;
  as?: "h1" | "h2";
  className?: string;
  /** atraso antes da primeira palavra, em ms */
  atraso?: number;
  id?: string;
}) {
  const palavras = texto.split(" ");
  return createElement(
    as,
    { className, id, style: { "--atraso-base": `${atraso}ms` } as CSSProperties },
    palavras.map((p, i) => (
      <Fragment key={i}>
        <span className="palavra-mascara">
          <span style={{ "--i": i } as CSSProperties}>{p}</span>
        </span>
        {i < palavras.length - 1 ? " " : null}
      </Fragment>
    )),
  );
}
