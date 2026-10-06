import type { CSSProperties } from "react";
import { TituloAnimado } from "@/components/movimento/TituloAnimado";
import { GradeRevelar } from "@/components/movimento/Revelar";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Gauge } from "lucide-react";
import { useMemo } from "react";
import { CardItem, CardRoteiro } from "@/components/azulejo/cards";
import { corDaCategoria } from "@/components/azulejo/cores";
import { CardEmpresa, InfoPraticas } from "@/components/azulejo/detalhes";
import { MarcaCategoria, Tag } from "@/components/azulejo/etiquetas";
import { Favoritar } from "@/components/azulejo/Favoritar";
import { Foto } from "@/components/azulejo/Foto";
import { SecaoTitulo } from "@/components/azulejo/SecaoTitulo";
import { MapaInterativo } from "@/components/mapa/MapaInterativo";
import { PageShell } from "@/components/site/PageShell";
import { urlFoto } from "@/lib/imagens";
import {
  categoriaPorId,
  empresasDoDestino,
  experiencias,
  getDestino,
  getEmpresa,
  getItem,
  getLugar,
  nomeMes,
  proximos,
  roteirosQueIncluem,
  type Empresa,
  type Experiencia,
  type Item,
  type Lugar,
} from "@/data";

type Props = { tipo: "lugar"; dados: Lugar } | { tipo: "experiencia"; dados: Experiencia };

