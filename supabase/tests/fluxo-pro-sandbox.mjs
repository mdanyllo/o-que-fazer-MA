// Plano Pro de ponta a ponta no SANDBOX do Asaas e no Supabase real:
// assinar o mensal no Pix, pagar o QR Code, ver o webhook ligar o Pro, contar estatísticas,
// cancelar, e assinar o anual em 3x pagando com cartão de teste.
//
//   npm run test:pro -- --configurar   gera o token do webhook, grava os segredos das
//                                       funções e cadastra o webhook no Asaas sandbox
//   npm run test:pro                    roda o fluxo
//
// Precisa no .env.local: ASAAS_API_KEY (sandbox), as contas de teste 1 (dono) e 3 (admin).
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";
import { appendFileSync, readFileSync } from "node:fs";

const raiz = new URL("../../", import.meta.url);
const arquivoEnv = new URL(".env.local", raiz);
const env = Object.fromEntries(
  readFileSync(arquivoEnv, "utf8")
    .split(/\r?\n/)
    .filter((l) => /^[A-Z0-9_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim()]),
);
const API = env.ASAAS_API_URL || "https://api-sandbox.asaas.com/v3";
if (!env.ASAAS_API_KEY) {
  console.log("Falta ASAAS_API_KEY (sandbox) no .env.local.");
  process.exit(1);
}
if (!API.includes("sandbox")) {
  console.log("Por segurança, este teste só roda no sandbox do Asaas.");
  process.exit(1);
}

async function asaas(metodo, caminho, corpo) {
  const r = await fetch(`${API}${caminho}`, {
    method: metodo,
    headers: { "Content-Type": "application/json", "User-Agent": "azulejo-testes", access_token: env.ASAAS_API_KEY },
    ...(corpo ? { body: JSON.stringify(corpo) } : {}),
  });
  const texto = await r.text();
  const dados = texto ? JSON.parse(texto) : null;
  if (!r.ok) throw new Error(`Asaas ${metodo} ${caminho}: ${r.status} ${texto}`);
  return dados;
}

const URL_WEBHOOK = `${env.VITE_SUPABASE_URL}/functions/v1/asaas-webhook`;
const EVENTOS = [
  "PAYMENT_CREATED",
  "PAYMENT_CONFIRMED",
  "PAYMENT_RECEIVED",
  "PAYMENT_OVERDUE",
  "PAYMENT_REFUNDED",
  "PAYMENT_CHARGEBACK_REQUESTED",
  "SUBSCRIPTION_DELETED",
  "SUBSCRIPTION_INACTIVATED",
];

// ——— configurar: token, segredos e webhook ———
if (process.argv.includes("--configurar")) {
  let token = env.ASAAS_WEBHOOK_TOKEN;
  if (!token) {
    token = randomBytes(24).toString("base64url");
    const quebra = readFileSync(arquivoEnv, "utf8").endsWith("\n") ? "" : "\n";
    appendFileSync(arquivoEnv, `${quebra}ASAAS_WEBHOOK_TOKEN=${token}\n`);
    console.log("Token do webhook gerado e guardado no .env.local.");
  }
  const existentes = await asaas("GET", "/webhooks");
  const atual = existentes.data?.find((w) => w.url === URL_WEBHOOK);
  const corpo = {
    name: "Azulejo (plano Pro)",
    url: URL_WEBHOOK,
    email: env.ASAAS_EMAIL_AVISOS || "contatologostecnologias@gmail.com",
    enabled: true,
    interrupted: false,
    apiVersion: 3,
    authToken: token,
    sendType: "SEQUENTIALLY",
    events: EVENTOS,
  };
  if (atual) await asaas("PUT", `/webhooks/${atual.id}`, corpo);
  else await asaas("POST", "/webhooks", corpo);
  console.log(`Webhook ${atual ? "atualizado" : "cadastrado"} no Asaas sandbox: ${URL_WEBHOOK}`);
  console.log("Agora grave os segredos das funções (comando no README, seção Plano Pro).");
  process.exit(0);
}

// ——— utilitários ———
let passaram = 0;
const falhas = [];
function confere(descricao, ok, detalhe = "") {
  if (ok) passaram++;
  else falhas.push(`${descricao} ${detalhe}`);
  console.log(`  ${ok ? "✓" : "✗"} ${descricao}${ok ? "" : `\n      ${detalhe}`}`);
}
const titulo = (t) => console.log(`\n${t}`);
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const novoCliente = () =>
  createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
