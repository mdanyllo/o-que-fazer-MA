import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ClientOnly, Link, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Botao } from "@/components/azulejo/botao";
import { Tag } from "@/components/azulejo/etiquetas";
import { LoadingAzulejo } from "@/components/azulejo/LoadingAzulejo";
import { classeCampo, DicaErro, Rotulo } from "@/components/conta/formulario";
import { STATUS } from "@/components/conta/status";
import { ExcluirNegocio } from "@/components/painel/ExcluirNegocio";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  aprovar,
  despublicar,
  lerNotasInternas,
  marcarRevisado,
  recusar,
  salvarNotas,
  salvarPosicao,
  type Conta,
  type NegocioAdmin,
} from "@/lib/admin";
import { mensagemErroNegocio, rascunhoDe, validar } from "@/lib/meus-negocios";
import { cn } from "@/lib/utils";

const MapaPosicao = lazy(() => import("@/components/mapa/MapaPosicaoLeaflet"));

const data = new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" });
const quando = (v: string | null) => (v ? data.format(new Date(v)) : "—");

export const nomeDaConta = (contas: Conta[] | undefined, id: string | null) => {
  if (!id) return null;
  const c = contas?.find((x) => x.id === id);
  return c ? `${c.nome || "Sem nome"} (${c.email})` : "Conta removida";
};

function Cartao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section aria-label={titulo} className="flex flex-col gap-4 rounded-md border border-linha p-5">
      <h2 className="text-t3">{titulo}</h2>
      {children}
    </section>
  );
}

