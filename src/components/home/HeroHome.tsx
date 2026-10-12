import { Link, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useEffect, useId, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { Selo } from "@/components/azulejo/etiquetas";
import { PadraoAzulejo } from "@/components/azulejo/PadraoAzulejo";
import { TituloAnimado } from "@/components/movimento/TituloAnimado";
import { CarrosselHero } from "./CarrosselHero";
import { destinos } from "@/data";
import { cn } from "@/lib/utils";

type Modo = "cheguei" | "viajar";

const normalizar = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

const chip =
  "inline-flex min-h-11 items-center font-bold text-cobalto md:min-h-8 underline underline-offset-4 transition-colors duration-150 hover:text-cobalto-forte";

const EASE = [0.22, 1, 0.36, 1] as const;

/** atraso de entrada em sequência, depois do título */
const seq = (ms: number) => ({ "--atraso": `${ms}ms` }) as CSSProperties;

export function HeroHome() {
  const [modo, setModo] = useState<Modo>("viajar");
  const [termo, setTermo] = useState("");
  const navigate = useNavigate();
  const idBusca = useId();
  const camadas = useCamadas();

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
    <section
      ref={camadas.ref}
      className="relative overflow-hidden lg:grid lg:min-h-[720px] lg:grid-cols-[calc(520px+(100%-1080px)/2.3)_minmax(0,1fr)]"
    >
      {/* esquerda: texto, cartão de busca e "Mais procurados" */}
      <motion.div
        style={camadas.estilo("texto")}
        className="relative z-10 flex min-w-0 flex-col justify-center gap-6 px-[clamp(20px,5vw,80px)] pt-8 pb-12 md:pt-12 lg:pt-[52px] lg:pr-[clamp(20px,3vw,40px)] lg:pb-[72px]"
      >
        <TituloAnimado
          texto={"O Maranhão,\num azulejo de\ncada vez"}
          final={<span className="text-guara">.</span>}
          atraso={150}
          linhasFixas
          className="max-w-[9.5em] text-[clamp(48px,6.4vw,104px)] leading-[0.92] font-extrabold tracking-[-0.03em] text-cobalto"
        />
        <p className="entra max-w-[30em] text-[1.1875rem] text-ink-suave" style={seq(650)}>
          Roteiros, cultura e comida contados por quem conhece o estado por dentro. Dos casarões de
          São Luís às lagoas dos Lençóis.
        </p>

        {/* cartão: Já estou no Maranhão / Vou viajar + busca */}
        <div
          className="entra flex max-w-[560px] flex-col gap-3 rounded-[10px] border border-linha bg-white p-2 noite:bg-areia"
          style={seq(800)}
        >
          <div
            role="group"
            aria-label="Momento da viagem"
            className="flex gap-1 rounded-[8px] bg-areia p-1 noite:bg-louca"
          >
            {(
              [
                ["cheguei", "Já estou no Maranhão", "Já estou aqui"],
                ["viajar", "Vou viajar", "Vou viajar"],
              ] as const
            ).map(([valor, rotulo, curto]) => (
              <button
                key={valor}
                type="button"
                aria-pressed={modo === valor}
                onClick={() => setModo(valor)}
                className={cn(
                  "relative min-h-11 flex-1 rounded-[6px] px-3 text-[0.9375rem] font-bold transition-colors duration-300 ease-saida",
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

          <form role="search" onSubmit={buscar} className="flex items-center gap-2 pl-3">
            <Search className="size-5 shrink-0 text-ink-suave" aria-hidden />
            <label htmlFor={idBusca} className="sr-only">
              {modo === "cheguei" ? "O que tem perto de você?" : "Para onde você vai?"}
            </label>
            <input
              id={idBusca}
              type="search"
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              placeholder={modo === "cheguei" ? "O que tem perto de você?" : "Para onde você vai?"}
              className="min-h-12 min-w-0 flex-1 bg-transparent text-base outline-offset-2 placeholder:text-ink-suave"
            />
            <button
              type="submit"
              className="min-h-12 shrink-0 rounded-[8px] bg-cobalto px-5 font-bold text-sobre-cobalto transition-colors duration-150 hover:bg-cobalto-forte"
            >
              Buscar
            </button>
          </form>
        </div>

        <div className="entra min-h-6" style={seq(950)}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={modo}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.9375rem] lg:flex-nowrap lg:whitespace-nowrap"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <span className="text-ink-suave">
                {modo === "cheguei" ? "Perto de você:" : "Mais procurados:"}
              </span>
              {modo === "cheguei" ? <SugestoesCheguei /> : <SugestoesViajar />}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* direita: painel cobalto até a borda e carrossel de destaques */}
      <div className="relative flex min-w-0 items-center px-5 pt-20 pb-6 md:px-12 lg:py-[clamp(48px,5vw,80px)] lg:pr-[clamp(40px,6vw,96px)] lg:pl-0">
        <div
          aria-hidden
          className="entra-painel absolute inset-0 overflow-hidden bg-painel lg:left-[24%] lg:rounded-l-[24px]"
        >
          <motion.div
            style={camadas.estilo("padrao")}
            className="absolute -inset-y-[20%] inset-x-0"
          >
            <PadraoAzulejo azulejo={30} className="absolute inset-0 opacity-[0.12]" />
          </motion.div>
        </div>
        <motion.div
          style={camadas.estilo("simbolo")}
          className="absolute top-[clamp(16px,2vw,24px)] right-[clamp(16px,2vw,24px)]"
        >
          <img
            src="/brand/azulejo-simbolo.svg"
            alt=""
            width={48}
            height={48}
            className="entra size-12"
            style={seq(1000)}
          />
        </motion.div>
        <motion.div style={camadas.estilo("foto")} className="relative w-full">
          <CarrosselHero />
        </motion.div>
      </div>
    </section>
  );
}

type Camada = "texto" | "padrao" | "simbolo" | "foto";

/**
 * Parallax em camadas enquanto o hero sai da tela: o padrão do painel fica para trás,
 * a foto sobe um pouco mais rápido que a página e o símbolo mais ainda, girando.
 * O texto desce devagar. Desligado com movimento reduzido e antes de montar.
 */
function useCamadas() {
  const ref = useRef<HTMLElement>(null);
  const reduzido = useReducedMotion();
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const valores: Record<Camada, Record<string, MotionValue>> = {
    texto: { y: useTransform(p, [0, 1], [0, 60]) },
    padrao: { y: useTransform(p, [0, 1], ["0%", "16%"]) },
    foto: { y: useTransform(p, [0, 1], [0, -70]) },
    simbolo: {
      y: useTransform(p, [0, 1], [0, -160]),
      rotate: useTransform(p, [0, 1], [0, 90]),
    },
  };
  const ligado = montado && !reduzido;
  return { ref, estilo: (c: Camada) => (ligado ? valores[c] : {}) };
}

function SugestoesCheguei() {
  return (
    <>
      <Link to="/explorar" search={{ categoria: "lagoas-praias", perto: true }} className={chip}>
        Lagoas e praias
      </Link>
      <Link to="/explorar" search={{ categoria: "gastronomia", perto: true }} className={chip}>
        Onde comer
      </Link>
      <Link to="/explorar" search={{ q: "barco", perto: true }} className={chip}>
        Passeio de barco
      </Link>
    </>
  );
}

function SugestoesViajar() {
  return (
    <>
      <Link to="/roteiros/$slug" params={{ slug: "lencois-em-4-dias" }} className={chip}>
        Lençóis em 4 dias
      </Link>
      <Link to="/destinos/$slug" params={{ slug: "carolina" }} className={chip}>
        Chapada das Mesas
      </Link>
      <Link to="/eventos" className={chip}>
        São João em junho
      </Link>
    </>
  );
}
