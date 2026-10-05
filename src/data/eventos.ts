import type { Evento } from "./tipos";

/**
 * DADOS DE EXEMPLO.
 * Festas reais do calendário maranhense, indicadas só pelo mês. As datas exatas mudam
 * a cada ano: confira a programação oficial antes de viajar.
 */
export const eventos: Evento[] = [
  {
    slug: "carnaval-de-sao-luis",
    nome: "Carnaval de São Luís",
    mes: 2,
    periodo: "Fevereiro ou março, conforme o calendário do ano",
    destino: "sao-luis",
    local: "Centro e bairros",
    resumo:
      "Blocos tradicionais, tambor de crioula e as fofões, fantasias típicas do carnaval maranhense.",
    foto: "/images/eventos/carnaval-de-sao-luis.jpg",
    tags: ["Rua", "Blocos"],
  },
  {
    slug: "festa-do-divino",
    nome: "Festa do Divino Espírito Santo",
    mes: 5,
    periodo: "Maio ou junho, no período de Pentecostes",
    destino: "alcantara",
    local: "Centro Histórico de Alcântara",
    resumo:
      "Uma das festas religiosas mais tradicionais do estado, com caixeiras, cortejos e a coroação do imperador do Divino.",
    foto: "/images/eventos/festa-do-divino.jpg",
    tags: ["Religiosa", "Tradição"],
  },
  {
    slug: "sao-joao",
    nome: "São João e Bumba-meu-boi",
    mes: 6,
    periodo: "Junho inteiro, com festas até o começo de julho",
    destino: "sao-luis",
    local: "Arraiais por toda a ilha",
    resumo:
      "O mês mais animado do Maranhão. Os grupos de bumba-meu-boi, em seus diferentes sotaques, se apresentam nos arraiais. O Complexo Cultural do Bumba-meu-boi é Patrimônio Cultural Imaterial da Humanidade.",
    foto: "/images/eventos/sao-joao.jpg",
    tags: ["Bumba-meu-boi", "Arraial", "Comida típica"],
  },
  {
    slug: "temporada-das-lagoas",
    nome: "Temporada das lagoas cheias",
    mes: 7,
    periodo: "De junho a setembro",
    destino: "barreirinhas",
    local: "Lençóis Maranhenses",
    resumo:
      "Não é festa, mas é o motivo de muita viagem: as lagoas entre as dunas estão no ponto mais cheio.",
    foto: "/images/lugares/lagoa-azul.jpg",
    tags: ["Temporada", "Natureza"],
  },
  {
    slug: "aniversario-de-sao-luis",
    nome: "Aniversário de São Luís",
    mes: 9,
    periodo: "Setembro, em torno do dia 8",
    destino: "sao-luis",
    local: "Centro Histórico",
    resumo: "A cidade comemora a fundação, de 1612, com shows e programação cultural no Centro.",
    foto: "/images/eventos/aniversario-de-sao-luis.jpg",
    tags: ["Shows", "Centro Histórico"],
  },
  {
    slug: "temporada-do-vento",
    nome: "Temporada de vento em Atins",
    mes: 8,
    periodo: "De agosto a dezembro",
    destino: "atins",
    local: "Praia de Atins",
    resumo: "O vento constante traz escolas e praticantes de kitesurf para a vila.",
    foto: "/images/experiencias/kitesurf-em-atins.jpg",
    tags: ["Temporada", "Kitesurf"],
  },
  {
    slug: "festa-da-jucara",
    nome: "Festa da Juçara",
    mes: 10,
    periodo: "Outubro",
    destino: "sao-luis",
    local: "Parque da Juçara, no Maracanã",
    resumo: "Época da safra da juçara, com barracas, música e muita tigela com farinha e camarão.",
    foto: "/images/lugares/parque-da-jucara.jpg",
    tags: ["Juçara", "Comida"],
  },
];
