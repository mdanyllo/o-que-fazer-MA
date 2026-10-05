import type { Parada, Roteiro } from "./tipos";

/**
 * DADOS DE EXEMPLO.
 * Roteiros sugeridos com lugares reais. Custos são estimativas ilustrativas por pessoa,
 * sem passagem aérea. Tempos de deslocamento aproximados.
 */

const l = (slug: string, nota?: string): Parada => ({
  ref: { tipo: "lugar", slug },
  ...(nota ? { nota } : {}),
});
const e = (slug: string, nota?: string): Parada => ({
  ref: { tipo: "experiencia", slug },
  ...(nota ? { nota } : {}),
});

export const roteiros: Roteiro[] = [
  {
    slug: "3-dias-em-sao-luis",
    titulo: "3 dias em São Luís",
    chamada: "Centro Histórico a pé, juçara, praia e um dia em Alcântara.",
    resumo:
      "Três dias para conhecer a capital sem pressa: um dia inteiro no Centro Histórico, um dia de comida e praia, e a travessia da baía até Alcântara.",
    destinos: ["sao-luis", "alcantara"],
    ritmo: "Equilibrado",
    custoEstimado: "R$ 1.200 a R$ 2.000 por pessoa (exemplo)",
    melhorEpoca: "Ano todo; menos chuva de julho a dezembro",
    foto: "/images/destinos/sao-luis.jpg",
    categorias: ["cultura", "gastronomia"],
    dias: [
      {
        titulo: "Centro Histórico a pé",
        resumo: "Manhã de caminhada guiada, almoço na Praia Grande e fim de tarde no teatro.",
        paradas: [
          e("caminhada-centro-historico", "Comece cedo, antes do sol forte."),
          l("cozinha-do-cuxa", "Almoço: arroz de cuxá e peixe-pedra."),
          l("teatro-arthur-azevedo"),
        ],
        ondeComer: ["Cozinha do Cuxá (exemplo)"],
      },
      {
        titulo: "Juçara, feira e praia",
        resumo: "Juçara no Maracanã de manhã e pôr do sol no Calhau.",
        deslocamento: "Cerca de 30 minutos de carro entre o Maracanã e o Centro",
        paradas: [
          l("parque-da-jucara"),
          l("casa-das-tulhas"),
          l("praia-do-calhau", "Confira a maré."),
        ],
      },
      {
        titulo: "Alcântara",
        resumo: "Travessia da baía e um dia entre ruínas e sobrados.",
        deslocamento: "Cerca de 1h20 de barco em cada sentido",
        paradas: [e("bate-volta-alcantara"), l("ruinas-de-sao-matias"), l("casario-de-alcantara")],
      },
    ],
  },
  {
    slug: "lencois-em-4-dias",
    titulo: "Lençóis em 4 dias",
    chamada: "Lagoa Azul, Lagoa Bonita, o Preguiças até Atins e uma noite na vila.",
    resumo:
      "Saindo de São Luís, quatro dias para ver os dois circuitos clássicos, descer o Rio Preguiças de lancha e dormir em Atins.",
    destinos: ["barreirinhas", "atins"],
    ritmo: "Equilibrado",
    custoEstimado: "R$ 1.800 a R$ 3.000 por pessoa (exemplo)",
    melhorEpoca: "Junho a setembro, com as lagoas cheias",
    foto: "/images/destinos/barreirinhas.jpg",
    categorias: ["lagoas-praias", "natureza"],
    dias: [
      {
        titulo: "São Luís → Barreirinhas e Lagoa Bonita",
        resumo: "Estrada de manhã e pôr do sol na Lagoa Bonita.",
        deslocamento: "Cerca de 4 horas de carro ou van",
        paradas: [e("por-do-sol-lagoa-bonita"), l("peixaria-beira-rio", "Jantar na orla.")],
      },
      {
        titulo: "Circuito Lagoa Azul",
        resumo: "Manhã nas lagoas e tarde livre na beira do rio.",
        paradas: [e("circuito-lagoa-azul"), l("pousada-preguicas")],
      },
      {
        titulo: "Rio Preguiças até Atins",
        resumo: "Lancha com paradas em Vassouras, Mandacaru e Caburé.",
        deslocamento: "Dia inteiro de barco",
        paradas: [e("passeio-rio-preguicas"), l("vassouras"), l("mandacaru"), l("cabure")],
      },
      {
        titulo: "Atins e volta",
        resumo: "Manhã na praia e camarão no Canto do Atins antes de voltar.",
        deslocamento: "Volta de 4x4 até Barreirinhas e estrada até São Luís",
        paradas: [l("praia-de-atins"), l("canto-do-atins")],
      },
    ],
  },
  {
    slug: "fim-de-semana-santo-amaro",
    titulo: "Fim de semana em Santo Amaro",
    chamada: "Os Lençóis com menos gente, em dois dias.",
    resumo:
      "Para quem tem pouco tempo e quer lagoas mais vazias: dois dias em Santo Amaro, com a Lagoa da Gaivota e o Rio Alegre.",
    destinos: ["santo-amaro"],
    ritmo: "Tranquilo",
    custoEstimado: "R$ 800 a R$ 1.400 por pessoa (exemplo)",
    melhorEpoca: "Junho a setembro",
    foto: "/images/destinos/santo-amaro.jpg",
    categorias: ["lagoas-praias", "natureza"],
    dias: [
      {
        titulo: "São Luís → Santo Amaro",
        resumo: "Estrada até Sangue, 4x4 pela areia e tarde na Lagoa da Gaivota.",
        deslocamento: "Cerca de 4 horas e meia",
        paradas: [e("lagoa-da-gaivota-4x4")],
      },
      {
        titulo: "Betânia e volta",
        resumo: "Banho no Rio Alegre e retorno à capital no fim da tarde.",
        paradas: [l("betania")],
      },
    ],
  },
  {
    slug: "chapada-das-mesas-em-5-dias",
    titulo: "Chapada das Mesas em 5 dias",
    chamada: "Cânion, cachoeiras, poços azuis e o pôr do sol no Portal.",
    resumo:
      "Cinco dias com base em Carolina para ver os principais atrativos da Chapada, alternando dias puxados e dias mais leves.",
    destinos: ["carolina"],
    ritmo: "Intenso",
    custoEstimado: "R$ 2.000 a R$ 3.500 por pessoa (exemplo)",
    melhorEpoca: "Maio a setembro",
    foto: "/images/destinos/carolina.jpg",
    categorias: ["natureza"],
    dias: [
      {
        titulo: "Chegada e Portal da Chapada",
        resumo: "Chegada por Imperatriz e fim de tarde no Portal.",
        deslocamento: "Cerca de 3 horas de carro de Imperatriz a Carolina",
        paradas: [l("portal-da-chapada"), l("mesa-da-chapada")],
      },
      {
        titulo: "Pedra Caída",
        resumo: "Dia inteiro no complexo, com a trilha do cânion.",
        paradas: [e("canion-pedra-caida"), l("pedra-caida")],
      },
      {
        titulo: "Cachoeiras de Riachão",
        resumo: "Santa Bárbara e Poço Azul, com estrada de terra.",
        deslocamento: "Cerca de 2 horas até a região de Riachão",
        paradas: [e("cachoeiras-de-riachao"), l("cachoeira-de-santa-barbara"), l("poco-azul")],
      },
      {
        titulo: "Cachoeira da Prata",
        resumo: "Dia dentro do parque nacional.",
        paradas: [l("cachoeira-da-prata")],
      },
      {
        titulo: "Manhã livre e volta",
        resumo: "Descanso na pousada e estrada até Imperatriz.",
        paradas: [l("pousada-mesa-alta")],
      },
    ],
  },
  {
    slug: "maranhao-essencial-7-dias",
    titulo: "Maranhão essencial em 7 dias",
    chamada: "São Luís, Lençóis e o Preguiças numa semana.",
    resumo:
      "A primeira viagem ao Maranhão em uma semana: dois dias na capital, Barreirinhas com os dois circuitos, a descida do rio até Atins e a volta.",
    destinos: ["sao-luis", "barreirinhas", "atins"],
    ritmo: "Equilibrado",
    custoEstimado: "R$ 3.000 a R$ 5.000 por pessoa (exemplo)",
    melhorEpoca: "Junho a setembro",
    foto: "/images/home/hero.jpg",
    categorias: ["cultura", "lagoas-praias", "gastronomia"],
    dias: [
      {
        titulo: "Centro Histórico",
        resumo: "Caminhada guiada e almoço de cuxá.",
        paradas: [e("caminhada-centro-historico"), l("cozinha-do-cuxa")],
      },
      {
        titulo: "Sabores e praia",
        resumo: "Juçara, Casa das Tulhas e pôr do sol no Calhau.",
        paradas: [e("sabores-de-sao-luis"), l("praia-do-calhau")],
      },
      {
        titulo: "Rumo aos Lençóis",
        resumo: "Estrada até Barreirinhas e Lagoa Bonita no fim da tarde.",
        deslocamento: "Cerca de 4 horas de carro",
        paradas: [e("por-do-sol-lagoa-bonita")],
      },
      {
        titulo: "Lagoa Azul",
        resumo: "Manhã nas lagoas, tarde na beira do rio.",
        paradas: [e("circuito-lagoa-azul")],
      },
      {
        titulo: "Preguiças até Atins",
        resumo: "Lancha com paradas e noite em Atins.",
        deslocamento: "Dia inteiro de barco",
        paradas: [e("passeio-rio-preguicas"), l("pousada-vento-leste")],
      },
      {
        titulo: "Atins",
        resumo: "Praia, vento e camarão.",
        paradas: [l("praia-de-atins"), l("canto-do-atins")],
      },
      {
        titulo: "Volta a São Luís",
        resumo: "4x4 até Barreirinhas e estrada até a capital.",
        deslocamento: "Cerca de 6 horas no total",
        paradas: [l("rua-portugal", "Se der tempo, uma última volta pelo Centro.")],
      },
    ],
  },
];
