import { GradeRevelar } from "@/components/movimento/Revelar";
import { createFileRoute } from "@tanstack/react-router";
import { CardDestino } from "@/components/azulejo/cards";
import { CabecalhoPagina, PageShell } from "@/components/site/PageShell";
import { destinos } from "@/data";

export const Route = createFileRoute("/destinos/")({
  head: () => ({
    meta: [
      { title: "Destinos | Azulejo" },
      {
        name: "description",
        content:
          "São Luís, Lençóis, Alcântara, Chapada das Mesas e mais: por onde começar no Maranhão.",
      },
    ],
  }),
  component: Destinos,
});

function Destinos() {
  return (
    <PageShell>
      <CabecalhoPagina
        titulo="Destinos"
        apoio="Do casario de São Luís às cachoeiras do sul do estado. Cada cidade com melhor época, como chegar e o que fazer."
      />
      <section
        aria-label="Lista de destinos"
        className="mx-auto max-w-7xl px-5 pb-16 md:px-12 md:pb-24"
      >
        <GradeRevelar colunas={3} className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {destinos.map((d) => (
            <CardDestino key={d.slug} destino={d} />
          ))}
        </GradeRevelar>
      </section>
    </PageShell>
  );
}
