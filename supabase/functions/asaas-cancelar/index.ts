// Cancelar o plano mensal: a assinatura no Asaas para de gerar cobranças e o Pro continua
// até a data já paga. (O anual não renova sozinho, então não há o que cancelar.)
import { asaas, CORS, ErroAsaas, json } from "../_shared/asaas.ts";
import { servidor, usuarioDaRequisicao, type Assinatura } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ erro: "Método não aceito." }, 405);

  const usuario = await usuarioDaRequisicao(req);
  if (!usuario) return json({ erro: "Entre na sua conta." }, 401);

  const db = servidor();
  const { data: conta } = await db
    .from("assinaturas")
    .select("*")
    .eq("perfil_id", usuario.id)
    .maybeSingle<Assinatura>();
  if (!conta?.asaas_assinatura_id || conta.status === "cancelada" || conta.status === "encerrada")
    return json({ erro: "Não há assinatura mensal ativa para cancelar." }, 409);

  try {
    await asaas("DELETE", `/subscriptions/${conta.asaas_assinatura_id}`);
  } catch (e) {
    // já removida no Asaas: segue e marca como cancelada
    if (!(e instanceof ErroAsaas && e.status === 404)) {
      console.error("[asaas-cancelar]", e);
      return json({ erro: "Não conseguimos cancelar agora. Tente de novo em instantes." }, 502);
    }
  }
  const aindaPro = Boolean(conta.pro_ate && new Date(conta.pro_ate) > new Date());
  const { error } = await db
    .from("assinaturas")
    .update({ status: aindaPro ? "cancelada" : "encerrada", link_pagamento: null })
    .eq("perfil_id", usuario.id);
  if (error)
    return json({ erro: "Cancelamos no Asaas, mas não conseguimos salvar. Avise a equipe." }, 500);
  return json({ ok: true, proAte: conta.pro_ate });
});
