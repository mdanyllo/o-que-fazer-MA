import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Search,
  ArrowRight,
  Sparkles,
  Map as MapIcon,
  Star,
  Droplets,
  Route as RouteIcon,
} from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/site/PageShell";
import {
  BusinessCard,
  CategoryCard,
  DestinationCard,
  Eyebrow,
  ExperienceCard,
  RouteCard,
  SectionHeading,
  pillButton,
} from "@/components/site/cards";
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
      { title: "Descubra Maranhão | Destinos, experiências e roteiros" },
      {
        name: "description",
        content:
          "Descubra o Maranhão: Lençóis Maranhenses, São Luís, Chapada das Mesas e mais. Experiências, mapas e roteiros prontos para planejar sua viagem.",
      },
      { property: "og:title", content: "Descubra Maranhão | Destinos, experiências e roteiros" },
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
    ["barreirinhas", "sao-luis", "atins", "santo-amaro", "carolina"].includes(d.slug),
  );
  const cityCards = destinations.filter((d) =>
    ["sao-luis", "barreirinhas", "santo-amaro", "atins", "carolina", "alcantara"].includes(d.slug),
  );

  return (
    <PageShell>
      {/* HERO */}
      <section className="px-5 pt-32 sm:pt-40">
        <div className="mx-auto max-w-4xl text-center">
          <Eyebrow line={false} className="justify-center">
            Guia de viagem · Maranhão
          </Eyebrow>
          <h1 className="mt-6 font-display text-[clamp(2.4rem,1.4rem+4.4vw,4.25rem)] leading-[1.06] font-semibold tracking-[-0.03em] text-balance-title">
            Dunas, lagoas e azulejos.
            <br className="hidden sm:block" />{" "}
            <span className="text-muted-foreground">Descubra o Maranhão.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground text-pretty sm:text-lg">
            Experiências, destinos e roteiros para você viver o Maranhão de verdade, dos Lençóis à
            Chapada das Mesas.
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
            className="mx-auto mt-10 max-w-2xl text-left"
          >
            <div className="flex items-center gap-2 rounded-full border border-border bg-card p-1.5 pl-5 shadow-[0_10px_40px_-20px_rgb(0_0_0/0.25)]">
              <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="O que você quer fazer?"
                aria-label="O que você quer fazer?"
                className="min-w-0 flex-1 bg-transparent py-2 text-base outline-none placeholder:text-[#a29e9a]"
              />
              <button
                type="submit"
                className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-turquoise px-5 text-sm font-medium text-turquoise-foreground shadow-pill transition-colors hover:bg-[#1ea8b0]"
              >
                <Sparkles className="h-4 w-4" /> <span className="hidden sm:inline">Planejar</span>
              </button>
            </div>
            <div className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0">
              {searchSuggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setQuery(s)}
                  className="shrink-0 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs whitespace-nowrap text-muted-foreground transition-colors hover:border-turquoise hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </form>
        </div>

        <div className="relative mx-auto mt-14 max-w-[1310px] sm:mt-20">
          <div className="overflow-hidden rounded-3xl sm:rounded-4xl">
            <img
              src={img.lencois}
              alt="Dunas e lagoas dos Lençóis Maranhenses ao entardecer"
              width={1920}
              height={1088}
              className="aspect-4/5 w-full object-cover sm:aspect-21/9"
            />
          </div>
          {/* Cartões flutuantes sobre a foto */}
          <div className="glass absolute top-4 left-4 flex items-center gap-3 rounded-2xl border border-white/80 p-3 pr-4 shadow-lift sm:top-8 sm:left-8">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-turquoise text-turquoise-foreground">
              <Droplets className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold">Lagoa Azul</span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-gold text-gold" /> 4,9 · Lençóis Maranhenses
              </span>
            </span>
          </div>
          <div className="glass absolute right-4 bottom-4 hidden rounded-2xl border border-white/80 p-4 shadow-lift sm:right-8 sm:bottom-8 sm:block">
            <p className="text-xs text-muted-foreground">Melhor época para as lagoas</p>
            <p className="mt-0.5 font-display text-lg font-semibold">Julho a setembro</p>
          </div>
          <div className="glass absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-white/80 px-4 py-2 text-xs font-medium shadow-lift sm:hidden">
            <RouteIcon className="h-3.5 w-3.5" /> 6 roteiros prontos
          </div>
        </div>

        <dl className="mx-auto mt-10 grid max-w-3xl grid-cols-3 gap-4 text-center">
          {[
            ["7", "destinos mapeados"],
            ["+120", "experiências"],
            ["6", "roteiros prontos"],
          ].map(([n, label]) => (
            <div key={label}>
              <dt className="font-display text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
                {n}
              </dt>
              <dd className="mt-1 text-xs text-muted-foreground sm:text-sm">{label}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* CIDADES */}
      <section className="mx-auto max-w-7xl px-5 pt-24 sm:pt-32 lg:px-8">
        <SectionHeading
          eyebrow="Explore o Maranhão"
          title="Cidades para começar a viagem"
          description="De capital histórica a vilas de areia dentro do parque. Escolha por onde entrar no estado."
          action={
            <Link to="/destinos" className={pillButton}>
              Ver todos os destinos <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cityCards.map((d) => (
            <DestinationCard key={d.slug} destination={d} />
          ))}
        </div>
      </section>

      {/* CATEGORIAS */}
      <section className="mx-auto max-w-7xl px-5 pt-24 sm:pt-32 lg:px-8">
        <SectionHeading
          align="center"
          eyebrow="Por onde começar"
          title="O que você quer viver?"
          description="Escolha um interesse e veja tudo o que combina com ele."
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {categories.map((c) => (
            <CategoryCard key={c.id} category={c} />
          ))}
        </div>
      </section>

      {/* DESTINOS EM DESTAQUE */}
      <section className="mx-auto max-w-7xl px-5 pt-24 sm:pt-32 lg:px-8">
        <SectionHeading
          eyebrow="Seleção editorial"
          title="Destinos que você precisa conhecer"
          description="Os lugares que definem a paisagem maranhense, com experiências já mapeadas."
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((d, i) => (
            <div key={d.slug} className={i === 0 ? "md:col-span-2 lg:col-span-2" : ""}>
              <DestinationCard destination={d} />
            </div>
          ))}
        </div>
      </section>

      {/* MAPA */}
      <section className="mt-24 px-2 sm:mt-32 sm:px-3">
        <div className="mx-auto max-w-350 rounded-3xl bg-deep bg-stripes py-16 text-deep-foreground sm:rounded-4xl sm:py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <SectionHeading
              tone="dark"
              eyebrow="Mapa turístico"
              title="Veja tudo no mapa antes de decidir"
              description="Atrações, praias, restaurantes e hospedagens em um mapa único, com rotas prontas."
              action={
                <Link
                  to="/mapa"
                  className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full bg-turquoise px-5 text-sm font-medium text-turquoise-foreground shadow-pill"
                >
                  <MapIcon className="h-4 w-4" /> Abrir mapa completo
                </Link>
              }
            />
            <div className="rounded-3xl border border-white/10 bg-background p-3 text-foreground sm:p-5">
              <MapExplorer compact />
            </div>
          </div>
        </div>
      </section>

      {/* EXPERIÊNCIAS */}
      <section className="mx-auto max-w-7xl px-5 pt-24 sm:pt-32 lg:px-8">
        <SectionHeading
          eyebrow="Experiências"
          title="Para viver assim que chegar"
          action={
            <Link to="/experiencias" className={pillButton}>
              Ver todas <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {experiences.slice(0, 4).map((e) => (
            <ExperienceCard key={e.id} experience={e} />
          ))}
        </div>
      </section>

      {/* ROTEIROS */}
      <section className="mx-auto max-w-7xl px-5 pt-24 sm:pt-32 lg:px-8">
        <SectionHeading
          eyebrow="Roteiros"
          title="Viagens prontas para seguir"
          description="Dia a dia com deslocamentos, tempo estimado e onde comer."
          action={
            <Link to="/roteiros" className={pillButton}>
              Todos os roteiros <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="grid gap-4 lg:grid-cols-2">
          {itineraries.slice(0, 2).map((i) => (
            <RouteCard key={i.slug} itinerary={i} />
          ))}
        </div>
      </section>

      {/* EMPRESAS */}
      <section className="mx-auto max-w-7xl px-5 pt-24 sm:pt-32 lg:px-8">
        <SectionHeading
          eyebrow="Local"
          title="Encontre quem faz acontecer"
          description="Pousadas, restaurantes, guias e agências que operam nos destinos."
          action={
            <Link to="/empresas" className={pillButton}>
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
          <Star className="h-3.5 w-3.5 fill-gold text-gold" /> Empresas, avaliações e preços são
          dados demonstrativos deste protótipo.
        </p>
      </section>

      {/* CTA FINAL */}
      <section className="mx-auto max-w-7xl px-5 pt-24 sm:pt-32 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl sm:rounded-4xl">
          <img
            src={img.porDoSol}
            alt="Pôr do sol nas dunas"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-deep/55" />
          <div className="relative mx-auto max-w-2xl px-6 py-20 text-center sm:py-28">
            <Eyebrow tone="dark" line={false} className="justify-center">
              Planejador
            </Eyebrow>
            <h2 className="mt-6 font-display text-[clamp(1.75rem,1.15rem+2.1vw,2.75rem)] leading-tight text-white text-balance-title">
              Conte como você quer viajar. A gente monta o caminho.
            </h2>
            <p className="mt-4 text-white/75">
              Cinco perguntas rápidas e um roteiro completo com mapa, experiências e estimativa de
              custo.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/planejar"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-turquoise px-6 text-sm font-medium text-turquoise-foreground shadow-pill transition-colors hover:bg-[#1ea8b0]"
              >
                <Sparkles className="h-4 w-4" /> Monte minha viagem
              </Link>
              <Link
                to="/roteiros"
                className="glass inline-flex min-h-11 items-center gap-2 rounded-full border border-white/80 px-6 text-sm font-medium text-foreground"
              >
                Ver roteiros prontos
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
