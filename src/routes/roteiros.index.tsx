import { GradeRevelar } from "@/components/movimento/Revelar";
import { createFileRoute, Link } from "@tanstack/react-router";
import { botao } from "@/components/azulejo/botao";
import { CardRoteiro } from "@/components/azulejo/cards";
import { CabecalhoPagina, PageShell } from "@/components/site/PageShell";
import { roteiros } from "@/data";

export const Route = createFileRoute("/roteiros/")({
  head: () => ({
    meta: [
      { title: "Roteiros prontos | Azulejo" },
      {
        name: "description",
        content:
          "Roteiros dia a dia pelo Maranhão: São Luís, Lençóis, Santo Amaro e Chapada das Mesas.",
      },
    ],
  }),
  component: Roteiros,
});

function Roteiros() {
  return (
    <PageShell>
      <CabecalhoPagina
        titulo="Roteiros prontos"
        apoio="Dias contados, paradas escolhidas e tempo de estrada. Use como está ou mude o que quiser em Minha viagem."
      />
      <section
        aria-label="Lista de roteiros"
        className="mx-auto max-w-7xl px-5 pb-12 md:px-12 md:pb-20"
      >
        <GradeRevelar colunas={3} className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {roteiros.map((r) => (
            <CardRoteiro key={r.slug} roteiro={r} destaque />
          ))}
        </GradeRevelar>
      </section>
      <section
        aria-labelledby="sob-medida"
        className="mx-auto max-w-7xl px-5 pb-12 md:px-12 md:pb-22"
      >
        <div className="flex flex-wrap items-end justify-between gap-6 rounded-md bg-areia p-6 md:p-12">
          <div className="flex max-w-xl flex-col gap-2">
            <h2 id="sob-medida" className="text-t1">
              Nenhum serve direitinho?
            </h2>
            <p className="text-ink-suave">
              Responda cinco perguntas e a gente monta um roteiro do seu jeito.
            </p>
          </div>
          <Link to="/planejar" className={botao({ tamanho: "lg" })}>
            Planejar viagem
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
