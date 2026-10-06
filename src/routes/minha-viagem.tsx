import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";

// Provisório (etapa b): a página completa é feita na etapa (d).
export const Route = createFileRoute("/minha-viagem")({
  head: () => ({ meta: [{ title: "Minha viagem | Azulejo" }] }),
  component: MinhaViagemPage,
});

function MinhaViagemPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
        <h1 className="text-t1">Minha viagem</h1>
        <p className="mt-4 medida text-ink-suave">
          Favoritos e roteiros salvos entram na etapa (d).
        </p>
      </section>
    </PageShell>
  );
}
