import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Clock, Car, Utensils, MapPin, Play, Check, Wallet } from "lucide-react";
import { toast } from "sonner";
import { HeroFrame, PageShell } from "@/components/site/PageShell";
import { SectionHeading } from "@/components/site/cards";
import { cn } from "@/lib/utils";
import { getItinerary, itineraries } from "@/data/maranhao";

export const Route = createFileRoute("/roteiros/$slug")({
  loader: ({ params }) => {
    const itinerary = getItinerary(params.slug);
    if (!itinerary) throw notFound();
    return { itinerary };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Roteiro não encontrado" }, { name: "robots", content: "noindex" }],
      };
    }
    const i = loaderData.itinerary;
    return {
      meta: [
        { title: `${i.title} | Roteiro de ${i.days} dias no Maranhão` },
        { name: "description", content: i.subtitle },
        { property: "og:title", content: `${i.title} | Descubra Maranhão` },
        { property: "og:description", content: i.subtitle },
      ],
    };
  },
  notFoundComponent: () => (
    <PageShell>
      <div className="mx-auto max-w-3xl px-5 py-40 text-center">
        <h1 className="font-display text-4xl">Roteiro não encontrado</h1>
        <Link
          to="/roteiros"
          className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          Ver roteiros
        </Link>
      </div>
    </PageShell>
  ),
  component: RoteiroPage,
});

