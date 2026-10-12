import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Botao } from "@/components/azulejo/botao";
import { Tag } from "@/components/azulejo/etiquetas";
import { LoadingAzulejo } from "@/components/azulejo/LoadingAzulejo";
import { LayoutAdmin } from "@/components/admin/LayoutAdmin";
import { CaixaErro, classeCampo, Rotulo } from "@/components/conta/formulario";
import { AreaRestrita } from "@/components/conta/LayoutConta";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { listarContas, listarNegociosAdmin, transferir, type Conta } from "@/lib/admin";
import { LIMITE_NEGOCIOS, mensagemErroNegocio } from "@/lib/meus-negocios";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/usuarios")({
  head: () => ({
    meta: [{ title: "Usuários | Administração | Azulejo" }, { name: "robots", content: "noindex" }],
  }),
  component: () => <AreaRestrita papel="admin">{() => <Usuarios />}</AreaRestrita>,
});

const data = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" });

function Usuarios() {
  const contas = useQuery({ queryKey: ["admin-contas"], queryFn: listarContas });
  return (
    <LayoutAdmin titulo="Usuários">
      <p className="-mt-4 medida text-ink-suave">
        Contas cadastradas no Azulejo. O papel de admin só é dado pelo SQL Editor do Supabase (veja
        o README); aqui ele não muda.
      </p>
      {contas.isPending ? (
        <LoadingAzulejo rotulo="Carregando contas" className="self-center py-12" />
      ) : contas.isError ? (
        <CaixaErro>
          <p>Não conseguimos carregar as contas agora.</p>
          <button
            type="button"
            onClick={() => void contas.refetch()}
            className="mt-2 min-h-11 font-bold text-cobalto underline underline-offset-4"
          >
            Tentar de novo
          </button>
        </CaixaErro>
      ) : (
        <ul className="flex flex-col">
          {contas.data.map((c) => (
            <li
              key={c.id}
              className="grid gap-3 border-t border-linha py-4 last:border-b sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="font-bold">{c.nome || "Sem nome"}</span>
                  {c.papel === "admin" && (
                    <Tag className="bg-cobalto text-sobre-cobalto">Admin</Tag>
                  )}
                </p>
                <p className="truncate text-legenda text-ink-suave">{c.email}</p>
                <p className="mt-1 text-legenda">
                  {c.negocios} {c.negocios === 1 ? "negócio" : "negócios"} · conta criada em{" "}
                  {data.format(new Date(c.criado_em))}
                </p>
              </div>
              <Transferir conta={c} />
            </li>
          ))}
        </ul>
      )}
    </LayoutAdmin>
  );
}

/** Entrega a um dono um negócio que a equipe cadastrou (sem dono). */
function Transferir({ conta }: { conta: Conta }) {
  const queryClient = useQueryClient();
  const [aberto, setAberto] = useState(false);
  const [escolhido, setEscolhido] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const negocios = useQuery({
    queryKey: ["admin-negocios"],
    queryFn: listarNegociosAdmin,
    enabled: aberto,
  });
  const daEquipe = (negocios.data ?? []).filter((n) => !n.dono_id);
  const idSelect = `transferir-${conta.id}`;

  async function confirmar() {
    if (!escolhido) return;
    setOcupado(true);
    try {
      await transferir(escolhido, conta.id);
      await queryClient.invalidateQueries({ queryKey: ["admin-contas"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-negocios"] });
      toast.success(`Negócio transferido para ${conta.nome || conta.email}.`);
      setAberto(false);
      setEscolhido("");
    } catch (e) {
      toast.error(mensagemErroNegocio(e));
    } finally {
      setOcupado(false);
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger className="inline-flex min-h-11 items-center justify-center rounded-md border-2 border-cobalto px-4 text-[0.9375rem] font-bold text-cobalto transition-colors duration-150 hover:bg-cobalto hover:text-sobre-cobalto">
        Transferir negócio para este usuário
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-md border-linha bg-louca text-ink">
        <DialogTitle className="pr-8 text-t2">
          Transferir para {conta.nome || conta.email}
        </DialogTitle>
        <DialogDescription className="text-base text-ink-suave">
          A pessoa passa a ver e editar o negócio no painel dela. O status não muda.
        </DialogDescription>
        {negocios.isPending ? (
          <LoadingAzulejo className="self-center py-6" />
        ) : daEquipe.length === 0 ? (
          <p className="rounded-md bg-areia p-4">
            Não há negócios cadastrados pela equipe sem dono.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            <Rotulo id={idSelect} rotulo="Negócio da equipe" />
            <select
              id={idSelect}
              value={escolhido}
              onChange={(e) => setEscolhido(e.target.value)}
              className={cn(classeCampo, "appearance-auto")}
            >
              <option value="">Escolha o negócio</option>
              {daEquipe.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.nome}
                  {n.cidade ? ` · ${n.cidade}` : ""}
                  {n.exemplo ? " (exemplo)" : ""}
                </option>
              ))}
            </select>
          </div>
        )}
        {conta.negocios >= LIMITE_NEGOCIOS && (
          <p className="text-legenda text-ink-suave">
            Esta conta já tem {conta.negocios} negócios. A transferência passa do limite de{" "}
            {LIMITE_NEGOCIOS} que vale para o cadastro feito pelo dono.
          </p>
        )}
        <Botao disabled={!escolhido || ocupado} onClick={() => void confirmar()}>
          {ocupado ? "Transferindo…" : "Transferir"}
        </Botao>
      </DialogContent>
    </Dialog>
  );
}
