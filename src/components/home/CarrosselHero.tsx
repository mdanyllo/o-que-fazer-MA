import { Link } from "@tanstack/react-router";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import type { CorMaranhense } from "@/components/azulejo/cores";
import { Foto } from "@/components/azulejo/Foto";
import { categoriaPorId, getDestino, getItem, type Item } from "@/data";
import { cn } from "@/lib/utils";

const INTERVALO = 5500;

type Slide = {
  chave: string;
  nome: string;
  /** "Passeio", "Lugar"... aparece na legenda */
  rotulo: string;
  local: string;
  foto: string;
  alt: string;
  cor: CorMaranhense;
  link:
    | { to: "/destinos/$slug"; slug: string }
    | { to: "/lugares/$slug" | "/experiencias/$slug"; slug: string };
};

const doItem = (tipo: Item["tipo"], slug: string, alt: string): Slide | undefined => {
  const item = getItem(tipo, slug);
  if (!item) return undefined;
  return {
    chave: `${tipo}:${slug}`,
    nome: item.nome,
    rotulo: tipo === "experiencia" ? "Passeio" : "Lugar",
    local: getDestino(item.destino)?.nome ?? "",
    foto: item.foto,
    alt,
    cor: categoriaPorId[item.categoria]?.cor ?? "cobalto",
    link: { to: item.href, slug: item.slug },
  };
};

/** Só entram itens que já têm foto de verdade em src/assets/images. */
const SLIDES: Slide[] = [
  {
    chave: "destino:barreirinhas",
    nome: "Lençóis Maranhenses",
    rotulo: "Destino",
    local: "Barreirinhas",
    foto: "/images/home/hero.jpg",
    alt: "Dunas brancas e lagoas azuis dos Lençóis Maranhenses vistas do alto",
    cor: "lagoa",
    link: { to: "/destinos/$slug", slug: "barreirinhas" },
  },
  doItem("lugar", "lagoa-bonita", "Lagoa Bonita entre dunas altas ao entardecer"),
  doItem("experiencia", "passeio-rio-preguicas", "Barco descendo o Rio Preguiças entre mangues"),
  doItem(
    "experiencia",
    "caminhada-centro-historico",
    "Casarões azulejados do Centro Histórico de São Luís",
  ),
  doItem("experiencia", "sabores-de-sao-luis", "Pratos típicos maranhenses servidos à mesa"),
  doItem("experiencia", "bate-volta-alcantara", "Ruínas e igrejas coloniais de Alcântara"),
].filter((s): s is Slide => Boolean(s));

/**
 * Carrossel do hero: passa sozinho, aceita arrastar/deslizar e cada foto leva à página
 * do destino, lugar ou passeio. Pausa com mouse em cima, foco do teclado ou no botão;
 * com movimento reduzido não passa sozinho.
 */
