import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHero, PageShell } from "@/components/site/PageShell";
import { BusinessCard, SectionHeading } from "@/components/site/cards";
import { cn } from "@/lib/utils";
import { businesses, img } from "@/data/maranhao";

export const Route = createFileRoute("/empresas")({
  head: () => ({
    meta: [
      { title: "Empresas locais no Maranhão — pousadas, guias e agências" },
      {
        name: "description",
        content:
          "Encontre pousadas, restaurantes, agências, guias e transfers que operam nos destinos maranhenses. Perfis demonstrativos.",
      },
      { property: "og:title", content: "Encontre quem faz acontecer" },
      { property: "og:description", content: "Pousadas, restaurantes, guias e agências dos destinos do Maranhão." },
    ],
  }),
  component: EmpresasPage,
});

const cats = ["Todas", "Hotéis", "Restaurantes", "Agências", "Guias", "Transfers", "Passeios"] as const;

function EmpresasPage() {
  const [cat, setCat] = useState<string>("Todas");
  const list = cat === "Todas" ? businesses : businesses.filter((b) => b.category === cat);

  return (
    <PageShell transparentHeader>
      <PageHero
        image={img.hospedagem}
        eyebrow="Local"
        title="Encontre quem faz acontecer"
        subtitle="Quem recebe, guia, transporta e alimenta quem visita o Maranhão."
      />

      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="flex flex-wrap gap-2">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                cat === c
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-10">
          <SectionHeading title={`${list.length} negócios locais`} description="Perfis e avaliações demonstrativos." />
          <div className="grid gap-4 lg:grid-cols-2">
            {list.map((b) => (
              <BusinessCard key={b.id} business={b} />
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