async function entrar(n) {
  const sb = novoCliente();
  const { data, error } = await sb.auth.signInWithPassword({
    email: env[`TESTE_EMAIL_${n}`],
    password: env[`TESTE_SENHA_${n}`],
  });
  if (error) throw new Error(`Não entrou com a conta ${n}: ${error.message}`);
  return { sb, id: data.user.id };
}
async function funcao(conta, nome, corpo) {
  const { data, error } = await conta.sb.functions.invoke(nome, { body: corpo });
  if (error) {
    let detalhe = error.message;
    try {
      detalhe = JSON.stringify(await error.context.json());
    } catch {
      /* sem corpo */
    }
    return { erro: detalhe };
  }
  return data;
}
const assinatura = async (conta) =>
  (await conta.sb.from("assinaturas").select("*").eq("perfil_id", conta.id).maybeSingle()).data;
/** Espera o webhook mudar a assinatura (até 90 s). */
async function esperar(conta, condicao, descricao) {
  for (let i = 0; i < 45; i++) {
    const a = await assinatura(conta);
    if (a && condicao(a)) return a;
    await dormir(2000);
  }
  console.log(`  … tempo esgotado esperando: ${descricao}`);
  return assinatura(conta);
}

const dona = await entrar(1);
const admin = await entrar(3);
const CPF_TESTE = "52998224725"; // válido, de exemplo
console.log(`Asaas: ${API}\nSupabase: ${env.VITE_SUPABASE_URL}`);

// estado inicial: sem assinatura mensal ativa
const antes = await assinatura(dona);
if (antes?.asaas_assinatura_id && ["ativa", "atrasada"].includes(antes.status))
  await funcao(dona, "asaas-cancelar", {});

