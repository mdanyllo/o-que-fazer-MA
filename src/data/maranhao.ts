import lencois from "@/assets/lencois-hero.jpg";
import saoLuis from "@/assets/sao-luis.jpg";
import barreirinhas from "@/assets/barreirinhas.jpg";
import atins from "@/assets/atins.jpg";
import chapada from "@/assets/chapada.jpg";
import rioPreguicas from "@/assets/rio-preguicas.jpg";
import cultura from "@/assets/cultura.jpg";
import gastronomia from "@/assets/gastronomia.jpg";
import alcantara from "@/assets/alcantara.jpg";
import santoAmaro from "@/assets/santo-amaro.jpg";
import porDoSol from "@/assets/por-do-sol.jpg";
import hospedagem from "@/assets/hospedagem.jpg";

export const img = {
  lencois,
  saoLuis,
  barreirinhas,
  atins,
  chapada,
  rioPreguicas,
  cultura,
  gastronomia,
  alcantara,
  santoAmaro,
  porDoSol,
  hospedagem,
};

export type Category = {
  id: string;
  name: string;
  image: string;
  blurb: string;
};

export const categories: Category[] = [
  { id: "natureza", name: "Natureza", image: lencois, blurb: "Dunas, lagoas e paisagens abertas" },
  { id: "praias", name: "Praias", image: atins, blurb: "Areia clara, vento e mar morno" },
  { id: "cachoeiras", name: "Cachoeiras", image: chapada, blurb: "Quedas d'água e poços verdes" },
  { id: "cultura", name: "Cultura", image: saoLuis, blurb: "Casarões, azulejos e tradição" },
  {
    id: "gastronomia",
    name: "Gastronomia",
    image: gastronomia,
    blurb: "Cuxá, peixe fresco e doces",
  },
  { id: "aventura", name: "Aventura", image: rioPreguicas, blurb: "Trilhas, 4x4 e travessias" },
  {
    id: "por-do-sol",
    name: "Pôr do sol",
    image: porDoSol,
    blurb: "Os melhores mirantes do estado",
  },
  { id: "familia", name: "Família", image: santoAmaro, blurb: "Passeios tranquilos para todos" },
  {
    id: "romantico",
    name: "Romântico",
    image: hospedagem,
    blurb: "Lugares para desacelerar a dois",
  },
];

export type RegionSlug = "lencois-maranhenses" | "sao-luis" | "chapada-das-mesas";

export type DestinationSlug =
  "barreirinhas" | "atins" | "santo-amaro" | "sao-luis" | "alcantara" | "carolina";

type Highlight = { name: string; description: string; image: string };

/**
 * Região turística: é como o visitante de fora pensa o Maranhão
 * ("vou para os Lençóis"). As cidades (Destination) são as bases dentro dela.
 */
export type Region = {
  slug: RegionSlug;
  name: string;
  tagline: string;
  description: string;
  image: string;
  gallery: string[];
  categories: string[];
  bestTime: string;
  gettingThere: { airport: string; summary: string };
  highlights: Highlight[];
  tips: string[];
  faq: { question: string; answer: string }[];
};

