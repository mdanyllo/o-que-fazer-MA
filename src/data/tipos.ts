/**
 * Tipos dos dados do Azulejo.
 *
 * Todos os dados deste diretório são DADOS DE EXEMPLO para o MVP. Lugares e informações
 * gerais são reais; preços, avaliações, horários e empresas são ilustrativos.
 */

export type CategoriaId =
  "lagoas-praias" | "cultura" | "natureza" | "gastronomia" | "festas" | "hospedagem";

/** 1 = barato/gratuito, 2 = médio, 3 = mais caro. Faixas de exemplo. */
export type FaixaPreco = 1 | 2 | 3;

/** 1 = janeiro … 12 = dezembro */
export type Mes = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type Coordenada = { lat: number; lng: number };

export type Destino = Coordenada & {
  slug: string;
  nome: string;
  regiao: string;
  /** frase curta para cards */
  chamada: string;
  resumo: string;
  melhorEpoca: string;
  mesesBons: Mes[];
  /** distância aproximada de São Luís, em km (arredondada) */
  distanciaKm: number;
  /** tempo aproximado saindo de São Luís */
  tempoDeSaoLuis: string;
  comoChegar: string[];
  categorias: CategoriaId[];
  foto: string;
  zoom: number;
  tags: string[];
};

export type InfoPratica = {
  horario: string;
  preco: string;
  duracao: string;
  dicas: string[];
};

export type Lugar = Coordenada & {
  slug: string;
  nome: string;
  destino: string;
  categoria: CategoriaId;
  tipo: "atrativo" | "restaurante" | "hospedagem";
  resumo: string;
  descricao: string;
  info: InfoPratica;
  faixaPreco: FaixaPreco;
  /** duração típica da visita, em horas */
  horas: number;
  mesesBons: Mes[];
  foto: string;
  tags: string[];
  /** true para restaurantes e pousadas inventados para o MVP */
  ficticio?: boolean;
};

export type Experiencia = Coordenada & {
  slug: string;
  nome: string;
  destino: string;
  categoria: CategoriaId;
  resumo: string;
  descricao: string;
  info: InfoPratica;
  faixaPreco: FaixaPreco;
  horas: number;
  dificuldade: "Leve" | "Moderada" | "Puxada";
  mesesBons: Mes[];
  /** lugares visitados, em ordem */
  lugares: string[];
  /** empresas (fictícias) que oferecem */
  empresas: string[];
  foto: string;
  tags: string[];
};

export type Empresa = {
  slug: string;
  nome: string;
  tipo: "Agência" | "Guia" | "Barqueiro" | "Transfer" | "Pousada" | "Restaurante";
  destino: string;
  /** avaliação fictícia, de 0 a 5 */
  avaliacao: number;
  avaliacoes: number;
  descricao: string;
  /** precisa ser claramente fictício */
  whatsapp: string;
  /** preço de exemplo mostrado no botão de reservar */
  aPartirDe?: number;
};

export type Parada = {
  ref: { tipo: "lugar" | "experiencia"; slug: string };
  nota?: string;
};

export type DiaRoteiro = {
  titulo: string;
  resumo: string;
  deslocamento?: string;
  paradas: Parada[];
  ondeComer?: string[];
};

export type Roteiro = {
  slug: string;
  titulo: string;
  chamada: string;
  resumo: string;
  dias: DiaRoteiro[];
  destinos: string[];
  ritmo: "Tranquilo" | "Equilibrado" | "Intenso";
  /** estimativa de exemplo por pessoa, sem passagem aérea */
  custoEstimado: string;
  melhorEpoca: string;
  foto: string;
  categorias: CategoriaId[];
};

export type Evento = {
  slug: string;
  nome: string;
  mes: Mes;
  /** texto livre do período, sem data exata */
  periodo: string;
  destino: string;
  local: string;
  resumo: string;
  foto: string;
  tags: string[];
};
