import type { CategoriaId } from "./tipos";

export type Categoria = {
  id: CategoriaId;
  nome: string;
  chamada: string;
  /** token de cor maranhense usado no mapa, nos filtros e nos cards */
  cor: "lagoa" | "cobalto" | "babacu" | "ouro" | "guara" | "jucara";
  foto: string;
};

export const categorias: Categoria[] = [
  {
    id: "lagoas-praias",
    nome: "Lagoas e praias",
    chamada: "Dunas, lagoas de água doce e mar morno",
    cor: "lagoa",
    foto: "/images/categorias/lagoas-praias.jpg",
  },
  {
    id: "cultura",
    nome: "Cultura e centro histórico",
    chamada: "Casarões, azulejos, museus e tambor",
    cor: "cobalto",
    foto: "/images/categorias/cultura.jpg",
  },
  {
    id: "natureza",
    nome: "Natureza e cachoeiras",
    chamada: "Chapadas, rios, poços e trilhas",
    cor: "babacu",
    foto: "/images/categorias/natureza.jpg",
  },
  {
    id: "gastronomia",
    nome: "Gastronomia",
    chamada: "Cuxá, juçara, peixe-pedra e torta de camarão",
    cor: "ouro",
    foto: "/images/categorias/gastronomia.jpg",
  },
  {
    id: "festas",
    nome: "Festas e eventos",
    chamada: "Bumba-meu-boi, Divino e Carnaval",
    cor: "guara",
    foto: "/images/categorias/festas.jpg",
  },
  {
    id: "hospedagem",
    nome: "Onde ficar",
    chamada: "Pousadas na beira do rio, da duna e do casario",
    cor: "jucara",
    foto: "/images/categorias/hospedagem.jpg",
  },
];

export const categoriaPorId = Object.fromEntries(categorias.map((c) => [c.id, c])) as Record<
  CategoriaId,
  Categoria
>;
