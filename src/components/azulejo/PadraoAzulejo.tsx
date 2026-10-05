import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * Trecho do padrão de azulejos (public/brand/azulejo-padrao.svg).
 * Decorativo: nunca atrás de texto corrido. Prefira deixá-lo cortado pela borda.
 * `azulejo` = lado de cada azulejo, em px.
 */
export function PadraoAzulejo({
  azulejo = 64,
  className,
  style,
}: {
  azulejo?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none select-none", className)}
      style={{
        backgroundImage: "url(/brand/azulejo-padrao.svg)",
        // o arquivo tem 4 × 3 azulejos
        backgroundSize: `${azulejo * 4}px ${azulejo * 3}px`,
        backgroundRepeat: "repeat",
        ...style,
      }}
    />
  );
}

/** Faixa divisória com uma fileira de azulejos. */
export function FaixaAzulejo({
  className,
  azulejo = 40,
}: {
  className?: string;
  azulejo?: number;
}) {
  return (
    <PadraoAzulejo
      azulejo={azulejo}
      className={cn("w-full", className)}
      style={{ height: azulejo }}
    />
  );
}
