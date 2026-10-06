import { createFileRoute, Link } from "@tanstack/react-router";
import { Route as RouteIcon, X } from "lucide-react";
import { useId, useMemo } from "react";
import { Chip } from "@/components/azulejo/etiquetas";
import { MapaInterativo } from "@/components/mapa/MapaInterativo";
import { PageShell } from "@/components/site/PageShell";
import {
  categorias,
  getRoteiro,
  itens,
  nomeDestino,
  pontosDoRoteiro,
  roteiros,
  type CategoriaId,
} from "@/data";

type BuscaMapa = { categoria?: CategoriaId; roteiro?: string };

export const Route = createFileRoute("/mapa")({
  validateSearch: (s: Record<string, unknown>): BuscaMapa => {
    const out: BuscaMapa = {};
    const c = s["categoria"];
    if (typeof c === "string" && categorias.some((x) => x.id === c))
      out.categoria = c as CategoriaId;
    const r = s["roteiro"];
    if (typeof r === "string" && getRoteiro(r)) out.roteiro = r;
    return out;
  },
  head: () => ({
    meta: [
      { title: "Mapa do Maranhão | Azulejo" },
      {
        name: "description",
        content:
          "Lagoas, cachoeiras, casarões, onde comer e onde ficar no mapa do Maranhão, com as rotas dos roteiros.",
      },
    ],
  }),
  component: PaginaMapa,
});

function PaginaMapa() {
  const busca = Route.useSearch();
  const navigate = Route.useNavigate();
  const idRoteiro = useId();
  const roteiro = busca.roteiro ? getRoteiro(busca.roteiro) : undefined;

  const { pontos, rota } = useMemo(() => {
    if (roteiro) {
      const p = pontosDoRoteiro(roteiro.dias);
      return { pontos: p, rota: p.map(({ lat, lng }) => ({ lat, lng })) };
    }
    // lugares (as experiências ficam no mesmo ponto dos lugares que visitam)
    const p = itens.filter(
      (i) => i.tipo === "lugar" && (!busca.categoria || i.categoria === busca.categoria),
    );
    return { pontos: p, rota: undefined };
  }, [roteiro, busca.categoria]);

  const atualizar = (m: { categoria?: CategoriaId | undefined; roteiro?: string | undefined }) =>
    navigate({
      search: (prev) => {
        const proximo: Record<string, unknown> = { ...prev, ...m };
        for (const k of Object.keys(proximo)) if (proximo[k] === undefined) delete proximo[k];
        return proximo as BuscaMapa;
      },
      replace: true,
    });

  return (
    <PageShell semRodape>
      <h1 className="sr-only">Mapa do Maranhão</h1>
      <div className="relative h-[calc(100svh-8rem)] md:h-[calc(100svh-5rem)]">
        <MapaInterativo
          pontos={pontos}
          {...(rota ? { rota } : {})}
          card="completo"
          rolagemZoom
          agrupar={!roteiro}
          enquadrar={roteiro || busca.categoria ? "pontos" : "maranhao"}
          className="absolute inset-0"
        />

        {/* controles flutuando sobre o mapa */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[600] flex flex-col gap-2 p-3 md:p-4">
          <div className="pointer-events-auto flex max-w-full items-center gap-2 self-start rounded-md border border-linha bg-louca/95 p-2 shadow-flutua backdrop-blur-sm">
            <RouteIcon className="ml-1 size-5 text-cobalto" aria-hidden />
            <label htmlFor={idRoteiro} className="sr-only">
              Mostrar a rota de um roteiro
            </label>
            <select
              id={idRoteiro}
              value={busca.roteiro ?? ""}
              onChange={(e) =>
                atualizar({ roteiro: e.target.value || undefined, categoria: undefined })
              }
              className="min-h-11 min-w-0 flex-1 truncate rounded-md bg-transparent px-2 font-bold focus:outline-none"
            >
              <option value="">Todos os lugares</option>
              {roteiros.map((r) => (
                <option key={r.slug} value={r.slug}>
                  Rota: {r.titulo}
                </option>
              ))}
            </select>
            {roteiro && (
              <button
                type="button"
                onClick={() => atualizar({ roteiro: undefined })}
                aria-label="Tirar a rota"
                className="grid size-11 place-items-center rounded-md hover:bg-areia"
              >
                <X className="size-5" />
              </button>
            )}
          </div>

          {!roteiro && (
            <div
              role="group"
              aria-label="Filtrar por categoria"
              className="pointer-events-auto sem-barra -mx-3 flex gap-2 overflow-x-auto px-3 md:mx-0 md:flex-wrap md:px-0"
            >
              {categorias
                .filter((c) => c.id !== "festas")
                .map((c) => (
                  <Chip
                    key={c.id}
                    cor={c.cor}
                    ativo={busca.categoria === c.id}
                    onClick={() =>
                      atualizar({ categoria: busca.categoria === c.id ? undefined : c.id })
                    }
                    className="bg-louca shadow-flutua"
                  >
                    {c.nome}
                  </Chip>
                ))}
            </div>
          )}

          {roteiro && (
            <div className="pointer-events-auto self-start rounded-md border border-linha bg-louca p-4 shadow-flutua md:max-w-sm">
              <p className="text-legenda text-ink-suave">
                {roteiro.dias.length} dias · {roteiro.destinos.map(nomeDestino).join(" → ")}
              </p>
              <p className="mt-1 font-display text-xl font-semibold">{roteiro.titulo}</p>
              <Link
                to="/roteiros/$slug"
                params={{ slug: roteiro.slug }}
                className="mt-2 inline-flex min-h-11 items-center font-bold text-cobalto underline-offset-4 hover:underline"
              >
                Ver o roteiro dia a dia
              </Link>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
