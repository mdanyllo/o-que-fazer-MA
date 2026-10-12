import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { User } from "@supabase/supabase-js";
import { botao } from "@/components/azulejo/botao";
import { LoadingAzulejo } from "@/components/azulejo/LoadingAzulejo";
import { AreaRestrita } from "@/components/conta/LayoutConta";
import { FormularioNegocio } from "@/components/painel/FormularioNegocio";
import { LayoutPainel } from "@/components/painel/LayoutPainel";
import { LIMITE_NEGOCIOS, listarMeusNegocios } from "@/lib/meus-negocios";

export const Route = createFileRoute("/painel/novo")({
  head: () => ({
    meta: [{ title: "Cadastrar negócio | Azulejo" }, { name: "robots", content: "noindex" }],
  }),
  component: () => <AreaRestrita>{({ usuario }) => <Novo usuario={usuario} />}</AreaRestrita>,
});

function Novo({ usuario }: { usuario: User }) {
  const consulta = useQuery({
    queryKey: ["meus-negocios", usuario.id],
    queryFn: () => listarMeusNegocios(usuario.id),
  });

  return (
    <LayoutPainel titulo="Cadastrar negócio">
      {consulta.isPending ? (
        <LoadingAzulejo className="self-center py-12" />
      ) : (consulta.data?.length ?? 0) >= LIMITE_NEGOCIOS ? (
        <div role="status" className="flex flex-col items-start gap-4 rounded-md bg-areia p-6">
          <p className="medida">
            Você chegou ao limite de {LIMITE_NEGOCIOS} negócios por conta. Para cadastrar outro,
            exclua um que não usa mais.
          </p>
          <Link to="/painel" className={botao({ variante: "secundario" })}>
            Ver meus negócios
          </Link>
        </div>
      ) : (
        <FormularioNegocio />
      )}
    </LayoutPainel>
  );
}
