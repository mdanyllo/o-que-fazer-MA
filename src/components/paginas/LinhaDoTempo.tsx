import { Link } from "@tanstack/react-router";
import { Car, UtensilsCrossed } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { MarcaCategoria } from "@/components/azulejo/etiquetas";
import { Revelar } from "@/components/movimento/Revelar";
import { formatarHoras, nomeDestino, resolverParada, type DiaRoteiro } from "@/data";

/** Linha do tempo dia a dia de um roteiro. `acoesParada` permite editar (Minha viagem/planejador). */
export function LinhaDoTempo({
  dias,
  acoesParada,
  rodapeDia,
}: {
  dias: DiaRoteiro[];
  acoesParada?: (dia: number, parada: number) => ReactNode;
  rodapeDia?: (dia: number) => ReactNode;
}) {
  return (
    <ol className="flex flex-col">
      {dias.map((dia, d) => (
        <Revelar
          as="li"
          key={d}
          atraso={Math.min(d, 3) * 80}
          className="relative grid grid-cols-[56px_1fr] gap-4 pb-10 last:pb-0"
        >
          {/* trilho vertical entre os dias */}
          {d < dias.length - 1 && (
            <span
              aria-hidden
              className="trilho absolute top-14 bottom-0 left-[27px] w-0.5 bg-linha"
            />
          )}
          <span className="grid size-14 place-items-center rounded-sm bg-cobalto text-center leading-none text-sobre-cobalto">
            <span>
              <span className="block text-[11px] font-bold">Dia</span>
              <span className="font-display text-2xl font-extrabold">{d + 1}</span>
            </span>
          </span>
          <div className="min-w-0 pt-1">
            <h3 className="text-t3">{dia.titulo}</h3>
            <p className="mt-1 text-ink-suave">{dia.resumo}</p>
            {dia.deslocamento && (
              <p className="mt-2 flex items-center gap-2 text-legenda text-ink-suave">
                <Car className="size-4" aria-hidden /> {dia.deslocamento}
              </p>
            )}
            <ul className="mt-4 flex flex-col gap-2">
              {dia.paradas.map((p, i) => {
                // chave estável (sem o índice) para animar a troca de posição
                const repeticoes = dia.paradas
                  .slice(0, i)
                  .filter((x) => x.ref.tipo === p.ref.tipo && x.ref.slug === p.ref.slug).length;
                const item = resolverParada(p);
                if (!item) return null;
                return (
                  <motion.li
                    layout="position"
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    key={`${p.ref.tipo}:${p.ref.slug}:${repeticoes}`}
                    className="flex items-center gap-3 rounded-md bg-areia p-3"
                  >
                    <MarcaCategoria categoria={item.categoria} tamanho="sm" />
                    <div className="min-w-0 flex-1">
                      <Link
                        to={item.href}
                        params={{ slug: item.slug }}
                        className="font-bold underline-offset-4 hover:text-cobalto hover:underline"
                      >
                        {item.nome}
                      </Link>
                      <p className="text-legenda text-ink-suave">
                        {nomeDestino(item.destino)}
                        {item.horas > 0 && ` · ${formatarHoras(item.horas)}`}
                        {p.nota && ` · ${p.nota}`}
                      </p>
                    </div>
                    {acoesParada?.(d, i)}
                  </motion.li>
                );
              })}
            </ul>
            {dia.ondeComer && dia.ondeComer.length > 0 && (
              <p className="mt-3 flex items-center gap-2 text-legenda text-ink-suave">
                <UtensilsCrossed className="size-4" aria-hidden /> Onde comer:{" "}
                {dia.ondeComer.join(", ")}
              </p>
            )}
            {rodapeDia?.(d)}
          </div>
        </Revelar>
      ))}
    </ol>
  );
}