/** Status atual e ações da equipe. Cada ação grava na hora e recarrega a página. */
export function AcoesNegocio({
  negocio: n,
  recarregar,
}: {
  negocio: NegocioAdmin;
  recarregar: () => Promise<unknown>;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [ocupado, setOcupado] = useState(false);
  const faltando = Object.values(validar(rascunhoDe(n), "completo", n.negocio_fotos.length));

  async function executar(acao: () => Promise<void>, sucesso: string) {
    setOcupado(true);
    try {
      await acao();
      await recarregar();
      await queryClient.invalidateQueries({ queryKey: ["admin-negocios"] });
      toast.success(sucesso);
    } catch (e) {
      toast.error(mensagemErroNegocio(e));
    } finally {
      setOcupado(false);
    }
  }

  return (
    <Cartao titulo="Status">
      <div className="flex flex-wrap items-center gap-2">
        <Tag className={STATUS[n.status].classe}>{STATUS[n.status].rotulo}</Tag>
        {n.alterado_desde_revisao && (
          <Tag className="bg-ouro text-sobre-ouro">Alterado em {quando(n.alterado_em)}</Tag>
        )}
        {n.exemplo && <Tag>Exemplo</Tag>}
        {n.status === "publicado" && (
          <Link
            to={n.tipo === "passeio" ? "/experiencias/$slug" : "/lugares/$slug"}
            params={{ slug: n.slug }}
            className="ml-auto min-h-11 content-center font-bold text-cobalto underline-offset-4 hover:underline"
          >
            Ver no site
          </Link>
        )}
      </div>
      {n.status === "recusado" && n.motivo_recusa && (
        <p className="text-legenda">
          <span className="font-bold text-guara">Motivo enviado ao dono: </span>
          {n.motivo_recusa}
        </p>
      )}
      {n.status !== "publicado" && faltando.length > 0 && (
        <div className="rounded-md bg-areia p-3 text-legenda">
          <p className="font-bold">Antes de publicar, falta:</p>
          <p className="mt-1">{faltando.join(" ")}</p>
        </div>
      )}
      <div className="flex flex-col gap-2">
        {n.status !== "publicado" && (
          <Botao
            disabled={ocupado}
            onClick={() => void executar(() => aprovar(n.id), "Publicado.")}
          >
            Aprovar e publicar
          </Botao>
        )}
        {n.alterado_desde_revisao && (
          <Botao
            variante="secundario"
            disabled={ocupado}
            onClick={() => void executar(() => marcarRevisado(n.id), "Marcado como revisado.")}
          >
            Marcar como revisado
          </Botao>
        )}
        {n.status !== "recusado" && n.status !== "rascunho" && (
          <Recusar
            ocupado={ocupado}
            aoRecusar={(motivo) =>
              executar(() => recusar(n.id, motivo), "Recusado. O dono vê o motivo no painel.")
            }
          />
        )}
        {n.status === "publicado" && (
          <Botao
            variante="fantasma"
            disabled={ocupado}
            onClick={() =>
              void executar(() => despublicar(n.id), "Despublicado: voltou para rascunho.")
            }
          >
            Despublicar
          </Botao>
        )}
      </div>
      <ExcluirNegocio
        negocio={n}
        chave={["admin-negocios"]}
        aoExcluir={() => void navigate({ to: "/admin" })}
      />
    </Cartao>
  );
}

function Recusar({
  ocupado,
  aoRecusar,
}: {
  ocupado: boolean;
  aoRecusar: (motivo: string) => Promise<void>;
}) {
  const [aberto, setAberto] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [erro, setErro] = useState<string>();
  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger
        disabled={ocupado}
        className="inline-flex min-h-11 items-center justify-center rounded-md border-2 border-guara px-5 font-bold text-guara transition-colors duration-150 hover:bg-guara hover:text-louca disabled:opacity-50"
      >
        Recusar
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-md border-linha bg-louca text-ink">
        <form
          className="flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!motivo.trim()) return setErro("Escreva o motivo: o dono vê no painel.");
            await aoRecusar(motivo);
            setAberto(false);
            setMotivo("");
          }}
        >
          <DialogTitle className="text-t2">Recusar o cadastro</DialogTitle>
          <DialogDescription className="text-base text-ink-suave">
            O dono vê este motivo no painel, corrige e reenvia.
          </DialogDescription>
          <div className="flex flex-col gap-2">
            <Rotulo id="motivo" rotulo="Motivo" />
            <textarea
              id="motivo"
              value={motivo}
              onChange={(e) => {
                setMotivo(e.target.value);
                setErro(undefined);
              }}
              rows={4}
              maxLength={1000}
              aria-invalid={erro ? true : undefined}
              aria-describedby={erro ? "motivo-erro" : undefined}
              placeholder="Ex.: A foto de capa está escura. Envie uma foto de dia."
              className={cn(classeCampo, "py-3")}
            />
            <DicaErro id="motivo" erro={erro} />
          </div>
          <Botao type="submit" disabled={ocupado} className="bg-guara hover:bg-guara/90">
            Recusar e avisar o dono
          </Botao>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Posição no mapa: clicar ou arrastar o pin; os campos fazem o ajuste fino. */
