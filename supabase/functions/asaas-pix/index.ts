// QR Code e "copia e cola" do Pix da cobrança em aberto da conta, para pagar dentro do site
// (sem ir para a página do Asaas). A confirmação continua chegando pelo asaas-webhook.
//
// Resposta: { imagem (PNG em base64), copiaECola, valor, vencimento, expiraEm }
import { asaas, CORS, ErroAsaas, json, type CobrancaAsaas } from "../_shared/asaas.ts";
import { servidor, usuarioDaRequisicao, type Assinatura } from "../_shared/supabase.ts";

type QrCodePix = { encodedImage: string; payload: string; expirationDate: string | null };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ erro: "Método não aceito." }, 405);

  const usuario = await usuarioDaRequisicao(req);
  if (!usuario) return json({ erro: "Entre na sua conta." }, 401);

  const { data: conta } = await servidor()
    .from("assinaturas")
    .select("*")
    .eq("perfil_id", usuario.id)
    .maybeSingle<Assinatura>();
  if (!conta?.asaas_cobranca_id || conta.forma !== "pix" || !conta.link_pagamento)
    return json({ erro: "Não há Pix em aberto para pagar." }, 409);

  try {
    const cobranca = await asaas<CobrancaAsaas>("GET", `/payments/${conta.asaas_cobranca_id}`);
    if (cobranca.status !== "PENDING" && cobranca.status !== "OVERDUE")
      return json({ erro: "Essa cobrança já foi paga ou cancelada.", pago: true }, 409);
    const qr = await asaas<QrCodePix>("GET", `/payments/${cobranca.id}/pixQrCode`);
    return json({
      imagem: qr.encodedImage,
      copiaECola: qr.payload,
      valor: cobranca.value,
      vencimento: cobranca.dueDate,
      expiraEm: qr.expirationDate,
    });
  } catch (e) {
    console.error(
      "[asaas-pix]",
      e instanceof ErroAsaas ? { msg: e.message, detalhes: e.detalhes } : e,
    );
    return json({ erro: "Não conseguimos gerar o Pix agora. Tente de novo em instantes." }, 502);
  }
});
