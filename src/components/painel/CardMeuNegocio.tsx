import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Tag } from "@/components/azulejo/etiquetas";
import { Foto } from "@/components/azulejo/Foto";
import { STATUS } from "@/components/conta/status";
import type { NegocioDono } from "@/lib/meus-negocios";
import { urlFotoNegocio } from "@/lib/negocios";

const TIPO = { restaurante: "Restaurante", hospedagem: "Hospedagem", passeio: "Passeio" } as const;

/** Card de um negócio na lista do painel: capa 4:3, status, nome, tipo e cidade. */
export function CardMeuNegocio({ negocio: n }: { negocio: NegocioDono }) {
  const capa = n.negocio_fotos[0];
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
        <Link
          to="/painel/$id"
          params={{ id: n.id }}
          className="after:absolute after:inset-0 after:content-[''] hover:text-cobalto"
        >
          {n.nome}
        </Link>
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
      <span
        aria-hidden
        className="sobe-no-hover inline-flex items-center gap-1 text-rotulo text-cobalto"
      >
        Editar <ArrowRight className="size-4" />
      </span>
    </article>
  );
}
