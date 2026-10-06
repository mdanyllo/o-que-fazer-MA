import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useFavorito, type TipoFavorito } from "@/lib/minha-viagem";
import { cn } from "@/lib/utils";

/** Botão de favoritar (coração). Guarda em "Minha viagem", no navegador. */
export function Favoritar({
  tipo,
  slug,
  nome,
  className,
}: {
  tipo: TipoFavorito;
  slug: string;
  nome: string;
  className?: string;
}) {
  const [ativo, alternar] = useFavorito(tipo, slug);
  return (
    <button
      type="button"
      aria-pressed={ativo}
      aria-label={ativo ? `Remover ${nome} de Minha viagem` : `Salvar ${nome} em Minha viagem`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const salvo = alternar();
        toast(salvo ? `${nome} salvo em Minha viagem` : `${nome} saiu de Minha viagem`);
      }}
      className={cn(
        "favoritar grid size-11 place-items-center rounded-md bg-louca text-ink transition-colors duration-150 hover:text-guara",
        ativo && "text-guara",
        className,
      )}
    >
      <Heart className={cn("size-5", ativo && "fill-current")} />
    </button>
  );
}