export const regions: Region[] = [
  {
    slug: "lencois-maranhenses",
    name: "Lençóis Maranhenses",
    tagline: "Dunas brancas e lagoas de água doce até onde a vista alcança.",
    description:
      "O Parque Nacional dos Lençóis Maranhenses protege um campo de dunas de areia branca que, depois das chuvas do primeiro semestre, se enche de lagoas azuis e verdes. Os passeios saem de três bases: Barreirinhas, Atins e Santo Amaro, cada uma com um ritmo diferente.",
    image: lencois,
    gallery: [lencois, porDoSol, rioPreguicas, atins, santoAmaro],
    categories: ["natureza", "aventura", "praias", "por-do-sol", "familia", "romantico"],
    bestTime: "Julho a setembro, com as lagoas mais cheias",
    gettingThere: {
      airport: "Aeroporto de São Luís (SLZ)",
      summary:
        "De São Luís são cerca de 250 km de estrada asfaltada até Barreirinhas ou Santo Amaro (≈ 4h de carro, transfer ou ônibus). Atins não tem acesso asfaltado: chega-se de 4x4 pela areia ou de lancha pelo Rio Preguiças, saindo de Barreirinhas.",
    },
    highlights: [
      {
        name: "Lagoa Azul",
        description: "Circuito clássico de 4x4 saindo de Barreirinhas, com várias lagoas próximas.",
        image: lencois,
      },
      {
        name: "Lagoa Bonita",
        description: "Duna alta com vista panorâmica, o lugar mais procurado para o pôr do sol.",
        image: porDoSol,
      },
      {
        name: "Rio Preguiças",
        description:
          "Descida de lancha entre mangues e dunas com paradas em Vassouras, Mandacaru e Caburé.",
        image: rioPreguicas,
      },
      {
        name: "Lagoa da Gaivota",
        description: "Uma das maiores lagoas do parque, no lado de Santo Amaro.",
        image: santoAmaro,
      },
      {
        name: "Atins",
        description: "Vila de areia onde o rio encontra o mar, base de kitesurf.",
        image: atins,
      },
    ],
    tips: [
      "As lagoas dependem da chuva: de janeiro a maio ainda estão enchendo, e a partir de outubro começam a secar.",
      "Não se dirige por conta própria dentro do parque. Os passeios são feitos em 4x4 credenciados ou a pé com guia.",
      "Não há sombra nem estrutura nas dunas. Leve água, protetor solar, chapéu e saco para o lixo.",
      "Reserve pelo menos 3 dias para fazer as lagoas e o Rio Preguiças sem correria.",
    ],
    faq: [
      {
        question: "Qual a melhor época para visitar os Lençóis Maranhenses?",
        answer:
          "De julho a setembro as lagoas costumam estar no auge. Junho e outubro também são boas opções, com lagoas cheias e menos movimento.",
      },
      {
        question: "Onde é melhor se hospedar: Barreirinhas, Atins ou Santo Amaro?",
        answer:
          "Barreirinhas tem mais estrutura e opções de passeio. Atins é mais rústica e tranquila, ideal para casais e kitesurf. Santo Amaro tem lagoas cercadas de dunas altas e é a mais sossegada.",
      },
      {
        question: "Quantos dias ficar nos Lençóis?",
        answer:
          "Três dias permitem fazer os dois circuitos clássicos de lagoas e a descida do Rio Preguiças. Com cinco dias dá para incluir Atins ou Santo Amaro.",
      },
    ],
  },
  {
    slug: "sao-luis",
    name: "São Luís e Alcântara",
    tagline: "Azulejos, tambores e história dos dois lados da baía.",
    description:
      "A capital maranhense tem um centro histórico tombado como Patrimônio Mundial pela UNESCO, com casarões cobertos de azulejos portugueses, e uma cena cultural ligada ao Bumba Meu Boi e ao reggae. Do outro lado da baía de São Marcos, Alcântara preserva ruínas e igrejas do período colonial.",
    image: saoLuis,
    gallery: [saoLuis, cultura, alcantara, gastronomia, porDoSol],
    categories: ["cultura", "gastronomia", "praias", "familia", "romantico"],
    bestTime: "O ano inteiro; em junho acontece o São João",
    gettingThere: {
      airport: "Aeroporto de São Luís (SLZ), dentro da cidade",
      summary:
        "São Luís é a porta de entrada do estado, com voos diretos das principais capitais. Alcântara fica a uma travessia de barco ou catamarã saindo do centro histórico, com horários que variam conforme a maré.",
    },
    highlights: [
      {
        name: "Centro Histórico",
        description: "Casarões coloniais azulejados e ladeiras de pedra, Patrimônio Mundial.",
        image: saoLuis,
      },
      {
        name: "Rua do Giz",
        description: "Bares, música ao vivo e fachadas históricas.",
        image: cultura,
      },
      {
        name: "Casa das Tulhas",
        description: "Mercado tradicional para provar e levar sabores locais.",
        image: gastronomia,
      },
      {
        name: "Ruínas de Alcântara",
        description: "Vila colonial do outro lado da baía.",
        image: alcantara,
      },
      {
        name: "Praia de São Marcos",
        description: "Praia urbana extensa, ponto de encontro no fim da tarde.",
        image: porDoSol,
      },
    ],
    tips: [
      "Use São Luís como primeira e última parada da viagem: é de lá que saem os transfers para os Lençóis.",
      "Visite o centro histórico de manhã ou no fim da tarde, quando o calor é menor.",
      "Para Alcântara, confira o horário da travessia na véspera, porque ele muda com a maré.",
      "Em junho, a cidade inteira vira arraial com apresentações de Bumba Meu Boi.",
    ],
    faq: [
      {
        question: "Quantos dias ficar em São Luís?",
        answer:
          "Dois dias cobrem o centro histórico e as praias. Com três dias dá para incluir o bate-volta a Alcântara.",
      },
      {
        question: "Vale a pena ir a Alcântara?",
        answer:
          "Sim, para quem gosta de história. O passeio de um dia inclui a travessia da baía e uma caminhada pelas ruínas e casarões da vila.",
      },
    ],
  },
  {
    slug: "chapada-das-mesas",
    name: "Chapada das Mesas",
    tagline: "Cachoeiras e montanhas de topo plano no sul do estado.",
    description:
      "No sul do Maranhão, o Parque Nacional da Chapada das Mesas reúne cachoeiras volumosas, poços de água cristalina e formações rochosas em forma de mesa no meio do cerrado. Carolina é a principal base para os passeios.",
    image: chapada,
    gallery: [chapada, rioPreguicas, porDoSol],
    categories: ["cachoeiras", "aventura", "natureza"],
    bestTime: "Maio a outubro, na estação seca",
    gettingThere: {
      airport: "Aeroporto de Imperatriz (IMP)",
      summary:
        "Imperatriz é o aeroporto mais próximo, a cerca de 3h de carro de Carolina. De São Luís são aproximadamente 800 km de estrada.",
    },
    highlights: [
      {
        name: "Cachoeira de São Romão",
        description: "Uma das mais fotografadas da região, com poço amplo.",
        image: chapada,
      },
      {
        name: "Cachoeira da Prata",
        description: "Cortina d'água larga cercada por mata, ótima para banho.",
        image: chapada,
      },
      {
        name: "Poço Azul",
        description: "Nascente de água azul-turquesa em meio à vegetação.",
        image: rioPreguicas,
      },
      {
        name: "Encanto Azul",
        description: "Poço tranquilo com fundo claro, ideal para flutuação.",
        image: santoAmaro,
      },
      {
        name: "Portal da Chapada",
        description: "Mirante com vista das mesas no fim da tarde.",
        image: porDoSol,
      },
    ],
    tips: [
      "As distâncias entre as atrações são grandes: alugue carro ou contrate passeios com transporte incluído.",
      "Na estação seca a água fica mais transparente e as trilhas mais seguras.",
      "Várias atrações ficam em propriedades particulares e cobram entrada.",
    ],
    faq: [
      {
        question: "Qual a melhor época para ir à Chapada das Mesas?",
        answer:
          "De maio a outubro, quando chove pouco, as águas estão mais claras e as estradas de terra ficam em melhores condições.",
      },
      {
        question: "Onde se hospedar na Chapada das Mesas?",
        answer:
          "Carolina concentra a maior parte das pousadas, restaurantes e agências, e fica perto das principais cachoeiras.",
      },
    ],
  },
];

export const getRegion = (slug: string) => regions.find((r) => r.slug === slug);

export type Destination = {
  slug: DestinationSlug;
  regionSlug: RegionSlug;
  name: string;
  tagline: string;
  /** Para quem a cidade é indicada como base dentro da região. */
  baseFor: string;
  state: string;
  description: string;
  image: string;
  gallery: string[];
  experiences: number;
  categories: string[];
  bestTime: string;
  distance: string;
  highlights: Highlight[];
};

