import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, BadgeCheck, Check, Minus, Star } from "lucide-react";
import { useState } from "react";
import { botao } from "@/components/azulejo/botao";
import { Chip } from "@/components/azulejo/etiquetas";
import { CabecalhoPagina, PageShell } from "@/components/site/PageShell";
import { useAuth } from "@/lib/auth";
import {
  MAX_PARCELAS,
  parcelamentoAnual,
  PRECO_ANUAL,
  PRECO_MENSAL,
  reais,
  TOLERANCIA_DIAS,
} from "@/lib/plano";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/planos")({
  head: () => ({
    meta: [
      { title: "Planos para negócios | Azulejo" },
      {
        name: "description",
        content:
          "Cadastre seu negócio no Azulejo de graça. Com o Pro, veja quantas pessoas visitam sua página e chamam no WhatsApp, e ganhe o selo de verificado.",
      },
    ],
  }),
  component: Planos,
});

const RECURSOS: { texto: string; gratuito: boolean; pro: boolean }[] = [
  { texto: "Página do negócio no Azulejo, revisada pela equipe", gratuito: true, pro: true },
  { texto: "Até 8 fotos, WhatsApp, Instagram e site", gratuito: true, pro: true },
  { texto: "Aparece nos destinos, no mapa e nos roteiros", gratuito: true, pro: true },
  { texto: "Selo de verificado nos cards e na página", gratuito: false, pro: true },
  { texto: "Estatísticas: visitas, conversas no WhatsApp e cliques", gratuito: false, pro: true },
  { texto: "Comparação com o período anterior, por dia", gratuito: false, pro: true },
];

