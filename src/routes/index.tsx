import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { botao } from "@/components/azulejo/botao";
import {
  CardComida,
  CardDestino,
  CardItem,
  CardRoteiro,
  LinhaEvento,
} from "@/components/azulejo/cards";
import { Chip } from "@/components/azulejo/etiquetas";
import { Foto } from "@/components/azulejo/Foto";
import { FaixaAzulejo } from "@/components/azulejo/PadraoAzulejo";
import { linkTexto, SecaoTitulo } from "@/components/azulejo/SecaoTitulo";
import { HeroHome } from "@/components/home/HeroHome";
import { MapaPrevia } from "@/components/home/MapaPrevia";
import { PageShell } from "@/components/site/PageShell";
import {
  categoriaPorId,
  eventos,
  getDestino,
  getRoteiro,
  itens,
  type CategoriaId,
  type Destino,
  type Roteiro,
} from "@/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Azulejo — o Maranhão, um azulejo de cada vez" },
      {
        name: "description",
        content:
          "Roteiros, cultura e comida contados por quem conhece o Maranhão por dentro. Dos casarões de São Luís às lagoas dos Lençóis.",
      },
    ],
  }),
  component: Home,
});

const POR_ONDE_COMECAR: { slug: string; titulo: string; texto: string }[] = [
  {
    slug: "barreirinhas",
    titulo: "Lençóis Maranhenses",
    texto:
      "Dunas brancas e lagoas de água doce que enchem com as chuvas. A melhor época vai de junho a setembro.",
  },
  {
    slug: "sao-luis",
    titulo: "Centro Histórico de São Luís",
    texto: "Casarões cobertos de azulejos portugueses, Patrimônio Mundial da UNESCO desde 1997.",
  },
  {
    slug: "alcantara",
    titulo: "Alcântara",
    texto:
      "Cidade colonial do outro lado da baía de São Marcos, com igrejas e ruínas que se visitam num dia.",
  },
  {
    slug: "carolina",
    titulo: "Chapada das Mesas",
    texto: "Cachoeiras e morros em forma de mesa no sul do estado, perto de Carolina.",
  },
];

const CATEGORIAS_HOME: CategoriaId[] = ["lagoas-praias", "cultura", "natureza", "gastronomia"];

const secao = "mx-auto max-w-7xl px-5 py-12 md:px-12 md:py-20";

