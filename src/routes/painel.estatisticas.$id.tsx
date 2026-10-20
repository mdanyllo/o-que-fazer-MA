import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { User } from "@supabase/supabase-js";
import { ArrowDown, ArrowUp, Lock } from "lucide-react";
import { useState } from "react";
import { botao } from "@/components/azulejo/botao";
import { Chip } from "@/components/azulejo/etiquetas";
import { LoadingAzulejo } from "@/components/azulejo/LoadingAzulejo";
import { CaixaErro } from "@/components/conta/formulario";
import { AreaRestrita } from "@/components/conta/LayoutConta";
import { GraficoDiario, type PontoDia } from "@/components/painel/GraficoDiario";
import { LayoutPainel } from "@/components/painel/LayoutPainel";
import { Pagina404 } from "@/components/site/Pagina404";
import { buscarEstatisticas, type Evento, type LinhaEstatistica } from "@/lib/estatisticas";
import { buscarMeuNegocio } from "@/lib/meus-negocios";
import { ehPro, usePlano } from "@/lib/plano";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/painel/estatisticas/$id")({
  head: () => ({
    meta: [{ title: "Estatísticas | Azulejo" }, { name: "robots", content: "noindex" }],
  }),
  component: () => (
    <AreaRestrita>{({ usuario }) => <Estatisticas usuario={usuario} />}</AreaRestrita>
  ),
});

const PERIODOS = [7, 30, 90] as const;

const COMPARTILHAMENTOS: Evento[] = [
  "compartilhar_whatsapp",
  "compartilhar_instagram",
  "compartilhar_link",
];

/** Cada métrica soma um ou mais tipos de evento (compartilhamentos juntam os três canais). */
const METRICAS: { tipo: Evento | Evento[]; rotulo: string; unidade: string; dica: string }[] = [
  {
    tipo: "visita",
    rotulo: "Visitas à página",
    unidade: "visitas",
    dica: "Uma por pessoa a cada sessão",
  },
  {
    tipo: "whatsapp",
    rotulo: "Conversas no WhatsApp",
    unidade: "conversas",
    dica: "Toques no botão do WhatsApp",
  },
  {
    tipo: "instagram",
    rotulo: "Cliques no Instagram",
    unidade: "cliques",
    dica: "Toques no link do perfil",
  },
  { tipo: "site", rotulo: "Cliques no site", unidade: "cliques", dica: "Toques no link do site" },
  {
    tipo: "aparicao",
    rotulo: "Aparições em listas",
    unidade: "aparições",
    dica: "Card visto em Explorar, destinos e Home",
  },
  {
    tipo: COMPARTILHAMENTOS,
    rotulo: "Compartilhamentos",
    unidade: "compartilhamentos",
    dica: "WhatsApp, Instagram e link copiado",
  },
];

const CANAIS: { tipo: Evento; rotulo: string }[] = [
  { tipo: "compartilhar_whatsapp", rotulo: "WhatsApp" },
  { tipo: "compartilhar_instagram", rotulo: "Instagram" },
  { tipo: "compartilhar_link", rotulo: "Link copiado" },
];

const tiposDe = (tipo: Evento | Evento[]) => (Array.isArray(tipo) ? tipo : [tipo]);
const chaveDe = (tipo: Evento | Evento[]) => tiposDe(tipo).join("+");

