import { urlFotoNegocio, type NegocioPublico } from "@/lib/negocios";
import {
  atrativos,
  destinos,
  distanciaKm,
  FAIXAS,
  porSlug,
  roteiros,
  type CategoriaId,
  type Coordenada,
  type DetalhesNegocio,
  type Experiencia,
  type FaixaPreco,
  type Hospedagem,
  type InfoPratica,
  type Item,
  type Lugar,
  type Mes,
  type Parada,
  type TipoHospedagem,
  type TipoNegocio,
} from "./index";

/**
 * Catálogo do site: os atrativos fixos (src/data/lugares.ts) mais os negócios publicados
 * que vêm do banco, já no formato que os cards, o mapa e os roteiros usam.
 *
 * Nas telas, use `useCatalogo()` (src/lib/use-catalogo.ts). Se o banco não respondeu,
 * `negociosOk` é false: os atrativos continuam lá e as telas mostram <AvisoNegocios />.
 */
export type Catalogo = {
  negociosOk: boolean;
  lugares: Lugar[];
  experiencias: Experiencia[];
  /** cards de "Onde ficar", na ordem da equipe */
  hospedagens: Hospedagem[];
  itens: Item[];
  getLugar: (slug: string) => Lugar | undefined;
  getExperiencia: (slug: string) => Experiencia | undefined;
  getHospedagem: (slug: string) => Hospedagem | undefined;
  getItem: (tipo: Item["tipo"], slug: string) => Item | undefined;
  resolverParada: (p: Parada) => Item | undefined;
  itensDoDestino: (destino: string) => Item[];
  roteirosQueIncluem: (tipo: Item["tipo"], slug: string) => typeof roteiros;
  pontosDoRoteiro: (dias: { paradas: Parada[] }[]) => Item[];
  proximos: (alvo: Coordenada & { slug: string }, limite?: number) => { item: Item; km: number }[];
};

const porNegocios = new WeakMap<NegocioPublico[], Catalogo>();
let semNegocios: Catalogo | undefined;

/** Monta (uma vez por lista) o catálogo. `null` = o banco não respondeu. */
export function criarCatalogo(negocios: NegocioPublico[] | null): Catalogo {
  if (negocios === null) return (semNegocios ??= montar(null));
  let catalogo = porNegocios.get(negocios);
  if (!catalogo) {
    catalogo = montar(negocios);
    porNegocios.set(negocios, catalogo);
  }
  return catalogo;
}

// ——— conversão de uma linha de negocios ———

