import { Link } from "@tanstack/react-router";
import { ArrowRight, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { MarcaCategoria } from "@/components/azulejo/etiquetas";
import { Mapa } from "@/components/mapa/Mapa";
import { itens, nomeDestino, type Item } from "@/data";

/**
 * Prévia do mapa na Home: só os pins coloridos por categoria. O nome aparece ao passar
 * o mouse ou tocar; ao selecionar, fica fixo e um card sobe com o link.
 */
export function MapaPrevia() {
  const pontos = useMemo(() => itens.filter((i) => i.tipo === "lugar" && !i.ficticio), []);
  const [selecionado, setSelecionado] = useState<Item | null>(null);
  const aoSelecionar = useCallback((item: Item | null) => setSelecionado(item), []);

  return (
    <Mapa
      pontos={pontos}
      selecionado={selecionado ? `${selecionado.tipo}:${selecionado.slug}` : null}
      aoSelecionar={aoSelecionar}
      className="h-[360px] w-full overflow-hidden rounded-md md:h-[440px]"
    >
      {selecionado && (
        <div className="absolute right-3 bottom-3 left-3 z-[500] flex items-center gap-3 rounded-md border border-linha bg-louca p-3 text-ink shadow-flutua sm:right-auto sm:max-w-sm">
          <MarcaCategoria categoria={selecionado.categoria} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold">{selecionado.nome}</p>
            <p className="text-legenda text-ink-suave">{nomeDestino(selecionado.destino)}</p>
          </div>
          <Link
            to={selecionado.href}
            params={{ slug: selecionado.slug }}
            aria-label={`Ver ${selecionado.nome}`}
            className="grid size-11 shrink-0 place-items-center rounded-md bg-cobalto text-sobre-cobalto hover:bg-cobalto-forte"
          >
            <ArrowRight className="size-5" />
          </Link>
          <button
            type="button"
            onClick={() => setSelecionado(null)}
            aria-label="Fechar"
            className="grid size-11 shrink-0 place-items-center rounded-md hover:bg-areia"
          >
            <X className="size-5" />
          </button>
        </div>
      )}
    </Mapa>
  );
}
