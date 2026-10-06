import { useEffect, useRef, useState, type ReactNode } from "react";
import { urlFoto } from "@/lib/imagens";
import { cn } from "@/lib/utils";
import { COR, type CorMaranhense } from "./cores";
import { Parallax } from "@/components/movimento/Parallax";
import { PadraoAzulejo } from "./PadraoAzulejo";

type Props = {
  /** caminho lógico da foto (ex.: /images/destinos/barreirinhas.jpg), ver src/lib/imagens.ts */
  src?: string;
  /** texto alternativo descritivo (obrigatório) */
  alt: string;
  /** o que vai na foto, para a etiqueta do fallback ("Foto: Lagoa Bonita") */
  rotulo: string;
  /** cor da categoria no fallback */
  cor?: CorMaranhense;
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
  children?: ReactNode;
};

/**
 * Imagem com fallback da marca: enquanto a foto não existir (ou falhar), mostra o padrão
 * de azulejos sobre a cor da categoria, com uma etiqueta discreta do que vai ali.
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

  return (
    <div className={cn("relative overflow-hidden", COR[cor].bg, className)}>
      {/* fallback de azulejos só quando a foto não existe ou falhou;
          enquanto carrega, a cor da categoria serve de placeholder */}
      {falhou && (
        <div className="absolute inset-0" role="img" aria-label={alt}>
          <PadraoAzulejo
            azulejo={56}
            className="absolute -top-6 -right-10 h-[70%] w-[60%] opacity-90"
          />
          <span className="absolute bottom-3 left-3 max-w-[80%] truncate rounded-sm bg-louca/90 px-2 py-1 text-rotulo text-ink">
            Foto: {rotulo}
          </span>
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
          const camada = entrada ? <div className="entra-foto absolute inset-0">{img}</div> : img;
          return parallax ? <Parallax>{camada}</Parallax> : camada;
        })()}
      {children}
    </div>
  );
}
