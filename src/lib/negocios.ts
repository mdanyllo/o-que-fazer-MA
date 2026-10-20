import type { CategoriaId, FaixaPreco, Mes, TipoNegocio } from "@/data/tipos";
import { BUCKET_FOTOS, supabase } from "./supabase";

/**
 * Negócios (restaurantes, hospedagens e passeios) vindos do banco.
 * Modelo completo e regras de acesso: supabase/migrations e AZULEJO-BRIEF.md (seção 10).
 */

export type { TipoNegocio };
export type StatusNegocio = "rascunho" | "pendente" | "publicado" | "recusado";
export type SubtipoHospedagem = "pousada" | "hotel" | "chale" | "hostel" | "casa_de_temporada";

/**
 * Campos editoriais da equipe (coluna `extras`), que o dono não edita. Todos opcionais:
 * um negócio cadastrado pelo dono chega com `{}` e o site usa valores padrão.
 */
export type ExtrasNegocio = {
  /** cor no mapa e nos filtros; padrão pelo tipo */
  categoria?: CategoriaId;
  /** frase curta dos cards; padrão: a primeira frase da descrição */
  resumo?: string;
  tags?: string[];
  mesesBons?: Mes[];
  /** duração típica da visita, em horas (filtros e planejador) */
  horas?: number;
  dicas?: string[];
  /** como o preço aparece nas informações práticas; padrão: montado a partir do preço */
  precoTexto?: string;
  /** "duração" nas informações práticas de restaurantes e hospedagens */
  duracaoTexto?: string;
  /** faixa de preço de hospedagens e passeios (restaurante usa a coluna faixa_preco) */
  faixaPreco?: FaixaPreco;
  dificuldade?: "Leve" | "Moderada" | "Puxada";
  /** passeio: slugs dos lugares (atrativos) visitados, em ordem */
  lugares?: string[];
  /** passeio: slugs das empresas fictícias que levam (src/data/empresas.ts) */
  empresas?: string[];
  /** nota e número de avaliações de exemplo */
  avaliacao?: number;
  avaliacoes?: number;
  /** posição nos cards de "Onde ficar" */
  ordem?: number;
  /** false: a hospedagem não aparece nos cards de "Onde ficar" */
  ondeFicar?: boolean;
};

export type FotoNegocio = { caminho: string; ordem: number; legenda: string | null };

/** O que o site público lê de cada negócio publicado. */
export type NegocioPublico = {
  id: string;
  tipo: TipoNegocio;
  subtipo: string | null;
  nome: string;
  nome_curto: string | null;
  slug: string;
  cidade: string | null;
  descricao: string | null;
  endereco: string | null;
  latitude: number | null;
  longitude: number | null;
  whatsapp: string | null;
  instagram: string | null;
  site: string | null;
  preco: number | null;
  faixa_preco: "$" | "$$" | "$$$" | null;
  duracao: string | null;
  horario: string | null;
  exemplo: boolean;
  extras: ExtrasNegocio;
  negocio_fotos: FotoNegocio[];
  /** o dono tem o plano Pro (selo de verificado); vem de negocios_verificados() */
  verificado?: boolean;
};

/**
 * Colunas lidas pelo site público. A API não deixa ler `notas_internas`, então nunca use
 * `select("*")` em negocios: liste as colunas.
 */
export const COLUNAS_NEGOCIO_PUBLICO =
  "id, tipo, subtipo, nome, nome_curto, slug, cidade, descricao, endereco, latitude, longitude, whatsapp, instagram, site, preco, faixa_preco, duracao, horario, exemplo, extras, negocio_fotos (caminho, ordem, legenda)";

const VALIDADE_MS = 60_000;
const TEMPO_LIMITE_MS = 8_000;

let cache: { em: number; promessa: Promise<NegocioPublico[] | null> } | null = null;

/**
 * Negócios publicados, ou null se o banco não respondeu (as telas mostram um estado de erro).
 * Guarda o resultado por um minuto; falhas não ficam guardadas, então "tentar de novo" refaz.
 */
export function buscarNegociosPublicados(): Promise<NegocioPublico[] | null> {
  const agora = Date.now();
  if (cache && agora - cache.em < VALIDADE_MS) return cache.promessa;
  const atual = {
    em: agora,
    promessa: carregar().then((negocios) => {
      if (negocios === null && cache === atual) cache = null;
      return negocios;
    }),
  };
  cache = atual;
  return atual.promessa;
}

async function carregar(): Promise<NegocioPublico[] | null> {
  if (!supabase) {
    console.warn(
      "[negocios] Supabase não configurado: defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.local",
    );
    return null;
  }
  const controle = new AbortController();
  const limite = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);
  try {
    const [{ data, error }, verificados] = await Promise.all([
      supabase
        .from("negocios")
        .select(COLUNAS_NEGOCIO_PUBLICO)
        .eq("status", "publicado")
        .order("nome")
        .abortSignal(controle.signal),
      // selo de verificado (dono com Pro); se falhar, o site segue sem selos
      supabase.rpc("negocios_verificados").abortSignal(controle.signal),
    ]);
    if (error) {
      console.error("[negocios] erro ao carregar:", error.message);
      return null;
    }
    const comSelo = new Set((verificados.data as string[] | null) ?? []);
    return ((data ?? []) as unknown as NegocioPublico[]).map((n) =>
      comSelo.has(n.id) ? { ...n, verificado: true } : n,
    );
  } catch (erro) {
    console.error("[negocios] erro ao carregar:", erro);
    return null;
  } finally {
    clearTimeout(limite);
  }
}

/**
 * URL de uma foto de negócio. Caminhos que começam com "/" são fotos do próprio site
 * (dados de exemplo, ver src/lib/imagens.ts); o resto está no bucket fotos-negocios.
 */
export function urlFotoNegocio(caminho: string): string {
  if (caminho.startsWith("/") || !supabase) return caminho;
  return supabase.storage.from(BUCKET_FOTOS).getPublicUrl(caminho).data.publicUrl;
}
