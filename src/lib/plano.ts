import { useQuery } from "@tanstack/react-query";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export {
  MAX_PARCELAS,
  PRECO_ANUAL,
  PRECO_MENSAL,
  TOLERANCIA_DIAS,
  cpfCnpjValido,
  opcoesParcelamento,
  parcelamentoAnual,
} from "../../supabase/functions/_shared/precos.ts";

/*
 * Plano Pro da conta (tabela assinaturas, escrita só pelas funções do servidor) e as
 * chamadas às funções asaas-assinar, asaas-pix e asaas-cancelar.
 */

export type StatusAssinatura =
  "sem_plano" | "aguardando_pagamento" | "ativa" | "atrasada" | "cancelada" | "encerrada";

export type Assinatura = {
  plano: "mensal" | "anual" | null;
  forma: "pix" | "cartao" | null;
  status: StatusAssinatura;
  pro_ate: string | null;
  proximo_vencimento: string | null;
  link_pagamento: string | null;
  parcelas: number | null;
  valor: number | null;
  nome_fiscal: string | null;
  cpf_cnpj: string | null;
};

const COLUNAS =
  "plano, forma, status, pro_ate, proximo_vencimento, link_pagamento, parcelas, valor, nome_fiscal, cpf_cnpj";

export const ehPro = (a: Assinatura | null | undefined) =>
  Boolean(a?.pro_ate && new Date(a.pro_ate) > new Date());

export async function buscarAssinatura(perfilId: string) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("assinaturas")
    .select(COLUNAS)
    .eq("perfil_id", perfilId)
    .maybeSingle();
  if (error) throw error;
  return (data as Assinatura | null) ?? null;
}

/**
 * Plano da conta logada. `acompanhar`: enquanto espera a confirmação do pagamento,
 * consulta de novo a cada 5 segundos.
 */
export function usePlano(perfilId: string | undefined, acompanhar = false) {
  return useQuery({
    queryKey: ["plano", perfilId],
    queryFn: () => buscarAssinatura(perfilId!),
    enabled: Boolean(perfilId),
    refetchInterval: (q) =>
      acompanhar && q.state.data?.status === "aguardando_pagamento" ? 5000 : false,
  });
}

/** Mensagem da função do servidor (o corpo traz { erro }). */
async function mensagemDaFuncao(error: unknown) {
  if (error instanceof FunctionsHttpError) {
    try {
      const corpo = (await error.context.json()) as { erro?: string };
      if (corpo.erro) return corpo.erro;
    } catch {
      /* resposta sem JSON */
    }
  }
  return "Não conseguimos falar com o sistema de pagamentos. Tente de novo em instantes.";
}

export type PedidoAssinatura = {
  plano: "mensal" | "anual";
  forma: "pix" | "cartao";
  parcelas?: number;
  nome: string;
  cpfCnpj: string;
};

/** Cria a cobrança no Asaas e devolve o link da fatura. */
export async function assinar(pedido: PedidoAssinatura): Promise<string> {
  if (!supabase) throw new Error("As contas ainda não estão ligadas neste ambiente.");
  const { data, error } = await supabase.functions.invoke<{ url: string }>("asaas-assinar", {
    body: pedido,
  });
  if (error || !data?.url) throw new Error(await mensagemDaFuncao(error));
  return data.url;
}

export type Pix = {
  /** PNG em base64 */
  imagem: string;
  copiaECola: string;
  valor: number;
  vencimento: string;
  expiraEm: string | null;
};

/** QR Code do Pix da cobrança em aberto, para pagar dentro do site. */
export async function buscarPix(): Promise<Pix> {
  if (!supabase) throw new Error("As contas ainda não estão ligadas neste ambiente.");
  const { data, error } = await supabase.functions.invoke<Pix>("asaas-pix", { body: {} });
  if (error || !data?.copiaECola) throw new Error(await mensagemDaFuncao(error));
  return data;
}

export async function cancelarAssinatura() {
  if (!supabase) throw new Error("As contas ainda não estão ligadas neste ambiente.");
  const { error } = await supabase.functions.invoke("asaas-cancelar", { body: {} });
  if (error) throw new Error(await mensagemDaFuncao(error));
}

// ——— formatação ———

export const reais = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const dataLonga = (v: string) =>
  new Date(v.length === 10 ? `${v}T12:00:00` : v).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

/** "123.456.789-09" ou "12.345.678/0001-90", conforme digita. */
export function mascararCpfCnpj(valor: string) {
  const d = valor.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 11)
    return d
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  return d
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}