export const destinations: Destination[] = [
  {
    slug: "barreirinhas",
    regionSlug: "lencois-maranhenses",
    name: "Barreirinhas",
    tagline: "A porta de entrada para os Lençóis Maranhenses.",
    baseFor:
      "Primeira viagem aos Lençóis: mais pousadas, restaurantes e saídas para todos os circuitos.",
    state: "Maranhão, Brasil",
    description:
      "Às margens do Rio Preguiças, Barreirinhas concentra a maior parte das saídas de 4x4 para as lagoas dos Lençóis e dos barcos que descem o rio até o mar. É a base mais estruturada para quem quer conhecer o parque em poucos dias.",
    image: barreirinhas,
    gallery: [lencois, rioPreguicas, atins],
    experiences: 24,
    categories: ["natureza", "aventura", "praias", "por-do-sol", "familia"],
    bestTime: "Junho a setembro (lagoas cheias)",
    distance: "≈ 250 km de São Luís",
    highlights: [
      {
        name: "Circuito Lagoa Azul",
        description: "Passeio clássico de 4x4 pelas dunas com paradas em lagoas de água doce.",
        image: lencois,
      },
      {
        name: "Circuito Lagoa Bonita",
        description: "Duna alta com vista panorâmica, o melhor lugar para o pôr do sol.",
        image: porDoSol,
      },
      {
        name: "Rio Preguiças",
        description: "Descida de lancha entre mangues, dunas e pequenos povoados ribeirinhos.",
        image: rioPreguicas,
      },
      {
        name: "Atins",
        description:
          "Vila de ruas de areia entre o rio e o mar, base de kitesurf e restaurantes autorais.",
        image: atins,
      },
      {
        name: "Vassouras",
        description:
          "Parada tradicional do circuito do rio, com macacos e barracas à beira d'água.",
        image: barreirinhas,
      },
      {
        name: "Mandacaru",
        description: "Povoado do farol com vista de 360° sobre o encontro do rio com o oceano.",
        image: santoAmaro,
      },
    ],
  },
  {
    slug: "sao-luis",
    regionSlug: "sao-luis",
    name: "São Luís",
    tagline: "Azulejos, tambores e mar na capital maranhense.",
    baseFor: "Chegada e partida da viagem, com cultura, gastronomia e vida noturna.",
    state: "Maranhão, Brasil",
    description:
      "Capital do estado e principal porta de chegada, São Luís reúne um centro histórico de casarões azulejados, uma cena cultural viva o ano inteiro e praias urbanas extensas.",
    image: saoLuis,
    gallery: [saoLuis, cultura, gastronomia],
    experiences: 31,
    categories: ["cultura", "gastronomia", "praias", "familia"],
    bestTime: "O ano inteiro, com junho para o São João",
    distance: "Aeroporto internacional na cidade",
    highlights: [
      {
        name: "Centro Histórico",
        description: "Conjunto de casarões coloniais e ladeiras de pedra tombadas.",
        image: saoLuis,
      },
      {
        name: "Rua do Giz",
        description: "Rua boêmia com bares, música ao vivo e fachadas históricas.",
        image: cultura,
      },
      {
        name: "Palácio dos Leões",
        description: "Sede do governo com vista para a baía e salões de época.",
        image: saoLuis,
      },
      {
        name: "Praia de São Marcos",
        description: "Praia urbana ampla, ponto de encontro no fim da tarde.",
        image: porDoSol,
      },
      {
        name: "Lagoa da Jansen",
        description: "Área de lazer com orla, restaurantes e caminhada.",
        image: hospedagem,
      },
      {
        name: "Casa das Tulhas",
        description: "Mercado tradicional para provar e levar sabores locais.",
        image: gastronomia,
      },
    ],
  },
  {
    slug: "atins",
    regionSlug: "lencois-maranhenses",
    name: "Atins",
    tagline: "Vila de areia entre o rio, o mar e as dunas.",
    baseFor: "Casais e quem busca sossego, praia e kitesurf, com estrutura mais rústica.",
    state: "Barreirinhas, Maranhão",
    description:
      "Atins virou o refúgio preferido de quem quer os Lençóis com menos gente: pousadas pequenas, cozinha autoral, kitesurf e caminhadas pelas dunas ao entardecer.",
    image: atins,
    gallery: [atins, lencois, hospedagem],
    experiences: 12,
    categories: ["praias", "romantico", "aventura", "por-do-sol"],
    bestTime: "Julho a dezembro (vento para kite)",
    distance: "≈ 45 km de Barreirinhas",
    highlights: [
      {
        name: "Praia de Atins",
        description: "Faixa larga de areia com poucas estruturas e muito vento.",
        image: atins,
      },
      {
        name: "Canto do Atins",
        description: "Ponto famoso pelo camarão fresco à beira-mar.",
        image: gastronomia,
      },
      {
        name: "Dunas do Sol Poente",
        description: "Caminhada curta até as dunas para ver o sol cair.",
        image: porDoSol,
      },
    ],
  },
  {
    slug: "santo-amaro",
    regionSlug: "lencois-maranhenses",
    name: "Santo Amaro",
    tagline: "O lado mais silencioso dos Lençóis.",
    baseFor: "Quem quer lagoas cercadas de dunas altas e uma vila tranquila, sem multidão.",
    state: "Maranhão, Brasil",
    description:
      "Menos movimentada que Barreirinhas, Santo Amaro dá acesso a lagoas cercadas de dunas altas e mantém o ritmo tranquilo de vila.",
    image: santoAmaro,
    gallery: [santoAmaro, lencois, porDoSol],
    experiences: 9,
    categories: ["natureza", "familia", "por-do-sol"],
    bestTime: "Junho a setembro",
    distance: "≈ 230 km de São Luís",
    highlights: [
      {
        name: "Lagoa da Gaivota",
        description: "Lagoa extensa cercada por dunas, boa para o dia inteiro.",
        image: santoAmaro,
      },
      {
        name: "Lagoa do Álvaro",
        description: "Passeio curto de 4x4 saindo da vila.",
        image: lencois,
      },
      {
        name: "Betânia",
        description: "Comunidade dentro do parque, com trilhas e mirantes.",
        image: porDoSol,
      },
    ],
  },
  {
    slug: "alcantara",
    regionSlug: "sao-luis",
    name: "Alcântara",
    tagline: "Ruínas coloniais do outro lado da baía.",
    baseFor: "Bate-volta de um dia a partir de São Luís para quem gosta de história.",
    state: "Maranhão, Brasil",
    description:
      "A uma travessia de barco de São Luís, Alcântara guarda ruínas, igrejas e casarões que contam a história colonial do Maranhão em ritmo lento.",
    image: alcantara,
    gallery: [alcantara, cultura, saoLuis],
    experiences: 7,
    categories: ["cultura", "romantico"],
    bestTime: "O ano inteiro",
    distance: "≈ 1h30 de barco de São Luís",
    highlights: [
      {
        name: "Ruínas da Matriz",
        description: "Fachada histórica preservada no centro da vila.",
        image: alcantara,
      },
      {
        name: "Praça da Matriz",
        description: "Pelourinho e casarões ao redor de uma praça arborizada.",
        image: cultura,
      },
      {
        name: "Travessia da baía",
        description: "Passeio de barco com vista da capital ao sair do porto.",
        image: saoLuis,
      },
    ],
  },
  {
    slug: "carolina",
    regionSlug: "chapada-das-mesas",
    name: "Carolina",
    tagline: "Base de aventura para a Chapada das Mesas.",
    baseFor: "Base principal para as cachoeiras e poços da Chapada das Mesas.",
    state: "Maranhão, Brasil",
    description:
      "Cidade histórica às margens do Tocantins, Carolina é o ponto de partida para as cachoeiras e poços da Chapada das Mesas.",
    image: chapada,
    gallery: [chapada, rioPreguicas, gastronomia],
    experiences: 11,
    categories: ["aventura", "cachoeiras", "natureza"],
    bestTime: "Maio a outubro",
    distance: "≈ 800 km de São Luís",
    highlights: [
      {
        name: "Pedra Caída",
        description: "Complexo de cachoeiras e cânions com trilhas sinalizadas.",
        image: chapada,
      },
      {
        name: "Praia do Tocantins",
        description: "Praia fluvial de areia clara na temporada seca.",
        image: atins,
      },
      {
        name: "Centro de Carolina",
        description: "Casario histórico e restaurantes regionais.",
        image: gastronomia,
      },
    ],
  },
];