function Planos() {
  const { usuario } = useAuth();
  const [ciclo, setCiclo] = useState<"mensal" | "anual">("mensal");
  const em12 = parcelamentoAnual(MAX_PARCELAS);
  const destinoPro = usuario ? "/painel/assinatura" : "/cadastrar";

  return (
    <PageShell>
      <CabecalhoPagina
        titulo="Seu negócio no Azulejo"
        apoio="Cadastrar é de graça. Com o Pro, você vê quem visita sua página e chama no WhatsApp, e ganha o selo de verificado."
      />

      <section
        aria-label="Planos"
        className="mx-auto flex max-w-6xl flex-col gap-8 px-5 pb-16 md:px-12 md:pb-24"
      >
        <div role="group" aria-label="Forma de cobrança do Pro" className="flex gap-2">
          <Chip ativo={ciclo === "mensal"} onClick={() => setCiclo("mensal")}>
            Mensal
          </Chip>
          <Chip ativo={ciclo === "anual"} onClick={() => setCiclo("anual")}>
            Anual
          </Chip>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <article className="flex flex-col gap-6 rounded-md border border-linha p-6 md:p-8">
            <header className="flex flex-col gap-2">
              <h2 className="text-t2">Gratuito</h2>
              <p className="font-display text-[2.5rem] leading-none font-extrabold">R$ 0</p>
              <p className="text-ink-suave">Para estar no guia, sem custo.</p>
            </header>
            <ListaRecursos plano="gratuito" />
            <Link
              to={usuario ? "/painel" : "/cadastrar"}
              className={cn(botao({ variante: "secundario", tamanho: "lg" }), "mt-auto")}
            >
              {usuario ? "Ir para meus negócios" : "Cadastrar grátis"}
            </Link>
          </article>

          <article className="relative mt-3 flex flex-col gap-6 rounded-md border-2 border-cobalto p-6 md:mt-0 md:p-8">
            <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-sm bg-cobalto px-2 py-0.5 text-rotulo text-sobre-cobalto md:left-8">
              <Star className="size-3.5 fill-current" aria-hidden /> Mais escolhido
            </span>
            <header className="flex flex-col gap-2">
              <h2 className="flex items-center gap-2 text-t2 text-cobalto">
                Pro <BadgeCheck className="size-6" aria-hidden />
              </h2>
              {ciclo === "mensal" ? (
                <>
                  <p className="font-display text-[2.5rem] leading-none font-extrabold">
                    {reais(PRECO_MENSAL)}
                    <span className="font-sans text-base font-normal text-ink-suave"> / mês</span>
                  </p>
                  <p className="text-ink-suave">No Pix ou no cartão. Cancele quando quiser.</p>
                </>
              ) : (
                <>
                  <p className="font-display text-[2.5rem] leading-none font-extrabold">
                    {reais(PRECO_ANUAL)}
                    <span className="font-sans text-base font-normal text-ink-suave"> / ano</span>
                  </p>
                  <p className="text-ink-suave">
                    No cartão, à vista ou em até {MAX_PARCELAS}x de {reais(em12.parcela)} (com
                    juros). Equivale a {reais(PRECO_ANUAL / 12)} por mês.
                  </p>
                </>
              )}
            </header>
            <ListaRecursos plano="pro" />
            <Link
              to={destinoPro}
              {...(usuario ? { search: { plano: ciclo } } : {})}
              className={cn(botao({ tamanho: "lg" }), "mt-auto")}
            >
              Assinar o Pro
            </Link>
          </article>
        </div>

        <section aria-labelledby="perguntas" className="mt-8 flex flex-col gap-6">
          <h2 id="perguntas" className="text-t2">
            Perguntas frequentes
          </h2>
          <dl className="grid gap-x-12 gap-y-6 md:grid-cols-2">
            {[
              [
                "Como eu pago?",
                "Pela página segura do Asaas, nosso parceiro de pagamentos. O mensal pode ser no Pix (você paga a cada mês pelo QR Code) ou no cartão (cobrado sozinho todo mês). O anual é no cartão.",
              ],
              [
                "E se eu não pagar o mensal?",
                `O Pro continua por ${TOLERANCIA_DIAS} dias depois do vencimento. Se a fatura não for paga, sua conta volta para o Gratuito, sem multa. Seu negócio continua no guia.`,
              ],
              [
                "Posso cancelar?",
                "Sim, no painel, a qualquer momento. O Pro vale até o fim do período já pago.",
              ],
              [
                "O Pro vale para todos os meus negócios?",
                "Sim. Uma assinatura cobre todos os negócios da sua conta.",
              ],
              [
                "O que entra nas estatísticas?",
                "Visitas à página, cliques no WhatsApp, no Instagram e no site, e quantas vezes o negócio apareceu em listas do site. Nenhum dado pessoal de quem visita.",
              ],
              [
                "Recebo nota fiscal?",
                "Sim. A nota fiscal de serviço é emitida a cada pagamento confirmado e enviada para o seu e-mail.",
              ],
            ].map(([p, r]) => (
              <div key={p} className="flex flex-col gap-1">
                <dt className="font-bold">{p}</dt>
                <dd className="medida text-ink-suave">{r}</dd>
              </div>
            ))}
          </dl>
        </section>

        <p className="flex items-center gap-2 text-legenda text-ink-suave">
          <BarChart3 className="size-4" aria-hidden />
          Os números das estatísticas começam a contar quando o negócio é publicado, mesmo no plano
          Gratuito.
        </p>
      </section>
    </PageShell>
  );
}

function ListaRecursos({ plano }: { plano: "gratuito" | "pro" }) {
  return (
    <ul className="flex flex-col gap-3">
      {RECURSOS.map((r) => {
        const tem = r[plano];
        return (
          <li key={r.texto} className={cn("flex gap-3", !tem && "text-ink-suave")}>
            {tem ? (
              <Check className="mt-0.5 size-5 shrink-0 text-babacu" aria-hidden />
            ) : (
              <Minus className="mt-0.5 size-5 shrink-0" aria-hidden />
            )}
            <span>
              <span className="sr-only">{tem ? "Inclui: " : "Não inclui: "}</span>
              {r.texto}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
