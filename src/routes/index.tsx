import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, ArrowRight, Sparkles, Map as MapIcon, Star } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/site/PageShell";
import { CategoryCard, DestinationCard, ExperienceCard, RouteCard, SectionHeading, BusinessCard } from "@/components/site/cards";
import { MapExplorer } from "@/components/site/MapExplorer";
import {
  businesses,
  categories,
  destinations,
  experiences,
  img,
  itineraries,
  searchSuggestions,
} from "@/data/maranhao";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Descubra Maranhão — destinos, experiências e roteiros" },
      {
        name: "description",
        content:
          "Descubra o Maranhão: Lençóis Maranhenses, São Luís, Chapada das Mesas e mais. Experiências, mapas e roteiros prontos para planejar sua viagem.",
      },
      { property: "og:title", content: "Descubra Maranhão — destinos, experiências e roteiros" },
      {
        property: "og:description",
        content: "Experiências, destinos e roteiros para você viver o Maranhão de verdade.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [query, setQuery] = useState("");

  const featured = destinations.filter((d) =>
    ["barreirinhas", "chapada-das-mesas", "sao-luis", "atins", "santo-amaro", "alcantara"].includes(d.slug),
  );
  const cityCards = destinations.filter((d) =>
    ["sao-luis", "barreirinhas", "santo-amaro", "atins", "carolina", "alcantara"].includes(d.slug),
  );

  return (
    <PageShell transparentHeader>
      {/* HERO */}
      <section className="relative flex min-h-[92vh] items-end overflow-hidden">
        <img
          src={img.lencois}
          alt="Dunas e lagoas dos Lençóis Maranhenses ao entardecer"
          width={1920}
          height={1088}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 hero-scrim" />

        <div className="relative mx-auto w-full max-w-7xl px-5 pt-32 pb-14 lg:px-8 lg:pb-20">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold tracking-[0.18em] text-white uppercase backdrop-blur-sm">
            Maranhão · Brasil
          </p>
          <h1 className="max-w-4xl font-display text-5xl leading-[1.05] text-white text-balance-title sm:text-6xl lg:text-7xl">
            Descubra o Maranhão.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/85 sm:text-xl">
            Experiências, destinos e roteiros para você viver o Maranhão de verdade.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Buscando ideias de viagem", {
                description: query
                  ? `Protótipo: interpretaríamos “${query}” e montaríamos um roteiro.`
                  : "Protótipo: escolha uma sugestão para ver como funciona.",
              });
            }}
            className="mt-9 max-w-3xl rounded-3xl border border-white/25 bg-background/95 p-2.5 shadow-lift backdrop-blur-md"
          >
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 sm:flex">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-turquoise/15 text-turquoise">
                <Search className="h-5 w-5" />
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="O que você quer fazer?"
                aria-label="O que você quer fazer?"
                className="min-w-0 flex-1 bg-transparent py-3 text-base outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                className="col-span-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] sm:col-span-1"
              >
                <Sparkles className="h-4 w-4" /> Planejar
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto px-1 pt-2.5 pb-1">
              {searchSuggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setQuery(s)}
                  className="shrink-0 rounded-full border border-border px-3.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-turquoise hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </form>

          <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/75">
            <span>7 destinos mapeados</span>
            <span>+120 experiências demonstrativas</span>
            <span>6 roteiros prontos</span>
          </div>
        </div>
      </section>

      {/* EXPLORE */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <SectionHeading
          eyebrow="Explore o Maranhão"
          title="Cidades para começar a viagem"
          description="De capital histórica a vilas de areia dentro do parque — escolha por onde entrar no estado."
          action={
            <Link
              to="/destinos"
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary"
            >
              Ver todos os destinos <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cityCards.map((d) => (
            <DestinationCard key={d.slug} destination={d} />
          ))}
        </div>
      </section>

      {/* CATEGORIAS */}
      <section className="bg-sand/60 py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeading
            eyebrow="Por onde começar"
            title="O que você quer viver?"
            description="Escolha um interesse e veja tudo o que combina com ele."
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((c) => (
              <CategoryCard key={c.id} category={c} />
            ))}
          </div>
        </div>
      </section>

      {/* DESTINOS EM DESTAQUE */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <SectionHeading
          eyebrow="Seleção editorial"
          title="Destinos que você precisa conhecer"
          description="Os lugares que definem a paisagem maranhense, com experiências já mapeadas."
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((d, i) => (
            <div key={d.slug} className={i === 0 ? "md:col-span-2 lg:col-span-2" : ""}>
              <DestinationCard destination={d} size={i === 0 ? "md" : "md"} />
            </div>
          ))}
        </div>
      </section>

      {/* MAPA */}
      <section className="bg-deep py-20 text-deep-foreground">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mb-8 grid gap-4 sm:flex sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-turquoise uppercase">Mapa turístico</p>
              <h2 className="font-display text-3xl text-balance-title sm:text-4xl">
                Veja tudo no mapa antes de decidir
              </h2>
              <p className="mt-3 text-deep-foreground/70">
                Atrações, praias, restaurantes e hospedagens em um mapa único — com rotas prontas.
              </p>
            </div>
            <Link
              to="/mapa"
              className="inline-flex items-center gap-2 rounded-full bg-turquoise px-5 py-2.5 text-sm font-semibold text-turquoise-foreground"
            >
              <MapIcon className="h-4 w-4" /> Abrir mapa completo
            </Link>
          </div>
          <div className="rounded-3xl bg-background p-4 text-foreground shadow-lift lg:p-6">
            <MapExplorer compact />
          </div>
        </div>
      </section>

      {/* EXPERIÊNCIAS */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <SectionHeading
          eyebrow="Experiências"
          title="Para viver assim que chegar"
          action={
            <Link
              to="/experiencias"
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary"
            >
              Ver todas <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {experiences.slice(0, 4).map((e) => (
            <ExperienceCard key={e.id} experience={e} />
          ))}
        </div>
      </section>

      {/* ROTEIROS */}
      <section className="bg-sand/60 py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeading
            eyebrow="Roteiros"
            title="Viagens prontas para seguir"
            description="Dia a dia com deslocamentos, tempo estimado e onde comer."
            action={
              <Link
                to="/roteiros"
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-card"
              >
                Todos os roteiros <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          <div className="grid gap-5 lg:grid-cols-2">
            {itineraries.slice(0, 2).map((i) => (
              <RouteCard key={i.slug} itinerary={i} />
            ))}
          </div>
        </div>
      </section>

      {/* PLANEJADOR CTA */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl">
          <img src={img.porDoSol} alt="Pôr do sol nas dunas" loading="lazy" className="h-full w-full object-cover" />
          <div className="absolute inset-0 hero-scrim" />
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-xl px-6 py-10 sm:px-12">
              <h2 className="font-display text-3xl text-white text-balance-title sm:text-4xl">
                Conte como você quer viajar. A gente monta o caminho.
              </h2>
              <p className="mt-3 text-white/80">
                Cinco perguntas rápidas e um roteiro completo com mapa, experiências e estimativa de custo.
              </p>
              <Link
                to="/planejar"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-turquoise px-6 py-3.5 text-sm font-semibold text-turquoise-foreground transition-transform hover:scale-[1.03]"
              >
                <Sparkles className="h-4 w-4" /> Monte minha viagem
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* EMPRESAS */}
      <section className="mx-auto max-w-7xl px-5 pb-4 lg:px-8">
        <SectionHeading
          eyebrow="Local"
          title="Encontre quem faz acontecer"
          description="Pousadas, restaurantes, guias e agências que operam nos destinos."
          action={
            <Link
              to="/empresas"
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary"
            >
              Ver empresas <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="grid gap-4 md:grid-cols-2">
          {businesses.slice(0, 4).map((b) => (
            <BusinessCard key={b.id} business={b} />
          ))}
        </div>
        <p className="mt-6 inline-flex items-center gap-2 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-gold text-gold" /> Empresas, avaliações e preços são dados
          demonstrativos deste protótipo.
        </p>
      </section>
    </PageShell>
  );
}