export const getDestination = (slug: string) => destinations.find((d) => d.slug === slug);

export type Experience = {
  id: string;
  title: string;
  destinationSlug: DestinationSlug;
  category: string;
  price: number;
  duration: string;
  difficulty: "Fácil" | "Moderado" | "Desafiador";
  rating: number;
  reviews: number;
  image: string;
  description: string;
};

export const experiences: Experience[] = [
  {
    id: "e1",
    title: "Nascer do sol nos Lençóis",
    destinationSlug: "barreirinhas",
    category: "natureza",
    price: 180,
    duration: "4h",
    difficulty: "Fácil",
    rating: 4.9,
    reviews: 312,
    image: lencois,
    description:
      "Saída de madrugada de 4x4 para ver a luz chegar sobre as dunas e as lagoas ainda vazias.",
  },
  {
    id: "e2",
    title: "Passeio pelo Rio Preguiças",
    destinationSlug: "barreirinhas",
    category: "aventura",
    price: 150,
    duration: "6h",
    difficulty: "Fácil",
    rating: 4.8,
    reviews: 501,
    image: rioPreguicas,
    description: "Descida de lancha com paradas em Vassouras, Mandacaru e Caburé.",
  },
  {
    id: "e3",
    title: "Circuito Lagoa Bonita",
    destinationSlug: "barreirinhas",
    category: "por-do-sol",
    price: 120,
    duration: "4h",
    difficulty: "Moderado",
    rating: 4.9,
    reviews: 428,
    image: porDoSol,
    description: "Subida na duna mais alta do circuito para banho nas lagoas e pôr do sol.",
  },
  {
    id: "e4",
    title: "Trilha para a Cachoeira da Prata",
    destinationSlug: "carolina",
    category: "cachoeiras",
    price: 140,
    duration: "5h",
    difficulty: "Moderado",
    rating: 4.7,
    reviews: 189,
    image: chapada,
    description: "Caminhada leve na mata até uma cortina d'água com poço para banho.",
  },
  {
    id: "e5",
    title: "Centro Histórico de São Luís a pé",
    destinationSlug: "sao-luis",
    category: "cultura",
    price: 90,
    duration: "3h",
    difficulty: "Fácil",
    rating: 4.8,
    reviews: 264,
    image: saoLuis,
    description: "Caminhada guiada pelos casarões azulejados, ladeiras e praças do centro.",
  },
  {
    id: "e6",
    title: "Travessia de barco para Alcântara",
    destinationSlug: "alcantara",
    category: "cultura",
    price: 130,
    duration: "8h",
    difficulty: "Fácil",
    rating: 4.6,
    reviews: 143,
    image: alcantara,
    description: "Bate-volta pela baía até a vila colonial, com guia local.",
  },
  {
    id: "e7",
    title: "Experiência gastronômica maranhense",
    destinationSlug: "sao-luis",
    category: "gastronomia",
    price: 210,
    duration: "3h",
    difficulty: "Fácil",
    rating: 4.9,
    reviews: 97,
    image: gastronomia,
    description: "Jantar degustação com arroz de cuxá, peixe fresco e doces tradicionais.",
  },
  {
    id: "e8",
    title: "Kitesurf em Atins",
    destinationSlug: "atins",
    category: "aventura",
    price: 320,
    duration: "2h",
    difficulty: "Desafiador",
    rating: 4.8,
    reviews: 76,
    image: atins,
    description: "Aula com instrutor local nas águas rasas entre o rio e o mar.",
  },
  {
    id: "e9",
    title: "Lagoa da Gaivota em Santo Amaro",
    destinationSlug: "santo-amaro",
    category: "familia",
    price: 160,
    duration: "6h",
    difficulty: "Fácil",
    rating: 4.7,
    reviews: 132,
    image: santoAmaro,
    description: "Dia inteiro em lagoas rasas e tranquilas, ideal para ir com crianças.",
  },
  {
    id: "e10",
    title: "Pôr do sol na Praia de São Marcos",
    destinationSlug: "sao-luis",
    category: "por-do-sol",
    price: 0,
    duration: "2h",
    difficulty: "Fácil",
    rating: 4.5,
    reviews: 220,
    image: porDoSol,
    description: "Encontro no fim de tarde na praia urbana mais movimentada da capital.",
  },
  {
    id: "e11",
    title: "Jantar à beira-mar no Canto do Atins",
    destinationSlug: "atins",
    category: "gastronomia",
    price: 190,
    duration: "2h",
    difficulty: "Fácil",
    rating: 4.9,
    reviews: 168,
    image: gastronomia,
    description: "Camarão fresco preparado na hora com os pés praticamente na areia.",
  },
  {
    id: "e12",
    title: "Noite de Bumba Meu Boi",
    destinationSlug: "sao-luis",
    category: "cultura",
    price: 60,
    duration: "3h",
    difficulty: "Fácil",
    rating: 4.9,
    reviews: 341,
    image: cultura,
    description: "Apresentação de grupo tradicional com explicação sobre os sotaques do boi.",
  },
];

