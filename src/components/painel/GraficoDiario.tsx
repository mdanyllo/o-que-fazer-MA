import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts";

/*
 * Linha de uma série por dia (uma métrica por gráfico: nunca dois eixos). Cor da marca
 * (--cobalto, contraste >= 3:1 com o fundo nos dois temas), traço de 2px, grade discreta,
 * cruz + dica ao passar o mouse ou tocar. A tabela com os mesmos números fica ao lado.
 */

export type PontoDia = { dia: string; total: number };

const diaCurto = (dia: string) => `${dia.slice(8, 10)}/${dia.slice(5, 7)}`;

function Dica({ active, payload, rotulo }: TooltipProps<number, string> & { rotulo: string }) {
  const ponto = payload?.[0]?.payload as PontoDia | undefined;
  if (!active || !ponto) return null;
  return (
    <div className="rounded-md border border-linha bg-louca px-3 py-2 text-legenda text-ink shadow-flutua">
      <p className="text-ink-suave">
        {new Date(`${ponto.dia}T12:00:00`).toLocaleDateString("pt-BR", {
          weekday: "short",
          day: "numeric",
          month: "short",
        })}
      </p>
      <p className="font-bold">
        {ponto.total.toLocaleString("pt-BR")} {rotulo}
      </p>
    </div>
  );
}

export function GraficoDiario({
  titulo,
  rotulo,
  pontos,
}: {
  titulo: string;
  /** unidade na dica, no plural ("visitas") */
  rotulo: string;
  pontos: PontoDia[];
}) {
  const maximo = Math.max(1, ...pontos.map((p) => p.total));
  return (
    <figure className="flex min-w-0 flex-col gap-3">
      <figcaption className="text-t3">{titulo}</figcaption>
      <div
        className="h-56 w-full"
        role="img"
        aria-label={`${titulo}: ${pontos.reduce((t, p) => t + p.total, 0)} no período. Os números de cada dia estão na tabela.`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={pontos} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid vertical={false} stroke="var(--linha)" />
            <XAxis
              dataKey="dia"
              tickFormatter={diaCurto}
              tick={{ fill: "var(--ink-suave)", fontSize: 12 }}
              axisLine={{ stroke: "var(--linha)" }}
              tickLine={false}
              minTickGap={24}
            />
            <YAxis
              allowDecimals={false}
              domain={[0, maximo]}
              tick={{ fill: "var(--ink-suave)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              content={<Dica rotulo={rotulo} />}
              cursor={{ stroke: "var(--ink-suave)", strokeWidth: 1, strokeDasharray: "3 3" }}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="var(--cobalto)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, stroke: "var(--louca)", strokeWidth: 2, fill: "var(--cobalto)" }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
