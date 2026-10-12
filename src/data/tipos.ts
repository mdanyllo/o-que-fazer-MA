/**
 * Tipos dos dados do Azulejo.
 *
 * Todos os dados deste diretório são DADOS DE EXEMPLO para o MVP. Lugares e informações
 * gerais são reais; preços, avaliações, horários e empresas são ilustrativos.
 */

export type CategoriaId =
  "lencois" | "lagoas-praias" | "cultura" | "natureza" | "gastronomia" | "festas" | "hospedagem";

/** Negócios que vêm do banco (tabela negocios). */
export type TipoNegocio = "restaurante" | "hospedagem" | "passeio";

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

/** O que só os negócios do banco têm (a página usa para a galeria, o contato e a ficha). */
export type DetalhesNegocio = {
  tipo: TipoNegocio;
  exemplo: boolean;
  /** fotos do próprio negócio, na ordem do dono (a primeira é a capa) */
  fotos: string[];
  /** só dígitos, com 55 */
  whatsapp?: string;
  /** "Pousada", "Chalé"… (hospedagem) */
  subtipo?: string;
  cidade?: string;
  /** os meses bons e a dificuldade foram informados (senão a ficha não mostra) */
  melhorEpoca: boolean;
  dificuldade: boolean;
};
/** Faixa de preço em reais, de exemplo. `por` diz a unidade: "por pessoa", "a diária"… */
export type FaixaValores = { min: number; max: number; por: string };

export type InfoPratica = {
  horario: string;
  /** preço numérico, mostrado como "R$ 100,00 – R$ 160,00" */
  faixa?: FaixaValores;
  /** texto livre quando não há faixa ("Gratuito", "Incluído no passeio"…) */
  preco?: string;
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
  /** true para restaurantes e pousadas inventados para o MVP (mostra a etiqueta "Exemplo") */
  ficticio?: boolean;
  /** negócio de exemplo vindo do banco (exemplo = true): liga o aviso do rodapé */
  exemplo?: boolean;
  /** só nos restaurantes e hospedagens do banco */
  negocio?: DetalhesNegocio;
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
  /** passeio de exemplo vindo do banco (exemplo = true): liga o aviso do rodapé */
  exemplo?: boolean;
  /** só nos passeios do banco */
  negocio?: DetalhesNegocio;
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

export type TipoHospedagem = "Pousada" | "Hotel" | "Chalé" | "Hostel" | "Casa de temporada";

/** Card de hospedagem da seção "Onde ficar" (sem reserva de verdade). */
export type Hospedagem = {
  slug: string;
  nome: string;
  tipo: TipoHospedagem;
  /** slug do destino (cidade) */
  destino: string;
  /** nota de exemplo, de 0 a 5 (sem nota, o card não mostra a linha da estrela) */
  avaliacao?: number;
  avaliacoes?: number;
  /** preço por noite, em reais (sem preço, o card não mostra a linha) */
  precoNoite?: number;
  foto: string;
  /** slug do lugar com página própria, quando a hospedagem tem página */
  lugar?: string;
  /** negócio de exemplo (exemplo = true): liga o aviso do rodapé */
  exemplo?: boolean;
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
