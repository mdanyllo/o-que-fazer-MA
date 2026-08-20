import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { MapExplorer } from "@/components/site/MapExplorer";

export const Route = createFileRoute("/mapa")({
  head: () => ({
    meta: [
      { title: "Mapa turístico do Maranhão — atrações, praias e passeios" },
      {
        name: "description",
        content:
          "Explore o Maranhão no mapa: atrações, restaurantes, hotéis, passeios, praias, natureza e cultura, com rota de um dia nos Lençóis.",
      },
      { property: "og:title", content: "Mapa turístico do Maranhão" },
      { property: "og:description", content: "Todos os pontos turísticos do estado em um mapa único." },
    ],
  }),
  component: MapaPage,
});

function MapaPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-5 pt-28 pb-16 lg:px-8">
        <div className="mb-8 grid gap-4 sm:flex sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-turquoise uppercase">Mapa turístico</p>
            <h1 className="font-display text-4xl text-balance-title sm:text-5xl">O Maranhão inteiro no mapa</h1>
            <p className="mt-3 text-muted-foreground">
              Filtre por tipo de lugar, toque nos pins para ver detalhes e visualize a rota do roteiro em destaque.
            </p>
          </div>
          <Link
            to="/planejar"
            className="inline-flex items-center gap-2 rounded-full bg-turquoise px-5 py-3 text-sm font-semibold text-turquoise-foreground"
          >
            <Sparkles className="h-4 w-4" /> Monte minha viagem
          </Link>
        </div>

        <MapExplorer />

        <p className="mt-6 text-xs text-muted-foreground">
          Mapa ilustrativo criado para este protótipo — as posições são aproximadas e não substituem navegação real.
        </p>
      </section>
    </PageShell>
  );
}
