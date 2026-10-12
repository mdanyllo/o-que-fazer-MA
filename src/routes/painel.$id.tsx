import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { User } from "@supabase/supabase-js";
import { LoadingAzulejo } from "@/components/azulejo/LoadingAzulejo";
import { CaixaErro } from "@/components/conta/formulario";
import { AreaRestrita } from "@/components/conta/LayoutConta";
import { FormularioNegocio } from "@/components/painel/FormularioNegocio";
import { LayoutPainel } from "@/components/painel/LayoutPainel";
import { Pagina404 } from "@/components/site/Pagina404";
import { buscarMeuNegocio } from "@/lib/meus-negocios";

type Busca = { etapa?: number };

export const Route = createFileRoute("/painel/$id")({
  validateSearch: (s: Record<string, unknown>): Busca => {
    const n = Number(s["etapa"]);
    return n >= 1 && n <= 5 ? { etapa: Math.round(n) } : {};
  },
  head: () => ({
    meta: [{ title: "Editar negócio | Azulejo" }, { name: "robots", content: "noindex" }],
  }),
  component: () => <AreaRestrita>{({ usuario }) => <Editar usuario={usuario} />}</AreaRestrita>,
});

function Editar({ usuario }: { usuario: User }) {
  const { id } = Route.useParams();
  const { etapa } = Route.useSearch();
  const consulta = useQuery({
    queryKey: ["meus-negocios", usuario.id, id],
    queryFn: () => buscarMeuNegocio(id, usuario.id),
    // o formulário guarda o próprio estado: não recarregar por baixo dele
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  if (consulta.isPending)
    return (
      <LayoutPainel titulo="Editar negócio">
        <LoadingAzulejo className="self-center py-12" />
      </LayoutPainel>
    );
  if (consulta.isError)
    return (
      <LayoutPainel titulo="Editar negócio">
        <CaixaErro>
          <p>Não conseguimos carregar o negócio agora.</p>
          <button
            type="button"
            onClick={() => void consulta.refetch()}
            className="mt-2 min-h-11 font-bold text-cobalto underline underline-offset-4"
          >
            Tentar de novo
          </button>
        </CaixaErro>
      </LayoutPainel>
    );
  // não existe ou é de outra pessoa
  if (!consulta.data) return <Pagina404 />;

  return (
    <LayoutPainel titulo={consulta.data.nome}>
      {/* key: ao trocar de negócio, o formulário recomeça */}
      <FormularioNegocio key={consulta.data.id} negocio={consulta.data} etapaInicial={etapa ?? 1} />
    </LayoutPainel>
  );
}
