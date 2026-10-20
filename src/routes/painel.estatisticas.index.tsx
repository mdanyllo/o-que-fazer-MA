import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import type { User } from "@supabase/supabase-js";
import { BarChart3, ChevronRight, Plus } from "lucide-react";
import { botao } from "@/components/azulejo/botao";
import { Tag } from "@/components/azulejo/etiquetas";
import { LoadingAzulejo } from "@/components/azulejo/LoadingAzulejo";
import { CaixaErro } from "@/components/conta/formulario";
import { AreaRestrita } from "@/components/conta/LayoutConta";
import { STATUS } from "@/components/conta/status";
import { LayoutPainel } from "@/components/painel/LayoutPainel";
import { listarMeusNegocios } from "@/lib/meus-negocios";

export const Route = createFileRoute("/painel/estatisticas/")({
  head: () => ({
    meta: [{ title: "Estatísticas | Azulejo" }, { name: "robots", content: "noindex" }],
  }),
  component: () => (
    <AreaRestrita>{({ usuario }) => <EscolherNegocio usuario={usuario} />}</AreaRestrita>
  ),
});

/** "Estatísticas" do menu: com um negócio só, vai direto para ele; com mais, a pessoa escolhe. */
function EscolherNegocio({ usuario }: { usuario: User }) {
  const consulta = useQuery({
    queryKey: ["meus-negocios", usuario.id],
    queryFn: () => listarMeusNegocios(usuario.id),
  });

  if (consulta.data?.length === 1)
    return <Navigate to="/painel/estatisticas/$id" params={{ id: consulta.data[0]!.id }} replace />;

  return (
    <LayoutPainel titulo="Estatísticas" voltar={false}>
      {consulta.isPending ? (
        <LoadingAzulejo className="self-center py-12" />
      ) : consulta.isError ? (
        <CaixaErro>
          <p>Não conseguimos carregar seus negócios agora.</p>
          <button
            type="button"
            onClick={() => void consulta.refetch()}
            className="mt-2 min-h-11 font-bold text-cobalto underline underline-offset-4"
          >
            Tentar de novo
          </button>
        </CaixaErro>
      ) : consulta.data.length === 0 ? (
        <section className="flex flex-col items-start gap-4 rounded-md bg-areia p-6 md:p-8">
          <p className="medida text-[1.1875rem]">
            As estatísticas aparecem quando você tiver um negócio publicado no Azulejo.
          </p>
          <Link to="/painel/novo" className={botao({ tamanho: "lg" })}>
            <Plus aria-hidden /> Cadastrar negócio
          </Link>
        </section>
      ) : (
        <>
          <p className="text-ink-suave">Escolha o negócio para ver os números.</p>
          <ul className="flex flex-col divide-y divide-linha rounded-md border border-linha">
            {consulta.data.map((n) => (
              <li key={n.id}>
                <Link
                  to="/painel/estatisticas/$id"
                  params={{ id: n.id }}
                  className="flex min-h-16 items-center gap-4 px-4 py-3 transition-colors duration-150 hover:bg-areia"
                >
                  <BarChart3 className="size-5 shrink-0 text-cobalto" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">{n.nome}</span>
                    {n.cidade && (
                      <span className="block text-legenda text-ink-suave">{n.cidade}</span>
                    )}
                  </span>
                  <Tag className={STATUS[n.status].classe}>{STATUS[n.status].rotulo}</Tag>
                  <ChevronRight className="size-5 shrink-0 text-ink-suave" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </LayoutPainel>
  );
}
