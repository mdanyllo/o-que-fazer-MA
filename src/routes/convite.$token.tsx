import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { botao, Botao } from "@/components/azulejo/botao";
import { LoadingAzulejo } from "@/components/azulejo/LoadingAzulejo";
import { CaixaAviso, CaixaErro, linkConta } from "@/components/conta/formulario";
import { LayoutConta } from "@/components/conta/LayoutConta";
import { nomeParaMostrar, useAuth } from "@/lib/auth";
import {
  aceitarConvite,
  esquecerConvitePendente,
  guardarConvitePendente,
  verConvite,
} from "@/lib/convites";
import { dataLonga } from "@/lib/plano";

export const Route = createFileRoute("/convite/$token")({
  head: () => ({
    meta: [{ title: "Convite | Azulejo" }, { name: "robots", content: "noindex" }],
  }),
  component: PaginaConvite,
});

const TIPO = { restaurante: "restaurante", hospedagem: "hospedagem", passeio: "passeio" } as const;

function PaginaConvite() {
  const { token } = Route.useParams();
  const { usuario, perfil, carregando, sair } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const convite = useQuery({
    queryKey: ["convite", token],
    queryFn: () => verConvite(token),
    enabled: typeof window !== "undefined",
  });
  const [aceitando, setAceitando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const situacao = convite.data?.situacao;

  // válido: guarda para voltar aqui depois de criar a conta; senão, esquece
  useEffect(() => {
    if (situacao === "valido") guardarConvitePendente(token);
    else if (situacao) esquecerConvitePendente();
  }, [situacao, token]);

  async function aceitar() {
    setAceitando(true);
    setErro(null);
    try {
      const { nome } = await aceitarConvite(token);
      esquecerConvitePendente();
      await queryClient.invalidateQueries({ queryKey: ["meus-negocios"] });
      toast.success(`${nome} agora é seu. Boas-vindas ao Azulejo!`);
      void navigate({ to: "/painel", replace: true });
    } catch (e) {
      setErro((e as Error).message);
      setAceitando(false);
    }
  }

  if (convite.isPending || carregando)
    return (
      <LayoutConta titulo="Convite">
        <LoadingAzulejo className="self-start py-6" />
      </LayoutConta>
    );

  if (convite.isError)
    return (
      <LayoutConta titulo="Convite">
        <CaixaErro>
          <p>{(convite.error as Error).message}</p>
          <button
            type="button"
            onClick={() => void convite.refetch()}
            className="mt-2 min-h-11 font-bold text-cobalto underline underline-offset-4"
          >
            Tentar de novo
          </button>
        </CaixaErro>
      </LayoutConta>
    );

  const c = convite.data;
  if (c.situacao !== "valido") {
    const textos = {
      usado: [
        "Este convite já foi usado",
        "O negócio já tem dono. Se foi você, ele está em Meus negócios.",
      ],
      expirado: [
        "Este convite expirou",
        "Os convites valem 7 dias. Peça um link novo à equipe do Azulejo.",
      ],
      invalido: [
        "Convite não encontrado",
        "Confira se o link foi copiado inteiro, ou peça um novo à equipe do Azulejo.",
      ],
    } as const;
    const [titulo, texto] = textos[c.situacao];
    return (
      <LayoutConta titulo={titulo} apoio={texto}>
        <div className="flex flex-wrap gap-3">
          {usuario ? (
            <Link to="/painel" className={botao()}>
              Ir para Meus negócios
            </Link>
          ) : (
            <Link to="/" className={botao({ variante: "secundario" })}>
              Ir para o início
            </Link>
          )}
        </div>
      </LayoutConta>
    );
  }

  const descricao = [TIPO[c.tipo], c.cidade].filter(Boolean).join(" em ");
  return (
    <LayoutConta
      titulo={`Assuma ${c.nome} no Azulejo`}
      apoio={`A equipe do Azulejo cadastrou este ${descricao}. Com a sua conta, você edita a página, troca as fotos e acompanha as visitas.`}
    >
      {erro && <CaixaErro>{erro}</CaixaErro>}
      {usuario ? (
        <div className="flex flex-col gap-5">
          <p>
            Você está entrando como <strong>{nomeParaMostrar(usuario, perfil)}</strong>
            {usuario.email ? ` (${usuario.email})` : ""}.
          </p>
          <Botao tamanho="lg" disabled={aceitando} onClick={() => void aceitar()}>
            {aceitando ? "Assumindo…" : `Assumir ${c.nome}`}
          </Botao>
          <p className="text-legenda text-ink-suave">
            Não é você?{" "}
            <button type="button" onClick={() => void sair()} className={linkConta}>
              Sair e usar outra conta
            </button>
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <CaixaAviso titulo="Primeiro, a sua conta">
            <p>
              Crie uma conta (ou entre, se já tiver). Depois de confirmar o e-mail, você volta para
              cá e assume o negócio.
            </p>
          </CaixaAviso>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/cadastrar" className={botao({ tamanho: "lg" })}>
              Criar minha conta
            </Link>
            <Link
              to="/entrar"
              search={{ redirect: `/convite/${token}` }}
              className={botao({ variante: "secundario", tamanho: "lg" })}
            >
              Já tenho conta
            </Link>
          </div>
          <p className="text-legenda text-ink-suave">
            O convite vale até {dataLonga(c.expira_em)} e só pode ser usado uma vez.
          </p>
        </div>
      )}
    </LayoutConta>
  );
}
