import type { CSSProperties } from "react";
import { TituloAnimado } from "@/components/movimento/TituloAnimado";
import { GradeRevelar } from "@/components/movimento/Revelar";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CalendarDays, Car, ChevronRight, MapPin } from "lucide-react";
import { useMemo, type ReactNode } from "react";
import { botao } from "@/components/azulejo/botao";
import { CardItem, CardRoteiro } from "@/components/azulejo/cards";
import { MarcaCategoria, PontoGuara, Tag } from "@/components/azulejo/etiquetas";
import { Favoritar } from "@/components/azulejo/Favoritar";
import { Foto } from "@/components/azulejo/Foto";
import { linkTexto, SecaoTitulo } from "@/components/azulejo/SecaoTitulo";
import { MapaInterativo } from "@/components/mapa/MapaInterativo";
import { FaixaAzulejoRolagem } from "@/components/movimento/FaixaAzulejoRolagem";
import { Pagina404 } from "@/components/site/Pagina404";
import { PageShell } from "@/components/site/PageShell";
import { FAIXAS, getDestino, itensDoDestino, roteirosQuePassamPor, type Item } from "@/data";

export const Route = createFileRoute("/destinos/$slug")({
  loader: ({ params }) => {
    const destino = getDestino(params.slug);
    if (!destino) throw notFound();
    return { destino };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Destino não encontrado | Azulejo" }] };
    const d = loaderData.destino;
    return {
      meta: [
        { title: `${d.nome}: o que fazer | Azulejo` },
        { name: "description", content: d.chamada },
        { property: "og:title", content: `${d.nome} | Azulejo` },
        { property: "og:description", content: d.chamada },
      ],
    };
  },
  notFoundComponent: () => (
    <Pagina404
      titulo="Destino não encontrado"
      texto="Talvez ele ainda não esteja no Azulejo. Veja a lista de destinos ou explore o mapa."
    />
  ),
  component: PaginaDestino,
});

const secao = "mx-auto flex max-w-7xl flex-col gap-8 px-5 py-12 md:px-12 md:py-20";

