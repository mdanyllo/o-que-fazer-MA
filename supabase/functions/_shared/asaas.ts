// Cliente mínimo da API do Asaas (v3) para as funções do servidor.
// Segredos (Supabase → Edge Functions → Secrets):
//   ASAAS_API_KEY   chave da API (sandbox ou produção). NUNCA vai para o navegador.
//   ASAAS_API_URL   https://api-sandbox.asaas.com/v3 (padrão) ou https://api.asaas.com/v3

export type CobrancaAsaas = {
  id: string;
  customer: string;
  subscription?: string | null;
  installment?: string | null;
  installmentNumber?: number | null;
  value: number;
  netValue?: number;
  billingType: string;
  status: string;
  dueDate: string;
  paymentDate?: string | null;
  confirmedDate?: string | null;
  invoiceUrl: string;
  externalReference?: string | null;
};

export class ErroAsaas extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly detalhes: unknown,
  ) {
    super(message);
  }
}

const URL_API = () => Deno.env.get("ASAAS_API_URL") ?? "https://api-sandbox.asaas.com/v3";

export async function asaas<T>(
  metodo: "GET" | "POST" | "PUT" | "DELETE",
  caminho: string,
  corpo?: unknown,
): Promise<T> {
  const chave = Deno.env.get("ASAAS_API_KEY");
  if (!chave) throw new ErroAsaas("ASAAS_API_KEY não configurada", 500, null);
  const resposta = await fetch(`${URL_API()}${caminho}`, {
    method: metodo,
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "azulejo",
      access_token: chave,
    },
    ...(corpo ? { body: JSON.stringify(corpo) } : {}),
  });
  const texto = await resposta.text();
  const dados = texto ? JSON.parse(texto) : null;
  if (!resposta.ok) {
    const descricao =
      (dados?.errors as { description?: string }[] | undefined)
        ?.map((e) => e.description)
        .join(" ") || `Asaas respondeu ${resposta.status}`;
    throw new ErroAsaas(descricao, resposta.status, dados);
  }
  return dados as T;
}

/** Data de hoje em Brasília, no formato do Asaas (AAAA-MM-DD). */
export const hojeBrasilia = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());

/** Soma meses a uma data AAAA-MM-DD (dia 31 + 1 mês cai no último dia do mês). */
export function somarMeses(data: string, meses: number) {
  const [a, m, d] = data.split("-").map(Number) as [number, number, number];
  const alvo = new Date(Date.UTC(a, m - 1 + meses, 1));
  const ultimoDia = new Date(
    Date.UTC(alvo.getUTCFullYear(), alvo.getUTCMonth() + 1, 0),
  ).getUTCDate();
  alvo.setUTCDate(Math.min(d, ultimoDia));
  return alvo.toISOString().slice(0, 10);
}

/** Fim do dia (23:59:59 de Brasília) de uma data AAAA-MM-DD, somando dias. */
export function fimDoDia(data: string, maisDias = 0) {
  const [a, m, d] = data.split("-").map(Number) as [number, number, number];
  // 23:59:59 em Brasília (UTC-3) = 02:59:59 UTC do dia seguinte
  return new Date(Date.UTC(a, m - 1, d + maisDias + 1, 2, 59, 59)).toISOString();
}

export const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export const json = (dados: unknown, status = 200) =>
  new Response(JSON.stringify(dados), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
