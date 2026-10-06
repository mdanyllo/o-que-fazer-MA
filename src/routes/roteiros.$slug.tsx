import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { CalendarDays, ChevronRight, Gauge, MapPin, Wallet } from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { botao } from "@/components/azulejo/botao";
import { CardRoteiro } from "@/components/azulejo/cards";
import { Favoritar } from "@/components/azulejo/Favoritar";
import { Foto } from "@/components/azulejo/Foto";
import { SecaoTitulo } from "@/components/azulejo/SecaoTitulo";
import { MapaInterativo } from "@/components/mapa/MapaInterativo";
import { LinhaDoTempo } from "@/components/paginas/LinhaDoTempo";
import { Pagina404 } from "@/components/site/Pagina404";
import { PageShell } from "@/components/site/PageShell";
import { getRoteiro, nomeDestino, pontosDoRoteiro, roteiros } from "@/data";
import { salvarRoteiro } from "@/lib/minha-viagem";

export const Route = createFileRoute("/roteiros/$slug")({
  loader: ({ params }) => {
    const roteiro = getRoteiro(params.slug);
    if (!roteiro) throw notFound();
    return { roteiro };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Roteiro não encontrado | Azulejo" }] };
    const r = loaderData.roteiro;
    return {
      meta: [
        { title: `${r.titulo} | Azulejo` },
        { name: "description", content: r.chamada },
        { property: "og:title", content: `${r.titulo} | Azulejo` },
        { property: "og:description", content: r.chamada },
      ],
    };
  },
  notFoundComponent: () => (
    <Pagina404
      titulo="Roteiro não encontrado"
      texto="Talvez ele tenha mudado de nome. Veja os roteiros prontos ou monte o seu."
    />
  ),
  component: PaginaRoteiro,
});

function PaginaRoteiro() {
  const { roteiro } = Route.useLoaderData();
  const navigate = useNavigate();
  const pontos = pontosDoRoteiro(roteiro.dias);
  const outros = roteiros.filter((r) => r.slug !== roteiro.slug).slice(0, 2);

  function usar() {
    salvarRoteiro({
      id: `pronto-${roteiro.slug}`,
      titulo: roteiro.titulo,
      origem: "pronto",
      baseSlug: roteiro.slug,
      resumo: roteiro.chamada,
      dias: roteiro.dias,
    });
    toast.success(`${roteiro.titulo} está em Minha viagem`, {
      description: "Lá você pode mudar a ordem, tirar e acrescentar paradas.",
      action: { label: "Abrir", onClick: () => navigate({ to: "/minha-viagem" }) },
    });
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-5 pt-8 md:px-12 md:pt-12">
        <nav aria-label="Você está em" className="text-legenda text-ink-suave">
          <ol className="flex items-center gap-1">
            <li>
              <Link
                to="/roteiros"
                className="underline-offset-4 hover:text-cobalto hover:underline"
              >
                Roteiros
              </Link>
            </li>
            <ChevronRight className="size-4" aria-hidden />
            <li aria-current="page" className="text-ink">
              {roteiro.titulo}
            </li>
          </ol>
        </nav>
        <header className="mt-6 flex flex-wrap items-end justify-between gap-6">
          <div className="flex max-w-4xl flex-col gap-4">
            <p className="text-legenda text-ink-suave">
              <span className="font-bold text-cobalto">{roteiro.dias.length} dias</span> ·{" "}
              {roteiro.destinos.map(nomeDestino).join(" → ")}
            </p>
            <h1 className="text-display text-cobalto">{roteiro.titulo}</h1>
            <p className="medida text-[1.1875rem] text-ink-suave">{roteiro.resumo}</p>
          </div>
          <div className="flex gap-2">
            <Favoritar
              tipo="roteiro"
              slug={roteiro.slug}
              nome={roteiro.titulo}
              className="border-2 border-linha"
            />
            <button type="button" onClick={usar} className={botao({ tamanho: "lg" })}>
              Usar este roteiro
            </button>
          </div>
        </header>
        <Foto
          src={roteiro.foto}
          alt={roteiro.titulo}
          rotulo={roteiro.titulo}
          prioridade
          className="mt-10 aspect-[4/3] rounded-md md:aspect-[21/9]"
        />
        <dl className="mt-6 grid gap-x-8 gap-y-2 rounded-md bg-areia p-5 sm:grid-cols-2 lg:grid-cols-4">
          <Fato
            icone={<CalendarDays className="size-5" />}
            rotulo="Duração"
            valor={`${roteiro.dias.length} dias`}
          />
          <Fato icone={<Gauge className="size-5" />} rotulo="Ritmo" valor={roteiro.ritmo} />
          <Fato
            icone={<MapPin className="size-5" />}
            rotulo="Melhor época"
            valor={roteiro.melhorEpoca}
          />
          <Fato
            icone={<Wallet className="size-5" />}
            rotulo="Custo estimado"
            valor={roteiro.custoEstimado}
          />
        </dl>
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-12 md:px-12 md:py-20 lg:grid-cols-[1.25fr_1fr]">
        <section aria-labelledby="dia-a-dia" className="min-w-0">
          <h2 id="dia-a-dia" className="mb-8 text-t1">
            Dia a dia
          </h2>
          <LinhaDoTempo dias={roteiro.dias} />
          <button type="button" onClick={usar} className={`${botao({ tamanho: "lg" })} mt-10`}>
            Usar este roteiro
          </button>
        </section>
        <aside aria-label="Mapa da rota" className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="mb-4 text-t3">Mapa da rota</h2>
          <MapaInterativo
            pontos={pontos}
            rota={pontos.map(({ lat, lng }) => ({ lat, lng }))}
            agrupar={false}
            className="h-[420px] rounded-md lg:h-[560px]"
          />
          <p className="mt-3 text-legenda text-ink-suave">
            A linha liga as paradas na ordem do roteiro. Não é o traçado exato da estrada.
          </p>
        </aside>
      </div>

      <section aria-labelledby="outros" className="bg-areia">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-12 md:px-12 md:py-20">
          <SecaoTitulo id="outros" titulo="Outros roteiros" />
          <div className="grid gap-6 md:grid-cols-2">
            {outros.map((r) => (
              <CardRoteiro key={r.slug} roteiro={r} />
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function Fato({ icone, rotulo, valor }: { icone: ReactNode; rotulo: string; valor: string }) {
  return (
    <div className="flex gap-3 py-2">
      <span className="mt-0.5 text-cobalto" aria-hidden>
        {icone}
      </span>
      <div>
        <dt className="text-rotulo">{rotulo}</dt>
        <dd className="text-base">{valor}</dd>
      </div>
    </div>
  );
}
