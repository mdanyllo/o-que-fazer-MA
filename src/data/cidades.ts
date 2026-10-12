import { destinos } from "./destinos";

/**
 * Cidades do Maranhão para o cadastro de negócios, com o centro aproximado de cada uma.
 * O negócio recebe essas coordenadas ao ser criado (ou ao trocar de cidade); a equipe ajusta
 * o ponto exato depois. As primeiras são as mais procuradas; o resto vem em ordem alfabética.
 * Coordenadas aproximadas, arredondadas.
 */
export type Cidade = { nome: string; lat: number; lng: number };

const doDestino = (slug: string): Cidade => {
  const d = destinos.find((x) => x.slug === slug);
  if (!d) throw new Error(`Destino sem cadastro: ${slug}`);
  return { nome: d.nome, lat: d.lat, lng: d.lng };
};

const PRINCIPAIS: Cidade[] = [
  doDestino("barreirinhas"),
  doDestino("atins"),
  doDestino("sao-luis"),
  doDestino("alcantara"),
  doDestino("carolina"),
  doDestino("santo-amaro"),
  { nome: "Imperatriz", lat: -5.5264, lng: -47.4917 },
];

const OUTRAS: Cidade[] = [
  { nome: "Axixá", lat: -2.8394, lng: -44.0622 },
  { nome: "Bacabal", lat: -4.225, lng: -44.78 },
  { nome: "Balsas", lat: -7.5325, lng: -46.0356 },
  { nome: "Caxias", lat: -4.8586, lng: -43.3561 },
  { nome: "Chapadinha", lat: -3.7417, lng: -43.36 },
  { nome: "Codó", lat: -4.4553, lng: -43.8856 },
  { nome: "Cururupu", lat: -1.8283, lng: -44.8683 },
  { nome: "Estreito", lat: -6.5608, lng: -47.4497 },
  { nome: "Grajaú", lat: -5.8197, lng: -46.1386 },
  { nome: "Guimarães", lat: -2.1328, lng: -44.6008 },
  { nome: "Humberto de Campos", lat: -2.5983, lng: -43.4611 },
  { nome: "Icatu", lat: -2.7756, lng: -44.0656 },
  { nome: "Morros", lat: -2.8642, lng: -44.0394 },
  { nome: "Paço do Lumiar", lat: -2.5317, lng: -44.1078 },
  { nome: "Paulino Neves", lat: -2.7206, lng: -42.5258 },
  { nome: "Pinheiro", lat: -2.5211, lng: -45.0828 },
  { nome: "Primeira Cruz", lat: -2.5072, lng: -43.4386 },
  doDestino("raposa"),
  { nome: "Riachão", lat: -7.3617, lng: -46.6225 },
  { nome: "Santa Inês", lat: -3.6667, lng: -45.38 },
  { nome: "São José de Ribamar", lat: -2.5619, lng: -44.0542 },
  { nome: "Tasso Fragoso", lat: -8.4747, lng: -45.7436 },
  { nome: "Timon", lat: -5.0942, lng: -42.8364 },
  doDestino("tutoia"),
  { nome: "Viana", lat: -3.22, lng: -44.9997 },
];

export const CIDADES_PRINCIPAIS = PRINCIPAIS;
export const OUTRAS_CIDADES = OUTRAS;
export const CIDADES: Cidade[] = [...PRINCIPAIS, ...OUTRAS];

export const getCidade = (nome: string | null | undefined) =>
  nome ? CIDADES.find((c) => c.nome === nome) : undefined;