/** Página de um lugar ou de uma experiência. */
export function PaginaItem(props: Props) {
  const { tipo, dados } = props;
  const destino = getDestino(dados.destino);
  const categoria = categoriaPorId[dados.categoria];
  const cor = corDaCategoria(dados.categoria);
  const item = getItem(tipo, dados.slug) as Item;

  // lugares por onde a experiência passa
  const paradas =
    props.tipo === "experiencia"
      ? props.dados.lugares.map(getLugar).filter((l): l is Lugar => Boolean(l))
      : [];

  // empresas: as que oferecem a experiência, ou as que levam a este lugar
  const empresas: Empresa[] = useMemo(() => {
    if (props.tipo === "experiencia")
      return props.dados.empresas.map(getEmpresa).filter((e): e is Empresa => Boolean(e));
    const slugs = new Set(
      experiencias.filter((x) => x.lugares.includes(dados.slug)).flatMap((x) => x.empresas),
    );
    const daqui = [...slugs].map(getEmpresa).filter((e): e is Empresa => Boolean(e));
    if (daqui.length || props.dados.tipo !== "atrativo") return daqui;
    return empresasDoDestino(dados.destino).filter(
      (e) => e.tipo === "Guia" || e.tipo === "Agência",
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dados.slug]);

  const experienciasAqui =
    props.tipo === "lugar" ? experiencias.filter((x) => x.lugares.includes(dados.slug)) : [];
  const roteiros = roteirosQueIncluem(tipo, dados.slug);
  // vizinhos de verdade: fora do mesmo ponto e fora das paradas já listadas
  const perto = proximos(dados, 8)
    .filter((p) => p.km > 0.3 && !paradas.some((l) => l.slug === p.item.slug))
    .slice(0, 3);
  const pontosMapa = [
    item,
    ...paradas.map((l) => getItem("lugar", l.slug) as Item),
    ...perto.map((p) => p.item),
  ].filter((p, i, arr) => arr.findIndex((x) => x.lat === p.lat && x.lng === p.lng) === i);

  // galeria: a foto principal (ou o fallback) e até duas fotos que existem, do destino e dos vizinhos
  const extras = [
    ...(destino ? [{ src: destino.foto, rotulo: destino.nome }] : []),
    ...[...paradas, ...perto.map((p) => p.item)].map((x) => ({ src: x.foto, rotulo: x.nome })),
  ]
    .filter((g) => g.src !== dados.foto && urlFoto(g.src))
    .filter((g, i, arr) => arr.findIndex((x) => x.src === g.src) === i)
    .slice(0, 2);
  const galeria = [{ src: dados.foto, rotulo: dados.nome }, ...(extras.length === 2 ? extras : [])];

  const melhorEpoca =
    dados.mesesBons.length === 12
      ? "Ano todo"
      : `${nomeMes(dados.mesesBons[0]!)} a ${nomeMes(dados.mesesBons[dados.mesesBons.length - 1]!)}`;

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-5 pt-8 md:px-12 md:pt-12">
        <nav aria-label="Você está em" className="text-legenda text-ink-suave">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link
                to="/explorar"
                className="underline-offset-4 hover:text-cobalto hover:underline"
              >
                Explorar
              </Link>
            </li>
            {destino && (
              <>
                <ChevronRight className="size-4" aria-hidden />
                <li>
                  <Link
                    to="/destinos/$slug"
                    params={{ slug: destino.slug }}
                    className="underline-offset-4 hover:text-cobalto hover:underline"
                  >
                    {destino.nome}
                  </Link>
                </li>
              </>
            )}
            <ChevronRight className="size-4" aria-hidden />
            <li aria-current="page" className="text-ink">
              {dados.nome}
            </li>
          </ol>
        </nav>

        <header className="mt-6 flex flex-wrap items-end justify-between gap-6">
          <div className="flex max-w-4xl flex-col gap-4">
            <p className="flex items-center gap-2 text-legenda text-ink-suave">
              <MarcaCategoria categoria={dados.categoria} tamanho="sm" />
              {categoria.nome}
              {tipo === "experiencia" && <Tag>Experiência</Tag>}
              {"ficticio" in dados && dados.ficticio && <Tag>Exemplo</Tag>}
            </p>
            <TituloAnimado texto={dados.nome} className="text-display text-pretty text-cobalto" />
            <p
              className="entra medida text-[1.1875rem] text-ink-suave"
              style={{ "--atraso": "500ms" } as CSSProperties}
            >
              {dados.resumo}
            </p>
          </div>
          <Favoritar
            tipo={tipo}
            slug={dados.slug}
            nome={dados.nome}
            className="border-2 border-linha"
          />
        </header>

        {/* galeria editorial: uma grande e duas menores */}
        <div
          className={
            galeria.length > 1
              ? "mt-10 grid gap-3 md:grid-cols-[2fr_1fr] md:grid-rows-2"
              : "mt-10 grid"
          }
        >
          {galeria.map((g, i) => (
            <Foto
              key={g.src + i}
              src={g.src}
              alt={g.rotulo}
              rotulo={g.rotulo}
              cor={cor}
              prioridade={i === 0}
              entrada={i === 0}
              sizes={i === 0 ? "(min-width: 768px) 66vw, 100vw" : "(min-width: 768px) 33vw, 100vw"}
              className={
                i === 0 && galeria.length === 1
                  ? "aspect-[4/3] rounded-md md:aspect-[21/9]"
                  : i === 0
                    ? "aspect-[4/3] rounded-md md:row-span-2 md:aspect-auto md:min-h-[480px]"
                    : "hidden aspect-[4/3] rounded-md md:block md:aspect-auto"
              }
            />
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-12 md:px-12 md:py-20 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex min-w-0 flex-col gap-12">
          <section aria-labelledby="sobre">
            <h2 id="sobre" className="text-t2">
              Sobre
            </h2>
            <p className="mt-4 medida">{dados.descricao}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {dados.tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
          </section>

          {paradas.length > 0 && (
            <section aria-labelledby="paradas">
              <h2 id="paradas" className="text-t2">
                Por onde passa
              </h2>
              <ol className="mt-4">
                {paradas.map((l, i) => (
                  <li key={l.slug} className="flex items-center gap-4 border-t border-linha py-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-sm bg-cobalto text-rotulo text-sobre-cobalto">
                      {i + 1}
                    </span>
                    <Link
                      to="/lugares/$slug"
                      params={{ slug: l.slug }}
                      className="font-bold underline-offset-4 hover:text-cobalto hover:underline"
                    >
                      {l.nome}
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {empresas.length > 0 && (
            <section aria-labelledby="quem-leva">
              <h2 id="quem-leva" className="text-t2">
                {dados.categoria === "hospedagem" || dados.categoria === "gastronomia"
                  ? "Reservar"
                  : "Quem leva você"}
              </h2>
              <p className="mt-2 text-ink-suave">
                Empresas locais fictícias, para mostrar como a reserva vai funcionar.
              </p>
              <ul className="mt-4 flex flex-col gap-3">
                {empresas.map((e) => (
                  <CardEmpresa key={e.slug} empresa={e} oQue={dados.nome} />
                ))}
              </ul>
            </section>
          )}

          {experienciasAqui.length > 0 && (
            <section aria-labelledby="experiencias-aqui">
              <h2 id="experiencias-aqui" className="text-t2">
                Passeios que passam aqui
              </h2>
              <div className="mt-6 grid gap-8 sm:grid-cols-2">
                {experienciasAqui.map((x) => {
                  const it = getItem("experiencia", x.slug);
                  return it ? <CardItem key={x.slug} item={it} /> : null;
                })}
              </div>
            </section>
          )}
        </div>

        <aside className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
          <InfoPraticas
            info={dados.info}
            extra={
              <div className="flex gap-3 py-3">
                <Gauge className="mt-0.5 size-5 text-cobalto" aria-hidden />
                <div>
                  <dt className="text-rotulo">Melhor época</dt>
                  <dd className="text-base">
                    {melhorEpoca}
                    {props.tipo === "experiencia" &&
                      ` · dificuldade ${props.dados.dificuldade.toLowerCase()}`}
                  </dd>
                </div>
              </div>
            }
          />
          <MapaInterativo pontos={pontosMapa} agrupar={false} className="h-72 rounded-md" />
        </aside>
      </div>

      {roteiros.length > 0 && (
        <section aria-labelledby="roteiros-aqui" className="bg-areia">
          <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-12 md:px-12 md:py-20">
            <SecaoTitulo id="roteiros-aqui" titulo="Roteiros que passam aqui" />
            <GradeRevelar colunas={2} className="grid gap-6 md:grid-cols-2">
              {roteiros.slice(0, 4).map((r) => (
                <CardRoteiro key={r.slug} roteiro={r} />
              ))}
            </GradeRevelar>
          </div>
        </section>
      )}

      {perto.length > 0 && (
        <section
          aria-labelledby="perto"
          className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-12 md:px-12 md:py-20"
        >
          <SecaoTitulo id="perto" titulo="Perto daqui" apoio="Dá para encaixar no mesmo dia." />
          <GradeRevelar colunas={3} className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {perto.map(({ item: p }) => (
              <CardItem key={`${p.tipo}:${p.slug}`} item={p} />
            ))}
          </GradeRevelar>
        </section>
      )}
    </PageShell>
  );
}
