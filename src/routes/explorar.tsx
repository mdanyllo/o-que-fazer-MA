import { AnimatePresence, motion } from "motion/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { List, LocateFixed, Map as MapIcon, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { botao } from "@/components/azulejo/botao";
import { CardItem } from "@/components/azulejo/cards";
import { Chip } from "@/components/azulejo/etiquetas";
import { PadraoAzulejo } from "@/components/azulejo/PadraoAzulejo";
import { MapaInterativo } from "@/components/mapa/MapaInterativo";
import { CabecalhoPagina, PageShell } from "@/components/site/PageShell";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  categorias,
  destinos,
  distanciaKm,
  FAIXAS,
  formatarDistancia,
  itens,
  MESES,
  nomeDestino,
  type FaixaPreco,
  type Item,
} from "@/data";
import { validarBuscaExplorar, type BuscaExplorar } from "@/lib/busca";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/explorar")({
  validateSearch: validarBuscaExplorar,
  head: () => ({
    meta: [
      { title: "O que fazer no Maranhão | Azulejo" },
      {
        name: "description",
        content:
          "Lugares e experiências do Maranhão com filtros por categoria, cidade, época, duração e preço.",
      },
    ],
  }),
  component: Explorar,
});

/** "Perto de mim" é simulado: usamos o Centro Histórico de São Luís como posição. */
const POSICAO_SIMULADA = { lat: -2.5297, lng: -44.3028, nome: "Centro Histórico de São Luís" };
const RAIO_PERTO_KM = 50;

const normalizar = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Mudança nos filtros: `undefined` remove o parâmetro da URL. */
type Mudanca = { [K in keyof BuscaExplorar]?: BuscaExplorar[K] | undefined };

const DURACOES = [
  { valor: "curta", rotulo: "Até 3 horas" },
  { valor: "meio-dia", rotulo: "Meio dia" },
  { valor: "dia", rotulo: "Dia inteiro" },
] as const;

function filtrar(busca: BuscaExplorar) {
  const q = busca.q ? normalizar(busca.q) : "";
  let lista: (Item & { km?: number })[] = itens.filter((i) => {
    if (busca.categoria && i.categoria !== busca.categoria) return false;
    if (busca.cidade && i.destino !== busca.cidade) return false;
    if (busca.epoca && !i.mesesBons.includes(busca.epoca as Item["mesesBons"][number]))
      return false;
    if (busca.preco && i.faixaPreco !== busca.preco) return false;
    if (busca.duracao) {
      if (i.horas <= 0) return false;
      if (busca.duracao === "curta" && i.horas >= 3.5) return false;
      if (busca.duracao === "meio-dia" && (i.horas < 3.5 || i.horas >= 6)) return false;
      if (busca.duracao === "dia" && i.horas < 6) return false;
    }
    if (q) {
      const alvo = normalizar([i.nome, i.resumo, nomeDestino(i.destino), ...i.tags].join(" "));
      if (!q.split(/\s+/).every((p) => alvo.includes(p))) return false;
    }
    return true;
  });
  if (busca.perto) {
    lista = lista
      .map((i) => ({ ...i, km: distanciaKm(POSICAO_SIMULADA, i) }))
      .filter((i) => i.km <= RAIO_PERTO_KM)
      .sort((a, b) => a.km - b.km);
  }
  return lista;
}

