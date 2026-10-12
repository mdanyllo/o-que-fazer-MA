import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { LoadingAzulejo } from "@/components/azulejo/LoadingAzulejo";
import { LayoutAdmin } from "@/components/admin/LayoutAdmin";
import {
  AcoesNegocio,
  EditorPosicao,
  Historico,
  NotasInternas,
} from "@/components/admin/PainelNegocio";
import { CaixaErro } from "@/components/conta/formulario";
import { AreaRestrita } from "@/components/conta/LayoutConta";
import { FormularioNegocio } from "@/components/painel/FormularioNegocio";
import { Pagina404 } from "@/components/site/Pagina404";
import { buscarNegocioAdmin, listarContas } from "@/lib/admin";

type Busca = { etapa?: number; publicar?: boolean };

export const Route = createFileRoute("/admin/$id")({
  validateSearch: (s: Record<string, unknown>): Busca => {
    const out: Busca = {};
    const n = Number(s["etapa"]);
    if (n >= 1 && n <= 5) out.etapa = Math.round(n);
    if (s["publicar"] === true || s["publicar"] === "true") out.publicar = true;
    return out;
  },
  head: () => ({
    meta: [{ title: "Negócio | Administração | Azulejo" }, { name: "robots", content: "noindex" }],
  }),
  component: () => <AreaRestrita papel="admin">{() => <NegocioAdmin />}</AreaRestrita>,
});

function NegocioAdmin() {
  const { id } = Route.useParams();
  const { etapa, publicar } = Route.useSearch();
  const consulta = useQuery({
    queryKey: ["admin-negocios", id],
    queryFn: () => buscarNegocioAdmin(id),
    refetchOnWindowFocus: false,
  });
  const contas = useQuery({ queryKey: ["admin-contas"], queryFn: listarContas });

  if (consulta.isPending)
    return (
      <LayoutAdmin titulo="Negócio">
        <LoadingAzulejo className="self-center py-12" />
      </LayoutAdmin>
    );
  if (consulta.isError)
    return (
      <LayoutAdmin titulo="Negócio">
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
      </LayoutAdmin>
    );
  if (!consulta.data) return <Pagina404 />;

  const n = consulta.data;
  const recarregar = () => consulta.refetch();
  return (
    <LayoutAdmin titulo={n.nome} largura="max-w-7xl">
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <aside className="flex flex-col gap-6 lg:order-2">
          <AcoesNegocio negocio={n} recarregar={recarregar} />
          <EditorPosicao
            key={`${n.id}-${n.latitude}-${n.longitude}`}
            negocio={n}
            recarregar={recarregar}
          />
          <NotasInternas id={n.id} />
          <Historico negocio={n} {...(contas.data ? { contas: contas.data } : {})} />
        </aside>
        <div className="min-w-0 lg:order-1">
          <FormularioNegocio
            key={n.id}
            negocio={n}
            modo="equipe"
            etapaInicial={etapa ?? 1}
            publicarAoSalvar={Boolean(publicar)}
            aoSalvar={() => void recarregar()}
          />
        </div>
      </div>
    </LayoutAdmin>
  );
}
