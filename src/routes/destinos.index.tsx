import { createFileRoute } from "@tanstack/react-router";
import { PageHero, PageShell } from "@/components/site/PageShell";
import { DestinationCard, SectionHeading } from "@/components/site/cards";
import { destinations, img } from "@/data/maranhao";

export const Route = createFileRoute("/destinos/")({
  head: () => ({
    meta: [
      { title: "Destinos do Maranhão | Cidades, parques e vilas" },
      {
        name: "description",
        content:
          "Conheça São Luís, Barreirinhas, Lençóis Maranhenses, Atins, Santo Amaro, Alcântara e a Chapada das Mesas.",
      },
      { property: "og:title", content: "Destinos do Maranhão" },
      {
        property: "og:description",
        content: "Cidades, parques e vilas para explorar no Maranhão.",
      },
    ],
  }),
  component: DestinosPage,
});

function DestinosPage() {
  return (
    <PageShell>
      <PageHero
        image={img.santoAmaro}
        eyebrow="Destinos"
        title="Todo o Maranhão em um só lugar"
        subtitle="Do centro histórico da capital às dunas do parque e às cachoeiras do sul do estado."
      />
      <section className="mx-auto max-w-7xl px-5 py-12 sm:py-16 lg:px-8">
        <SectionHeading
          title="Escolha por onde começar"
          description={`${destinations.length} destinos mapeados com experiências, mapas e roteiros.`}
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((d) => (
            <DestinationCard key={d.slug} destination={d} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
