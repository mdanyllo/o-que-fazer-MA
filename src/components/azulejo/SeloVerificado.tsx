import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Selo de verificado (dono com plano Pro). `icone`: só o símbolo, ao lado do nome nos cards;
 * `etiqueta`: símbolo + texto, no topo da página do negócio.
 */
export function SeloVerificado({
  variante = "icone",
  className,
}: {
  variante?: "icone" | "etiqueta";
  className?: string;
}) {
  if (variante === "etiqueta")
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-sm bg-cobalto px-2 py-0.5 text-rotulo text-sobre-cobalto",
          className,
        )}
      >
        <BadgeCheck className="size-4" aria-hidden /> Verificado
      </span>
    );
  return (
    <span
      title="Verificado pelo Azulejo"
      className={cn("inline-flex shrink-0 align-[-0.125em] text-cobalto", className)}
    >
      <BadgeCheck className="size-[1em]" aria-hidden />
      <span className="sr-only">Verificado</span>
    </span>
  );
}
