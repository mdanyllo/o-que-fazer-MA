import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { BarChart3, Pencil } from "lucide-react";
import { botao } from "@/components/azulejo/botao";
import { ExcluirNegocio } from "@/components/painel/ExcluirNegocio";
import { useAuth } from "@/lib/auth";
import { buscarMeuNegocio } from "@/lib/meus-negocios";
import { cn } from "@/lib/utils";

/**
 * Na página pública de um negócio, só para o dono logado: editar, estatísticas e excluir.
 * Para os visitantes não aparece nada.
 */
export function AcoesDono({ negocioId }: { negocioId: string | undefined }) {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const { data: negocio } = useQuery({
    queryKey: ["meu-negocio", negocioId, usuario?.id],
    queryFn: () => buscarMeuNegocio(negocioId!, usuario!.id),
    enabled: Boolean(negocioId && usuario),
  });
  if (!negocio) return null;

  return (
    <div role="group" aria-label="Seu negócio" className="-mx-2 flex flex-wrap items-center">
      <Link
        to="/painel/$id"
        params={{ id: negocio.id }}
        className={cn(botao({ variante: "fantasma" }), "px-3")}
      >
        <Pencil aria-hidden /> Editar
      </Link>
      <Link
        to="/painel/estatisticas/$id"
        params={{ id: negocio.id }}
        className={cn(botao({ variante: "fantasma" }), "px-3")}
      >
        <BarChart3 aria-hidden /> Estatísticas
      </Link>
      <ExcluirNegocio
        negocio={negocio}
        naBarra
        aoExcluir={() => void navigate({ to: "/painel" })}
      />
    </div>
  );
}
