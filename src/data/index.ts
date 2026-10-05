import { categoriaPorId, categorias } from "./categorias";
import { destinos } from "./destinos";
import { empresas } from "./empresas";
import { eventos } from "./eventos";
import { experiencias } from "./experiencias";
import { lugares } from "./lugares";
import { roteiros } from "./roteiros";
import type { CategoriaId, Coordenada, FaixaPreco, Mes, Parada } from "./tipos";

export * from "./tipos";
export { categorias, categoriaPorId, destinos, empresas, eventos, experiencias, lugares, roteiros };

const porSlug = <T extends { slug: string }>(lista: T[]) => new Map(lista.map((i) => [i.slug, i]));

const mapaDestinos = porSlug(destinos);
const mapaLugares = porSlug(lugares);
const mapaExperiencias = porSlug(experiencias);
const mapaRoteiros = porSlug(roteiros);
const mapaEmpresas = porSlug(empresas);

export const getDestino = (slug: string) => mapaDestinos.get(slug);
export const getLugar = (slug: string) => mapaLugares.get(slug);
export const getExperiencia = (slug: string) => mapaExperiencias.get(slug);
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
 * com o que os cards e pins precisam.
 */
export type Item = Coordenada & {
  tipo: "lugar" | "experiencia";
  slug: string;
  nome: string;
  resumo: string;
  destino: string;
  categoria: CategoriaId;
  faixaPreco: FaixaPreco;
  horas: number;
  mesesBons: Mes[];
  foto: string;
  tags: string[];
  ficticio?: boolean;
  href: "/lugares/$slug" | "/experiencias/$slug";
};

export const itens: Item[] = [
  ...experiencias.map((x): Item => ({
    tipo: "experiencia",
    slug: x.slug,
    nome: x.nome,
    resumo: x.resumo,
    destino: x.destino,
    categoria: x.categoria,
    faixaPreco: x.faixaPreco,
    horas: x.horas,
    mesesBons: x.mesesBons,
    foto: x.foto,
    tags: x.tags,
    lat: x.lat,
    lng: x.lng,
    href: "/experiencias/$slug",
  })),
  ...lugares.map((x): Item => ({
    tipo: "lugar",
    slug: x.slug,
    nome: x.nome,
    resumo: x.resumo,
    destino: x.destino,
    categoria: x.categoria,
    faixaPreco: x.faixaPreco,
    horas: x.horas,
    mesesBons: x.mesesBons,
    foto: x.foto,
    tags: x.tags,
    ...(x.ficticio ? { ficticio: true } : {}),
    lat: x.lat,
    lng: x.lng,
    href: "/lugares/$slug",
  })),
];

const mapaItens = new Map(itens.map((i) => [`${i.tipo}:${i.slug}`, i]));

export const getItem = (tipo: Item["tipo"], slug: string) => mapaItens.get(`${tipo}:${slug}`);
export const resolverParada = (p: Parada) => getItem(p.ref.tipo, p.ref.slug);

export const itensDoDestino = (destino: string) => itens.filter((i) => i.destino === destino);

export const roteirosQuePassamPor = (destino: string) =>
  roteiros.filter((r) => r.destinos.includes(destino));

export const roteirosQueIncluem = (tipo: Item["tipo"], slug: string) =>
  roteiros.filter((r) =>
    r.dias.some((d) => d.paradas.some((p) => p.ref.tipo === tipo && p.ref.slug === slug)),
  );

export const empresasDoDestino = (destino: string) => empresas.filter((x) => x.destino === destino);

/** Pontos do roteiro, em ordem, sem repetir. */
export function pontosDoRoteiro(dias: { paradas: Parada[] }[]) {
  const vistos = new Set<string>();
  const pontos: Item[] = [];
  for (const d of dias)
    for (const p of d.paradas) {
      const item = resolverParada(p);
      if (!item) continue;
      const chave = `${item.lat},${item.lng}`;
      if (vistos.has(chave)) continue;
      vistos.add(chave);
      pontos.push(item);
    }
  return pontos;
}

export function proximos(alvo: Coordenada & { slug: string }, limite = 4) {
  return itens
    .filter((i) => i.slug !== alvo.slug && i.horas > 0)
    .map((i) => ({ item: i, km: distanciaKm(alvo, i) }))
    .filter((x) => x.km < 60)
    .sort((a, b) => a.km - b.km)
    .slice(0, limite);
}