const ANO_TODO: Mes[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const CATEGORIA_PADRAO: Record<TipoNegocio, CategoriaId> = {
  restaurante: "gastronomia",
  hospedagem: "hospedagem",
  passeio: "natureza",
};

const HORAS_PADRAO: Record<TipoNegocio, number> = { restaurante: 1.5, hospedagem: 0, passeio: 4 };

const FAIXA_DO_SIMBOLO = { $: 1, $$: 2, $$$: 3 } as const satisfies Record<string, FaixaPreco>;

const TIPO_HOSPEDAGEM: Record<string, TipoHospedagem> = {
  pousada: "Pousada",
  hotel: "Hotel",
  chale: "Chalé",
  hostel: "Hostel",
  casa_de_temporada: "Casa de temporada",
};

const reais = new Intl.NumberFormat("pt-BR");

const normalizar = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

const destinoPorNome = new Map(destinos.map((d) => [normalizar(d.nome), d.slug]));

/** A coluna cidade guarda o nome ("São Luís"); o site usa o slug do destino. */
function destinoDaCidade(cidade: string | null) {
  if (!cidade) return "";
  const nome = normalizar(cidade);
  return destinoPorNome.get(nome) ?? nome.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const fotosEmOrdem = (n: NegocioPublico) =>
  [...n.negocio_fotos].sort((a, b) => a.ordem - b.ordem).map((f) => urlFotoNegocio(f.caminho));

const capa = (n: NegocioPublico) => fotosEmOrdem(n)[0] ?? "";

function primeiraFrase(texto: string) {
  const m = texto.match(/^.+?[.!?](\s|$)/);
  return (m ? m[0] : texto).trim();
}

function faixaPreco(n: NegocioPublico): FaixaPreco {
  if (n.faixa_preco) return FAIXA_DO_SIMBOLO[n.faixa_preco];
  if (n.extras.faixaPreco) return n.extras.faixaPreco;
  if (n.preco == null) return 2;
  const [barato, medio] = n.tipo === "hospedagem" ? [200, 400] : [100, 250];
  return n.preco <= barato ? 1 : n.preco <= medio ? 2 : 3;
}

/** Texto do preço na ficha; vazio quando o negócio não informou (a linha some). */
function precoTexto(n: NegocioPublico) {
  if (n.extras.precoTexto) return n.extras.precoTexto;
  if (n.tipo === "restaurante")
    return n.faixa_preco ? FAIXAS[FAIXA_DO_SIMBOLO[n.faixa_preco]].texto : "";
  if (n.preco == null) return "";
  const valor = `R$ ${reais.format(n.preco)}`;
  // os exemplos mantêm o texto de antes
  if (n.exemplo)
    return n.tipo === "hospedagem"
      ? `Diária a partir de ${valor} (exemplo)`
      : `A partir de ${valor} por pessoa (exemplo)`;
  return n.tipo === "hospedagem" ? `${valor} por noite` : `${valor} por pessoa`;
}

function detalhes(n: NegocioPublico): DetalhesNegocio {
  const subtipo = n.tipo === "hospedagem" ? TIPO_HOSPEDAGEM[n.subtipo ?? ""] : undefined;
  return {
    tipo: n.tipo,
    exemplo: n.exemplo,
    fotos: fotosEmOrdem(n),
    ...(n.whatsapp ? { whatsapp: n.whatsapp } : {}),
    ...(subtipo ? { subtipo } : {}),
    ...(n.cidade ? { cidade: n.cidade } : {}),
    melhorEpoca: Boolean(n.extras.mesesBons?.length),
    dificuldade: Boolean(n.extras.dificuldade),
  };
}

function base(n: NegocioPublico) {
  // sem valores padrão: o que o negócio não informou fica vazio e some da ficha
  const info: InfoPratica = {
    horario: n.tipo === "hospedagem" ? "" : (n.horario ?? ""),
    preco: precoTexto(n),
    duracao: (n.tipo === "passeio" ? n.duracao : n.extras.duracaoTexto) ?? "",
    dicas: n.extras.dicas ?? [],
  };
  return {
    slug: n.slug,
    nome: n.nome,
    destino: destinoDaCidade(n.cidade),
    categoria: n.extras.categoria ?? CATEGORIA_PADRAO[n.tipo],
    resumo: n.extras.resumo ?? primeiraFrase(n.descricao ?? ""),
    descricao: n.descricao ?? "",
    info,
    faixaPreco: faixaPreco(n),
    horas: n.extras.horas ?? HORAS_PADRAO[n.tipo],
    mesesBons: n.extras.mesesBons ?? ANO_TODO,
    foto: capa(n),
    tags: n.extras.tags ?? [],
    lat: n.latitude ?? 0,
    lng: n.longitude ?? 0,
  };
}

/** Tem página própria? Precisa de descrição e de localização (mapa e "perto daqui"). */
const temPagina = (n: NegocioPublico) =>
  Boolean(n.descricao?.trim()) && n.latitude != null && n.longitude != null;

function paraLugar(n: NegocioPublico): Lugar | null {
  if (n.tipo === "passeio" || !temPagina(n)) return null;
  return {
    ...base(n),
    tipo: n.tipo,
    // a etiqueta "Exemplo" aparece nos restaurantes e pousadas inventados
    ...(n.exemplo ? { ficticio: true, exemplo: true } : {}),
    negocio: detalhes(n),
  };
}

function paraExperiencia(n: NegocioPublico): Experiencia | null {
  if (n.tipo !== "passeio" || !temPagina(n)) return null;
  return {
    ...base(n),
    dificuldade: n.extras.dificuldade ?? "Leve",
    lugares: n.extras.lugares ?? [],
    empresas: n.extras.empresas ?? [],
    ...(n.exemplo ? { exemplo: true } : {}),
    negocio: detalhes(n),
  };
}

function paraHospedagem(n: NegocioPublico): Hospedagem | null {
  if (n.tipo !== "hospedagem" || n.extras.ondeFicar === false) return null;
  const { avaliacao, avaliacoes } = n.extras;
  return {
    slug: n.slug,
    nome: n.nome_curto || n.nome,
    tipo: TIPO_HOSPEDAGEM[n.subtipo ?? ""] ?? "Pousada",
    destino: destinoDaCidade(n.cidade),
    foto: capa(n),
    ...(n.preco != null ? { precoNoite: n.preco } : {}),
    ...(avaliacao != null && avaliacoes != null ? { avaliacao, avaliacoes } : {}),
    // com página própria, o card leva para ela; senão, para a cidade
    ...(temPagina(n) ? { lugar: n.slug } : {}),
    ...(n.exemplo ? { exemplo: true } : {}),
  };
}

// negócios reais antes dos de exemplo; dentro de cada grupo, a ordem da equipe e o nome
const pelaOrdem = (a: NegocioPublico, b: NegocioPublico) =>
  Number(a.exemplo) - Number(b.exemplo) ||
  (a.extras.ordem ?? Infinity) - (b.extras.ordem ?? Infinity) ||
  a.nome.localeCompare(b.nome);

function lugarParaItem(x: Lugar, negocio?: TipoNegocio): Item {
  return {
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
    ...(x.exemplo ? { exemplo: true } : {}),
    ...(negocio ? { negocio } : {}),
    lat: x.lat,
    lng: x.lng,
    href: "/lugares/$slug",
  };
}

function experienciaParaItem(x: Experiencia): Item {
  return {
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
    ...(x.exemplo ? { exemplo: true } : {}),
    negocio: "passeio",
    lat: x.lat,
    lng: x.lng,
    href: "/experiencias/$slug",
  };
}

function montar(negocios: NegocioPublico[] | null): Catalogo {
  const ordenados = [...(negocios ?? [])].sort(pelaOrdem);
  // um slug de negócio nunca cobre um atrativo
  const slugsAtrativos = new Set(atrativos.map((a) => a.slug));
  const deNegocio = ordenados.filter((n) => !slugsAtrativos.has(n.slug));

  const lugaresNegocio = deNegocio.map(paraLugar).filter((x): x is Lugar => x !== null);
  const experiencias = deNegocio.map(paraExperiencia).filter((x): x is Experiencia => x !== null);
  const hospedagens = deNegocio.map(paraHospedagem).filter((x): x is Hospedagem => x !== null);
  const lugares = [...atrativos, ...lugaresNegocio];

  const itens: Item[] = [
    ...experiencias.map(experienciaParaItem),
    ...atrativos.map((x) => lugarParaItem(x)),
    ...lugaresNegocio.map((x) => lugarParaItem(x, x.tipo === "atrativo" ? undefined : x.tipo)),
  ];

  const mapaLugares = porSlug(lugares);
  const mapaExperiencias = porSlug(experiencias);
  const mapaHospedagens = porSlug(hospedagens);
  const mapaItens = new Map(itens.map((i) => [`${i.tipo}:${i.slug}`, i]));

  const getItem = (tipo: Item["tipo"], slug: string) => mapaItens.get(`${tipo}:${slug}`);
  const resolverParada = (p: Parada) => getItem(p.ref.tipo, p.ref.slug);

  return {
    negociosOk: negocios !== null,
    lugares,
    experiencias,
    hospedagens,
    itens,
    getLugar: (slug) => mapaLugares.get(slug),
    getExperiencia: (slug) => mapaExperiencias.get(slug),
    getHospedagem: (slug) => mapaHospedagens.get(slug),
    getItem,
    resolverParada,
    itensDoDestino: (destino) => itens.filter((i) => i.destino === destino),
    roteirosQueIncluem: (tipo, slug) =>
      roteiros.filter((r) =>
        r.dias.some((d) => d.paradas.some((p) => p.ref.tipo === tipo && p.ref.slug === slug)),
      ),
    /** Pontos do roteiro, em ordem, sem repetir. */
    pontosDoRoteiro: (dias) => {
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
    },
    proximos: (alvo, limite = 4) =>
      itens
        .filter((i) => i.slug !== alvo.slug && i.horas > 0)
        .map((i) => ({ item: i, km: distanciaKm(alvo, i) }))
        .filter((x) => x.km < 60)
        .sort((a, b) => a.km - b.km)
        .slice(0, limite),
  };
}

/**
 * Como um negócio vai aparecer no site (prévia do formulário do dono): a mesma conversão
 * que o catálogo usa para os publicados.
 */
export function previaDoNegocio(n: NegocioPublico) {
  const lugar = paraLugar(n);
  const experiencia = paraExperiencia(n);
  return {
    lugar,
    experiencia,
    hospedagem: paraHospedagem(n),
    item: experiencia
      ? experienciaParaItem(experiencia)
      : lugar
        ? lugarParaItem(lugar, n.tipo)
        : null,
  };
}
