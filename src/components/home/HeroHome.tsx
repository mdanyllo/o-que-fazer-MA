import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Camera, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useId, useState, type CSSProperties, type FormEvent } from "react";
import { botao } from "@/components/azulejo/botao";
import { Selo } from "@/components/azulejo/etiquetas";
import { Foto } from "@/components/azulejo/Foto";
import { TituloAnimado } from "@/components/movimento/TituloAnimado";
import { destinos } from "@/data";
import { cn } from "@/lib/utils";

type Modo = "cheguei" | "viajar";

const normalizar = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

const chip =
  "inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-full border-2 border-cobalto px-4 text-[0.9375rem] font-bold text-cobalto transition-colors duration-150 hover:bg-cobalto hover:text-sobre-cobalto";

const EASE = [0.22, 1, 0.36, 1] as const;

/** atraso de entrada em sequência, depois do título */
const seq = (ms: number) => ({ "--atraso": `${ms}ms` }) as CSSProperties;

export function HeroHome() {
  const [modo, setModo] = useState<Modo>("viajar");
  const [termo, setTermo] = useState("");
  const navigate = useNavigate();
  const idBusca = useId();

  function buscar(e: FormEvent) {
    e.preventDefault();
    const q = termo.trim();
    if (modo === "viajar" && q) {
      const alvo = normalizar(q);
      const destino = destinos.find(
        (d) => normalizar(d.nome).includes(alvo) || normalizar(d.regiao).includes(alvo),
      );
      if (destino) {
        navigate({ to: "/destinos/$slug", params: { slug: destino.slug } });
        return;
      }
    }
    navigate({
      to: "/explorar",
      search: { ...(q ? { q } : {}), ...(modo === "cheguei" ? { perto: true } : {}) },
    });
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-5 pt-8 pb-12 md:px-12 md:pt-14 md:pb-20 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
      <div className="flex min-w-0 flex-col gap-6">
        <Selo className="entra self-start px-3 py-1.5">Guia do Maranhão</Selo>
        <TituloAnimado
          texto="O Maranhão, um azulejo de cada vez."
          atraso={150}
          className="text-[clamp(2.75rem,1.6rem+4.2vw,5rem)] leading-[0.95] font-extrabold tracking-[-0.02em] text-pretty text-cobalto"
        />
        <p className="entra max-w-[34em] text-[1.1875rem] text-ink-suave" style={seq(650)}>
          Roteiros, cultura e comida contados por quem conhece o estado por dentro. Dos casarões de
          São Luís às lagoas dos Lençóis.
        </p>

        <div className="entra flex flex-wrap gap-3" style={seq(750)}>
          <AnimatePresence mode="popLayout" initial={false}>
            {modo === "cheguei" ? (
              <motion.div
                key="cheguei"
                className="flex flex-wrap gap-3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <Link to="/explorar" search={{ perto: true }} className={botao({ tamanho: "lg" })}>
                  Ver o que fazer perto
                </Link>
                <Link to="/mapa" className={botao({ variante: "secundario", tamanho: "lg" })}>
                  Abrir o mapa
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="viajar"
                className="flex flex-wrap gap-3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <Link to="/roteiros" className={botao({ tamanho: "lg" })}>
                  Ver roteiros
                </Link>
                <Link to="/planejar" className={botao({ variante: "secundario", tamanho: "lg" })}>
                  Planejar viagem
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* painel de busca: Cheguei / Vou viajar */}
        <div
          className="entra mt-2 flex flex-col gap-4 rounded-md bg-areia p-4 md:p-5"
          style={seq(850)}
        >
          <div
            role="group"
            aria-label="Como você está no Maranhão"
            className="grid grid-cols-2 rounded-md bg-louca p-1"
          >
            {(
              [
                ["cheguei", "Cheguei ao Maranhão", "Já cheguei"],
                ["viajar", "Vou viajar", "Vou viajar"],
              ] as const
            ).map(([valor, rotulo, curto]) => (
              <button
                key={valor}
                type="button"
                aria-pressed={modo === valor}
                onClick={() => setModo(valor)}
                className={cn(
                  "relative min-h-11 rounded-[6px] px-3 font-bold transition-colors duration-300 ease-saida",
                  modo === valor ? "text-sobre-cobalto" : "text-ink hover:text-cobalto",
                )}
              >
                {modo === valor && (
                  <motion.span
                    layoutId="indicador-modo"
                    aria-hidden
                    className="absolute inset-0 rounded-[6px] bg-cobalto"
                    transition={{ duration: 0.3, ease: EASE }}
                  />
                )}
                <span className="relative hidden sm:inline">{rotulo}</span>
                <span className="relative sm:hidden">{curto}</span>
              </button>
            ))}
          </div>

          <form role="search" onSubmit={buscar} className="flex flex-col gap-3">
            <label htmlFor={idBusca} className="sr-only">
              {modo === "cheguei" ? "O que tem perto de você?" : "Para onde você vai?"}
            </label>
            <div className="flex min-h-13 items-center rounded-md border-2 border-linha bg-louca transition-colors duration-150 focus-within:border-cobalto">
              <Search className="ml-4 size-5 shrink-0 text-ink-suave" aria-hidden />
              <input
                id={idBusca}
                type="search"
                value={termo}
                onChange={(e) => setTermo(e.target.value)}
                placeholder={
                  modo === "cheguei" ? "O que tem perto de você?" : "Para onde você vai?"
                }
                className="min-w-0 flex-1 bg-transparent px-3 text-base outline-none placeholder:text-ink-suave"
              />
              <button
                type="submit"
                className="group m-1 inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-[6px] bg-cobalto px-4 font-bold text-sobre-cobalto hover:bg-cobalto-forte"
                aria-label="Buscar"
              >
                <span className="hidden sm:inline">Buscar</span>
                <Search className="size-5 sm:hidden" aria-hidden />
                <ArrowRight
                  className="hidden size-4 transition-transform duration-150 group-hover:translate-x-0.5 sm:block"
                  aria-hidden
                />
              </button>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.ul
                key={modo}
                className="sem-barra -mx-4 flex gap-2 overflow-x-auto px-4 md:-mx-5 md:px-5 [&>li]:shrink-0"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                {modo === "cheguei" ? <SugestoesCheguei /> : <SugestoesViajar />}
              </motion.ul>
            </AnimatePresence>
          </form>
        </div>
      </div>

      <figure className="relative min-h-[300px] min-w-0 sm:min-h-[420px] lg:min-h-0">
        <Foto
          src="/images/home/hero.jpg"
          alt="Dunas brancas e lagoas azuis dos Lençóis Maranhenses vistas do alto"
          rotulo="Lençóis Maranhenses"
          cor="lagoa"
          prioridade
          entrada
          parallax
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="absolute inset-0 rounded-md"
        />
        <figcaption
          className="entra absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-sm bg-louca px-3 py-2 text-rotulo text-ink"
          style={seq(1100)}
        >
          <Camera className="size-4" aria-hidden /> Lençóis Maranhenses, Barreirinhas
        </figcaption>
      </figure>
    </section>
  );
}

function SugestoesCheguei() {
  return (
    <>
      <li>
        <Link to="/explorar" search={{ categoria: "lagoas-praias", perto: true }} className={chip}>
          Lagoas e praias
        </Link>
      </li>
      <li>
        <Link to="/explorar" search={{ categoria: "gastronomia", perto: true }} className={chip}>
          Onde comer
        </Link>
      </li>
      <li>
        <Link to="/explorar" search={{ q: "barco", perto: true }} className={chip}>
          Passeio de barco
        </Link>
      </li>
      <li>
        <Link to="/explorar" search={{ categoria: "natureza", perto: true }} className={chip}>
          Cachoeiras e trilhas
        </Link>
      </li>
    </>
  );
}

function SugestoesViajar() {
  return (
    <>
      <li>
        <Link to="/roteiros/$slug" params={{ slug: "lencois-em-4-dias" }} className={chip}>
          Lençóis em 4 dias
        </Link>
      </li>
      <li>
        <Link to="/destinos/$slug" params={{ slug: "carolina" }} className={chip}>
          Chapada das Mesas
        </Link>
      </li>
      <li>
        <Link to="/eventos" className={chip}>
          São João em junho
        </Link>
      </li>
      <li>
        <Link to="/roteiros/$slug" params={{ slug: "maranhao-essencial-7-dias" }} className={chip}>
          Uma semana no Maranhão
        </Link>
      </li>
    </>
  );
}
