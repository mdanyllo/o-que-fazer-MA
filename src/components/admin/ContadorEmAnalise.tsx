import { useQuery } from "@tanstack/react-query";
import { contarEmAnalise } from "@/lib/admin";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

/**
 * Número de negócios "Em análise", para avisar o admin de envios novos.
 * A chave fica sob "admin-negocios": aprovar ou recusar já invalida a contagem.
 */
function useEmAnalise() {
  const { perfil } = useAuth();
  const consulta = useQuery({
    queryKey: ["admin-negocios", "em-analise"],
    queryFn: contarEmAnalise,
    enabled: perfil?.papel === "admin",
    refetchInterval: 60_000,
  });
  return perfil?.papel === "admin" ? (consulta.data ?? 0) : 0;
}

/** Selo com a contagem; com zero não mostra nada. */
export function ContadorEmAnalise({ className }: { className?: string }) {
  const total = useEmAnalise();
  if (!total) return null;
  return (
    <span
      className={cn(
        "inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-ouro px-1.5 text-legenda leading-none font-bold text-sobre-ouro tabular-nums",
        className,
      )}
    >
      {total}
      <span className="sr-only"> {total === 1 ? "negócio" : "negócios"} em análise</span>
    </span>
  );
}