export type Itinerary = {
  slug: string;
  title: string;
  subtitle: string;
  days: number;
  difficulty: string;
  /** Texto de exibição do percurso, ex.: "São Luís → Barreirinhas → Atins". */
  destinationsLabel: string;
  regionSlugs: RegionSlug[];
  destinationSlugs: DestinationSlug[];
  places: number;
  budget: string;
  image: string;
  tags: string[];
  days_detail: {
    day: number;
    title: string;
    route: string;
    summary: string;
    image: string;
    time: string;
    transport: string;
    places: string[];
    food: string;
  }[];
};

export const itineraries: Itinerary[] = [
  {
    slug: "maranhao-essencial",
    title: "Maranhão Essencial",
    subtitle: "5 dias para conhecer alguns dos lugares mais incríveis do estado.",
    days: 5,
    difficulty: "Leve",
    destinationsLabel: "São Luís → Barreirinhas → Lençóis → Atins",
    regionSlugs: ["sao-luis", "lencois-maranhenses"],
    destinationSlugs: ["sao-luis", "barreirinhas", "atins"],
    places: 14,
    budget: "R$ 2.400 a R$ 3.600",
    image: lencois,
    tags: ["Natureza", "Cultura", "Praias"],
    days_detail: [
      {
        day: 1,
        title: "São Luís",
        route: "Chegada e centro histórico",
        summary:
          "Chegada na capital, caminhada pelos casarões azulejados e primeira noite com música ao vivo.",
        image: saoLuis,
        time: "6h de passeio",
        transport: "A pé + táxi",
        places: ["Centro Histórico", "Rua do Giz", "Palácio dos Leões"],
        food: "Jantar com arroz de cuxá no centro",
      },
      {
        day: 2,
        title: "São Luís → Barreirinhas",
        route: "Transfer de 4h",
        summary: "Manhã na Casa das Tulhas e deslocamento até Barreirinhas no início da tarde.",
        image: barreirinhas,
        time: "4h de estrada",
        transport: "Transfer compartilhado",
        places: ["Casa das Tulhas", "Orla do Preguiças"],
        food: "Peixe grelhado à beira do rio",
      },
      {
        day: 3,
        title: "Lençóis Maranhenses",
        route: "Circuito Lagoa Bonita",
        summary: "Dia inteiro nas dunas: banho nas lagoas e pôr do sol no alto da duna.",
        image: lencois,
        time: "8h",
        transport: "4x4",
        places: ["Lagoa Azul", "Lagoa da Esmeralda", "Lagoa Bonita"],
        food: "Almoço em restaurante de comunidade",
      },
      {
        day: 4,
        title: "Rio Preguiças + Atins",
        route: "Barreirinhas → Atins",
        summary: "Descida do rio de lancha com paradas até chegar em Atins para dormir.",
        image: rioPreguicas,
        time: "7h",
        transport: "Lancha + 4x4",
        places: ["Vassouras", "Mandacaru", "Caburé", "Atins"],
        food: "Camarão no Canto do Atins",
      },
      {
        day: 5,
        title: "Retorno",
        route: "Atins → São Luís",
        summary: "Manhã livre na praia e retorno para a capital no fim do dia.",
        image: porDoSol,
        time: "6h",
        transport: "4x4 + transfer",
        places: ["Praia de Atins", "Aeroporto de São Luís"],
        food: "Café da manhã na pousada",
      },
    ],
  },
  {
    slug: "sao-luis-1-dia",
    title: "São Luís em 1 dia",
    subtitle: "O essencial da capital entre azulejos, mercado e pôr do sol.",
    days: 1,
    difficulty: "Leve",
    destinationsLabel: "São Luís",
    regionSlugs: ["sao-luis"],
    destinationSlugs: ["sao-luis"],
    places: 6,
    budget: "R$ 180 a R$ 320",
    image: saoLuis,
    tags: ["Cultura", "Gastronomia"],
    days_detail: [
      {
        day: 1,
        title: "Capital em um dia",
        route: "Centro → Praia",
        summary: "Manhã no centro histórico, tarde no mercado e fim de tarde na praia.",
        image: saoLuis,
        time: "10h",
        transport: "A pé + carro de app",
        places: ["Centro Histórico", "Rua do Giz", "Casa das Tulhas", "Praia de São Marcos"],
        food: "Almoço regional na Casa das Tulhas",
      },
    ],
  },
  {
    slug: "sao-luis-3-dias",
    title: "São Luís em 3 dias",
    subtitle: "História, praias urbanas e a cena cultural da capital.",
    days: 3,
    difficulty: "Leve",
    destinationsLabel: "São Luís → Alcântara",
    regionSlugs: ["sao-luis"],
    destinationSlugs: ["sao-luis", "alcantara"],
    places: 11,
    budget: "R$ 750 a R$ 1.400",
    image: cultura,
    tags: ["Cultura", "Praias"],
    days_detail: [
      {
        day: 1,
        title: "Centro histórico",
        route: "Caminhada guiada",
        summary: "Museus, ladeiras e casarões azulejados.",
        image: saoLuis,
        time: "6h",
        transport: "A pé",
        places: ["Centro Histórico", "Palácio dos Leões"],
        food: "Jantar na Rua do Giz",
      },
      {
        day: 2,
        title: "Alcântara",
        route: "Travessia da baía",
        summary: "Bate-volta de barco até a vila colonial.",
        image: alcantara,
        time: "8h",
        transport: "Barco",
        places: ["Ruínas da Matriz", "Praça da Matriz"],
        food: "Almoço na vila",
      },
      {
        day: 3,
        title: "Praias e lagoa",
        route: "Orla da capital",
        summary: "Dia relaxado entre praia e Lagoa da Jansen.",
        image: porDoSol,
        time: "6h",
        transport: "Carro de app",
        places: ["Praia de São Marcos", "Lagoa da Jansen"],
        food: "Frutos do mar na orla",
      },
    ],
  },
  {
    slug: "lencois-3-dias",
    title: "Lençóis Maranhenses em 3 dias",
    subtitle: "Dunas, lagoas e rio no ritmo certo.",
    days: 3,
    difficulty: "Moderado",
    destinationsLabel: "Barreirinhas → Lençóis → Atins",
    regionSlugs: ["lencois-maranhenses"],
    destinationSlugs: ["barreirinhas", "atins"],
    places: 9,
    budget: "R$ 1.100 a R$ 1.900",
    image: porDoSol,
    tags: ["Natureza", "Aventura"],
    days_detail: [
      {
        day: 1,
        title: "Chegada em Barreirinhas",
        route: "Circuito Lagoa Azul",
        summary: "Primeiro contato com as dunas à tarde.",
        image: lencois,
        time: "5h",
        transport: "4x4",
        places: ["Lagoa Azul", "Lagoa da Esmeralda"],
        food: "Jantar na orla",
      },
      {
        day: 2,
        title: "Rio Preguiças",
        route: "Barreirinhas → Atins",
        summary: "Descida de lancha com paradas clássicas.",
        image: rioPreguicas,
        time: "7h",
        transport: "Lancha",
        places: ["Vassouras", "Mandacaru", "Caburé"],
        food: "Peixe frito em Caburé",
      },
      {
        day: 3,
        title: "Atins",
        route: "Dunas e praia",
        summary: "Caminhada nas dunas e retorno.",
        image: atins,
        time: "6h",
        transport: "4x4",
        places: ["Praia de Atins", "Canto do Atins"],
        food: "Camarão no Canto do Atins",
      },
    ],
  },
  {
    slug: "chapada-4-dias",
    title: "Chapada das Mesas em 4 dias",
    subtitle: "Cachoeiras, poços azuis e mirantes no sul do estado.",
    days: 4,
    difficulty: "Moderado",
    destinationsLabel: "Carolina → Chapada das Mesas",
    regionSlugs: ["chapada-das-mesas"],
    destinationSlugs: ["carolina"],
    places: 10,
    budget: "R$ 1.300 a R$ 2.200",
    image: chapada,
    tags: ["Aventura", "Cachoeiras"],
    days_detail: [
      {
        day: 1,
        title: "Carolina",
        route: "Chegada",
        summary: "Reconhecimento da cidade e Pedra Caída.",
        image: chapada,
        time: "5h",
        transport: "Carro",
        places: ["Pedra Caída"],
        food: "Jantar no centro",
      },
      {
        day: 2,
        title: "Cachoeira de São Romão",
        route: "Trilha",
        summary: "Dia inteiro na cachoeira mais famosa da região.",
        image: chapada,
        time: "8h",
        transport: "4x4",
        places: ["São Romão"],
        food: "Almoço no complexo",
      },
      {
        day: 3,
        title: "Poço Azul e Encanto Azul",
        route: "Poços",
        summary: "Flutuação em águas cristalinas.",
        image: rioPreguicas,
        time: "7h",
        transport: "Carro",
        places: ["Poço Azul", "Encanto Azul"],
        food: "Piquenique",
      },
      {
        day: 4,
        title: "Portal da Chapada",
        route: "Mirante e retorno",
        summary: "Vista das mesas antes de voltar.",
        image: porDoSol,
        time: "4h",
        transport: "Carro",
        places: ["Portal da Chapada"],
        food: "Café da manhã reforçado",
      },
    ],
  },
  {
    slug: "fim-de-semana-lencois",
    title: "Fim de semana nos Lençóis",
    subtitle: "Dois dias intensos para quem tem pouco tempo.",
    days: 2,
    difficulty: "Leve",
    destinationsLabel: "Barreirinhas → Lençóis",
    regionSlugs: ["lencois-maranhenses"],
    destinationSlugs: ["barreirinhas"],
    places: 6,
    budget: "R$ 700 a R$ 1.200",
    image: lencois,
    tags: ["Natureza", "Pôr do sol"],
    days_detail: [
      {
        day: 1,
        title: "Lagoa Azul",
        route: "Circuito clássico",
        summary: "Chegada e tarde nas lagoas.",
        image: lencois,
        time: "5h",
        transport: "4x4",
        places: ["Lagoa Azul", "Lagoa da Esmeralda"],
        food: "Jantar em Barreirinhas",
      },
      {
        day: 2,
        title: "Lagoa Bonita",
        route: "Pôr do sol",
        summary: "Duna alta e retorno no fim do dia.",
        image: porDoSol,
        time: "5h",
        transport: "4x4",
        places: ["Lagoa Bonita"],
        food: "Almoço na estrada",
      },
    ],
  },
];

