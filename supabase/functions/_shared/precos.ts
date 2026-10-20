// Preços e regras do plano Pro. Usado pelo site (src/) e pelas funções do servidor (Deno):
// TypeScript puro, sem nada de Node, Deno ou do navegador.

export const PRECO_MENSAL = 29.9;
export const PRECO_ANUAL = 329.9;
export const MAX_PARCELAS = 12;

/** Dias de Pro depois do vencimento do mensal sem pagamento. */
export const TOLERANCIA_DIAS = 3;

/**
 * Juros ao mês do anual parcelado (tabela Price). 1x é sem juros.
 * 2,99% a.m., definido pelo dono "por enquanto". Mudou? Publique as funções de novo.
 */
export const JUROS_MES = 0.0299;

const centavos = (v: number) => Math.round(v * 100) / 100;

/** Valor da parcela e total do anual em `n` vezes. */
export function parcelamentoAnual(n: number, juros = JUROS_MES) {
  const vezes = Math.min(MAX_PARCELAS, Math.max(1, Math.round(n)));
  if (vezes === 1 || juros <= 0) {
    const parcela = centavos(PRECO_ANUAL / vezes);
    return { vezes, parcela, total: centavos(parcela * vezes) };
  }
  const parcela = centavos((PRECO_ANUAL * juros) / (1 - (1 + juros) ** -vezes));
  return { vezes, parcela, total: centavos(parcela * vezes) };
}

/** Todas as opções de 1x a 12x. */
export const opcoesParcelamento = (juros = JUROS_MES) =>
  Array.from({ length: MAX_PARCELAS }, (_, i) => parcelamentoAnual(i + 1, juros));

/** CPF ou CNPJ válido (só dígitos). */
export function cpfCnpjValido(valor: string) {
  const d = valor.replace(/\D/g, "");
  if (d.length === 11) return cpfValido(d);
  if (d.length === 14) return cnpjValido(d);
  return false;
}

function cpfValido(d: string) {
  if (/^(\d)\1{10}$/.test(d)) return false;
  const digito = (base: string, peso: number) => {
    let soma = 0;
    for (const c of base) soma += Number(c) * peso--;
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return digito(d.slice(0, 9), 10) === Number(d[9]) && digito(d.slice(0, 10), 11) === Number(d[10]);
}

function cnpjValido(d: string) {
  if (/^(\d)\1{13}$/.test(d)) return false;
  const digito = (base: string) => {
    const pesos =
      base.length === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const soma = [...base].reduce((t, c, i) => t + Number(c) * pesos[i]!, 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  return digito(d.slice(0, 12)) === Number(d[12]) && digito(d.slice(0, 13)) === Number(d[13]);
}
