import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { COR, ICONE_CATEGORIA, corDaCategoria, type CorMaranhense } from "./cores";
import type { CategoriaId } from "@/data/tipos";

/** Chip de filtro (único elemento em pílula). */
export function Chip({
  ativo,
  cor,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { ativo?: boolean; cor?: CorMaranhense }) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      className={cn(
        "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-legenda font-bold transition-colors duration-150 ease-saida",
        ativo
          ? "border-cobalto bg-cobalto text-sobre-cobalto"
          : "border-linha bg-louca text-ink hover:border-cobalto hover:text-cobalto",
        className,
      )}
      {...props}
    >
      {cor && (
        <span
          aria-hidden
          className={cn("size-2.5 rounded-full", COR[cor].bg, ativo && "ring-2 ring-sobre-cobalto")}
        />
      )}
      {children}
    </button>
  );
}

/** Tag informativa, quase reta como cerâmica. */
export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm bg-areia px-2 py-0.5 text-rotulo text-ink-suave",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Selo de destaque em ouro, sempre com texto escuro. */
export function Selo({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm bg-ouro px-2 py-0.5 text-rotulo text-sobre-ouro",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Marca circular da categoria: cor maranhense + ícone. */
export function MarcaCategoria({
  categoria,
  tamanho = "md",
  className,
}: {
  categoria: CategoriaId;
  tamanho?: "sm" | "md";
  className?: string;
}) {
  const cor = COR[corDaCategoria(categoria)];
  const Icone = ICONE_CATEGORIA[categoria];
  return (
    <span
      aria-hidden
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-full",
        tamanho === "sm" ? "size-7" : "size-10",
        cor.bg,
        cor.sobre,
        className,
      )}
    >
      <Icone className={tamanho === "sm" ? "size-4" : "size-5"} strokeWidth={2} />
    </span>
  );
}

/** Marcador de lista com o ponto do guará. */
export function PontoGuara({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block size-2 shrink-0 rounded-full bg-guara", className)}
    />
  );
}
