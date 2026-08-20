import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { TripPlanner } from "@/components/site/TripPlanner";

export const Route = createFileRoute("/planejar")({
  head: () => ({
    meta: [
      { title: "Monte minha viagem pelo Maranhão" },
      {
        name: "description",
        content:
          "Conte como você quer viajar — dias, companhia, interesses, orçamento e transporte — e receba um roteiro pelo Maranhão.",
      },
      { property: "og:title", content: "Monte minha viagem pelo Maranhão" },
      { property: "og:description", content: "Conte como você quer viajar. A gente monta o caminho." },
    ],
  }),
  component: PlanejarPage,
});

function PlanejarPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-5 pt-32 pb-10 text-center lg:px-8">
        <p className="text-xs font-semibold tracking-[0.22em] text-turquoise uppercase">Planejador</p>
        <h1 className="mt-3 font-display text-4xl text-balance-title sm:text-5xl">Monte minha viagem</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Conte como você quer viajar. A gente monta o caminho.
        </p>
      </section>
      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <TripPlanner />
      </section>
    </PageShell>
  );
}