function Explorar() {
  const busca = Route.useSearch();
  const navigate = useNavigate({ from: "/explorar" });
  const resultado = useMemo(() => filtrar(busca), [busca]);
  const ver = busca.ver ?? "lista";

  const atualizar = (mudanca: Mudanca) =>
    navigate({
      search: (prev) => {
        const proximo: Record<string, unknown> = { ...prev, ...mudanca };
        for (const k of Object.keys(proximo)) if (proximo[k] === undefined) delete proximo[k];
        return proximo as BuscaExplorar;
      },
      replace: true,
      resetScroll: false,
    });

  const filtrosAtivos = (
    ["categoria", "cidade", "epoca", "duracao", "preco", "perto", "q"] as const
  ).filter((k) => busca[k] !== undefined).length;
  const limpar = () => navigate({ search: busca.ver ? { ver: busca.ver } : {}, replace: true });

  return (
    <PageShell>
      <CabecalhoPagina
        titulo="O que fazer no Maranhão"
        apoio="Lagoas, cachoeiras, casarões, passeios e onde comer. Filtre pelo que você quer viver e pela época da viagem."
        className="pb-6 md:pb-8"
      />

      <div className="sticky top-16 z-30 border-y border-linha bg-louca/95 backdrop-blur-sm md:top-20">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-5 py-3 md:px-12">
          <CampoBusca valor={busca.q ?? ""} aoMudar={(q) => atualizar({ q: q || undefined })} />
          <Chip
            ativo={Boolean(busca.perto)}
            onClick={() => atualizar({ perto: busca.perto ? undefined : true })}
          >
            <LocateFixed className="size-4" aria-hidden /> Perto de mim
          </Chip>
          <Drawer>
            <DrawerTrigger className={cn(botao({ variante: "secundario" }), "lg:hidden")}>
              <SlidersHorizontal /> Filtros
              {filtrosAtivos > 0 && (
                <span className="grid min-w-6 place-items-center rounded-full bg-cobalto px-1.5 text-rotulo text-sobre-cobalto">
                  {filtrosAtivos}
                </span>
              )}
            </DrawerTrigger>
            <DrawerContent className="z-[70] max-h-[88svh] border-linha bg-louca text-ink">
              <div className="overflow-y-auto px-5 pt-4 pb-2">
                <DrawerTitle className="text-t2">Filtros</DrawerTitle>
                <DrawerDescription className="mt-1 text-ink-suave">
                  {resultado.length} {resultado.length === 1 ? "resultado" : "resultados"}
                </DrawerDescription>
                <Filtros busca={busca} atualizar={atualizar} className="mt-6" />
              </div>
              <div className="flex gap-3 border-t border-linha p-4">
                <button
                  type="button"
                  onClick={limpar}
                  className={cn(botao({ variante: "fantasma" }), "flex-1")}
                >
                  Limpar
                </button>
                <DrawerClose className={cn(botao(), "flex-1")}>
                  Ver {resultado.length} resultados
                </DrawerClose>
              </div>
            </DrawerContent>
          </Drawer>
          <div
            role="group"
            aria-label="Modo de visualização"
            className="ml-auto inline-flex rounded-md border-2 border-linha p-1"
          >
            {(
              [
                ["lista", "Lista", <List key="l" className="size-5" />],
                ["mapa", "Mapa", <MapIcon key="m" className="size-5" />],
              ] as const
            ).map(([valor, rotulo, icone]) => (
              <button
                key={valor}
                type="button"
                aria-pressed={ver === valor}
                onClick={() => atualizar({ ver: valor === "lista" ? undefined : valor })}
                className={cn(
                  "inline-flex min-h-10 items-center gap-2 rounded-[6px] px-3 font-bold transition-colors duration-150",
                  ver === valor ? "bg-cobalto text-sobre-cobalto" : "hover:text-cobalto",
                )}
              >
                {icone}
                <span className="sr-only sm:not-sr-only">{rotulo}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-8 md:px-12 md:py-12 lg:grid-cols-[260px_1fr]">
        <aside aria-label="Filtros" className="hidden lg:block">
          <div className="sticky top-44">
            <Filtros busca={busca} atualizar={atualizar} />
            {filtrosAtivos > 0 && (
              <button
                type="button"
                onClick={limpar}
                className={cn(botao({ variante: "fantasma" }), "mt-6 -ml-3")}
              >
                <X /> Limpar filtros
              </button>
            )}
          </div>
        </aside>

        <section aria-label="Resultados" className="min-w-0">
          <p aria-live="polite" className="mb-6 text-ink-suave">
            <strong className="text-ink">{resultado.length}</strong>{" "}
            {resultado.length === 1 ? "lugar ou experiência" : "lugares e experiências"}
            {busca.perto && (
              <>
                {" "}
                a até {RAIO_PERTO_KM} km de você.{" "}
                <span className="text-legenda">
                  (Simulação: usando o {POSICAO_SIMULADA.nome} como sua localização.)
                </span>
              </>
            )}
          </p>

          {resultado.length === 0 ? (
            <Vazio limpar={limpar} />
          ) : ver === "mapa" ? (
            <MapaInterativo
              pontos={resultado}
              card="completo"
              rolagemZoom
              className="h-[68svh] min-h-[420px] rounded-md"
            />
          ) : (
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence mode="popLayout" initial={false}>
                {resultado.map((i, idx) => (
                  <motion.div
                    key={`${i.tipo}:${i.slug}`}
                    layout
                    className="grid"
                    initial={{ opacity: 0, y: 16, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{
                      duration: 0.35,
                      ease: [0.22, 1, 0.36, 1],
                      delay: Math.min(idx, 8) * 0.03,
                    }}
                  >
                    <CardItem
                      item={i}
                      {...(i.km !== undefined ? { nota: formatarDistancia(i.km) } : {})}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </div>
    </PageShell>
  );
}

function CampoBusca({ valor, aoMudar }: { valor: string; aoMudar: (q: string) => void }) {
  const [texto, setTexto] = useState(valor);
  const id = useId();
  useEffect(() => setTexto(valor), [valor]);
  // espera a pessoa parar de digitar para atualizar a URL
  useEffect(() => {
    if (texto === valor) return;
    const t = setTimeout(() => aoMudar(texto.trim()), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texto]);

  return (
    <div className="flex min-h-11 w-full items-center gap-2 rounded-md border-2 border-linha bg-louca px-3 focus-within:border-cobalto sm:w-72">
      <Search className="size-5 shrink-0 text-ink-suave" aria-hidden />
      <label htmlFor={id} className="sr-only">
        Buscar lugares e experiências
      </label>
      <input
        id={id}
        type="search"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Buscar: lagoa, juçara, barco…"
        className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-ink-suave"
      />
    </div>
  );
}

function Grupo({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3 text-rotulo">{titulo}</legend>
      {children}
    </fieldset>
  );
}

const classeSelect =
  "min-h-11 w-full rounded-md border-2 border-linha bg-louca px-3 text-base focus:border-cobalto focus:outline-none";

function Filtros({
  busca,
  atualizar,
  className,
}: {
  busca: BuscaExplorar;
  atualizar: (m: Mudanca) => void;
  className?: string;
}) {
  const idCidade = useId();
  const idEpoca = useId();
  return (
    <div className={cn("flex flex-col gap-8", className)}>
      <Grupo titulo="Categoria">
        <div className="flex flex-wrap gap-2">
          {categorias.map((c) => (
            <Chip
              key={c.id}
              cor={c.cor}
              ativo={busca.categoria === c.id}
              onClick={() => atualizar({ categoria: busca.categoria === c.id ? undefined : c.id })}
            >
              {c.nome}
            </Chip>
          ))}
        </div>
      </Grupo>
      <div className="flex flex-col gap-2">
        <label htmlFor={idCidade} className="text-rotulo">
          Cidade
        </label>
        <select
          id={idCidade}
          value={busca.cidade ?? ""}
          onChange={(e) => atualizar({ cidade: e.target.value || undefined })}
          className={classeSelect}
        >
          <option value="">Todas as cidades</option>
          {destinos.map((d) => (
            <option key={d.slug} value={d.slug}>
              {d.nome}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor={idEpoca} className="text-rotulo">
          Época da viagem
        </label>
        <select
          id={idEpoca}
          value={busca.epoca ?? ""}
          onChange={(e) =>
            atualizar({ epoca: e.target.value ? Number(e.target.value) : undefined })
          }
          className={classeSelect}
        >
          <option value="">Qualquer mês</option>
          {MESES.map((m, i) => (
            <option key={m} value={i + 1}>
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <Grupo titulo="Duração">
        <div className="flex flex-wrap gap-2">
          {DURACOES.map((d) => (
            <Chip
              key={d.valor}
              ativo={busca.duracao === d.valor}
              onClick={() =>
                atualizar({ duracao: busca.duracao === d.valor ? undefined : d.valor })
              }
            >
              {d.rotulo}
            </Chip>
          ))}
        </div>
      </Grupo>
      <Grupo titulo="Preço (faixas de exemplo)">
        <div className="flex flex-wrap gap-2">
          {([1, 2, 3] as FaixaPreco[]).map((p) => (
            <Chip
              key={p}
              ativo={busca.preco === p}
              onClick={() => atualizar({ preco: busca.preco === p ? undefined : p })}
              title={FAIXAS[p].texto}
            >
              {FAIXAS[p].simbolo}
              <span className="sr-only">: {FAIXAS[p].texto}</span>
            </Chip>
          ))}
        </div>
      </Grupo>
    </div>
  );
}

function Vazio({ limpar }: { limpar: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-md bg-areia p-8 md:p-12">
      <PadraoAzulejo azulejo={48} className="absolute -top-4 -right-8 h-36 w-48 opacity-60" />
      <h2 className="relative max-w-md text-t2">Nada encontrado com esses filtros</h2>
      <p className="relative mt-3 max-w-md text-ink-suave">
        Tente tirar algum filtro ou buscar por outra palavra. Lagoa, cachoeira, juçara e barco
        costumam dar bons resultados.
      </p>
      <button type="button" onClick={limpar} className={cn(botao(), "relative mt-6")}>
        Limpar filtros
      </button>
    </div>
  );
}
