import type { ReactNode, TextareaHTMLAttributes } from "react";
import { classeCampo, DicaErro, descritoPor, Rotulo } from "@/components/conta/formulario";
import { CIDADES_PRINCIPAIS, OUTRAS_CIDADES } from "@/data/cidades";
import { cn } from "@/lib/utils";

/* Campos do formulário do negócio que não existem nas páginas de conta. */

/** Texto longo com contador ("123 de 600"); o contador fica em guará fora do intervalo. */
export function CampoArea({
  id,
  rotulo,
  valor,
  aoMudar,
  erro,
  dica,
  minimo,
  maximo,
  ...props
}: Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id" | "onChange" | "value"> & {
  id: string;
  rotulo: string;
  valor: string;
  aoMudar: (v: string) => void;
  erro?: string | undefined;
  dica?: string;
  minimo?: number;
  maximo: number;
}) {
  const n = valor.trim().length;
  const fora = n > maximo || (minimo !== undefined && n > 0 && n < minimo);
  return (
    <div className="flex flex-col gap-2">
      <Rotulo id={id} rotulo={rotulo} />
      <textarea
        id={id}
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        aria-invalid={erro ? true : undefined}
        aria-describedby={[descritoPor(id, dica, erro), `${id}-contador`].filter(Boolean).join(" ")}
        maxLength={maximo + 50}
        rows={6}
        className={cn(classeCampo, "min-h-36 resize-y py-3 leading-relaxed")}
        {...props}
      />
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <DicaErro id={id} dica={dica} erro={erro} />
        </div>
        <p
          id={`${id}-contador`}
          aria-live="polite"
          className={cn(
            "shrink-0 text-legenda tabular-nums",
            fora ? "font-bold text-guara" : "text-ink-suave",
          )}
        >
          {n} de {maximo}
          {minimo !== undefined && n < minimo && (
            <span className="sr-only"> (mínimo {minimo})</span>
          )}
        </p>
      </div>
    </div>
  );
}

/** Lista de cidades do Maranhão, as mais procuradas primeiro. */
export function CampoCidade({
  id,
  valor,
  aoMudar,
  erro,
  dica,
}: {
  id: string;
  valor: string;
  aoMudar: (v: string) => void;
  erro?: string | undefined;
  dica?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Rotulo id={id} rotulo="Cidade" />
      <select
        id={id}
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        aria-invalid={erro ? true : undefined}
        aria-describedby={descritoPor(id, dica, erro)}
        className={cn(classeCampo, "appearance-auto")}
      >
        <option value="">Escolha a cidade</option>
        <optgroup label="Mais procuradas">
          {CIDADES_PRINCIPAIS.map((c) => (
            <option key={c.nome} value={c.nome}>
              {c.nome}
            </option>
          ))}
        </optgroup>
        <optgroup label="Outras cidades">
          {OUTRAS_CIDADES.map((c) => (
            <option key={c.nome} value={c.nome}>
              {c.nome}
            </option>
          ))}
        </optgroup>
      </select>
      <DicaErro id={id} dica={dica} erro={erro} />
    </div>
  );
}

/**
 * Escolha única com botões grandes (radio de verdade por baixo, navegável pelo teclado).
 * `colunas` controla a grade no celular/desktop.
 */
export function GrupoOpcoes<T extends string>({
  id,
  rotulo,
  opcoes,
  valor,
  aoMudar,
  erro,
  dica,
  className,
  tamanho = "md",
}: {
  id: string;
  rotulo: string;
  opcoes: { valor: T; rotulo: string; detalhe?: ReactNode; icone?: ReactNode }[];
  valor: T | "" | null;
  aoMudar: (v: T) => void;
  erro?: string | undefined;
  dica?: string;
  className?: string;
  tamanho?: "md" | "lg";
}) {
  return (
    <fieldset
      className="flex flex-col gap-2"
      aria-invalid={erro ? true : undefined}
      aria-describedby={descritoPor(id, dica, erro)}
    >
      <legend className="mb-2 text-rotulo">{rotulo}</legend>
      <div id={id} tabIndex={-1} className={cn("grid gap-2", className)}>
        {opcoes.map((o) => {
          const marcado = valor === o.valor;
          return (
            <label
              key={o.valor}
              className={cn(
                "relative flex cursor-pointer items-center gap-3 rounded-md border-2 px-4 transition-colors duration-150",
                "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-cobalto",
                tamanho === "lg" ? "min-h-20 py-3" : "min-h-12 py-2",
                marcado
                  ? "border-cobalto bg-cobalto text-sobre-cobalto"
                  : "border-linha bg-louca hover:border-cobalto",
                erro && !marcado && "border-guara",
              )}
            >
              <input
                type="radio"
                name={id}
                value={o.valor}
                checked={marcado}
                onChange={() => aoMudar(o.valor)}
                className="sr-only"
              />
              {o.icone}
              <span className="flex flex-col">
                <span className="font-bold">{o.rotulo}</span>
                {o.detalhe && (
                  <span className={cn("text-legenda", marcado ? "opacity-90" : "text-ink-suave")}>
                    {o.detalhe}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>
      <DicaErro id={id} dica={dica} erro={erro} />
    </fieldset>
  );
}
