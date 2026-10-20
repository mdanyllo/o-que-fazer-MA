import type { NegocioDono } from "./meus-negocios";
import { ErroNegocio } from "./meus-negocios";
import type { StatusNegocio } from "./negocios";
import { supabase } from "./supabase";

/*
 * Leitura e ações da área do administrador (/admin). O banco só aceita estas operações de
 * quem tem papel 'admin' (ver supabase/migrations e supabase/tests/permissoes.mjs).
 * Nada aqui lê ou grava a coluna `extras`.
 */

/** O negócio como o admin vê (sem `extras` e sem as notas, que vêm por função própria). */
export type NegocioAdmin = NegocioDono & {
  dono_id: string | null;
  exemplo: boolean;
  aprovado_por: string | null;
  aprovado_em: string | null;
  criado_em: string;
};

export type Conta = {
  id: string;
  nome: string;
  email: string;
  papel: "dono" | "admin";
  criado_em: string;
  negocios: number;
};

const COLUNAS_ADMIN =
  "id, tipo, subtipo, nome, nome_curto, slug, cidade, descricao, endereco, ponto_encontro, latitude, longitude, whatsapp, instagram, site, preco, faixa_preco, duracao, horario, status, motivo_recusa, alterado_desde_revisao, alterado_em, atualizado_em, criado_em, dono_id, exemplo, aprovado_por, aprovado_em, negocio_fotos (id, caminho, ordem, legenda)";

function cliente() {
  if (!supabase) throw new ErroNegocio("As contas ainda não estão ligadas neste ambiente.");
  return supabase;
}

const emOrdem = (n: NegocioAdmin): NegocioAdmin => ({
  ...n,
  negocio_fotos: [...n.negocio_fotos].sort((a, b) => a.ordem - b.ordem),
});

export async function listarNegociosAdmin() {
  const { data, error } = await cliente()
    .from("negocios")
    .select(COLUNAS_ADMIN)
    .order("atualizado_em", { ascending: false });
  if (error) throw error;
  return (data as unknown as NegocioAdmin[]).map(emOrdem);
}

export async function buscarNegocioAdmin(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data, error } = await cliente()
    .from("negocios")
    .select(COLUNAS_ADMIN)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? emOrdem(data as unknown as NegocioAdmin) : null;
}

/** Contas com e-mail e número de negócios (função admin_usuarios no banco). */
export async function listarContas() {
  const { data, error } = await cliente().rpc("admin_usuarios");
  if (error) throw error;
  return (data ?? []) as Conta[];
}

export type PlanoConta = {
  perfil_id: string;
  plano: "mensal" | "anual" | null;
  forma: "pix" | "cartao" | null;
  status: string;
  pro_ate: string | null;
};

/** Plano de cada conta (o admin lê a tabela assinaturas inteira). */
export async function listarPlanos() {
  const { data, error } = await cliente()
    .from("assinaturas")
    .select("perfil_id, plano, forma, status, pro_ate");
  if (error) throw error;
  return new Map((data as PlanoConta[]).map((p) => [p.perfil_id, p]));
}

export async function lerNotasInternas(id: string) {
  const { data, error } = await cliente().rpc("notas_internas", { negocio: id });
  if (error) throw error;
  return (data as string | null) ?? "";
}

/** Atualiza colunas que só a equipe mexe; confere que a linha foi gravada. */
async function atualizar(id: string, dados: Record<string, unknown>) {
  const { data, error } = await cliente().from("negocios").update(dados).eq("id", id).select("id");
  if (error) throw error;
  if (!data?.length) throw new ErroNegocio("Não encontramos esse negócio.");
}

/**
 * Publica o negócio e avisa o dono por e-mail (função avisar-aprovacao). O e-mail não segura
 * a aprovação: se o envio falhar ou não estiver configurado, o negócio continua publicado.
 */
export async function aprovar(id: string) {
  await atualizar(id, { status: "publicado" });
  void cliente()
    .functions.invoke("avisar-aprovacao", { body: { negocio: id } })
    .then(({ data, error }) => {
      if (error || !data?.enviado)
        console.warn("[aprovar] e-mail para o dono não enviado", error ?? data);
    });
}

export function recusar(id: string, motivo: string) {
  if (!motivo.trim()) throw new ErroNegocio("Escreva o motivo da recusa para o dono.");
  return atualizar(id, { status: "recusado", motivo_recusa: motivo.trim() });
}

export const marcarRevisado = (id: string) => atualizar(id, { alterado_desde_revisao: false });

export const despublicar = (id: string) => atualizar(id, { status: "rascunho" });

export const salvarNotas = (id: string, notas: string) =>
  atualizar(id, { notas_internas: notas.trim() || null });

export const salvarPosicao = (id: string, latitude: number, longitude: number) =>
  atualizar(id, { latitude, longitude });

export const transferir = (id: string, donoId: string) => atualizar(id, { dono_id: donoId });

export const mudarStatus = (id: string, status: StatusNegocio) => atualizar(id, { status });

/** Quantos negócios esperam revisão ("Em análise"). */
export async function contarEmAnalise() {
  const { data, error } = await cliente().from("negocios").select("id").eq("status", "pendente");
  if (error) throw error;
  return data.length;
}
