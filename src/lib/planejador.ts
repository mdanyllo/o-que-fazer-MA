import {
  getDestino,
  itensDoDestino,
  nomeDestino,
  type CategoriaId,
  type DiaRoteiro,
  type FaixaPreco,
  type Item,
  type Mes,
} from "@/data";

/**
 * Planejador simulado: monta um roteiro a partir das respostas, só com regras simples
 * sobre os dados de exemplo. Não há IA nem backend.
 */

export type Ritmo = "Tranquilo" | "Equilibrado" | "Intenso";
export type Orcamento = "Econômico" | "Confortável" | "Premium";
export type Chegada = "sao-luis" | "imperatriz" | "barreirinhas";

export type Respostas = {
  dias: number;
  /** mês da viagem, se a pessoa informou datas */
  mes?: Mes;
  interesses: CategoriaId[];
  ritmo: Ritmo;
  orcamento: Orcamento;
  chegada: Chegada;
};

export const CHEGADAS: { valor: Chegada; rotulo: string; detalhe: string }[] = [
  { valor: "sao-luis", rotulo: "São Luís", detalhe: "Aeroporto da capital, a entrada mais comum" },
  {
    valor: "imperatriz",
    rotulo: "Imperatriz",
    detalhe: "Aeroporto do sul, perto da Chapada das Mesas",
  },
  { valor: "barreirinhas", rotulo: "Já estou em Barreirinhas", detalhe: "Começar pelos Lençóis" },
];

const PARADAS_POR_DIA: Record<Ritmo, number> = { Tranquilo: 2, Equilibrado: 3, Intenso: 4 };
const PRECO_MAXIMO: Record<Orcamento, FaixaPreco> = { Econômico: 1, Confortável: 2, Premium: 3 };

/** Sequência de destinos conforme a chegada, os dias e os interesses. */
function escolherDestinos(r: Respostas): string[] {
  const quer = (c: CategoriaId) => r.interesses.length === 0 || r.interesses.includes(c);
  if (r.chegada === "imperatriz") return ["carolina"];
  const lista: string[] = r.chegada === "barreirinhas" ? ["barreirinhas"] : ["sao-luis"];
  if (r.chegada === "sao-luis") {
    if (r.dias >= 3 && (quer("lagoas-praias") || quer("natureza"))) lista.push("barreirinhas");
    if (r.dias >= 4 && quer("cultura")) lista.splice(1, 0, "alcantara");
  } else {
    lista.push("sao-luis");
  }
  if (r.dias >= 6 && lista.includes("barreirinhas"))
    lista.splice(lista.indexOf("barreirinhas") + 1, 0, "atins");
  if (r.dias >= 6 && (quer("cultura") || quer("gastronomia")) && !lista.includes("raposa"))
    lista.push("raposa");
  if (r.dias >= 8 && quer("lagoas-praias")) lista.push("santo-amaro");
  if (r.dias >= 10 && quer("natureza")) lista.push("tutoia");
  return lista;
}

/** Distribui os dias entre os destinos (ao menos 1 dia cada; sobra vai para os primeiros). */
function distribuir(dias: number, destinos: string[]) {
  const usados = destinos.slice(0, Math.max(1, dias));
  const base = Math.floor(dias / usados.length);
  let resto = dias - base * usados.length;
  return usados.map((d) => {
    const extra = resto > 0 ? 1 : 0;
    resto -= extra;
    return { destino: d, dias: base + extra };
  });
}

function deslocamento(de: string, tempoDaCapital: string) {
  if (de === "sao-luis")
    return `De São Luís: ${tempoDaCapital.charAt(0).toLowerCase()}${tempoDaCapital.slice(1)}`;
  return `Saindo de ${nomeDestino(de)}. Combine o transfer ou o barco com antecedência`;
}

export function gerarRoteiro(r: Respostas): { titulo: string; resumo: string; dias: DiaRoteiro[] } {
  const porDia = PARADAS_POR_DIA[r.ritmo];
  const precoMax = PRECO_MAXIMO[r.orcamento];
  const plano = distribuir(r.dias, escolherDestinos(r));
  const usados = new Set<string>();
  const dias: DiaRoteiro[] = [];

  plano.forEach(({ destino, dias: n }, idx) => {
    const todos = itensDoDestino(destino);
    const pontua = (i: Item) =>
      (r.interesses.includes(i.categoria) ? 2 : 0) +
      (i.tipo === "experiencia" ? 1 : 0) +
      (r.mes && i.mesesBons.includes(r.mes) ? 1 : 0);
    const candidatos = todos
      .filter(
        (i) => i.horas > 0 && i.categoria !== "hospedagem" && !(i.tipo === "lugar" && i.ficticio),
      )
      .filter((i) => i.faixaPreco <= precoMax)
      .sort((a, b) => pontua(b) - pontua(a));
    const restaurantes = todos.filter(
      (i) => i.tipo === "lugar" && i.ficticio && i.categoria === "gastronomia",
    );
    const destinoInfo = getDestino(destino);

    for (let k = 0; k < n; k++) {
      const paradas = candidatos
        .filter((i) => !usados.has(`${i.tipo}:${i.slug}`))
        .slice(0, porDia)
        .map((i) => {
          usados.add(`${i.tipo}:${i.slug}`);
          return { ref: { tipo: i.tipo, slug: i.slug } };
        });
      const chegando = k === 0;
      dias.push({
        titulo: chegando
          ? idx === 0
            ? `Chegada em ${nomeDestino(destino)}`
            : `Rumo a ${nomeDestino(destino)}`
          : paradas.length
            ? `${nomeDestino(destino)} sem pressa`
            : `Dia livre em ${nomeDestino(destino)}`,
        resumo: paradas.length
          ? `${paradas.length} ${paradas.length === 1 ? "parada" : "paradas"} em ${nomeDestino(destino)}.`
          : "Descanse, volte ao lugar que mais gostou ou acrescente uma parada.",
        ...(chegando && idx > 0 && destinoInfo
          ? { deslocamento: deslocamento(plano[idx - 1]!.destino, destinoInfo.tempoDeSaoLuis) }
          : {}),
        paradas,
        ...(restaurantes.length
          ? { ondeComer: restaurantes.map((x) => `${x.nome} (exemplo)`) }
          : {}),
      });
    }
  });

  const nomes = plano.map((p) => nomeDestino(p.destino));
  return {
    titulo: `${r.dias} dias no Maranhão`,
    resumo: `${nomes.join(" → ")}, em ritmo ${r.ritmo.toLowerCase()}.`,
    dias,
  };
}
