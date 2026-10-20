import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import type { User } from "@supabase/supabase-js";
import { Plus } from "lucide-react";
import { useEffect } from "react";
import { botao } from "@/components/azulejo/botao";
import { LoadingAzulejo } from "@/components/azulejo/LoadingAzulejo";
import { CaixaErro } from "@/components/conta/formulario";
import { AreaRestrita } from "@/components/conta/LayoutConta";
import { CardMeuNegocio } from "@/components/painel/CardMeuNegocio";
import { conteudoPainel } from "@/components/painel/LayoutPainel";
import { MolduraPainel } from "@/components/painel/MolduraPainel";
import { nomeParaMostrar, type Perfil } from "@/lib/auth";
import { lerConvitePendente } from "@/lib/convites";
import { LIMITE_NEGOCIOS, listarMeusNegocios } from "@/lib/meus-negocios";
import { ResumoPlano } from "@/components/painel/ResumoPlano";

export const Route = createFileRoute("/painel/")({
  head: () => ({
    meta: [{ title: "Meus negócios | Azulejo" }, { name: "robots", content: "noindex" }],
  }),
  component: () => <AreaRestrita>{(conta) => <Painel {...conta} />}</AreaRestrita>,
});

function Painel({ usuario, perfil }: { usuario: User; perfil: Perfil | null }) {
  const navigate = useNavigate();
  // chegou aqui depois de criar a conta (ou entrar) a partir de um convite: volta para ele
  useEffect(() => {
    const token = lerConvitePendente();
    if (token) void navigate({ to: "/convite/$token", params: { token }, replace: true });
  }, [navigate]);
  const consulta = useQuery({
    queryKey: ["meus-negocios", usuario.id],
    queryFn: () => listarMeusNegocios(usuario.id),
  });
  const total = consulta.data?.length ?? 0;
  const noLimite = total >= LIMITE_NEGOCIOS;

  return (
    <MolduraPainel>
      <div className={`${conteudoPainel} max-w-site`}>
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-ink-suave">Olá, {nomeParaMostrar(usuario, perfil)}.</p>
            <h1 className="mt-1 text-t1 text-cobalto">Meus negócios</h1>
          </div>
          {total > 0 && !noLimite && (
            <Link to="/painel/novo" className={botao()}>
              <Plus aria-hidden /> Cadastrar negócio
            </Link>
          )}
        </header>

        {consulta.isPending ? (
          <LoadingAzulejo rotulo="Carregando seus negócios" className="self-center py-12" />
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
        ) : total === 0 ? (
          <section className="flex flex-col items-start gap-4 rounded-md bg-areia p-6 md:p-8">
            <p className="medida text-[1.1875rem]">
              Você ainda não cadastrou nenhum negócio. Leva uns 10 minutos, e a equipe revisa antes
              de ir para o site.
            </p>
            <Link to="/painel/novo" className={botao({ tamanho: "lg" })}>
              <Plus aria-hidden /> Cadastrar negócio
            </Link>
          </section>
        ) : (
          <>
            <ResumoPlano perfilId={usuario.id} />
            {noLimite && (
              <p role="status" className="rounded-md border border-linha bg-areia p-4">
                Você chegou ao limite de {LIMITE_NEGOCIOS} negócios por conta. Para cadastrar outro,
                exclua um que não usa mais.
              </p>
            )}
            <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {consulta.data.map((n) => (
                <li key={n.id}>
                  <CardMeuNegocio negocio={n} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </MolduraPainel>
  );
}
