import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useId, useState } from "react";
import { botao } from "@/components/azulejo/botao";
import { destinos, itens, resolverParada, type DiaRoteiro } from "@/data";
import { cn } from "@/lib/utils";
import { LinhaDoTempo } from "./LinhaDoTempo";

const botaoIcone =
  "grid size-11 shrink-0 place-items-center rounded-md text-ink hover:bg-louca disabled:opacity-30 disabled:hover:bg-transparent";

/**
 * Roteiro editável: subir/descer paradas (passando para o dia anterior/seguinte nas pontas),
 * remover, acrescentar paradas e dias. Tudo por botões, funciona no teclado.
 */
export function EditorRoteiro({
  dias,
  aoMudar,
}: {
  dias: DiaRoteiro[];
  aoMudar: (dias: DiaRoteiro[]) => void;
}) {
  const copiar = () => dias.map((d) => ({ ...d, paradas: [...d.paradas] }));

  function mover(d: number, p: number, direcao: -1 | 1) {
    const novo = copiar();
    const dia = novo[d]!;
    const [parada] = dia.paradas.splice(p, 1);
    if (!parada) return;
    const alvo = p + direcao;
    if (alvo < 0) novo[d - 1]!.paradas.push(parada);
    else if (alvo > dia.paradas.length) novo[d + 1]!.paradas.unshift(parada);
    else dia.paradas.splice(alvo, 0, parada);
    aoMudar(novo);
  }

  function remover(d: number, p: number) {
    const novo = copiar();
    novo[d]!.paradas.splice(p, 1);
    aoMudar(novo);
  }

  function acrescentar(d: number, chave: string) {
    const [tipo, slug] = chave.split(":") as ["lugar" | "experiencia", string];
    const novo = copiar();
    novo[d]!.paradas.push({ ref: { tipo, slug } });
    aoMudar(novo);
  }

  function removerDia(d: number) {
    aoMudar(dias.filter((_, i) => i !== d));
  }

  return (
    <div>
      <LinhaDoTempo
        dias={dias}
        acoesParada={(d, p) => {
          const nome = resolverParada(dias[d]!.paradas[p]!)?.nome ?? "parada";
          const primeira = d === 0 && p === 0;
          const ultima = d === dias.length - 1 && p === dias[d]!.paradas.length - 1;
          return (
            <div className="flex shrink-0">
              <button
                type="button"
                className={botaoIcone}
                disabled={primeira}
                onClick={() => mover(d, p, -1)}
                aria-label={`Subir ${nome}`}
              >
                <ArrowUp className="size-5" />
              </button>
              <button
                type="button"
                className={botaoIcone}
                disabled={ultima}
                onClick={() => mover(d, p, 1)}
                aria-label={`Descer ${nome}`}
              >
                <ArrowDown className="size-5" />
              </button>
              <button
                type="button"
                className={cn(botaoIcone, "hover:text-guara")}
                onClick={() => remover(d, p)}
                aria-label={`Remover ${nome}`}
              >
                <Trash2 className="size-5" />
              </button>
            </div>
          );
        }}
        rodapeDia={(d) => (
          <AcrescentarParada
            dia={d}
            aoAcrescentar={(chave) => acrescentar(d, chave)}
            aoRemoverDia={
              dias.length > 1 && dias[d]!.paradas.length === 0 ? () => removerDia(d) : undefined
            }
          />
        )}
      />
      <button
        type="button"
        onClick={() =>
          aoMudar([
            ...dias,
            { titulo: `Dia extra`, resumo: "Acrescente as paradas deste dia.", paradas: [] },
          ])
        }
        className={cn(botao({ variante: "secundario" }), "mt-8")}
      >
        <Plus /> Acrescentar um dia
      </button>
    </div>
  );
}

function AcrescentarParada({
  dia,
  aoAcrescentar,
  aoRemoverDia,
}: {
  dia: number;
  aoAcrescentar: (chave: string) => void;
  aoRemoverDia: (() => void) | undefined;
}) {
  const [valor, setValor] = useState("");
  const id = useId();
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <label htmlFor={id} className="sr-only">
        Parada para acrescentar no dia {dia + 1}
      </label>
      <select
        id={id}
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        className="min-h-11 max-w-full flex-1 rounded-md border-2 border-linha bg-louca px-3 text-base focus:border-cobalto focus:outline-none sm:max-w-xs"
      >
        <option value="">Escolha uma parada…</option>
        {destinos.map((d) => (
          <optgroup key={d.slug} label={d.nome}>
            {itens
              .filter((i) => i.destino === d.slug && i.horas > 0)
              .map((i) => (
                <option key={`${i.tipo}:${i.slug}`} value={`${i.tipo}:${i.slug}`}>
                  {i.nome}
                </option>
              ))}
          </optgroup>
        ))}
      </select>
      <button
        type="button"
        disabled={!valor}
        onClick={() => {
          aoAcrescentar(valor);
          setValor("");
        }}
        className={botao({ variante: "fantasma" })}
      >
        <Plus /> Acrescentar
      </button>
      {aoRemoverDia && (
        <button
          type="button"
          onClick={aoRemoverDia}
          className={cn(botao({ variante: "fantasma" }), "text-guara")}
        >
          <Trash2 /> Tirar este dia
        </button>
      )}
    </div>
  );
}
