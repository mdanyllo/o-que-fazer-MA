import { useEffect, useRef, useState, type ReactNode } from "react";
import { urlFoto } from "@/lib/imagens";
import { cn } from "@/lib/utils";
import { COR, type CorMaranhense } from "./cores";
import { Parallax } from "@/components/movimento/Parallax";
import { Revelar } from "@/components/movimento/Revelar";

type Props = {
  /** caminho lógico da foto (ex.: /images/destinos/barreirinhas.jpg), ver src/lib/imagens.ts */
  src?: string;
  /** texto alternativo descritivo (obrigatório) */
  alt: string;
  /** o que vai na foto; marcado em data-foto-falta enquanto o arquivo não existir */
  rotulo: string;
  /** cor da categoria enquanto a foto carrega */
  cor?: CorMaranhense;
  /**
   * placeholder temporário colorido quando a foto não existe: fundo sólido nesta cor e o
   * símbolo branco; sem ele, o fallback é o neutro (areia com o símbolo apagado)
   */
  placeholderCor?: CorMaranhense;
  /** classes do contêiner: defina o tamanho/proporção aqui */
  className?: string;
  imgClassName?: string;
  /** atributo sizes da imagem */
  sizes?: string;
  /** fotos acima da dobra: carrega na hora */
  prioridade?: boolean;
  /** foto grande que desliza levemente com a rolagem (máx. 8%) */
  parallax?: boolean;
  /** entrada do hero: aparece e assenta de scale 1.08 para 1 */
  entrada?: boolean;
  /** foto grande no meio da página: uma cortina azul e vermelha abre quando ela entra na tela */
  cortina?: boolean;
  children?: ReactNode;
};

/**
 * Imagem com fallback neutro: enquanto a foto não existir (ou falhar), mostra o fundo areia
 * com o símbolo do azulejo pequeno no centro, sem texto.
 */
export function Foto({
  src,
  alt,
  rotulo,
  cor = "cobalto",
  className,
  imgClassName,
  sizes = "100vw",
  prioridade = false,
  parallax = false,
  entrada = false,
  cortina = false,
  placeholderCor,
  children,
}: Props) {
  const url = urlFoto(src);
  const [falhou, setFalhou] = useState(!url);
  const ref = useRef<HTMLImageElement>(null);

  // a imagem pode ter falhado antes da hidratação, quando o onError ainda não existia
  useEffect(() => {
    setFalhou(!url);
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFalhou(true);
  }, [url]);

  // sem foto o fundo é areia até na borda arredondada (a cor da categoria vazaria nos cantos),
  // com um fio de linha para o card não sumir sobre seções em areia
  const fundo = !falhou
    ? COR[cor].bg
    : placeholderCor
      ? COR[placeholderCor].bg
      : "bg-areia shadow-[inset_0_0_0_1px_var(--linha)]";
  const conteudo = (
    <>
      {/* sem a foto: fundo areia com o símbolo pequeno e apagado, sem texto;
          enquanto carrega, a cor da categoria serve de placeholder */}
      {falhou && (
        <div
          className="absolute inset-0 grid place-items-center"
          role="img"
          aria-label={alt}
          data-foto-falta={rotulo}
        >
          <img
            src={
              placeholderCor ? "/brand/azulejo-simbolo-branco.svg" : "/brand/azulejo-simbolo.svg"
            }
            alt=""
            width={100}
            height={100}
            className={cn("w-[clamp(28px,16%,56px)]", placeholderCor ? "opacity-35" : "opacity-15")}
          />
        </div>
      )}
      {url &&
        !falhou &&
        (() => {
          const img = (
            <img
              ref={ref}
              src={url}
              alt={alt}
              width={1600}
              height={1067}
              sizes={sizes}
              loading={prioridade ? "eager" : "lazy"}
              fetchPriority={prioridade ? "high" : "auto"}
              decoding="async"
              onError={() => setFalhou(true)}
              className={cn("absolute inset-0 h-full w-full object-cover", imgClassName)}
            />
          );
          let camada = entrada ? <div className="entra-foto absolute inset-0">{img}</div> : img;
          if (cortina) camada = <div className="cortina-zoom absolute inset-0">{camada}</div>;
          return parallax ? <Parallax>{camada}</Parallax> : camada;
        })()}
      {cortina && <span aria-hidden className="cortina pointer-events-none absolute inset-0" />}
      {children}
    </>
  );
  return cortina ? (
    <Revelar variante="cortina" className={cn("relative overflow-hidden", fundo, className)}>
      {conteudo}
    </Revelar>
  ) : (
    <div className={cn("relative overflow-hidden", fundo, className)}>{conteudo}</div>
  );
}
