import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { useState } from "react";
import { Tag } from "@/components/azulejo/etiquetas";
import { Foto } from "@/components/azulejo/Foto";
import { CabecalhoPagina, PageShell } from "@/components/site/PageShell";
import { eventos, MESES, nomeDestino, nomeMes, type Evento, type Mes } from "@/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/eventos")({
  head: () => ({
    meta: [
      { title: "Eventos e festas | Azulejo" },
      {
        name: "description",
        content:
          "São João e Bumba-meu-boi, Carnaval, Festa do Divino e outras festas do Maranhão, mês a mês.",
      },
    ],
  }),
  component: Eventos,
});

const maiuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function Eventos() {
  const [mes, setMes] = useState<Mes | null>(null);
  const mesAtual = (new Date().getMonth() + 1) as Mes;
  // a agenda começa no mês atual e dá a volta no ano
  const ordem = Array.from({ length: 12 }, (_, i) => (((mesAtual - 1 + i) % 12) + 1) as Mes);
  const meses = (mes ? [mes] : ordem).filter((m) => eventos.some((e) => e.mes === m));

  return (
    <PageShell>
      <CabecalhoPagina
        titulo="Eventos e festas"
        apoio="O calendário do Maranhão mês a mês. As datas exatas mudam todo ano: confira a programação oficial antes de viajar."
      />
      <div className="mx-auto max-w-7xl px-5 pb-16 md:px-12 md:pb-24">
        <div
          role="group"
          aria-label="Escolher mês"
          className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12"
        >
          {MESES.map((nome, i) => {
            const m = (i + 1) as Mes;
            const tem = eventos.some((e) => e.mes === m);
            const ativo = mes === m;
            return (
              <button
                key={nome}
                type="button"
                aria-pressed={ativo}
                onClick={() => setMes(ativo ? null : m)}
                className={cn(
                  "relative flex min-h-14 flex-col items-center justify-center rounded-sm border-2 font-bold transition-colors duration-150",
                  ativo
                    ? "border-cobalto bg-cobalto text-sobre-cobalto"
                    : tem
                      ? "border-linha bg-areia hover:border-cobalto"
                      : "border-linha text-ink-suave hover:border-cobalto",
                )}
              >
                {maiuscula(nome.slice(0, 3))}
                {tem && (
                  <span
                    aria-hidden
                    className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-guara"
                  />
                )}
                {m === mesAtual && <span className="text-[11px] font-normal">agora</span>}
                <span className="sr-only">
                  {tem ? ", com eventos" : ", sem eventos no calendário"}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-legenda text-ink-suave">
          {mes ? (
            <button
              type="button"
              onClick={() => setMes(null)}
              className="font-bold text-cobalto underline-offset-4 hover:underline"
            >
              Ver o ano inteiro
            </button>
          ) : (
            "Os meses com ponto vermelho têm festa no calendário."
          )}
        </p>

        {meses.length === 0 && mes && (
          <p className="mt-12 text-ink-suave">
            Nenhuma festa grande no nosso calendário em {nomeMes(mes)}. Bom mês para aproveitar as
            praias e o Centro Histórico com menos gente.
          </p>
        )}

        <div className="mt-12 flex flex-col gap-16">
          {meses.map((m) => (
            <section key={m} aria-labelledby={`mes-${m}`}>
              <h2 id={`mes-${m}`} className="text-t1">
                {maiuscula(nomeMes(m))}
              </h2>
              <ul className="mt-6 flex flex-col gap-6">
                {eventos
                  .filter((e) => e.mes === m)
                  .map((e) => (
                    <CardEvento key={e.slug} evento={e} />
                  ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

function CardEvento({ evento }: { evento: Evento }) {
  return (
    <li className="grid gap-5 rounded-md bg-areia p-4 sm:grid-cols-[240px_1fr] md:p-5">
      <Foto
        src={evento.foto}
        alt={evento.nome}
        rotulo={evento.nome}
        cor="guara"
        sizes="240px"
        className="aspect-[4/3] rounded-sm"
      />
      <div className="flex min-w-0 flex-col gap-2">
        <p className="text-legenda font-bold text-guara">{evento.periodo}</p>
        <h3 className="text-t3">{evento.nome}</h3>
        <p className="flex items-center gap-1.5 text-legenda text-ink-suave">
          <MapPin className="size-4" aria-hidden /> {evento.local},{" "}
          <Link
            to="/destinos/$slug"
            params={{ slug: evento.destino }}
            className="font-bold text-cobalto underline-offset-4 hover:underline"
          >
            {nomeDestino(evento.destino)}
          </Link>
        </p>
        <p className="medida text-base">{evento.resumo}</p>
        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          {evento.tags.map((t) => (
            <Tag key={t} className="bg-louca">
              {t}
            </Tag>
          ))}
        </div>
      </div>
    </li>
  );
}
