import { Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, Pencil } from "lucide-react";
import { Tag } from "@/components/azulejo/etiquetas";
import { Foto } from "@/components/azulejo/Foto";
import { STATUS } from "@/components/conta/status";
import type { NegocioDono } from "@/lib/meus-negocios";
import { urlFotoNegocio } from "@/lib/negocios";

const TIPO = { restaurante: "Restaurante", hospedagem: "Hospedagem", passeio: "Passeio" } as const;

/**
 * Card de um negócio na lista do painel: capa 4:3, status, nome, tipo e cidade.
 * Publicado: o card abre a página pública, e "Editar" fica num link próprio.
 * Os outros (sem página no site ainda) abrem a edição.
 */
export function CardMeuNegocio({ negocio: n }: { negocio: NegocioDono }) {
  const capa = n.negocio_fotos[0];
  const publicado = n.status === "publicado";
  const linkCard = "after:absolute after:inset-0 after:content-[''] hover:text-cobalto";
  const linkAcao =
    "relative z-10 inline-flex min-h-11 items-center gap-1 text-rotulo text-cobalto underline-offset-4 hover:underline";
  return (
    <article className="group relative flex flex-col gap-3">
      <Foto
        src={capa ? urlFotoNegocio(capa.caminho) : ""}
        alt={capa ? `Capa de ${n.nome}` : `${n.nome}, ainda sem foto`}
        rotulo={n.nome}
        placeholderCor="cobalto"
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="aspect-[4/3] rounded-md"
        imgClassName="transition-transform duration-600 ease-saida group-hover:scale-[1.04]"
      />
      <p className="flex flex-wrap items-center gap-2">
        <Tag className={STATUS[n.status].classe}>{STATUS[n.status].rotulo}</Tag>
        {n.status === "publicado" && n.alterado_desde_revisao && (
          <span className="text-legenda text-ink-suave">Alterações em conferência</span>
        )}
      </p>
      <h2 className="text-t3">
        {publicado ? (
          <Link
            to={n.tipo === "passeio" ? "/experiencias/$slug" : "/lugares/$slug"}
            params={{ slug: n.slug }}
            className={linkCard}
          >
            {n.nome}
          </Link>
        ) : (
          <Link to="/painel/$id" params={{ id: n.id }} className={linkCard}>
            {n.nome}
          </Link>
        )}
      </h2>
      <p className="text-legenda text-ink-suave">
        {[TIPO[n.tipo], n.cidade].filter(Boolean).join(" · ")}
      </p>
      {n.status === "recusado" && n.motivo_recusa && (
        <p className="medida text-legenda">
          <span className="font-bold text-guara">Motivo: </span>
          {n.motivo_recusa}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
        <span aria-hidden className="inline-flex items-center gap-1 text-rotulo text-cobalto">
          {publicado ? "Ver página" : "Editar"} <ArrowRight className="size-4" />
        </span>
        {/* por cima do link do card inteiro */}
        {publicado && (
          <Link to="/painel/$id" params={{ id: n.id }} className={linkAcao}>
            <Pencil className="size-4" aria-hidden /> Editar
          </Link>
        )}
        <Link to="/painel/estatisticas/$id" params={{ id: n.id }} className={linkAcao}>
          <BarChart3 className="size-4" aria-hidden /> Estatísticas
        </Link>
      </div>
    </article>
  );
}
