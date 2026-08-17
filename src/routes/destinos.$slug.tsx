import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MapPin, CalendarRange, Navigation, ArrowRight, Sparkles } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { ExperienceCard, RouteCard, SectionHeading } from "@/components/site/cards";
import { destinations, experiences, getDestination, itineraries } from "@/data/maranhao";

export const Route = createFileRoute("/destinos/$slug")({
  loader: ({ params }) => {
    const destination = getDestination(params.slug);
    if (!destination) throw notFound();
    return { destination };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Destino não encontrado" }, { name: "robots", content: "noindex" }] };
    }
    const d = loaderData.destination;
    return {
      meta: [
        { title: `${d.name} — o que fazer | Descubra Maranhão` },
        { name: "description", content: d.tagline },
        { property: "og:title", content: `${d.name} — Descubra Maranhão` },
        { property: "og:description", content: d.tagline },
      ],
    };
  },
  notFoundComponent: DestinoNotFound,
  component: DestinoPage,
});

function DestinoNotFound() {
  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-5 py-40 text-center">
        <h1 className="font-display text-4xl">Destino não encontrado</h1>
        <p className="mt-3 text-muted-foreground">Talvez ele ainda não esteja no nosso mapa.</p>
        <Link
          to="/destinos"
          className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          Ver todos os destinos
        </Link>
      </div>
    </PageShell>
  );
}

function DestinoPage() {
  const { destination } = Route.useLoaderData();
  const related = experiences.filter(
    (e) => e.destinationSlug === destination.slug || destination.categories.includes(e.category),
  );
  const routes = itineraries.filter(
    (i) =>
      i.destinationsLabel.toLowerCase().includes(destination.name.toLowerCase()) ||
      i.tags.some((t) => destination.categories.includes(t.toLowerCase())),
  );
  const others = destinations.filter((d) => d.slug !== destination.slug).slice(0, 3);

  return (
    <PageShell transparentHeader>
      <section className="relative flex min-h-[85vh] items-end overflow-hidden">
        <img src={destination.image} alt={destination.name} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 hero-scrim" />
        <div className="relative mx-auto w-full max-w-7xl px-5 pt-32 pb-14 lg:px-8">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
            <MapPin className="h-3.5 w-3.5" /> {destination.state}
          </p>
          <h1 className="mt-4 font-display text-5xl text-white sm:text-6xl lg:text-7xl">{destination.name}</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/85">{destination.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#experiencias"
              className="inline-flex items-center gap-2 rounded-full bg-background px-6 py-3.5 text-sm font-semibold text-foreground transition-transform hover:scale-[1.03]"
            >
              Explorar destino <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              to="/planejar"
              className="inline-flex items-center gap-2 rounded-full bg-turquoise px-6 py-3.5 text-sm font-semibold text-turquoise-foreground transition-transform hover:scale-[1.03]"
            >
              <Sparkles className="h-4 w-4" /> Montar roteiro
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="font-display text-3xl">Sobre {destination.name}</h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{destination.description}</p>
            <div className="mt-8 flex flex-wrap gap-2">
              {destination.categories.map((c) => (
                <span key={c} className="rounded-full bg-secondary px-3.5 py-1.5 text-sm capitalize">
                  {c.replace("-", " ")}
                </span>
              ))}
            </div>
          </div>
          <dl className="grid gap-4 self-start rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-start gap-3">
              <CalendarRange className="mt-0.5 h-5 w-5 shrink-0 text-turquoise" />
              <div>
                <dt className="text-sm text-muted-foreground">Melhor época</dt>
                <dd className="font-semibold">{destination.bestTime}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Navigation className="mt-0.5 h-5 w-5 shrink-0 text-turquoise" />
              <div>
                <dt className="text-sm text-muted-foreground">Como chegar</dt>
                <dd className="font-semibold">{destination.distance}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-turquoise" />
              <div>
                <dt className="text-sm text-muted-foreground">Experiências mapeadas</dt>
                <dd className="font-semibold">{destination.experiences}</dd>
              </div>
            </div>
            <Link
              to="/mapa"
              className="mt-2 rounded-full bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground"
            >
              Ver no mapa
            </Link>
          </dl>
        </div>
      </section>

      <section id="experiencias" className="bg-sand/60 py-16 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeading eyebrow="Não deixe de conhecer" title={`Experiências em ${destination.name}`} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {destination.highlights.map((h) => (
              <article
                key={h.name}
                className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft card-lift"
              >
                <div className="aspect-16/10 overflow-hidden">
                  <img src={h.image} alt={h.name} loading="lazy" className="h-full w-full object-cover img-zoom" />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-xl">{h.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{h.description}</p>
                  <p className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="rounded-full bg-secondary px-2.5 py-1">Meio período</span>
                    <span className="rounded-full bg-secondary px-2.5 py-1">Guia local</span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <SectionHeading title="Experiências relacionadas" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.slice(0, 4).map((e) => (
              <ExperienceCard key={e.id} experience={e} />
            ))}
          </div>
        </section>
      )}

      {routes.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-8">
          <SectionHeading title={`Roteiros com ${destination.name}`} />
          <div className="grid gap-5 lg:grid-cols-2">
            {routes.slice(0, 2).map((i) => (
              <RouteCard key={i.slug} itinerary={i} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-5 pb-8 lg:px-8">
        <SectionHeading title="Continue explorando" />
        <div className="grid gap-5 sm:grid-cols-3">
          {others.map((d) => (
            <Link
              key={d.slug}
              to="/destinos/$slug"
              params={{ slug: d.slug }}
              className="group relative block overflow-hidden rounded-2xl"
            >
              <div className="aspect-16/10 overflow-hidden">
                <img src={d.image} alt={d.name} loading="lazy" className="h-full w-full object-cover img-zoom" />
              </div>
              <div className="absolute inset-0 hero-scrim" />
              <span className="absolute bottom-4 left-4 font-display text-xl text-white">{d.name}</span>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
