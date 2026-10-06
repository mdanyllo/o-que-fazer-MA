import type { CategoriaId } from "@/data/tipos";

/** Parâmetros de busca da página Explorar (ficam na URL para poder compartilhar). */
export type BuscaExplorar = {
  q?: string;
  categoria?: CategoriaId;
  cidade?: string;
  /** mês, 1 a 12 */
  epoca?: number;
  duracao?: "curta" | "meio-dia" | "dia";
  preco?: 1 | 2 | 3;
  /** "perto de mim" simulado */
  perto?: boolean;
  ver?: "lista" | "mapa";
};

const CATEGORIAS: CategoriaId[] = [
  "lagoas-praias",
  "cultura",
  "natureza",
  "gastronomia",
  "festas",
  "hospedagem",
];

const texto = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
const num = (v: unknown) => {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : undefined;
};

export function validarBuscaExplorar(s: Record<string, unknown>): BuscaExplorar {
  const out: BuscaExplorar = {};
  const q = texto(s["q"]);
  if (q) out.q = q;
  const categoria = texto(s["categoria"]) as CategoriaId | undefined;
  if (categoria && CATEGORIAS.includes(categoria)) out.categoria = categoria;
  const cidade = texto(s["cidade"]);
  if (cidade) out.cidade = cidade;
  const epoca = num(s["epoca"]);
  if (epoca && epoca >= 1 && epoca <= 12) out.epoca = Math.round(epoca);
  const duracao = texto(s["duracao"]);
  if (duracao === "curta" || duracao === "meio-dia" || duracao === "dia") out.duracao = duracao;
  const preco = num(s["preco"]);
  if (preco === 1 || preco === 2 || preco === 3) out.preco = preco;
  if (s["perto"] === true || s["perto"] === "true" || s["perto"] === 1) out.perto = true;
  const ver = texto(s["ver"]);
  if (ver === "mapa" || ver === "lista") out.ver = ver;
  return out;
}