function RoteiroPage() {
  const { itinerary } = Route.useLoaderData();
  const [doneDays, setDoneDays] = useState<number[]>([]);
  const [started, setStarted] = useState(false);
  const progress = Math.round((doneDays.length / itinerary.days_detail.length) * 100);
  const others = itineraries.filter((i) => i.slug !== itinerary.slug).slice(0, 3);

  return (
    <PageShell>
      <HeroFrame image={itinerary.image} alt={itinerary.title} className="min-h-[60vh]">
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-10 sm:px-10 sm:pb-12 lg:pb-14">
          <p className="text-xs font-semibold tracking-[0.22em] text-white/80 uppercase">
            Roteiro de {itinerary.days} {itinerary.days === 1 ? "dia" : "dias"}
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl text-white text-balance-title sm:text-5xl lg:text-6xl">
            {itinerary.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-white/85 text-pretty sm:text-lg">
            {itinerary.subtitle}
          </p>
          <p className="mt-4 text-sm font-medium text-turquoise">{itinerary.destinationsLabel}</p>
        </div>
      </HeroFrame>

      <section className="sticky top-18 z-30 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 lg:px-8">
          <div className="min-w-0">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="truncate">
                <span className="sm:hidden">
                  {doneDays.length}/{itinerary.days_detail.length} dias
                </span>
                <span className="hidden sm:inline">
                  Progresso do roteiro: {doneDays.length}/{itinerary.days_detail.length} dias
                </span>
              </span>
              <span>{progress}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-turquoise transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <button
            onClick={() => {
              setStarted(true);
              toast.success("Roteiro iniciado", {
                description: "Marque cada dia conforme for avançando.",
              });
            }}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition-colors sm:px-5 sm:text-sm",
              started ? "bg-secondary text-foreground" : "bg-primary text-primary-foreground",
            )}
          >
            <Play className="h-4 w-4 shrink-0" />
            <span className="sm:hidden">{started ? "Em andamento" : "Começar"}</span>
            <span className="hidden sm:inline">{started ? "Em andamento" : "Começar roteiro"}</span>
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:py-14 lg:px-8">
        <dl className="grid gap-4 sm:grid-cols-4">
          {[
            { label: "Duração", value: `${itinerary.days} dias` },
            { label: "Dificuldade", value: itinerary.difficulty },
            { label: "Lugares", value: `${itinerary.places}` },
            { label: "Estimativa", value: itinerary.budget },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <dt className="text-xs tracking-wide text-muted-foreground uppercase">{s.label}</dt>
              <dd className="mt-1.5 font-display text-xl">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-12 sm:pb-16 lg:px-8">
        <SectionHeading eyebrow="Dia a dia" title="Como a viagem acontece" />
        <ol className="relative space-y-6 border-l border-dashed border-border pl-6 sm:pl-10">
          {itinerary.days_detail.map((d) => {
            const complete = doneDays.includes(d.day);
            return (
              <li key={d.day} className="relative">
                <span
                  className={cn(
                    "absolute top-6 -left-[37px] grid h-8 w-8 place-items-center rounded-full text-xs font-bold ring-4 ring-background transition-colors sm:-left-[53px]",
                    complete ? "bg-forest text-white" : "bg-primary text-primary-foreground",
                  )}
                >
                  {complete ? <Check className="h-4 w-4" /> : d.day}
                </span>
                <article className="grid overflow-hidden rounded-2xl border border-border bg-card shadow-soft md:grid-cols-[1fr_1.3fr]">
                  <div className="relative aspect-16/10 md:aspect-auto md:min-h-[240px]">
                    <img
                      src={d.image}
                      alt={d.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute top-3 left-3 rounded-full bg-background/90 px-3 py-1 text-xs font-bold backdrop-blur-sm">
                      DIA {d.day}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-2xl">{d.title}</h3>
                    <p className="mt-1 text-sm font-medium text-lagoon">{d.route}</p>
                    <p className="mt-3 text-muted-foreground">{d.summary}</p>

                    <div className="mt-5 flex flex-wrap gap-4 text-sm">
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="h-4 w-4" /> {d.time}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Car className="h-4 w-4" /> {d.transport}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {d.places.map((p) => (
                        <span
                          key={p}
                          className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs"
                        >
                          <MapPin className="h-3 w-3" /> {p}
                        </span>
                      ))}
                    </div>

                    <p className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
                      <Utensils className="h-4 w-4 text-gold" /> {d.food}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-4">
                      <button
                        onClick={() =>
                          setDoneDays((prev) =>
                            prev.includes(d.day)
                              ? prev.filter((x) => x !== d.day)
                              : [...prev, d.day],
                          )
                        }
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-colors",
                          complete ? "bg-forest text-white" : "bg-secondary hover:bg-accent",
                        )}
                      >
                        <Check className="h-3.5 w-3.5" />{" "}
                        {complete ? "Dia concluído" : "Marcar como feito"}
                      </button>
                      <Link
                        to="/mapa"
                        className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold transition-colors hover:bg-secondary"
                      >
                        <MapPin className="h-3.5 w-3.5" /> Ver no mapa
                      </Link>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-12 sm:pb-16 lg:px-8">
        <div className="grid items-center gap-6 rounded-3xl bg-deep p-8 text-deep-foreground sm:grid-cols-[1fr_auto] lg:p-12">
          <div>
            <p className="inline-flex items-center gap-2 text-sm text-lagoon">
              <Wallet className="h-4 w-4" /> Estimativa demonstrativa
            </p>
            <h2 className="mt-2 font-display text-3xl">Quer ajustar esse roteiro ao seu jeito?</h2>
            <p className="mt-2 text-deep-foreground/70">
              Responda cinco perguntas e receba uma versão adaptada ao seu tempo, grupo e orçamento.
            </p>
          </div>
          <Link
            to="/planejar"
            className="inline-flex items-center justify-center rounded-full bg-turquoise px-6 py-3.5 text-sm font-semibold text-turquoise-foreground"
          >
            Monte minha viagem
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-8 lg:px-8">
        <SectionHeading title="Outros roteiros" />
        <div className="grid gap-5 sm:grid-cols-3">
          {others.map((i) => (
            <Link
              key={i.slug}
              to="/roteiros/$slug"
              params={{ slug: i.slug }}
              className="group relative block overflow-hidden rounded-2xl"
            >
              <div className="aspect-16/10 overflow-hidden">
                <img
                  src={i.image}
                  alt={i.title}
                  loading="lazy"
                  className="h-full w-full object-cover img-zoom"
                />
              </div>
              <div className="absolute inset-0 hero-scrim" />
              <span className="absolute bottom-4 left-4 font-display text-lg text-white">
                {i.title}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
