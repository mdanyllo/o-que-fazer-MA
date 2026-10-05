import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { COR, type CorMaranhense } from "./cores";
import { PadraoAzulejo } from "./PadraoAzulejo";

type Props = {
  /** caminho em /public (ex.: /images/destinos/barreirinhas.jpg) */
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
  children,
}: Props) {
  const [falhou, setFalhou] = useState(!src);
  const ref = useRef<HTMLImageElement>(null);

  // A imagem pode ter falhado antes da hidratação, quando o onError ainda não existia.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFalhou(true);
  }, [src]);

  return (
    <div className={cn("relative overflow-hidden", COR[cor].bg, className)}>
      {/* fallback fica por baixo; a foto, quando carrega, cobre tudo */}
      <div
        className="absolute inset-0"
        {...(falhou ? { role: "img", "aria-label": alt } : { "aria-hidden": true })}
      >
        <PadraoAzulejo
          azulejo={56}
          className="absolute -top-6 -right-10 h-[70%] w-[60%] opacity-90"
        />
        <span className="absolute bottom-3 left-3 max-w-[80%] truncate rounded-sm bg-louca/90 px-2 py-1 text-rotulo text-ink">
          Foto: {rotulo}
        </span>
      </div>
      {src && !falhou && (
        <img
          ref={ref}
          src={src}
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
      )}
      {children}
    </div>
  );
}
