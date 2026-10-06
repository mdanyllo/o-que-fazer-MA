import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";

// Provisório (etapa b): a página completa é feita na etapa (d).
export const Route = createFileRoute("/explorar")({
  head: () => ({ meta: [{ title: "O que fazer no Maranhão | Azulejo" }] }),
  component: ExplorarPage,
});

function ExplorarPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
        <h1 className="text-t1">O que fazer no Maranhão</h1>
        <p className="mt-4 medida text-ink-suave">
          Lugares e experiências com filtros e mapa entram na etapa (d).
        </p>
      </section>
    </PageShell>
  );
}