export function CarrosselHero() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const reduzido = useReducedMotion();
  const [atual, setAtual] = useState(0);
  const [pausadoUsuario, setPausadoUsuario] = useState(false);
  const [emFoco, setEmFoco] = useState(false);
  const rodando = !reduzido && !pausadoUsuario && !emFoco;

  useEffect(() => {
    if (!emblaApi) return;
    const aoSelecionar = () => setAtual(emblaApi.selectedScrollSnap());
    aoSelecionar();
    emblaApi.on("select", aoSelecionar).on("reInit", aoSelecionar);
    return () => {
      emblaApi.off("select", aoSelecionar).off("reInit", aoSelecionar);
    };
  }, [emblaApi]);

  // reinicia a contagem a cada troca, para não pular logo depois de o usuário arrastar
  useEffect(() => {
    if (!emblaApi || !rodando) return;
    const t = window.setTimeout(() => emblaApi.scrollNext(), INTERVALO);
    return () => window.clearTimeout(t);
  }, [emblaApi, rodando, atual]);

  const irPara = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);
  const slide = SLIDES[atual] ?? SLIDES[0];
  if (!slide) return null;

  return (
    <div
      role="region"
      aria-roledescription="carrossel"
      aria-label="Destaques do Maranhão"
      className="relative flex w-full flex-col gap-3.5"
      onMouseEnter={() => setEmFoco(true)}
      onMouseLeave={() => setEmFoco(false)}
      onFocus={() => setEmFoco(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setEmFoco(false);
      }}
    >
      <div className="relative">
        <div ref={emblaRef} className="overflow-hidden rounded-[10px]">
          <div className="flex touch-pan-y">
            {SLIDES.map((s, i) => (
              <div
                key={s.chave}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} de ${SLIDES.length}: ${s.nome}`}
                className="min-w-0 shrink-0 grow-0 basis-full"
              >
                <Link
                  to={s.link.to}
                  params={{ slug: s.link.slug }}
                  className="group block rounded-[10px] outline-offset-4"
                  tabIndex={i === atual ? 0 : -1}
                  aria-hidden={i !== atual}
                  draggable={false}
                >
                  <Foto
                    src={s.foto}
                    alt={s.alt}
                    rotulo={s.nome}
                    cor={s.cor}
                    prioridade={i === 0}
                    entrada={i === 0}
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="aspect-[4/3] w-full lg:aspect-auto lg:h-[clamp(400px,42vw,600px)]"
                    imgClassName="transition-transform duration-700 ease-saida group-hover:scale-[1.03]"
                  />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* setas */}
        <div className="absolute right-3 bottom-3 flex gap-2">
          {(
            [
              ["Foto anterior", ArrowLeft, () => emblaApi?.scrollPrev()],
              ["Próxima foto", ArrowRight, () => emblaApi?.scrollNext()],
            ] as const
          ).map(([rotulo, Icone, acao]) => (
            <button
              key={rotulo}
              type="button"
              aria-label={rotulo}
              onClick={acao}
              className="grid size-11 place-items-center rounded-full bg-louca/90 text-ink backdrop-blur-sm transition-colors duration-150 hover:bg-louca"
            >
              <Icone className="size-5" />
            </button>
          ))}
        </div>

        {/* pausa e pontos, em pílula sobre a foto */}
        <div className="absolute bottom-3 left-3 flex items-center rounded-full bg-louca/90 pr-2 text-ink backdrop-blur-sm">
          {!reduzido && (
            <button
              type="button"
              onClick={() => setPausadoUsuario((v) => !v)}
              aria-label={
                pausadoUsuario ? "Retomar passagem automática" : "Pausar passagem automática"
              }
              className="grid size-11 place-items-center rounded-full transition-colors duration-150 hover:text-cobalto"
            >
              {pausadoUsuario ? <Play className="size-4" /> : <Pause className="size-4" />}
            </button>
          )}
          <div className={cn("flex items-center", reduzido && "pl-2")}>
            {SLIDES.map((s, i) => (
              <button
                key={s.chave}
                type="button"
                onClick={() => irPara(i)}
                aria-label={`Ir para ${s.nome}`}
                aria-current={i === atual}
                className="grid h-11 w-5 place-items-center"
              >
                <span
                  className={cn(
                    "block h-1.5 rounded-full transition-all duration-300 ease-saida",
                    i === atual ? "w-4 bg-cobalto" : "w-1.5 bg-ink/35",
                  )}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* legenda do slide atual, à direita (sobre o painel cobalto) */}
      <Link
        to={slide.link.to}
        params={{ slug: slide.link.slug }}
        className="max-w-full self-end truncate text-[0.875rem] font-bold text-sobre-faixa underline-offset-4 hover:underline"
        aria-live={rodando ? "off" : "polite"}
      >
        <span className="opacity-75">{slide.rotulo} · </span>
        {slide.nome}
        {slide.local && slide.local !== slide.nome ? `, ${slide.local}` : ""}
      </Link>
    </div>
  );
}
