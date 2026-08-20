import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHero, PageShell } from "@/components/site/PageShell";
import { EventCard, SectionHeading } from "@/components/site/cards";
import { cn } from "@/lib/utils";
import { events, img } from "@/data/maranhao";

export const Route = createFileRoute("/eventos")({
  head: () => ({
    meta: [
      { title: "Eventos no Maranhão — festas, cultura e gastronomia" },
      {
        name: "description",
        content:
          "Calendário demonstrativo de eventos no Maranhão: São João, Bumba Meu Boi, festivais gastronômicos e festas tradicionais.",
      },
      { property: "og:title", content: "Eventos no Maranhão" },
      { property: "og:description", content: "Um calendário visual das festas e festivais do estado." },
    ],
  }),
  component: EventosPage,
});

const months = ["Fevereiro", "Junho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

function EventosPage() {
  const [month, setMonth] = useState<string | null>(null);
  const list = month ? events.filter((e) => e.month === month) : events;

  return (
    <PageShell transparentHeader>
      <PageHero
        image={img.cultura}
        eyebrow="Agenda"
        title="Eventos no Maranhão"
        subtitle="Festas tradicionais, cultura popular, shows e festivais gastronômicos ao longo do ano."
      />

      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="overflow-x-auto">
          <div className="flex min-w-max gap-2 pb-2">
            <button
              onClick={() => setMonth(null)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                month === null ? "border-transparent bg-primary text-primary-foreground" : "border-border",
              )}
            >
              Ano todo
            </button>
            {months.map((m) => {
              const count = events.filter((e) => e.month === m).length;
              return (
                <button
                  key={m}
                  onClick={() => setMonth(m === month ? null : m)}
                  className={cn(
                    "flex min-w-[110px] flex-col items-start rounded-2xl border px-4 py-3 text-left transition-colors",
                    m === month
                      ? "border-transparent bg-primary text-primary-foreground"
                      : "border-border bg-card hover:border-turquoise",
                  )}
                >
                  <span className="text-sm font-semibold">{m}</span>
                  <span className={cn("text-xs", m === month ? "text-primary-foreground/70" : "text-muted-foreground")}>
                    {count} {count === 1 ? "evento" : "eventos"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-10">
          <SectionHeading title={month ? `Eventos em ${month}` : "Todos os eventos do ano"} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          Datas e programações são demonstrativas, criadas apenas para ilustrar o produto.
        </p>
      </section>
    </PageShell>
  );
}