function PaginaDestino() {
  const { destino } = Route.useLoaderData();
  const todos = useMemo(() => itensDoDestino(destino.slug), [destino.slug]);
  const oQueFazer = todos.filter(
    (i) => i.categoria !== "hospedagem" && !(i.tipo === "lugar" && i.ficticio),
  );
  const ondeComer = todos.filter((i) => i.categoria === "gastronomia");
  const ondeFicar = todos.filter((i) => i.categoria === "hospedagem");
  const roteiros = roteirosQuePassamPor(destino.slug);
  const pontosMapa = todos.filter((i) => i.tipo === "lugar");

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-5 pt-8 md:px-12 md:pt-12">
        <nav aria-label="Você está em" className="text-legenda text-ink-suave">
          <ol className="flex items-center gap-1">
            <li>
              <Link
                to="/destinos"
                className="underline-offset-4 hover:text-cobalto hover:underline"
              >
                Destinos
              </Link>
            </li>
            <ChevronRight className="size-4" aria-hidden />
            <li aria-current="page" className="text-ink">
              {destino.nome}
            </li>
          </ol>
        </nav>
        <header className="mt-6 flex flex-wrap items-end justify-between gap-6">
          <div className="flex max-w-4xl flex-col gap-4">
            <p className="flex items-center gap-1.5 text-legenda text-ink-suave">
              <MapPin className="size-4" aria-hidden /> {destino.regiao}, Maranhão
            </p>
            <TituloAnimado texto={destino.nome} className="text-display text-pretty text-cobalto" />
            <p
              className="entra medida text-[1.1875rem] text-ink-suave"
              style={{ "--atraso": "500ms" } as CSSProperties}
            >
              {destino.chamada}
            </p>
          </div>
          <div className="flex gap-2">
            <Favoritar
              tipo="destino"
              slug={destino.slug}
              nome={destino.nome}
              className="border-2 border-linha"
            />
            <Link to="/planejar" className={botao()}>
              Planejar viagem
            </Link>
          </div>
        </header>
        <Foto
          src={destino.foto}
          alt={`${destino.nome}, ${destino.regiao}`}
          rotulo={destino.nome}
          prioridade
          entrada
          parallax
          className="mt-10 aspect-[4/3] rounded-md md:aspect-[21/9]"
        />
      </div>

      {/* resumo + fatos */}
      <section
        aria-label="Resumo"
        className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:px-12 md:py-20 lg:grid-cols-[1.4fr_1fr]"
      >
        <div className="flex flex-col gap-6">
          <p className="medida text-[1.1875rem]">{destino.resumo}</p>
          <div className="flex flex-wrap gap-2">
            {destino.tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
          <div>
            <h2 className="text-t2">Como chegar</h2>
            <ul className="mt-4 space-y-3">
              {destino.comoChegar.map((c) => (
                <li key={c} className="flex gap-3">
                  <PontoGuara className="mt-2.5" /> {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <dl className="h-fit divide-y divide-linha rounded-md bg-areia p-5 md:p-6">
          <Fato
            icone={<CalendarDays className="size-5" />}
            rotulo="Melhor época"
            valor={destino.melhorEpoca}
          />
          <Fato
            icone={<Car className="size-5" />}
            rotulo="Saindo de São Luís"
            valor={destino.tempoDeSaoLuis}
          />
          {destino.distanciaKm > 0 && (
            <Fato
              icone={<MapPin className="size-5" />}
              rotulo="Distância"
              valor={`Cerca de ${destino.distanciaKm} km da capital`}
            />
          )}
        </dl>
      </section>

      <FaixaAzulejoRolagem azulejo={40} />

      {oQueFazer.length > 0 && (
        <section aria-labelledby="fazer" className={secao}>
          <SecaoTitulo
            id="fazer"
            titulo={`O que fazer em ${destino.nome}`}
            acao={
              <Link to="/explorar" search={{ cidade: destino.slug }} className={linkTexto}>
                Ver no Explorar
              </Link>
            }
          />
          <GradeRevelar colunas={3} className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {oQueFazer
              .filter((i) => i.categoria !== "gastronomia" || i.tipo === "experiencia")
              .slice(0, 6)
              .map((i) => (
                <CardItem key={`${i.tipo}:${i.slug}`} item={i} />
              ))}
          </GradeRevelar>
        </section>
      )}

      {(ondeComer.length > 0 || ondeFicar.length > 0) && (
        <section aria-label="Onde comer e onde ficar" className="bg-areia">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-12 md:grid-cols-2 md:px-12 md:py-20">
            <ListaCurta
              titulo="Onde comer"
              itens={ondeComer}
              vazio="Ainda sem sugestões de onde comer aqui."
            />
            <ListaCurta
              titulo="Onde ficar"
              itens={ondeFicar}
              vazio="Ainda sem sugestões de hospedagem aqui."
            />
          </div>
        </section>
      )}

      {roteiros.length > 0 && (
        <section aria-labelledby="roteiros" className={secao}>
          <SecaoTitulo id="roteiros" titulo={`Roteiros que passam por ${destino.nome}`} />
          <GradeRevelar colunas={2} className="grid gap-6 md:grid-cols-2">
            {roteiros.map((r) => (
              <CardRoteiro key={r.slug} roteiro={r} />
            ))}
          </GradeRevelar>
        </section>
      )}

      {pontosMapa.length > 0 && (
        <section aria-labelledby="no-mapa" className={`${secao} pt-0 md:pt-0`}>
          <SecaoTitulo
            id="no-mapa"
            titulo="No mapa"
            apoio="Toque num pin para ver o nome e abrir o lugar."
            acao={
              <Link to="/mapa" className={linkTexto}>
                Abrir o mapa completo
              </Link>
            }
          />
          <MapaInterativo
            pontos={pontosMapa}
            card="completo"
            className="h-[420px] rounded-md md:h-[520px]"
          />
        </section>
      )}
    </PageShell>
  );
}

function Fato({ icone, rotulo, valor }: { icone: ReactNode; rotulo: string; valor: string }) {
  return (
    <div className="flex gap-3 py-3">
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

function ListaCurta({ titulo, itens, vazio }: { titulo: string; itens: Item[]; vazio: string }) {
  return (
    <div>
      <h2 className="text-t2">{titulo}</h2>
      {itens.length === 0 ? (
        <p className="mt-4 text-ink-suave">{vazio}</p>
      ) : (
        <ul className="mt-4">
          {itens.map((i) => (
            <li
              key={`${i.tipo}:${i.slug}`}
              className="relative flex items-start gap-3 border-t border-linha py-4"
            >
              <MarcaCategoria categoria={i.categoria} tamanho="sm" />
              <div className="min-w-0">
                <Link
                  to={i.href}
                  params={{ slug: i.slug }}
                  className="font-bold underline-offset-4 after:absolute after:inset-0 hover:text-cobalto hover:underline"
                >
                  {i.nome}
                </Link>
                <p className="text-base text-ink-suave">{i.resumo}</p>
                <p className="mt-1 flex gap-2">
                  <Tag>{FAIXAS[i.faixaPreco].simbolo}</Tag>
                  {i.ficticio && <Tag>Exemplo</Tag>}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