function Home() {
  const comecar = POR_ONDE_COMECAR.map((c) => ({ ...c, destino: getDestino(c.slug) })).filter(
    (c): c is typeof c & { destino: Destino } => Boolean(c.destino),
  );
  const [roteiroDestaque, ...outrosRoteiros] = [
    "lencois-em-4-dias",
    "3-dias-em-sao-luis",
    "chapada-das-mesas-em-5-dias",
    "maranhao-essencial-7-dias",
  ]
    .map(getRoteiro)
    .filter((r): r is Roteiro => Boolean(r));

  return (
    <PageShell>
      <HeroHome />

      <FaixaAzulejo azulejo={96} />

      {/* Por onde começar */}
      <section aria-labelledby="comecar" className={`${secao} flex flex-col gap-8`}>
        <SecaoTitulo
          id="comecar"
          titulo="Por onde começar"
          apoio="Quatro lugares que resumem o estado, do litoral ao sertão."
          acao={
            <Link to="/destinos" className={linkTexto}>
              Ver todos os destinos
            </Link>
          }
        />
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {comecar.map((c) => (
            <CardDestino key={c.slug} destino={c.destino} titulo={c.titulo} texto={c.texto} />
          ))}
        </div>
      </section>

      <ExperienciasPorCategoria />

      {/* Roteiros prontos */}
      <section aria-labelledby="roteiros" className={`${secao} flex flex-col gap-8`}>
        <SecaoTitulo
          id="roteiros"
          titulo="Roteiros prontos"
          apoio="Dias contados, paradas escolhidas e tempo de estrada. É só seguir."
          acao={
            <Link to="/roteiros" className={linkTexto}>
              Ver todos os roteiros
            </Link>
          }
        />
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
          {roteiroDestaque && <CardRoteiro roteiro={roteiroDestaque} destaque />}
          <div className="flex flex-col gap-6">
            {outrosRoteiros.map((r) => (
              <CardRoteiro key={r.slug} roteiro={r} />
            ))}
          </div>
        </div>
      </section>

      <MesDeBoi />

      {/* Mapa: a faixa forte da página, em cobalto */}
      <section aria-labelledby="mapa" className="bg-cobalto text-sobre-cobalto">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 md:px-12 md:py-22 lg:grid-cols-[1fr_1.3fr]">
          <div className="flex flex-col gap-4">
            <h2 id="mapa" className="text-t1">
              O Maranhão inteiro num mapa só
            </h2>
            <p className="max-w-[34em]">
              Lagoas, cachoeiras, casarões e onde comer, cada um no seu lugar. Toque num pin para
              ver o nome e abrir o que tem por lá.
            </p>
            <Link
              to="/mapa"
              className={`${botao({ tamanho: "lg" })} self-start bg-ouro text-sobre-ouro hover:bg-ouro hover:brightness-95`}
            >
              Explorar o mapa
            </Link>
          </div>
          <MapaPrevia />
        </div>
      </section>

      {/* O que comer primeiro */}
      <section aria-labelledby="comer" className={`${secao} flex flex-col gap-8`}>
        <SecaoTitulo
          id="comer"
          titulo="O que comer primeiro"
          apoio="Três pratos para provar antes de qualquer outra coisa."
        />
        <div className="grid gap-6 md:grid-cols-3">
          <CardComida
            nome="Juçara"
            texto="Fruto de palmeira, servido puro com farinha d'água e camarão seco."
            foto="/images/lugares/parque-da-jucara.jpg"
            cor="jucara"
          />
          <CardComida
            nome="Arroz de cuxá"
            texto="Arroz com vinagreira, gergelim e camarão seco. O prato mais maranhense que existe."
            foto="/images/categorias/gastronomia.jpg"
            cor="babacu"
          />
          <CardComida
            nome="Torta de camarão"
            texto="Assada no forno, presença certa nos almoços de família e nas festas."
            cor="ouro"
          />
        </div>
      </section>

      {/* Chamada para planejar */}
      <section
        aria-labelledby="planejar"
        className="mx-auto max-w-7xl px-5 pb-12 md:px-12 md:pb-22"
      >
        <div className="flex flex-wrap items-end justify-between gap-6 rounded-md bg-areia p-6 md:p-12">
          <div className="flex max-w-xl flex-col gap-2">
            <h2
              id="planejar"
              className="font-display text-[clamp(1.75rem,1.4rem+1.2vw,2.25rem)] leading-tight font-extrabold"
            >
              Monte sua viagem em cinco perguntas
            </h2>
            <p className="text-ink-suave">
              Dias, interesses, ritmo, orçamento e cidade de chegada. A gente sugere um roteiro, e
              você muda o que quiser.
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

function ExperienciasPorCategoria() {
  const [categoria, setCategoria] = useState<CategoriaId>("lagoas-praias");
  const lista = useMemo(
    () =>
      itens
        .filter((i) => i.categoria === categoria && !i.ficticio && i.horas > 0)
        // experiências primeiro, sem repetir o mesmo lugar
        .sort((a, b) => (a.tipo === b.tipo ? 0 : a.tipo === "experiencia" ? -1 : 1))
        .filter((i, idx, arr) => arr.findIndex((x) => x.foto === i.foto) === idx)
        .slice(0, 3),
    [categoria],
  );

  return (
    <section aria-labelledby="fazer" className="bg-areia">
      <div className={`${secao} flex flex-col gap-8`}>
        <SecaoTitulo
          id="fazer"
          titulo="O que fazer por aqui"
          apoio="Escolha um jeito de viajar e veja por onde começar."
          acao={
            <Link to="/explorar" search={{ categoria }} className={linkTexto}>
              Ver tudo em {categoriaPorId[categoria].nome.toLowerCase()}
            </Link>
          }
        />
        <div
          role="group"
          aria-label="Categorias"
          className="sem-barra -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0"
        >
          {CATEGORIAS_HOME.map((id) => (
            <Chip key={id} ativo={categoria === id} onClick={() => setCategoria(id)}>
              {categoriaPorId[id].nome}
            </Chip>
          ))}
        </div>
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((item) => (
            <CardItem key={`${item.tipo}:${item.slug}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function MesDeBoi() {
  // próximos eventos a partir do mês atual, dando a volta no ano
  const mesAtual = new Date().getMonth() + 1;
  const proximos = [...eventos]
    .sort((a, b) => ((a.mes - mesAtual + 12) % 12) - ((b.mes - mesAtual + 12) % 12))
    .slice(0, 3);

  return (
    <section aria-labelledby="boi" className="bg-areia">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 md:px-12 md:py-24 lg:grid-cols-2 lg:gap-16">
        <Foto
          src="/images/eventos/sao-joao.jpg"
          alt="Grupo de Bumba-meu-boi se apresentando à noite, com o boi bordado e brincantes com chapéus de fita"
          rotulo="Bumba-meu-boi no São João"
          cor="guara"
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="aspect-[4/5] rounded-md"
        />
        <div className="flex flex-col gap-5">
          <h2 id="boi" className="text-t1">
            Junho é mês de boi
          </h2>
          <p className="max-w-[34em]">
            No São João, São Luís inteira vira arraial. Cada grupo de Bumba-meu-boi tem seu sotaque,
            com ritmo, instrumentos e roupas próprios: matraca, zabumba, orquestra, baixada e
            costa-de-mão.
          </p>
          <p className="max-w-[34em] text-ink-suave">
            A gente conta onde assistir, o que vestir e como entender o que está acontecendo na
            roda.
          </p>
          <ul className="flex flex-wrap gap-2">
            {["Bumba-meu-boi", "Tambor de crioula", "Cacuriá", "Reggae"].map((t) => (
              <li key={t}>
                <Link
                  to="/eventos"
                  className="inline-flex min-h-11 items-center rounded-full border-2 border-cobalto px-4 text-[0.9375rem] font-bold text-cobalto transition-colors duration-150 hover:bg-cobalto hover:text-sobre-cobalto"
                >
                  {t}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <h3 className="text-t3">Próximos eventos</h3>
            <ul className="mt-3">
              {proximos.map((e) => (
                <LinhaEvento key={e.slug} evento={e} />
              ))}
            </ul>
            <Link to="/eventos" className={linkTexto}>
              Ver a agenda do ano
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
