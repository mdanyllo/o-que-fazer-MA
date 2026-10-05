import { cn } from "@/lib/utils";

const PETALA = "M50 50 C58 38 58 24 50 13 C42 24 42 38 50 50 Z";

/**
 * Loading da marca: o azulejo se monta — cantos, pétalas uma a uma e o ponto do guará.
 * Mesma geometria do símbolo oficial. Com movimento reduzido, só pulsa a opacidade.
 */
export function LoadingAzulejo({
  rotulo = "Carregando",
  className,
}: {
  rotulo?: string;
  className?: string;
}) {
  return (
    <div role="status" className={cn("inline-flex flex-col items-center gap-3", className)}>
      <svg viewBox="0 0 100 100" className="azulejo-loading size-14" aria-hidden>
        <rect width="100" height="100" rx="6" className="fill-louca" />
        <rect
          x="1.5"
          y="1.5"
          width="97"
          height="97"
          rx="5"
          fill="none"
          strokeWidth="3"
          className="stroke-cobalto"
        />
        <g className="fill-cobalto">
          <path className="canto" d="M0 0 H22 A22 22 0 0 1 0 22 Z" />
          <path className="canto" d="M100 0 V22 A22 22 0 0 1 78 0 Z" />
          <path className="canto" d="M100 100 H78 A22 22 0 0 1 100 78 Z" />
          <path className="canto" d="M0 100 V78 A22 22 0 0 1 22 100 Z" />
          {[0, 90, 180, 270].map((r, i) => (
            <path
              key={r}
              className="petala"
              d={PETALA}
              transform={`rotate(${r} 50 50)`}
              style={{ animationDelay: `${i * 120}ms` }}
            />
          ))}
        </g>
        <circle cx="50" cy="50" r="7" className="ponto fill-guara" />
      </svg>
      <span className="sr-only">{rotulo}</span>
    </div>
  );
}
