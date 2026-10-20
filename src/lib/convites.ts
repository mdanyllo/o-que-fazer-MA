import type { TipoNegocio } from "@/data/tipos";
import { ErroNegocio, mensagemErroNegocio } from "./meus-negocios";
import { supabase } from "./supabase";

/*
 * Convite para o dono assumir um negócio cadastrado pela equipe (migração 20261018120000):
 * a equipe gera o link em /admin/:id, manda pelo WhatsApp, e o dono abre /convite/:token.
 */

export type Convite = { token: string; expira_em: string };

export type SituacaoConvite =
  | {
      situacao: "valido";
      nome: string;
      cidade: string | null;
      tipo: TipoNegocio;
      expira_em: string;
    }
  | { situacao: "usado" | "expirado" | "invalido" };

function cliente() {
  if (!supabase) throw new ErroNegocio("As contas ainda não estão ligadas neste ambiente.");
  return supabase;
}

/** Mensagem do banco quando é uma das nossas (convite usado, expirado, já tem dono). */
function mensagem(erro: unknown) {
  const e = (erro ?? {}) as { code?: string; message?: string };
  if (e.code === "P0001" && e.message) return e.message;
  return mensagemErroNegocio(erro);
}

export const urlDoConvite = (token: string) =>
  `${typeof window === "undefined" ? "" : window.location.origin}/convite/${token}`;

/** Equipe: gera um convite novo (o anterior deixa de valer). */
export async function gerarConvite(negocioId: string): Promise<Convite> {
  const { data, error } = await cliente().rpc("gerar_convite", { negocio: negocioId });
  if (error) throw new ErroNegocio(mensagem(error));
  return data as Convite;
}

/** Equipe: o convite que está valendo para o negócio, se houver. */
export async function conviteDoNegocio(negocioId: string): Promise<Convite | null> {
  const { data, error } = await cliente().rpc("convite_do_negocio", { negocio: negocioId });
  if (error) throw new ErroNegocio(mensagem(error));
  return (data as Convite | null) ?? null;
}

/** Qualquer pessoa: situação do convite e o nome do negócio. */
export async function verConvite(token: string): Promise<SituacaoConvite> {
  const { data, error } = await cliente().rpc("ver_convite", { token });
  if (error) throw new ErroNegocio(mensagem(error));
  return data as SituacaoConvite;
}

/** Logado: assume o negócio do convite. */
export async function aceitarConvite(token: string): Promise<{ negocio_id: string; nome: string }> {
  const { data, error } = await cliente().rpc("aceitar_convite", { token });
  if (error) throw new ErroNegocio(mensagem(error));
  return data as { negocio_id: string; nome: string };
}

// ——— convite pendente ———
// Quem abre o convite sem conta vai criar uma e confirmar o e-mail; o link do e-mail leva
// ao login, não de volta ao convite. Guardamos o token para o painel trazer a pessoa de volta.

const CHAVE = "azulejo:convite-pendente";

export function guardarConvitePendente(token: string) {
  try {
    localStorage.setItem(CHAVE, token);
  } catch {
    /* sem armazenamento: a pessoa abre o link de novo */
  }
}

export function lerConvitePendente() {
  try {
    return localStorage.getItem(CHAVE);
  } catch {
    return null;
  }
}

export function esquecerConvitePendente() {
  try {
    localStorage.removeItem(CHAVE);
  } catch {
    /* nada a fazer */
  }
}