export function EditorPosicao({
  negocio: n,
  recarregar,
}: {
  negocio: NegocioAdmin;
  recarregar: () => Promise<unknown>;
}) {
  const [lat, setLat] = useState(n.latitude ?? -2.5297);
  const [lng, setLng] = useState(n.longitude ?? -44.3028);
  const [salvando, setSalvando] = useState(false);
  const mudou = lat !== n.latitude || lng !== n.longitude;
  const arredondar = (v: number) => Math.round(v * 1e6) / 1e6;

  async function salvar() {
    setSalvando(true);
    try {
      await salvarPosicao(n.id, lat, lng);
      await recarregar();
      toast.success("Posição salva.");
    } catch (e) {
      toast.error(mensagemErroNegocio(e));
    } finally {
      setSalvando(false);
    }
  }

  const carregando = (
    <div className="grid h-96 place-items-center rounded-md bg-areia">
      <LoadingAzulejo rotulo="Carregando o mapa" />
    </div>
  );
  return (
    <Cartao titulo="Posição no mapa">
      <p className="text-legenda text-ink-suave">
        {n.latitude == null
          ? "Ainda sem posição. Clique no mapa para marcar."
          : "Clique no mapa ou arraste o pin. Os números servem para o ajuste fino."}
      </p>
      <ClientOnly fallback={carregando}>
        <Suspense fallback={carregando}>
          <MapaPosicao
            lat={lat}
            lng={lng}
            aoMudar={(a, b) => {
              setLat(arredondar(a));
              setLng(arredondar(b));
            }}
            className="h-96 rounded-md"
          />
        </Suspense>
      </ClientOnly>
      <div className="grid grid-cols-2 gap-3">
        {(
          [
            ["latitude", "Latitude", lat, setLat, -90, 90],
            ["longitude", "Longitude", lng, setLng, -180, 180],
          ] as const
        ).map(([id, rotulo, valor, mudar, min, max]) => (
          <div key={id} className="flex flex-col gap-2">
            <Rotulo id={id} rotulo={rotulo} />
            <input
              id={id}
              type="number"
              inputMode="decimal"
              step="0.0001"
              min={min}
              max={max}
              value={valor}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (Number.isFinite(v) && v >= min && v <= max) mudar(v);
              }}
              className={cn(classeCampo, "px-3 tabular-nums")}
            />
          </div>
        ))}
      </div>
      <Botao disabled={!mudou || salvando} onClick={() => void salvar()}>
        {salvando ? "Salvando…" : "Salvar posição"}
      </Botao>
    </Cartao>
  );
}

/** Notas internas: só a equipe lê e escreve (o banco não mostra a coluna para mais ninguém). */
export function NotasInternas({ id }: { id: string }) {
  const consulta = useQuery({ queryKey: ["admin-notas", id], queryFn: () => lerNotasInternas(id) });
  const [texto, setTexto] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const valor = texto ?? consulta.data ?? "";

  async function salvar() {
    setSalvando(true);
    try {
      await salvarNotas(id, valor);
      await consulta.refetch();
      setTexto(null);
      toast.success("Notas salvas.");
    } catch (e) {
      toast.error(mensagemErroNegocio(e));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Cartao titulo="Notas internas">
      <div className="flex flex-col gap-2">
        <Rotulo id="notas" rotulo="Só a equipe vê" />
        <textarea
          id="notas"
          value={valor}
          onChange={(e) => setTexto(e.target.value)}
          disabled={consulta.isPending}
          rows={4}
          placeholder="Ex.: falei com a dona por telefone em 10/10."
          className={cn(classeCampo, "py-3")}
        />
      </div>
      <Botao
        variante="secundario"
        disabled={salvando || texto === null || texto === (consulta.data ?? "")}
        onClick={() => void salvar()}
      >
        {salvando ? "Salvando…" : "Salvar notas"}
      </Botao>
    </Cartao>
  );
}

export function Historico({ negocio: n, contas }: { negocio: NegocioAdmin; contas?: Conta[] }) {
  const linhas: [string, string][] = [
    ["Dono", nomeDaConta(contas, n.dono_id) ?? "Cadastrado pela equipe"],
    ["Criado em", quando(n.criado_em)],
    ["Última alteração", quando(n.atualizado_em)],
    ["Última edição do dono", quando(n.alterado_em)],
    [
      "Aprovado",
      n.aprovado_em
        ? `${quando(n.aprovado_em)} por ${nomeDaConta(contas, n.aprovado_por) ?? "equipe (SQL)"}`
        : "Ainda não",
    ],
    ["Endereço no site", `/${n.tipo === "passeio" ? "experiencias" : "lugares"}/${n.slug}`],
  ];
  return (
    <Cartao titulo="Histórico">
      <dl className="flex flex-col divide-y divide-linha">
        {linhas.map(([rotulo, valor]) => (
          <div key={rotulo} className="flex flex-col gap-0.5 py-2">
            <dt className="text-rotulo text-ink-suave">{rotulo}</dt>
            <dd className="break-words">{valor}</dd>
          </div>
        ))}
      </dl>
    </Cartao>
  );
}
