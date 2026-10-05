import { createFileRoute } from "@tanstack/react-router";
import { PageHero, PageShell } from "@/components/site/PageShell";
import { RouteCard, SectionHeading } from "@/components/site/cards";
import { img, itineraries } from "@/data/maranhao";

export const Route = createFileRoute("/roteiros/")({
  head: () => ({
    meta: [
      { title: "Roteiros no Maranhão | De 1 a 5 dias" },
      {
        name: "description",
        content:
          "Roteiros prontos pelo Maranhão: São Luís em 1 dia, Lençóis em 3 dias, Chapada das Mesas em 4 dias e Maranhão Essencial em 5 dias.",
      },
      { property: "og:title", content: "Roteiros no Maranhão" },
      {
        property: "og:description",
        content: "Viagens prontas com dia a dia, mapa e estimativa de custo.",
      },
    ],
  }),
  component: RoteirosPage,
});

function RoteirosPage() {
  return (
    <PageShell>
      <PageHero
        image={img.porDoSol}
        eyebrow="Roteiros"
        title="Viagens prontas para seguir"
        subtitle="Cada roteiro traz duração, dificuldade, lugares e estimativa de gastos."
      />
      <section className="mx-auto max-w-7xl px-5 py-12 sm:py-16 lg:px-8">
        <SectionHeading
          title="Escolha o seu ritmo"
          description="De um fim de semana nos Lençóis a cinco dias cruzando o estado."
        />
        <div className="grid gap-5 lg:grid-cols-2">
          {itineraries.map((i) => (
            <RouteCard key={i.slug} itinerary={i} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
