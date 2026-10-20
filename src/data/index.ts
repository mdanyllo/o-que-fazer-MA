import { categoriaPorId, categorias } from "./categorias";
import { destinos } from "./destinos";
import { empresas } from "./empresas";
import { eventos } from "./eventos";
import { lugares as atrativos } from "./lugares";
import { roteiros } from "./roteiros";
import type { CategoriaId, Coordenada, FaixaPreco, FaixaValores, Mes, TipoNegocio } from "./tipos";

/*
 * Dados fixos do site: destinos, atrativos, roteiros, eventos e empresas fictícias.
 * Restaurantes, hospedagens e passeios vêm do banco e entram pelo catálogo
 * (src/data/catalogo.ts, useCatalogo() nas telas).
 */

export * from "./tipos";
export { atrativos, categorias, categoriaPorId, destinos, empresas, eventos, roteiros };

export const porSlug = <T extends { slug: string }>(lista: T[]) =>
  new Map(lista.map((i) => [i.slug, i]));

const mapaDestinos = porSlug(destinos);
const mapaRoteiros = porSlug(roteiros);
const mapaEmpresas = porSlug(empresas);

export const getDestino = (slug: string) => mapaDestinos.get(slug);
export const getRoteiro = (slug: string) => mapaRoteiros.get(slug);
export const getEmpresa = (slug: string) => mapaEmpresas.get(slug);

export const nomeDestino = (slug: string) => getDestino(slug)?.nome ?? slug;

export const MESES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
] as const;

export const nomeMes = (mes: Mes) => MESES[mes - 1] ?? "";

/** Texto das faixas de preço. Valores de exemplo. */
export const FAIXAS: Record<FaixaPreco, { simbolo: string; texto: string }> = {
  1: { simbolo: "$", texto: "Gratuito ou até R$ 100" },
  2: { simbolo: "$$", texto: "De R$ 100 a R$ 250" },
  3: { simbolo: "$$$", texto: "Acima de R$ 250" },
};

const reais = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** "R$ 100,00 – R$ 160,00" */
export const formatarFaixa = (f: FaixaValores) =>
  `${reais.format(f.min)} – ${reais.format(f.max)}`.replace(/\s/g, " ");

/** Preço curto para cards: a faixa em reais, "Gratuito" ou o símbolo da faixa. */
export function rotuloPreco(i: {
  faixa?: FaixaValores | undefined;
  preco?: string | undefined;
  faixaPreco: FaixaPreco;
}) {
  if (i.faixa) return formatarFaixa(i.faixa);
  if (i.preco?.startsWith("Gratuito")) return "Gratuito";
  return FAIXAS[i.faixaPreco].simbolo;
}

export function formatarHoras(horas: number) {
  if (horas <= 0) return "—";
  if (horas >= 6) return "Dia inteiro";
  if (horas >= 3.5) return "Meio dia";
  if (horas < 1) return `${Math.round(horas * 60)} min`;
  const h = Math.floor(horas);
  const min = Math.round((horas - h) * 60);
  return min ? `${h}h${String(min).padStart(2, "0")}` : `${h}h`;
}

/** Distância em linha reta, em km. */
export function distanciaKm(a: Coordenada, b: Coordenada) {
  const R = 6371;
  const rad = (g: number) => (g * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatarDistancia(km: number) {
  if (km < 1) return `${Math.round((km * 1000) / 50) * 50} m`;
  if (km < 10) return `${km.toFixed(1).replace(".", ",")} km`;
  return `${Math.round(km / 5) * 5} km`;
}

/**
 * Item comum de Explorar, do mapa e dos roteiros: um lugar ou uma experiência,
 * com o que os cards e pins precisam. A lista completa está no catálogo.
 */
export type Item = Coordenada & {
  tipo: "lugar" | "experiencia";
  slug: string;
  nome: string;
  resumo: string;
  destino: string;
  categoria: CategoriaId;
  faixaPreco: FaixaPreco;
  faixa?: FaixaValores | undefined;
  preco?: string | undefined;
  horas: number;
  mesesBons: Mes[];
  foto: string;
  tags: string[];
  ficticio?: boolean;
  /** restaurante, hospedagem ou passeio vindo do banco; ausente nos atrativos */
  negocio?: TipoNegocio;
  /** negócio de exemplo (exemplo = true): liga o aviso do rodapé */
  exemplo?: boolean;
  /** id na tabela negocios (estatísticas de aparição) */
  negocioId?: string;
  /** dono com plano Pro: selo de verificado */
  verificado?: boolean;
  href: "/lugares/$slug" | "/experiencias/$slug";
};

/** Restaurante ou hospedagem (fica fora de "o que fazer" e do planejador). */
export const ehOndeComerOuFicar = (i: Item) =>
  i.negocio === "restaurante" || i.negocio === "hospedagem";

export const roteirosQuePassamPor = (destino: string) =>
  roteiros.filter((r) => r.destinos.includes(destino));

export const empresasDoDestino = (destino: string) => empresas.filter((x) => x.destino === destino);
