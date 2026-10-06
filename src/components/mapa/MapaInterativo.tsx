import { Link } from "@tanstack/react-router";
import { ArrowRight, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { corDaCategoria } from "@/components/azulejo/cores";
import { MarcaCategoria } from "@/components/azulejo/etiquetas";
import { Favoritar } from "@/components/azulejo/Favoritar";
import { Foto } from "@/components/azulejo/Foto";
import { categoriaPorId, nomeDestino, type Coordenada, type Item } from "@/data";
import { cn } from "@/lib/utils";
import { Mapa } from "./Mapa";

/**
 * Mapa com seleção: os pins mostram o nome no hover/toque; ao selecionar, o mapa voa até
 * o ponto e um card sobe. No celular o card ocupa a base, como um bottom sheet.
 */
export function MapaInterativo({
  pontos,
  rota,
  enquadrar = "pontos",
  agrupar = true,
  rolagemZoom = false,
  card = "compacto",
  className,
}: {
  pontos: Item[];
  rota?: Coordenada[];
  enquadrar?: "pontos" | "maranhao";
  agrupar?: boolean;
  rolagemZoom?: boolean;
  card?: "compacto" | "completo";
  className?: string;
}) {
  const [selecionado, setSelecionado] = useState<Item | null>(null);
  const aoSelecionar = useCallback((item: Item | null) => setSelecionado(item), []);

  // se o filtro tirar o ponto selecionado do mapa, fecha o card
  useEffect(() => {
    if (
      selecionado &&
      !pontos.some((p) => p.tipo === selecionado.tipo && p.slug === selecionado.slug)
    )
      setSelecionado(null);
  }, [pontos, selecionado]);

  return (
    <Mapa
      pontos={pontos}
      {...(rota ? { rota } : {})}
      selecionado={selecionado ? `${selecionado.tipo}:${selecionado.slug}` : null}
      aoSelecionar={aoSelecionar}
      enquadrar={enquadrar}
      agrupar={agrupar}
      rolagemZoom={rolagemZoom}
      className={cn("overflow-hidden", className)}
    >
      {selecionado &&
        (card === "completo" ? (
          <CardCompleto
            key={`${selecionado.tipo}:${selecionado.slug}`}
            item={selecionado}
            fechar={() => setSelecionado(null)}
          />
        ) : (
          <CardCompacto
            key={`${selecionado.tipo}:${selecionado.slug}`}
            item={selecionado}
            fechar={() => setSelecionado(null)}
          />
        ))}
    </Mapa>
  );
}

function BotaoFechar({ fechar }: { fechar: () => void }) {
  return (
    <button
      type="button"
      onClick={fechar}
      aria-label="Fechar"
      className="grid size-11 shrink-0 place-items-center rounded-md hover:bg-areia"
    >
      <X className="size-5" />
    </button>
  );
}

function CardCompacto({ item, fechar }: { item: Item; fechar: () => void }) {
  return (
    <div className="card-sobe absolute right-3 bottom-3 left-3 z-[500] flex items-center gap-3 rounded-md border border-linha bg-louca p-3 text-ink shadow-flutua sm:right-auto sm:max-w-sm">
      <MarcaCategoria categoria={item.categoria} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold">{item.nome}</p>
        <p className="text-legenda text-ink-suave">{nomeDestino(item.destino)}</p>
      </div>
      <Link
        to={item.href}
        params={{ slug: item.slug }}
        aria-label={`Ver ${item.nome}`}
        className="grid size-11 shrink-0 place-items-center rounded-md bg-cobalto text-sobre-cobalto hover:bg-cobalto-forte"
      >
        <ArrowRight className="size-5" />
      </Link>
      <BotaoFechar fechar={fechar} />
    </div>
  );
}

function CardCompleto({ item, fechar }: { item: Item; fechar: () => void }) {
  return (
    <div
      role="dialog"
      aria-label={item.nome}
      className="card-sobe folha absolute inset-x-0 bottom-0 z-[500] rounded-t-md border-t border-linha bg-louca p-4 text-ink shadow-flutua sm:inset-x-auto sm:bottom-4 sm:left-4 sm:w-96 sm:rounded-md sm:border"
    >
      <div aria-hidden className="mx-auto mb-3 h-1 w-10 rounded-full bg-linha sm:hidden" />
      <div className="flex gap-4">
        <Foto
          src={item.foto}
          alt={item.nome}
          rotulo={item.nome}
          cor={corDaCategoria(item.categoria)}
          sizes="96px"
          className="size-24 shrink-0 rounded-sm"
        />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-legenda text-ink-suave">
            <MarcaCategoria categoria={item.categoria} tamanho="sm" />
            {categoriaPorId[item.categoria].nome}
          </p>
          <p className="mt-1 font-display text-xl leading-tight font-semibold">{item.nome}</p>
          <p className="text-legenda text-ink-suave">{nomeDestino(item.destino)}</p>
        </div>
        <BotaoFechar fechar={fechar} />
      </div>
      <p className="mt-3 line-clamp-2 text-base text-ink-suave">{item.resumo}</p>
      <div className="mt-4 flex gap-2">
        <Link
          to={item.href}
          params={{ slug: item.slug }}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-cobalto px-4 font-bold text-sobre-cobalto hover:bg-cobalto-forte"
        >
          Ver detalhes <ArrowRight className="size-5" />
        </Link>
        <Favoritar
          tipo={item.tipo}
          slug={item.slug}
          nome={item.nome}
          className="border-2 border-linha"
        />
      </div>
    </div>
  );
}
