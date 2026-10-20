// Webhook do Asaas: liga, estende e encerra o Pro conforme os pagamentos.
// Publicada SEM verificação de JWT (quem chama é o Asaas). A autenticação é o token
// configurado no webhook do Asaas, conferido no cabeçalho "asaas-access-token".
//
// Segredos: ASAAS_WEBHOOK_TOKEN (o mesmo cadastrado no webhook do Asaas).
// Nota fiscal (opcional; sem estes segredos, não emite):
//   ASAAS_NFSE_SERVICO_CODIGO, ASAAS_NFSE_SERVICO_NOME, ASAAS_NFSE_ISS (alíquota em %),
//   ASAAS_NFSE_SERVICO_ID (quando a prefeitura publica a lista de serviços)
import { asaas, fimDoDia, hojeBrasilia, somarMeses, type CobrancaAsaas } from "../_shared/asaas.ts";
import { TOLERANCIA_DIAS } from "../_shared/precos.ts";
import { servidor, type Assinatura } from "../_shared/supabase.ts";

type Aviso = {
  id: string;
  event: string;
  payment?: CobrancaAsaas;
  subscription?: { id: string; customer: string };
};

const responder = (status = 200, texto = "ok") => new Response(texto, { status });

Deno.serve(async (req) => {
  if (req.method !== "POST") return responder(405, "método não aceito");
  const token = Deno.env.get("ASAAS_WEBHOOK_TOKEN");
  if (!token || req.headers.get("asaas-access-token") !== token)
    return responder(401, "não autorizado");

  let aviso: Aviso;
  try {
    aviso = await req.json();
  } catch {
    return responder(400, "corpo inválido");
  }
  const db = servidor();

  // o Asaas entrega "pelo menos uma vez": cada aviso é processado uma vez só
  const { error: repetido } = await db
    .from("asaas_eventos")
    .insert({ id: aviso.id, evento: aviso.event, dados: aviso });
  if (repetido) {
    if (repetido.code === "23505") return responder(200, "já processado");
    console.error("[asaas-webhook] não gravou o aviso", repetido);
    return responder(500, "erro");
  }

  try {
    await processar(db, aviso);
    return responder();
  } catch (e) {
    console.error("[asaas-webhook]", aviso.event, e);
    // desfaz o registro para o Asaas mandar de novo
    await db.from("asaas_eventos").delete().eq("id", aviso.id);
    return responder(500, "erro");
  }
});

async function processar(db: ReturnType<typeof servidor>, aviso: Aviso) {
  const clienteId = aviso.payment?.customer ?? aviso.subscription?.customer;
  if (!clienteId) return;
  const { data: conta } = await db
    .from("assinaturas")
    .select("*")
    .eq("asaas_cliente_id", clienteId)
    .maybeSingle<Assinatura>();
  if (!conta) {
    console.warn("[asaas-webhook] cliente sem assinatura no Azulejo:", clienteId, aviso.event);
    return;
  }
  const atualizar = async (dados: Partial<Assinatura>) => {
    const { error } = await db.from("assinaturas").update(dados).eq("perfil_id", conta.perfil_id);
    if (error) throw error;
  };
  const p = aviso.payment;

  switch (aviso.event) {
    // nova cobrança do mensal (o Asaas gera antes do vencimento): link para pagar
    case "PAYMENT_CREATED":
      if (
        p?.subscription &&
        p.subscription === conta.asaas_assinatura_id &&
        conta.status !== "aguardando_pagamento"
      )
        await atualizar({
          link_pagamento: p.invoiceUrl,
          asaas_cobranca_id: p.id,
          proximo_vencimento: p.dueDate,
        });
      return;

    case "PAYMENT_CONFIRMED":
    case "PAYMENT_RECEIVED": {
      if (!p) return;
      // a mesma compra avisa "confirmado" e depois "recebido": estende o Pro uma vez só
      const chave = p.installment ? `parcelamento:${p.installment}` : `cobranca:${p.id}`;
      if (conta.ativado_por.includes(chave)) return;
      if (p.installment && (p.installmentNumber ?? 1) !== 1) return;

      let proAte: string;
      let extra: Partial<Assinatura>;
      if (p.subscription) {
        // mensal: vale até o próximo vencimento, mais a tolerância
        const proximo = somarMeses(p.dueDate, 1);
        proAte = fimDoDia(proximo, TOLERANCIA_DIAS);
        extra = { plano: "mensal", proximo_vencimento: proximo };
      } else {
        // anual: 12 meses, somados ao que ainda restar de Pro
        const base =
          conta.pro_ate && new Date(conta.pro_ate) > new Date()
            ? conta.pro_ate.slice(0, 10)
            : hojeBrasilia();
        proAte = fimDoDia(somarMeses(base, 12));
        extra = { plano: "anual", proximo_vencimento: null };
      }
      if (conta.pro_ate && conta.pro_ate > proAte) proAte = conta.pro_ate;
      await atualizar({
        ...extra,
        status: conta.status === "cancelada" && p.subscription ? "cancelada" : "ativa",
        pro_ate: proAte,
        link_pagamento: null,
        ativado_por: [...conta.ativado_por, chave],
      });
      await agendarNotaFiscal(p).catch((e) => console.error("[asaas-webhook] nota fiscal", e));
      return;
    }

    case "PAYMENT_OVERDUE":
      if (p?.subscription && p.subscription === conta.asaas_assinatura_id)
        await atualizar({ status: "atrasada", link_pagamento: p.invoiceUrl });
      return;

    // estorno ou contestação: o Pro acaba na hora
    case "PAYMENT_REFUNDED":
    case "PAYMENT_CHARGEBACK_REQUESTED":
      await atualizar({
        status: "encerrada",
        pro_ate: new Date().toISOString(),
        link_pagamento: null,
      });
      return;

    // assinatura cancelada (pelo painel, pelo Asaas ou por inadimplência): não cobra mais,
    // e o Pro vai até a data já paga
    case "SUBSCRIPTION_DELETED":
    case "SUBSCRIPTION_INACTIVATED":
      if (aviso.subscription?.id === conta.asaas_assinatura_id)
        await atualizar({
          status: conta.pro_ate && new Date(conta.pro_ate) > new Date() ? "cancelada" : "encerrada",
          link_pagamento: null,
        });
      return;
  }
}

/** Nota fiscal de serviço do pagamento, se a emissão estiver configurada nos segredos. */
async function agendarNotaFiscal(p: CobrancaAsaas) {
  const codigo = Deno.env.get("ASAAS_NFSE_SERVICO_CODIGO");
  const nomeServico = Deno.env.get("ASAAS_NFSE_SERVICO_NOME");
  if (!codigo || !nomeServico) return;
  const servicoId = Deno.env.get("ASAAS_NFSE_SERVICO_ID");
  await asaas("POST", "/invoices", {
    ...(p.installment ? { installment: p.installment } : { payment: p.id }),
    serviceDescription: p.subscription
      ? "Assinatura do plano Azulejo Pro (mensal)"
      : "Assinatura do plano Azulejo Pro (anual)",
    observations: "Plano Pro do Azulejo: estatísticas do negócio e selo de verificado.",
    value: p.value,
    deductions: 0,
    effectiveDate: hojeBrasilia(),
    municipalServiceCode: codigo,
    municipalServiceName: nomeServico,
    ...(servicoId ? { municipalServiceId: servicoId } : {}),
    taxes: {
      retainIss: false,
      iss: Number(Deno.env.get("ASAAS_NFSE_ISS") ?? 0),
      cofins: 0,
      csll: 0,
      inss: 0,
      ir: 0,
      pis: 0,
    },
  });
}
