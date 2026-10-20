import { createClient, type User } from "npm:@supabase/supabase-js@2.117.2";

// SUPABASE_URL, SUPABASE_ANON_KEY e SUPABASE_SERVICE_ROLE_KEY já existem nas Edge Functions.

/** Cliente com a service_role: passa pela RLS. Só no servidor. */
export const servidor = () =>
  createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

/** Quem chamou a função (pelo token do login), ou null. */
export async function usuarioDaRequisicao(req: Request): Promise<User | null> {
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const { data, error } = await servidor().auth.getUser(token);
  return error ? null : data.user;
}

export type Assinatura = {
  perfil_id: string;
  plano: "mensal" | "anual" | null;
  forma: "pix" | "cartao" | null;
  status: "sem_plano" | "aguardando_pagamento" | "ativa" | "atrasada" | "cancelada" | "encerrada";
  pro_ate: string | null;
  proximo_vencimento: string | null;
  link_pagamento: string | null;
  parcelas: number | null;
  valor: number | null;
  nome_fiscal: string | null;
  cpf_cnpj: string | null;
  asaas_cliente_id: string | null;
  asaas_assinatura_id: string | null;
  asaas_cobranca_id: string | null;
  asaas_parcelamento_id: string | null;
  ativado_por: string[];
};
