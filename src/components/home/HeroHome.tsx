import { Link, useNavigate } from "@tanstack/react-router";
import { Camera, Search } from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { botao } from "@/components/azulejo/botao";
import { Selo } from "@/components/azulejo/etiquetas";
import { Foto } from "@/components/azulejo/Foto";
import { destinos } from "@/data";
import { cn } from "@/lib/utils";

type Modo = "cheguei" | "viajar";

const normalizar = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

const chip =
  "inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-full border-2 border-cobalto px-4 text-[0.9375rem] font-bold text-cobalto transition-colors duration-150 hover:bg-cobalto hover:text-sobre-cobalto";

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
    <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 pt-8 pb-12 md:px-12 md:pt-12 md:pb-20 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
      <div className="flex min-w-0 flex-col gap-6">
        <Selo className="self-start px-3 py-1.5">Guia do Maranhão</Selo>
        <h1 className="text-display text-cobalto">O Maranhão, um azulejo de cada vez.</h1>
        <p className="max-w-[34em] text-[1.1875rem] text-ink-suave">
          Roteiros, cultura e comida contados por quem conhece o estado por dentro. Dos casarões de
          São Luís às lagoas dos Lençóis.
        </p>

        {/* Cheguei / Vou viajar */}
        <div
          role="group"
          aria-label="Como você está no Maranhão"
          className="inline-flex self-start rounded-md border-2 border-linha p-1"
        >
          {(
            [
              ["cheguei", "Cheguei ao Maranhão"],
              ["viajar", "Vou viajar"],
            ] as const
          ).map(([valor, rotulo]) => (
            <button
              key={valor}
              type="button"
              aria-pressed={modo === valor}
              onClick={() => setModo(valor)}
              className={cn(
                "min-h-11 rounded-[6px] px-4 font-bold transition-colors duration-300 ease-saida",
                modo === valor ? "bg-cobalto text-sobre-cobalto" : "text-ink hover:text-cobalto",
              )}
            >
              {rotulo}
            </button>
          ))}
        </div>

        <form role="search" onSubmit={buscar} className="flex flex-col gap-3">
          <label htmlFor={idBusca} className="text-rotulo">
            {modo === "cheguei" ? "O que tem perto de você?" : "Para onde você vai?"}
          </label>
          <div className="flex min-h-13 items-center rounded-md border-2 border-linha bg-louca focus-within:border-cobalto">
            <input
              id={idBusca}
              type="search"
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              placeholder={
                modo === "cheguei"
                  ? "Lagoa, juçara, passeio de barco…"
                  : "Barreirinhas, Chapada das Mesas, Alcântara…"
              }
              className="min-w-0 flex-1 bg-transparent px-4 text-base outline-none placeholder:text-ink-suave"
            />
            <button
              type="submit"
              aria-label="Buscar"
              className="m-1 grid size-11 shrink-0 place-items-center rounded-[6px] bg-cobalto text-sobre-cobalto hover:bg-cobalto-forte"
            >
              <Search className="size-5" />
            </button>
          </div>
          <ul className="sem-barra -mx-5 flex gap-2 overflow-x-auto [&>li]:shrink-0 px-5 md:mx-0 md:flex-wrap md:px-0">
            {modo === "cheguei" ? <SugestoesCheguei /> : <SugestoesViajar />}
          </ul>
        </form>

        <div className="flex flex-wrap gap-3">
          {modo === "cheguei" ? (
            <>
              <Link to="/explorar" search={{ perto: true }} className={botao({ tamanho: "lg" })}>
                Ver o que fazer perto
              </Link>
              <Link to="/mapa" className={botao({ variante: "secundario", tamanho: "lg" })}>
                Abrir o mapa
              </Link>
            </>
          ) : (
            <>
              <Link to="/roteiros" className={botao({ tamanho: "lg" })}>
                Ver roteiros
              </Link>
              <Link to="/planejar" className={botao({ variante: "secundario", tamanho: "lg" })}>
                Planejar viagem
              </Link>
            </>
          )}
        </div>
      </div>

      <figure className="relative min-w-0">
        <Foto
          src="/images/home/hero.jpg"
          alt="Dunas brancas e lagoas azuis dos Lençóis Maranhenses vistas do alto"
          rotulo="Lençóis Maranhenses"
          cor="lagoa"
          prioridade
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="aspect-[640/520] rounded-md"
        />
        <figcaption className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-sm bg-louca px-3 py-2 text-rotulo text-ink">
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
