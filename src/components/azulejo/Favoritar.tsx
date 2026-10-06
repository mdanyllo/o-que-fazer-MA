import { Heart } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
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
  // conta os toques: o "pop" só acontece depois de um clique, nunca ao carregar
  const [toques, setToques] = useState(0);

  return (
    <button
      type="button"
      aria-pressed={ativo}
      aria-label={ativo ? `Remover ${nome} de Minha viagem` : `Salvar ${nome} em Minha viagem`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const salvo = alternar();
        setToques((t) => t + 1);
        toast(salvo ? `${nome} salvo em Minha viagem` : `${nome} saiu de Minha viagem`);
      }}
      className={cn(
        "favoritar grid size-11 place-items-center rounded-md bg-louca text-ink transition-colors duration-150 hover:text-guara",
        ativo && "text-guara",
        className,
      )}
    >
      <motion.span
        key={toques}
        className="grid place-items-center"
        initial={false}
        animate={toques > 0 && ativo ? { scale: [1, 1.25, 1] } : { scale: [1, 0.85, 1] }}
        transition={{ duration: toques > 0 ? 0.35 : 0, ease: [0.22, 1, 0.36, 1] }}
      >
        <Heart className={cn("size-5", ativo && "fill-current")} />
      </motion.span>
    </button>
  );
}
