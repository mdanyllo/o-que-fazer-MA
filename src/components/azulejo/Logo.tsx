import { cn } from "@/lib/utils";

type Props = {
  /** completo = símbolo + nome; simbolo = só o azulejo */
  variante?: "completo" | "simbolo";
  /**
   * Sobre o que o logo está:
   * - "superficie": fundo louça/areia (positivo de dia, negativo à noite)
   * - "faixa": faixa cobalto/juçara (negativo de dia; à noite as faixas clareiam, então positivo)
   * - "foto": sempre negativo
   */
  sobre?: "superficie" | "faixa" | "foto";
  className?: string;
};

const ARQUIVOS = {
  completo: {
    pos: "/brand/azulejo-logo.svg",
    neg: "/brand/azulejo-logo-negativo.svg",
    w: 433,
    h: 104,
  },
  simbolo: {
    pos: "/brand/azulejo-simbolo.svg",
    neg: "/brand/azulejo-simbolo-negativo.svg",
    w: 100,
    h: 100,
  },
};

/** Logo oficial, sem recolorir nem distorcer. A altura vem de `className` (ex.: h-8). */
export function Logo({ variante = "completo", sobre = "superficie", className }: Props) {
  const a = ARQUIVOS[variante];
  const img = (src: string, extra?: string) => (
    <img
      src={src}
      alt={variante === "completo" ? "Azulejo" : ""}
      width={a.w}
      height={a.h}
      className={cn("h-full w-auto", extra)}
      decoding="async"
    />
  );

  return (
    <span className={cn("inline-flex shrink-0", className)}>
      {sobre === "foto" && img(a.neg)}
      {sobre === "superficie" && (
        <>
          {img(a.pos, "so-dia")}
          {img(a.neg, "so-noite")}
        </>
      )}
      {sobre === "faixa" && (
        <>
          {img(a.neg, "so-dia")}
          {img(a.pos, "so-noite")}
        </>
      )}
    </span>
  );
}