export const getItinerary = (slug: string) => itineraries.find((i) => i.slug === slug);

export type MapPoint = {
  id: string;
  name: string;
  type: "atracao" | "restaurante" | "hotel" | "passeio" | "praia" | "natureza" | "cultura";
  x: number;
  y: number;
  rating: number;
  description: string;
  image: string;
  destinationSlug: DestinationSlug;
};

export const mapTypes = [
  { id: "todos", label: "Todos" },
  { id: "atracao", label: "Atrações" },
  { id: "restaurante", label: "Restaurantes" },
  { id: "hotel", label: "Hotéis" },
  { id: "passeio", label: "Passeios" },
  { id: "praia", label: "Praias" },
  { id: "natureza", label: "Natureza" },
  { id: "cultura", label: "Cultura" },
] as const;

export const mapPoints: MapPoint[] = [
  {
    id: "m1",
    name: "Lagoa Azul",
    type: "natureza",
    x: 52,
    y: 22,
    rating: 4.9,
    description: "Lagoa mais visitada do circuito clássico dos Lençóis.",
    image: lencois,
    destinationSlug: "barreirinhas",
  },
  {
    id: "m2",
    name: "Lagoa Bonita",
    type: "natureza",
    x: 45,
    y: 27,
    rating: 4.9,
    description: "Duna alta com vista aberta, clássica para o pôr do sol.",
    image: porDoSol,
    destinationSlug: "barreirinhas",
  },
  {
    id: "m3",
    name: "Parque Nacional dos Lençóis",
    type: "atracao",
    x: 48,
    y: 16,
    rating: 5.0,
    description: "Área protegida com dunas e lagoas de água doce.",
    image: lencois,
    destinationSlug: "barreirinhas",
  },
  {
    id: "m4",
    name: "Centro de Barreirinhas",
    type: "cultura",
    x: 58,
    y: 34,
    rating: 4.4,
    description: "Orla do Rio Preguiças, agências e restaurantes.",
    image: barreirinhas,
    destinationSlug: "barreirinhas",
  },
  {
    id: "m5",
    name: "Praia de Atins",
    type: "praia",
    x: 68,
    y: 20,
    rating: 4.8,
    description: "Praia larga e ventosa, base de kitesurf.",
    image: atins,
    destinationSlug: "atins",
  },
  {
    id: "m6",
    name: "Canto do Atins",
    type: "restaurante",
    x: 72,
    y: 24,
    rating: 4.9,
    description: "Camarão fresco servido à beira-mar.",
    image: gastronomia,
    destinationSlug: "atins",
  },
  {
    id: "m7",
    name: "Pousada Dunas de Atins",
    type: "hotel",
    x: 66,
    y: 27,
    rating: 4.7,
    description: "Pousada boutique com rede, piscina e café da manhã regional.",
    image: hospedagem,
    destinationSlug: "atins",
  },
  {
    id: "m8",
    name: "Rio Preguiças",
    type: "passeio",
    x: 62,
    y: 30,
    rating: 4.8,
    description: "Descida de lancha com paradas em povoados ribeirinhos.",
    image: rioPreguicas,
    destinationSlug: "barreirinhas",
  },
  {
    id: "m9",
    name: "Farol de Mandacaru",
    type: "atracao",
    x: 74,
    y: 33,
    rating: 4.6,
    description: "Vista de 360° sobre o encontro do rio com o mar.",
    image: santoAmaro,
    destinationSlug: "barreirinhas",
  },
  {
    id: "m10",
    name: "Centro Histórico de São Luís",
    type: "cultura",
    x: 26,
    y: 42,
    rating: 4.8,
    description: "Casarões azulejados e ladeiras tombadas.",
    image: saoLuis,
    destinationSlug: "sao-luis",
  },
  {
    id: "m11",
    name: "Praia de São Marcos",
    type: "praia",
    x: 21,
    y: 37,
    rating: 4.5,
    description: "Praia urbana extensa na capital.",
    image: porDoSol,
    destinationSlug: "sao-luis",
  },
  {
    id: "m12",
    name: "Casa das Tulhas",
    type: "restaurante",
    x: 29,
    y: 46,
    rating: 4.6,
    description: "Mercado tradicional de sabores maranhenses.",
    image: gastronomia,
    destinationSlug: "sao-luis",
  },
  {
    id: "m13",
    name: "Ruínas de Alcântara",
    type: "cultura",
    x: 14,
    y: 34,
    rating: 4.7,
    description: "Vila colonial do outro lado da baía.",
    image: alcantara,
    destinationSlug: "alcantara",
  },
  {
    id: "m14",
    name: "Lagoa da Gaivota",
    type: "natureza",
    x: 38,
    y: 24,
    rating: 4.7,
    description: "Lagoa extensa no lado de Santo Amaro.",
    image: santoAmaro,
    destinationSlug: "santo-amaro",
  },
  {
    id: "m15",
    name: "Cachoeira de São Romão",
    type: "natureza",
    x: 33,
    y: 82,
    rating: 4.9,
    description: "Queda d'água larga com poço amplo para banho.",
    image: chapada,
    destinationSlug: "carolina",
  },
  {
    id: "m16",
    name: "Pedra Caída",
    type: "passeio",
    x: 27,
    y: 76,
    rating: 4.8,
    description: "Complexo de cachoeiras e cânions com trilhas.",
    image: chapada,
    destinationSlug: "carolina",
  },
  {
    id: "m17",
    name: "Hotel Portal da Chapada",
    type: "hotel",
    x: 37,
    y: 88,
    rating: 4.5,
    description: "Hospedagem com vista para as mesas.",
    image: hospedagem,
    destinationSlug: "carolina",
  },
  {
    id: "m18",
    name: "Poço Azul",
    type: "natureza",
    x: 41,
    y: 79,
    rating: 4.8,
    description: "Nascente de água azul-turquesa.",
    image: rioPreguicas,
    destinationSlug: "carolina",
  },
];

