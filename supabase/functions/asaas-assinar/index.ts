// Assinar o plano Pro: cria (ou reaproveita) o cliente no Asaas e a cobrança, e devolve o link
// da fatura do Asaas, onde a pessoa paga no Pix ou no cartão. O Pro só liga quando o Asaas
// confirma o pagamento (função asaas-webhook).
//
// Corpo: { plano: "mensal" | "anual", forma: "pix" | "cartao", parcelas?: 1-12,
//          nome: string, cpfCnpj: string }
// Mensal: assinatura MONTHLY no Pix (paga mês a mês) ou no cartão (cobrada sozinha).
// Anual: só cartão, cobrança parcelada em até 12x com juros; 12 meses de Pro, sem renovar.
import {
  asaas,
  CORS,
  ErroAsaas,
  hojeBrasilia,
  json,
  type CobrancaAsaas,
} from "../_shared/asaas.ts";
import { cpfCnpjValido, parcelamentoAnual, PRECO_MENSAL } from "../_shared/precos.ts";
import { servidor, usuarioDaRequisicao, type Assinatura } from "../_shared/supabase.ts";

type Pedido = {
  plano?: unknown;
  forma?: unknown;
  parcelas?: unknown;
  nome?: unknown;
  cpfCnpj?: unknown;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ erro: "Método não aceito." }, 405);

  const usuario = await usuarioDaRequisicao(req);
  if (!usuario) return json({ erro: "Entre na sua conta para assinar." }, 401);

  let pedido: Pedido;
  try {
    pedido = await req.json();
  } catch {
    return json({ erro: "Pedido inválido." }, 400);
  }
  const plano = pedido.plano === "anual" ? "anual" : pedido.plano === "mensal" ? "mensal" : null;
  const forma = pedido.forma === "pix" ? "pix" : pedido.forma === "cartao" ? "cartao" : null;
  const nome = typeof pedido.nome === "string" ? pedido.nome.trim().slice(0, 120) : "";
  const cpfCnpj = typeof pedido.cpfCnpj === "string" ? pedido.cpfCnpj.replace(/\D/g, "") : "";
  if (!plano || !forma) return json({ erro: "Escolha o plano e a forma de pagamento." }, 400);
  if (plano === "anual" && forma !== "cartao")
    return json({ erro: "O plano anual é só no cartão." }, 400);
  if (nome.length < 3) return json({ erro: "Informe o nome ou a razão social." }, 400);
  if (!cpfCnpjValido(cpfCnpj)) return json({ erro: "Confira o CPF ou CNPJ." }, 400);

  const db = servidor();
  const { data: atual } = await db
    .from("assinaturas")
    .select("*")
    .eq("perfil_id", usuario.id)
    .maybeSingle<Assinatura>();

  const proAtivo = Boolean(atual?.pro_ate && new Date(atual.pro_ate) > new Date());
  if (
    plano === "mensal" &&
    atual?.asaas_assinatura_id &&
    ["ativa", "atrasada"].includes(atual.status)
  )
    return json(
      { erro: "Você já tem a assinatura mensal. Para trocar de plano, cancele antes." },
      409,
    );

  try {
    // ——— cliente no Asaas (um por conta) ———
    let clienteId = atual?.asaas_cliente_id ?? null;
    const dadosCliente = {
      name: nome,
      cpfCnpj,
      email: usuario.email,
      externalReference: usuario.id,
      notificationDisabled: false,
    };
    if (clienteId) await asaas("PUT", `/customers/${clienteId}`, dadosCliente);
    else clienteId = (await asaas<{ id: string }>("POST", "/customers", dadosCliente)).id;

    // ——— uma fatura em aberto de cada vez: a anterior, não paga, é cancelada ———
    if (atual?.status === "aguardando_pagamento") {
      if (atual.asaas_assinatura_id)
        await asaas("DELETE", `/subscriptions/${atual.asaas_assinatura_id}`).catch(() => {});
      else if (atual.asaas_parcelamento_id)
        await asaas("DELETE", `/installments/${atual.asaas_parcelamento_id}`).catch(() => {});
      else if (atual.asaas_cobranca_id)
        await asaas("DELETE", `/payments/${atual.asaas_cobranca_id}`).catch(() => {});
    }

    const hoje = hojeBrasilia();
    // depois de pagar, o Asaas leva de volta ao painel. Só com SITE_URL: o domínio precisa
    // estar cadastrado em Minha Conta → Informações no Asaas, senão ele recusa a cobrança.
    const site = Deno.env.get("SITE_URL")?.replace(/\/$/, "");
    const callback = site
      ? { callback: { successUrl: `${site}/painel/assinatura`, autoRedirect: true } }
      : {};
    let registro: Partial<Assinatura>;
    if (plano === "mensal") {
      const assinatura = await asaas<{ id: string }>("POST", "/subscriptions", {
        customer: clienteId,
        billingType: forma === "pix" ? "PIX" : "CREDIT_CARD",
        value: PRECO_MENSAL,
        nextDueDate: hoje,
        cycle: "MONTHLY",
        description: "Azulejo Pro (mensal)",
        externalReference: usuario.id,
        ...callback,
      });
      // a primeira cobrança nasce junto com a assinatura
      const cobrancas = await asaas<{ data: CobrancaAsaas[] }>(
        "GET",
        `/subscriptions/${assinatura.id}/payments`,
      );
      const primeira = cobrancas.data.sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
      if (!primeira) throw new ErroAsaas("A assinatura foi criada sem cobrança.", 502, cobrancas);
      registro = {
        plano,
        forma,
        parcelas: null,
        valor: PRECO_MENSAL,
        asaas_assinatura_id: assinatura.id,
        asaas_cobranca_id: primeira.id,
        asaas_parcelamento_id: null,
        link_pagamento: primeira.invoiceUrl,
        proximo_vencimento: primeira.dueDate,
      };
    } else {
      const { vezes, parcela, total } = parcelamentoAnual(Number(pedido.parcelas) || 1);
      const cobranca = await asaas<CobrancaAsaas>("POST", "/payments", {
        customer: clienteId,
        billingType: "CREDIT_CARD",
        dueDate: hoje,
        description: `Azulejo Pro (anual, ${vezes}x)`,
        externalReference: usuario.id,
        ...callback,
        ...(vezes > 1 ? { installmentCount: vezes, installmentValue: parcela } : { value: total }),
      });
      registro = {
        plano,
        forma: "cartao",
        parcelas: vezes,
        valor: total,
        asaas_assinatura_id: null,
        asaas_cobranca_id: cobranca.id,
        asaas_parcelamento_id: cobranca.installment ?? null,
        link_pagamento: cobranca.invoiceUrl,
        proximo_vencimento: null,
      };
    }

    const { error } = await db.from("assinaturas").upsert({
      perfil_id: usuario.id,
      ...registro,
      // quem já é Pro (ex.: renovando o anual antes do fim) continua com o status de agora
      status: proAtivo ? (atual?.status ?? "ativa") : "aguardando_pagamento",
      nome_fiscal: nome,
      cpf_cnpj: cpfCnpj,
      asaas_cliente_id: clienteId,
    });
    if (error) throw error;
    return json({ url: registro.link_pagamento });
  } catch (e) {
    console.error(
      "[asaas-assinar]",
      e instanceof ErroAsaas ? { msg: e.message, detalhes: e.detalhes } : e,
    );
    const mensagem =
      e instanceof ErroAsaas && e.status < 500
        ? `O Asaas recusou o pedido: ${e.message}`
        : "Não conseguimos falar com o sistema de pagamentos. Tente de novo em instantes.";
    return json({ erro: mensagem }, 502);
  }
});