let negocioId;
try {
  titulo("Pedido inválido é barrado no servidor");
  const r1 = await funcao(dona, "asaas-assinar", { plano: "anual", forma: "pix", nome: "Teste", cpfCnpj: CPF_TESTE });
  confere("anual no Pix é recusado", Boolean(r1.erro), JSON.stringify(r1));
  const r2 = await funcao(dona, "asaas-assinar", { plano: "mensal", forma: "pix", nome: "Teste", cpfCnpj: "11111111111" });
  confere("CPF inválido é recusado", Boolean(r2.erro), JSON.stringify(r2));
  const anon = await novoCliente().functions.invoke("asaas-assinar", { body: {} });
  confere("sem login é recusado", Boolean(anon.error));
  const webhookSemToken = await fetch(URL_WEBHOOK, { method: "POST", body: JSON.stringify({ id: "x", event: "PAYMENT_RECEIVED" }) });
  confere("webhook sem o token do Asaas é recusado", webhookSemToken.status === 401, String(webhookSemToken.status));

  titulo("Mensal no Pix");
  const pedido = await funcao(dona, "asaas-assinar", { plano: "mensal", forma: "pix", nome: "Teste Azulejo Pro", cpfCnpj: CPF_TESTE });
  confere("devolve o link da fatura do Asaas", typeof pedido.url === "string" && pedido.url.startsWith("http"), JSON.stringify(pedido));
  let a = await assinatura(dona);
  confere("aguardando pagamento, ainda sem Pro", a?.status === "aguardando_pagamento" && !(a.pro_ate && new Date(a.pro_ate) > new Date()), JSON.stringify(a));
  const cobranca = await asaas("GET", `/payments/${a.asaas_cobranca_id}`);
  confere("cobrança de R$ 29,90 no Pix", cobranca.value === 29.9 && cobranca.billingType === "PIX", `${cobranca.value} ${cobranca.billingType}`);
  // o sandbox confirma a cobrança como se o Pix tivesse caído (pagar o QR Code pela API
  // exige chave com permissão de saque)
  const pago = await asaas("POST", `/sandbox/payment/${a.asaas_cobranca_id}/confirm`).catch((e) => ({ erro: e.message }));
  confere("pagamento do Pix confirmado no sandbox", !pago.erro, pago.erro ?? "");
  a = await esperar(dona, (x) => x.status === "ativa", "o webhook ligar o Pro");
  const proAte = a?.pro_ate ? new Date(a.pro_ate) : null;
  const dias = proAte ? (proAte - Date.now()) / 86400000 : 0;
  confere("o webhook liga o Pro", a?.status === "ativa", JSON.stringify(a));
  confere("Pro até o próximo vencimento + 3 dias (~31 a 34 dias)", dias > 30 && dias < 35, `${dias.toFixed(1)} dias`);
  const { data: ehPro } = await novoCliente().rpc("eh_pro", { perfil: dona.id });
  confere("eh_pro() responde que sim", ehPro === true);

  titulo("Selo de verificado e estatísticas");
  const { data: criado } = await dona.sb
    .from("negocios")
    .insert({ tipo: "passeio", nome: "Passeio Teste Pro", cidade: "Barreirinhas", status: "rascunho" })
    .select("id")
    .single();
  negocioId = criado.id;
  await admin.sb.from("negocios").update({ status: "publicado", latitude: -2.747, longitude: -42.827 }).eq("id", negocioId);
  const { data: verificados } = await novoCliente().rpc("negocios_verificados");
  confere("o negócio publicado da conta Pro tem o selo", verificados?.includes(negocioId));
  const visitante = novoCliente();
  for (const evento of ["visita", "visita", "whatsapp"])
    await visitante.rpc("registrar_evento", { negocio: negocioId, evento });
  const hoje = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
  const { data: est, error: eEst } = await dona.sb.rpc("estatisticas_negocio", { negocio: negocioId, desde: hoje });
  const soma = (tipo) => (est ?? []).filter((l) => l.tipo === tipo).reduce((t, l) => t + l.total, 0);
  confere("o dono Pro vê 2 visitas e 1 conversa", !eEst && soma("visita") === 2 && soma("whatsapp") === 1, eEst?.message ?? JSON.stringify(est));

  titulo("Cancelar o mensal");
  const cancelado = await funcao(dona, "asaas-cancelar", {});
  confere("cancela", cancelado.ok === true, JSON.stringify(cancelado));
  a = await assinatura(dona);
  confere("fica cancelada, com o Pro até a data paga", a?.status === "cancelada" && new Date(a.pro_ate) > new Date(), JSON.stringify(a));
  const sub = await asaas("GET", `/subscriptions/${a.asaas_assinatura_id}`).catch(() => ({ deleted: true }));
  confere("a assinatura sumiu no Asaas", sub.deleted === true || sub.status === "INACTIVE", JSON.stringify(sub).slice(0, 120));

  titulo("Anual no cartão em 3x (renovação somada ao que resta)");
  const proAntes = new Date(a.pro_ate);
  const anual = await funcao(dona, "asaas-assinar", { plano: "anual", forma: "cartao", parcelas: 3, nome: "Teste Azulejo Pro", cpfCnpj: CPF_TESTE });
  confere("devolve o link da fatura", typeof anual.url === "string", JSON.stringify(anual));
  a = await assinatura(dona);
  const primeira = await asaas("GET", `/payments/${a.asaas_cobranca_id}`);
  confere("3 parcelas de R$ 116,61 no cartão", primeira.installment && Math.abs(primeira.value - 116.61) < 0.01 && primeira.billingType === "CREDIT_CARD", `${primeira.value} ${primeira.billingType}`);
  const cartao = await asaas("POST", `/payments/${a.asaas_cobranca_id}/payWithCreditCard`, {
    creditCard: { holderName: "Teste Azulejo", number: "5162306219378829", expiryMonth: "12", expiryYear: "2030", ccv: "318" },
    creditCardHolderInfo: { name: "Teste Azulejo", email: env.TESTE_EMAIL_1, cpfCnpj: CPF_TESTE, postalCode: "01310100", addressNumber: "100", phone: "98991234567" },
  }).catch((e) => ({ erro: e.message }));
  confere("pagamento com cartão de teste", !cartao.erro, cartao.erro ?? "");
  a = await esperar(dona, (x) => x.plano === "anual" && new Date(x.pro_ate) > proAntes, "o webhook estender o Pro");
  const ganho = (new Date(a.pro_ate) - proAntes) / 86400000;
  confere("o Pro anual é somado ao que restava (~365 dias a mais)", ganho > 360 && ganho < 370, `${ganho.toFixed(1)} dias`);
  await dormir(8000);
  const depois = await assinatura(dona);
  confere("os avisos repetidos não estendem de novo", depois.pro_ate === a.pro_ate, `${a.pro_ate} → ${depois.pro_ate}`);
} finally {
  if (negocioId) await admin.sb.from("negocios").delete().eq("id", negocioId);
}

console.log(`\n${passaram} passaram, ${falhas.length} falharam`);
if (falhas.length) {
  console.log(`\nFalhas:\n  ${falhas.join("\n  ")}`);
  process.exit(1);
}