export const mapRoute = {
  name: "Roteiro Lençóis em 1 dia",
  stops: ["m4", "m3", "m1", "m2", "m9"],
  labels: ["Barreirinhas", "Parque", "Lagoa Azul", "Lagoa Bonita", "Pôr do sol"],
};

export type EventItem = {
  id: string;
  name: string;
  destinationSlug: DestinationSlug;
  month: string;
  day: string;
  category: string;
  image: string;
  description: string;
};

export const events: EventItem[] = [
  {
    id: "ev1",
    name: "São João do Maranhão",
    destinationSlug: "sao-luis",
    month: "Junho",
    day: "13 a 30",
    category: "Festa tradicional",
    image: cultura,
    description:
      "Arraiais espalhados pela cidade com apresentações de grupos juninos. Programação demonstrativa.",
  },
  {
    id: "ev2",
    name: "Bumba Meu Boi na Noite dos Sotaques",
    destinationSlug: "sao-luis",
    month: "Junho",
    day: "24",
    category: "Cultura",
    image: cultura,
    description:
      "Encontro de grupos de boi de diferentes sotaques em um mesmo palco. Dados demonstrativos.",
  },
  {
    id: "ev3",
    name: "Festival Gastronômico do Cuxá",
    destinationSlug: "sao-luis",
    month: "Agosto",
    day: "08 a 11",
    category: "Gastronomia",
    image: gastronomia,
    description: "Restaurantes locais criam pratos autorais a partir de ingredientes regionais.",
  },
  {
    id: "ev4",
    name: "Festival de Kitesurf de Atins",
    destinationSlug: "atins",
    month: "Setembro",
    day: "20 a 22",
    category: "Esporte",
    image: atins,
    description: "Competição amadora e aulas abertas na temporada de ventos.",
  },
  {
    id: "ev5",
    name: "Encontro de Violeiros da Chapada",
    destinationSlug: "carolina",
    month: "Outubro",
    day: "05",
    category: "Show",
    image: chapada,
    description: "Música de raiz em palco montado próximo ao rio.",
  },
  {
    id: "ev6",
    name: "Réveillon nas Dunas",
    destinationSlug: "barreirinhas",
    month: "Dezembro",
    day: "31",
    category: "Festa",
    image: porDoSol,
    description: "Programação de virada com shows na orla do Preguiças.",
  },
  {
    id: "ev7",
    name: "Semana do Patrimônio",
    destinationSlug: "alcantara",
    month: "Novembro",
    day: "12 a 18",
    category: "Cultura",
    image: alcantara,
    description: "Visitas guiadas gratuitas pelas ruínas e casarões da vila.",
  },
  {
    id: "ev8",
    name: "Carnaval de São Luís",
    destinationSlug: "sao-luis",
    month: "Fevereiro",
    day: "14 a 17",
    category: "Festa tradicional",
    image: cultura,
    description: "Blocos tradicionais desfilam pelo centro histórico.",
  },
];

