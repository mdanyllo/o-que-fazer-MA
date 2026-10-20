import type { Hospedagem } from "../tipos";

/**
 * HOSPEDAGENS FICTÍCIAS — fonte do seed dos cards de "Onde ficar".
 * O site não importa este arquivo: lê as hospedagens do banco (ver lugares-negocios.ts).
 * As que têm `lugar` viram um negócio só com a pousada de mesmo slug em lugares-negocios.ts.
 * Nomes, notas, número de avaliações e preços por noite foram inventados para o MVP.
 * Sem reserva de verdade: o card leva para a página do lugar (quando existe) ou da cidade.
 * Fotos em src/assets/images/hospedagens/<slug>.jpg; as que já são um lugar usam a foto dele
 * (ver IMAGENS.md).
 */
export const hospedagens: Hospedagem[] = [
  {
    slug: "pousada-margem-do-preguicas",
    // nome curto no card; a página do lugar mantém "Pousada Margem do Preguiças"
    nome: "Margem do Preguiças",
    tipo: "Pousada",
    destino: "barreirinhas",
    avaliacao: 4.7,
    avaliacoes: 218,
    precoNoite: 320,
    foto: "/images/categorias/hospedagem.jpg",
    lugar: "pousada-preguicas",
  },
  {
    slug: "chales-rio-e-duna",
    nome: "Chalés Rio e Duna",
    tipo: "Chalé",
    destino: "barreirinhas",
    avaliacao: 4.8,
    avaliacoes: 96,
    precoNoite: 450,
    foto: "/images/hospedagens/chales-rio-e-duna.jpg",
  },
  {
    slug: "pousada-vento-leste",
    nome: "Pousada Vento Leste",
    tipo: "Pousada",
    destino: "atins",
    avaliacao: 4.9,
    avaliacoes: 174,
    precoNoite: 580,
    foto: "/images/lugares/pousada-vento-leste.jpg",
    lugar: "pousada-vento-leste",
  },
  {
    slug: "casa-pe-na-areia",
    nome: "Casa Pé na Areia",
    tipo: "Casa de temporada",
    destino: "atins",
    avaliacao: 4.6,
    avaliacoes: 41,
    precoNoite: 650,
    foto: "/images/hospedagens/casa-pe-na-areia.jpg",
  },
  {
    slug: "hotel-mirante-da-baia",
    nome: "Hotel Mirante da Baía",
    tipo: "Hotel",
    destino: "sao-luis",
    avaliacao: 4.4,
    avaliacoes: 512,
    precoNoite: 390,
    foto: "/images/hospedagens/hotel-mirante-da-baia.jpg",
  },
  {
    slug: "hostel-da-estrela",
    nome: "Hostel da Estrela",
    tipo: "Hostel",
    destino: "sao-luis",
    avaliacao: 4.5,
    avaliacoes: 389,
    precoNoite: 120,
    foto: "/images/hospedagens/hostel-da-estrela.jpg",
  },
  {
    slug: "pousada-sobrado-das-pedras",
    nome: "Sobrado das Pedras",
    tipo: "Pousada",
    destino: "alcantara",
    avaliacao: 4.7,
    avaliacoes: 88,
    precoNoite: 220,
    foto: "/images/hospedagens/pousada-sobrado-das-pedras.jpg",
  },
  {
    slug: "pousada-mesa-alta",
    nome: "Pousada Mesa Alta",
    tipo: "Pousada",
    destino: "carolina",
    avaliacao: 4.8,
    avaliacoes: 157,
    precoNoite: 260,
    foto: "/images/lugares/pousada-mesa-alta.jpg",
    lugar: "pousada-mesa-alta",
  },
];
