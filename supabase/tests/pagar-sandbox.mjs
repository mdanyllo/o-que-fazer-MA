// Simula o pagamento de uma fatura no SANDBOX do Asaas (Pix ou cartão), para testar o
// Pro pela interface: o Asaas confirma a cobrança e manda o webhook, como num pagamento real.
//
//   npm run pagar:sandbox                          paga a cobrança pendente mais recente
//   npm run pagar:sandbox -- https://sandbox.asaas.com/i/abc123   paga a fatura desse link
//   npm run pagar:sandbox -- pay_abc123            paga a cobrança com esse id
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((l) => /^[A-Z0-9_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim()]),
);
const API = env.ASAAS_API_URL || "https://api-sandbox.asaas.com/v3";
if (!env.ASAAS_API_KEY || !API.includes("sandbox")) {
  console.log(
    "Precisa da ASAAS_API_KEY do sandbox no .env.local (este script só roda no sandbox).",
  );
  process.exit(1);
}

async function asaas(metodo, caminho) {
  const r = await fetch(`${API}${caminho}`, {
    method: metodo,
    headers: { "User-Agent": "azulejo-testes", access_token: env.ASAAS_API_KEY },
  });
  const texto = await r.text();
  if (!r.ok) throw new Error(`${r.status} ${texto}`);
  return texto ? JSON.parse(texto) : null;
}

const arg = process.argv[2];
let id;
if (!arg) {
  // a conta sandbox pode ter cobranças de outros projetos: só as do Azulejo
  const { data } = await asaas("GET", "/payments?status=PENDING&limit=100");
  const nossa = data?.find((c) => c.description?.startsWith("Azulejo Pro"));
  if (!nossa) {
    console.log(
      "Nenhuma cobrança do Azulejo pendente no sandbox. Assine o Pro pelo site primeiro.",
    );
    process.exit(1);
  }
  id = nossa.id;
} else {
  // o link da fatura termina no id sem o prefixo "pay_"
  id = arg.startsWith("pay_") ? arg : `pay_${arg.split("/").filter(Boolean).pop()}`;
}

const c = await asaas("GET", `/payments/${id}`);
const valor = c.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
console.log(`Cobrança ${id}: ${valor}, ${c.billingType}, ${c.description ?? ""} (${c.status})`);
if (!c.description?.startsWith("Azulejo Pro")) {
  console.log("Essa cobrança não é do Azulejo; não mexi nela.");
  process.exit(1);
}
if (c.status !== "PENDING" && c.status !== "OVERDUE") {
  console.log("Essa cobrança não está em aberto.");
  process.exit(1);
}
await asaas("POST", `/sandbox/payment/${id}/confirm`);
console.log(
  "Pago no sandbox. O webhook chega em alguns segundos e a tela do site atualiza sozinha.",
);