export type Business = {
  id: string;
  name: string;
  category: "Hotéis" | "Restaurantes" | "Agências" | "Guias" | "Transfers" | "Passeios";
  destinationSlug: DestinationSlug;
  rating: number;
  reviews: number;
  image: string;
  description: string;
};

export const businesses: Business[] = [
  {
    id: "b1",
    name: "Pousada Dunas de Atins",
    category: "Hotéis",
    destinationSlug: "atins",
    rating: 4.8,
    reviews: 214,
    image: hospedagem,
    description: "Pousada boutique com 12 quartos, piscina e café da manhã regional.",
  },
  {
    id: "b2",
    name: "Restaurante Maré do Cuxá",
    category: "Restaurantes",
    destinationSlug: "sao-luis",
    rating: 4.7,
    reviews: 389,
    image: gastronomia,
    description: "Cozinha maranhense contemporânea no centro histórico.",
  },
  {
    id: "b3",
    name: "Preguiças Turismo",
    category: "Agências",
    destinationSlug: "barreirinhas",
    rating: 4.6,
    reviews: 502,
    image: rioPreguicas,
    description: "Saídas diárias de 4x4 e lancha para os circuitos clássicos.",
  },
  {
    id: "b4",
    name: "Guia Marcos Duarte",
    category: "Guias",
    destinationSlug: "barreirinhas",
    rating: 4.9,
    reviews: 176,
    image: lencois,
    description: "Guia credenciado com foco em fotografia nas dunas.",
  },
  {
    id: "b5",
    name: "Transfer Lençóis Express",
    category: "Transfers",
    destinationSlug: "sao-luis",
    rating: 4.5,
    reviews: 231,
    image: barreirinhas,
    description: "Transfers compartilhados e privativos entre a capital e Barreirinhas.",
  },
  {
    id: "b6",
    name: "Chapada Aventura",
    category: "Passeios",
    destinationSlug: "carolina",
    rating: 4.8,
    reviews: 143,
    image: chapada,
    description: "Trilhas guiadas, rapel e cachoeirismo na Chapada das Mesas.",
  },
  {
    id: "b7",
    name: "Casa Azulejo Hostel",
    category: "Hotéis",
    destinationSlug: "sao-luis",
    rating: 4.4,
    reviews: 97,
    image: saoLuis,
    description: "Casarão restaurado com quartos compartilhados e privativos.",
  },
  {
    id: "b8",
    name: "Camarão do Canto",
    category: "Restaurantes",
    destinationSlug: "atins",
    rating: 4.9,
    reviews: 268,
    image: gastronomia,
    description: "Camarão fresco preparado na hora à beira-mar.",
  },
];

export const getDestinationName = (slug: DestinationSlug) =>
  destinations.find((d) => d.slug === slug)?.name ?? slug;

const destinationRegion = (slug: DestinationSlug) =>
  destinations.find((d) => d.slug === slug)?.regionSlug;

const inRegion = (region: RegionSlug) => (item: { destinationSlug: DestinationSlug }) =>
  destinationRegion(item.destinationSlug) === region;

export const getDestinationsByRegion = (region: RegionSlug) =>
  destinations.filter((d) => d.regionSlug === region);
export const getExperiencesByRegion = (region: RegionSlug) => experiences.filter(inRegion(region));
export const getItinerariesByRegion = (region: RegionSlug) =>
  itineraries.filter((i) => i.regionSlugs.includes(region));
export const getEventsByRegion = (region: RegionSlug) => events.filter(inRegion(region));
export const getBusinessesByRegion = (region: RegionSlug) => businesses.filter(inRegion(region));
export const getMapPointsByRegion = (region: RegionSlug) => mapPoints.filter(inRegion(region));

export const getExperiencesByDestination = (slug: DestinationSlug) =>
  experiences.filter((e) => e.destinationSlug === slug);
export const getItinerariesByDestination = (slug: DestinationSlug) =>
  itineraries.filter((i) => i.destinationSlugs.includes(slug));
export const getEventsByDestination = (slug: DestinationSlug) =>
  events.filter((e) => e.destinationSlug === slug);
export const getBusinessesByDestination = (slug: DestinationSlug) =>
  businesses.filter((b) => b.destinationSlug === slug);
export const getMapPointsByDestination = (slug: DestinationSlug) =>
  mapPoints.filter((p) => p.destinationSlug === slug);

export const searchSuggestions = [
  "Quero conhecer os Lençóis Maranhenses",
  "Quero viajar em família",
  "Quero conhecer praias",
  "Quero fazer uma viagem de 5 dias",
  "Quero cachoeiras na Chapada das Mesas",
];
