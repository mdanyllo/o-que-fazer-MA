import type { StatusNegocio } from "@/lib/negocios";

/** Rótulo e cor do selo de cada status (painel do dono e admin). */
export const STATUS: Record<StatusNegocio, { rotulo: string; classe: string }> = {
  rascunho: { rotulo: "Rascunho", classe: "" },
  pendente: { rotulo: "Em análise", classe: "bg-ouro text-sobre-ouro" },
  publicado: { rotulo: "Publicado", classe: "bg-babacu text-louca" },
  recusado: { rotulo: "Recusado", classe: "bg-guara text-louca" },
};