/** AAAA-MM-DD em Brasília, `dias` atrás. */
function diaBrasilia(diasAtras = 0) {
  const d = new Date(Date.now() - diasAtras * 86400000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(d);
}

/** Série diária completa (dias sem evento = 0) de uma métrica. */
function serie(linhas: LinhaEstatistica[], tipo: Evento | Evento[], dias: number): PontoDia[] {
  const porDia = new Map<string, number>();
  for (const l of linhas)
    if (tiposDe(tipo).includes(l.tipo)) porDia.set(l.dia, (porDia.get(l.dia) ?? 0) + l.total);
  return Array.from({ length: dias }, (_, i) => {
    const dia = diaBrasilia(dias - 1 - i);
    return { dia, total: porDia.get(dia) ?? 0 };
  });
}

function Estatisticas({ usuario }: { usuario: User }) {
  const { id } = Route.useParams();
  const [dias, setDias] = useState<(typeof PERIODOS)[number]>(30);
  const negocio = useQuery({
    queryKey: ["meus-negocios", usuario.id, id],
    queryFn: () => buscarMeuNegocio(id, usuario.id),
  });
  const plano = usePlano(usuario.id);
  const pro = ehPro(plano.data);
  // o período e o anterior, para comparar
  const dados = useQuery({
    queryKey: ["estatisticas", id, dias],
    queryFn: () => buscarEstatisticas(id, diaBrasilia(dias * 2 - 1)),
    enabled: pro && Boolean(negocio.data),
  });

  if (negocio.isPending || plano.isPending)
    return (
      <LayoutPainel
        titulo="Estatísticas"
        largura="max-w-site"
        voltar={{ to: "/painel/estatisticas", rotulo: "Estatísticas" }}
      >
        <LoadingAzulejo className="self-center py-12" />
      </LayoutPainel>
    );
  if (!negocio.data) return <Pagina404 />;

  if (!pro) return <SemPro nome={negocio.data.nome} />;

  const inicio = diaBrasilia(dias - 1);
  const atual = (dados.data ?? []).filter((l) => l.dia >= inicio);
  const anterior = (dados.data ?? []).filter((l) => l.dia < inicio);
  const soma = (linhas: LinhaEstatistica[], tipo: Evento | Evento[]) =>
    linhas.filter((l) => tiposDe(tipo).includes(l.tipo)).reduce((t, l) => t + l.total, 0);
  const compartilhados = soma(atual, COMPARTILHAMENTOS);
  const visitas = soma(atual, "visita");
  const conversas = soma(atual, "whatsapp");

  return (
    <LayoutPainel
      titulo={`Estatísticas: ${negocio.data.nome}`}
      largura="max-w-site"
      voltar={{ to: "/painel/estatisticas", rotulo: "Estatísticas" }}
    >
      <div role="group" aria-label="Período" className="flex flex-wrap gap-2">
        {PERIODOS.map((p) => (
          <Chip key={p} ativo={dias === p} onClick={() => setDias(p)}>
            Últimos {p} dias
          </Chip>
        ))}
      </div>

      {negocio.data.status !== "publicado" && (
        <p role="status" className="rounded-md bg-areia p-4">
          Este negócio ainda não está publicado. Os números começam a contar quando ele for ao ar.
        </p>
      )}

      {dados.isPending ? (
        <LoadingAzulejo className="self-center py-12" />
      ) : dados.isError ? (
        <CaixaErro>
          <p>Não conseguimos carregar as estatísticas agora.</p>
          <button
            type="button"
            onClick={() => void dados.refetch()}
            className="mt-2 min-h-11 font-bold text-cobalto underline underline-offset-4"
          >
            Tentar de novo
          </button>
        </CaixaErro>
      ) : (
        <>
          <section
            aria-label="Resumo do período"
            className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6"
          >
            {METRICAS.map((m) => (
              <Numero
                key={chaveDe(m.tipo)}
                rotulo={m.rotulo}
                dica={m.dica}
                valor={soma(atual, m.tipo)}
                antes={soma(anterior, m.tipo)}
                dias={dias}
              />
            ))}
          </section>
          <p className="medida text-ink-suave">
            {visitas > 0
              ? `${Math.round((conversas / visitas) * 100)}% das visitas viraram conversa no WhatsApp nos últimos ${dias} dias.`
              : `Ainda não houve visitas nos últimos ${dias} dias.`}
          </p>
          <div className="grid gap-10 lg:grid-cols-2">
            <GraficoDiario
              titulo="Visitas por dia"
              rotulo="visitas"
              pontos={serie(atual, "visita", dias)}
            />
            <GraficoDiario
              titulo="Conversas no WhatsApp por dia"
              rotulo="conversas"
              pontos={serie(atual, "whatsapp", dias)}
            />
          </div>
          <section aria-labelledby="titulo-compartilhamentos" className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 id="titulo-compartilhamentos" className="text-t3">
                Compartilhamentos
              </h2>
              <p className="text-ink-suave">
                {compartilhados > 0
                  ? `${negocio.data.nome} foi compartilhado ${compartilhados.toLocaleString("pt-BR")} ${compartilhados === 1 ? "vez" : "vezes"} nos últimos ${dias} dias, pelo botão "Compartilhar" da página.`
                  : `Ninguém usou o botão "Compartilhar" da página nos últimos ${dias} dias.`}
              </p>
            </div>
            <div className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_1fr]">
              <ul className="flex flex-col gap-3">
                {CANAIS.map((c) => {
                  const total = soma(atual, c.tipo);
                  const parte = compartilhados > 0 ? total / compartilhados : 0;
                  return (
                    <li key={c.tipo} className="flex flex-col gap-1.5">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="font-bold">{c.rotulo}</span>
                        <span className="tabular-nums">
                          {total.toLocaleString("pt-BR")}
                          {compartilhados > 0 && (
                            <span className="text-legenda text-ink-suave">
                              {" "}
                              · {Math.round(parte * 100)}%
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-areia" aria-hidden>
                        <div
                          className="h-full rounded-full bg-cobalto"
                          style={{ width: `${parte * 100}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
              <GraficoDiario
                titulo="Compartilhamentos por dia"
                rotulo="compartilhamentos"
                pontos={serie(atual, COMPARTILHAMENTOS, dias)}
              />
            </div>
          </section>
          <TabelaDias linhas={atual} dias={dias} />
        </>
      )}
    </LayoutPainel>
  );
}

function Numero({
  rotulo,
  dica,
  valor,
  antes,
  dias,
}: {
  rotulo: string;
  dica: string;
  valor: number;
  antes: number;
  dias: number;
}) {
  const variacao = antes > 0 ? Math.round(((valor - antes) / antes) * 100) : null;
  return (
    <div className="flex flex-col gap-1 rounded-md bg-areia p-4">
      <p className="text-rotulo">{rotulo}</p>
      <p className="font-display text-[2rem] leading-tight font-extrabold tabular-nums">
        {valor.toLocaleString("pt-BR")}
      </p>
      <p className="text-legenda text-ink-suave">
        {variacao === null ? (
          `sem dados dos ${dias} dias anteriores`
        ) : (
          <span className="inline-flex items-center gap-1">
            {variacao > 0 ? (
              <ArrowUp className="size-3.5" aria-hidden />
            ) : variacao < 0 ? (
              <ArrowDown className="size-3.5" aria-hidden />
            ) : null}
            {variacao > 0 ? "+" : ""}
            {variacao}% vs. {dias} dias antes
          </span>
        )}
      </p>
      <p className="text-legenda text-ink-suave">{dica}</p>
    </div>
  );
}

/** Os mesmos números em tabela (acessível e para quem prefere ler). */
function TabelaDias({ linhas, dias }: { linhas: LinhaEstatistica[]; dias: number }) {
  const [aberta, setAberta] = useState(false);
  const porDia = Array.from({ length: dias }, (_, i) => diaBrasilia(i)).map((dia) => ({
    dia,
    valores: METRICAS.map((m) =>
      linhas
        .filter((l) => l.dia === dia && tiposDe(m.tipo).includes(l.tipo))
        .reduce((t, l) => t + l.total, 0),
    ),
  }));
  return (
    <details open={aberta} onToggle={(e) => setAberta((e.target as HTMLDetailsElement).open)}>
      <summary className="min-h-11 cursor-pointer content-center font-bold text-cobalto">
        Ver os números de cada dia
      </summary>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[36rem] text-left text-legenda tabular-nums">
          <thead>
            <tr className="border-b border-linha">
              <th scope="col" className="py-2 pr-4 font-bold">
                Dia
              </th>
              {METRICAS.map((m) => (
                <th key={chaveDe(m.tipo)} scope="col" className="py-2 pr-4 font-bold">
                  {m.rotulo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {porDia.map((l) => (
              <tr key={l.dia} className="border-b border-linha">
                <th scope="row" className="py-2 pr-4 font-normal">
                  {new Date(`${l.dia}T12:00:00`).toLocaleDateString("pt-BR")}
                </th>
                {l.valores.map((v, i) => (
                  <td key={i} className="py-2 pr-4">
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

/** Gratuito: o que o Pro mostra, com os números escondidos. */
function SemPro({ nome }: { nome: string }) {
  return (
    <LayoutPainel
      titulo={`Estatísticas: ${nome}`}
      largura="max-w-site"
      voltar={{ to: "/painel/estatisticas", rotulo: "Estatísticas" }}
    >
      <div className="relative overflow-hidden rounded-md">
        <div
          aria-hidden
          className="pointer-events-none grid select-none grid-cols-2 gap-3 opacity-40 blur-[3px] md:grid-cols-3 xl:grid-cols-6"
        >
          {METRICAS.map((m, i) => (
            <div key={chaveDe(m.tipo)} className="flex flex-col gap-1 rounded-md bg-areia p-4">
              <p className="text-rotulo">{m.rotulo}</p>
              <p className="font-display text-[2rem] font-extrabold">
                {[128, 23, 9, 6, 940, 14][i]}
              </p>
            </div>
          ))}
        </div>
        <div className="absolute inset-0 grid place-items-center p-4">
          <div className="flex max-w-md flex-col items-center gap-3 rounded-md border border-linha bg-louca p-6 text-center">
            <Lock className="size-6 text-cobalto" aria-hidden />
            <p className="text-t3">As estatísticas fazem parte do Pro</p>
            <p className="text-ink-suave">
              Veja quantas pessoas visitam a página de {nome}, quantas chamam no WhatsApp, quantas
              compartilham e de onde vêm os cliques. Os números já estão sendo contados.
            </p>
            <Link to="/painel/assinatura" className={cn(botao(), "mt-1")}>
              Conhecer o Pro
            </Link>
          </div>
        </div>
      </div>
    </LayoutPainel>
  );
}
