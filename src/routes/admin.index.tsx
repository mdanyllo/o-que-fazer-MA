import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { useMemo } from "react";
import { botao } from "@/components/azulejo/botao";
import { Chip, Tag } from "@/components/azulejo/etiquetas";
import { Foto } from "@/components/azulejo/Foto";
import { LoadingAzulejo } from "@/components/azulejo/LoadingAzulejo";
import { LayoutAdmin } from "@/components/admin/LayoutAdmin";
import { nomeDaConta } from "@/components/admin/PainelNegocio";
import { CaixaErro, classeCampo } from "@/components/conta/formulario";
import { AreaRestrita } from "@/components/conta/LayoutConta";
import { STATUS } from "@/components/conta/status";
import { listarContas, listarNegociosAdmin, type Conta, type NegocioAdmin } from "@/lib/admin";
import { urlFotoNegocio, type TipoNegocio } from "@/lib/negocios";
import { cn } from "@/lib/utils";

const ABAS = [
  { id: "analise", rotulo: "Em análise", filtro: (n: NegocioAdmin) => n.status === "pendente" },
  {
    id: "alterados",
    rotulo: "Alterados",
    filtro: (n: NegocioAdmin) => n.status === "publicado" && n.alterado_desde_revisao,
  },
  { id: "publicados", rotulo: "Publicados", filtro: (n: NegocioAdmin) => n.status === "publicado" },
  { id: "recusados", rotulo: "Recusados", filtro: (n: NegocioAdmin) => n.status === "recusado" },
  { id: "rascunhos", rotulo: "Rascunhos", filtro: (n: NegocioAdmin) => n.status === "rascunho" },
  { id: "todos", rotulo: "Todos", filtro: () => true },
] as const;
type Aba = (typeof ABAS)[number]["id"];

const TIPOS: Record<TipoNegocio, string> = {
  restaurante: "Restaurante",
  hospedagem: "Hospedagem",
  passeio: "Passeio",
};

type Busca = { aba?: Aba; q?: string; tipo?: TipoNegocio; cidade?: string };

export const Route = createFileRoute("/admin/")({
  validateSearch: (s: Record<string, unknown>): Busca => {
    const out: Busca = {};
    if (ABAS.some((a) => a.id === s["aba"])) out.aba = s["aba"] as Aba;
    if (typeof s["q"] === "string" && s["q"].trim()) out.q = s["q"];
    if (typeof s["tipo"] === "string" && s["tipo"] in TIPOS) out.tipo = s["tipo"] as TipoNegocio;
    if (typeof s["cidade"] === "string" && s["cidade"]) out.cidade = s["cidade"];
    return out;
  },
  head: () => ({
    meta: [{ title: "Administração | Azulejo" }, { name: "robots", content: "noindex" }],
  }),
  component: () => <AreaRestrita papel="admin">{() => <ListaAdmin />}</AreaRestrita>,
});

const normalizar = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const dataCurta = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function ListaAdmin() {
  const busca = Route.useSearch();
  const navigate = Route.useNavigate();
  const aba = busca.aba ?? "analise";
  const negocios = useQuery({ queryKey: ["admin-negocios"], queryFn: listarNegociosAdmin });
  const contas = useQuery({ queryKey: ["admin-contas"], queryFn: listarContas });

  const mudar = (m: Partial<Record<keyof Busca, string | undefined>>) =>
    navigate({
      search: (atual: Busca) => {
        const prox: Record<string, unknown> = { ...atual, ...m };
        for (const k of Object.keys(prox)) if (!prox[k]) delete prox[k];
        return prox as Busca;
      },
      replace: true,
    });

  const todos = negocios.data ?? [];
  const cidades = useMemo(
    () => [...new Set(todos.map((n) => n.cidade).filter((c): c is string => Boolean(c)))].sort(),
    [todos],
  );
  const filtrados = todos.filter(
    (n) =>
      (!busca.q || normalizar(n.nome).includes(normalizar(busca.q))) &&
      (!busca.tipo || n.tipo === busca.tipo) &&
      (!busca.cidade || n.cidade === busca.cidade),
  );
  const daAba = filtrados.filter(ABAS.find((a) => a.id === aba)!.filtro);
  if (aba === "alterados")
    daAba.sort((a, b) => (b.alterado_em ?? "").localeCompare(a.alterado_em ?? ""));

  return (
    <LayoutAdmin
      titulo="Negócios"
      acoes={
        <Link to="/admin/novo" className={botao()}>
          <Plus aria-hidden /> Cadastrar negócio
        </Link>
      }
    >
      <div
        role="group"
        aria-label="Situação"
        className="sem-barra -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0"
      >
        {ABAS.map((a) => (
          <Chip key={a.id} ativo={aba === a.id} onClick={() => void mudar({ aba: a.id })}>
            {a.rotulo}
            <span className="tabular-nums opacity-80">{filtrados.filter(a.filtro).length}</span>
          </Chip>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <label className="relative">
          <span className="sr-only">Buscar pelo nome</span>
          <Search
            className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink-suave"
            aria-hidden
          />
          <input
            type="search"
            value={busca.q ?? ""}
            onChange={(e) => void mudar({ q: e.target.value })}
            placeholder="Buscar pelo nome"
            className={cn(classeCampo, "pl-12")}
          />
        </label>
        <label>
          <span className="sr-only">Tipo</span>
          <select
            value={busca.tipo ?? ""}
            onChange={(e) => void mudar({ tipo: e.target.value })}
            className={cn(classeCampo, "appearance-auto")}
          >
            <option value="">Todos os tipos</option>
            {Object.entries(TIPOS).map(([v, r]) => (
              <option key={v} value={v}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Cidade</span>
          <select
            value={busca.cidade ?? ""}
            onChange={(e) => void mudar({ cidade: e.target.value })}
            className={cn(classeCampo, "appearance-auto")}
          >
            <option value="">Todas as cidades</option>
            {cidades.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      {negocios.isPending ? (
        <LoadingAzulejo rotulo="Carregando negócios" className="self-center py-12" />
      ) : negocios.isError ? (
        <CaixaErro>
          <p>Não conseguimos carregar os negócios agora.</p>
          <button
            type="button"
            onClick={() => void negocios.refetch()}
            className="mt-2 min-h-11 font-bold text-cobalto underline underline-offset-4"
          >
            Tentar de novo
          </button>
        </CaixaErro>
      ) : daAba.length === 0 ? (
        <p className="rounded-md bg-areia p-6 text-ink-suave">
          Nada em “{ABAS.find((a) => a.id === aba)!.rotulo.toLowerCase()}”
          {busca.q || busca.tipo || busca.cidade ? " com esses filtros" : ""}.
        </p>
      ) : (
        <ul className="flex flex-col">
          {daAba.map((n) => (
            <LinhaAdmin
              key={n.id}
              negocio={n}
              contas={contas.data}
              mostrarAlteracao={aba === "alterados"}
            />
          ))}
        </ul>
      )}
    </LayoutAdmin>
  );
}

function LinhaAdmin({
  negocio: n,
  contas,
  mostrarAlteracao,
}: {
  negocio: NegocioAdmin;
  contas: Conta[] | undefined;
  mostrarAlteracao: boolean;
}) {
  const capa = n.negocio_fotos[0];
  const dono = n.dono_id ? contas?.find((c) => c.id === n.dono_id) : null;
  return (
    <li className="relative grid grid-cols-[96px_1fr] gap-4 border-t border-linha py-4 last:border-b sm:grid-cols-[128px_1fr_auto] sm:items-center">
      <Foto
        src={capa ? urlFotoNegocio(capa.caminho) : ""}
        alt=""
        rotulo={n.nome}
        placeholderCor="cobalto"
        sizes="128px"
        className="aspect-[4/3] rounded-md"
      />
      <div className="min-w-0">
        <p className="font-bold">
          <Link
            to="/admin/$id"
            params={{ id: n.id }}
            className="after:absolute after:inset-0 after:content-[''] hover:text-cobalto"
          >
            {n.nome}
          </Link>
        </p>
        <p className="text-legenda text-ink-suave">
          {[TIPOS[n.tipo], n.cidade].filter(Boolean).join(" · ")}
        </p>
        <p className="mt-1 truncate text-legenda">
          {n.dono_id ? (
            dono ? (
              <>
                {dono.nome || "Sem nome"} <span className="text-ink-suave">· {dono.email}</span>
              </>
            ) : (
              (nomeDaConta(contas, n.dono_id) ?? "")
            )
          ) : (
            <span className="text-ink-suave">Cadastrado pela equipe</span>
          )}
        </p>
        {mostrarAlteracao && n.alterado_em && (
          <p className="mt-1 text-legenda font-bold text-cobalto">
            Alterado em {dataCurta.format(new Date(n.alterado_em))}
          </p>
        )}
      </div>
      <p className="col-start-2 flex flex-wrap gap-2 sm:col-start-3 sm:justify-end">
        <Tag className={STATUS[n.status].classe}>{STATUS[n.status].rotulo}</Tag>
        {n.status === "publicado" && n.alterado_desde_revisao && !mostrarAlteracao && (
          <Tag className="bg-ouro text-sobre-ouro">Alterado</Tag>
        )}
        {n.exemplo && <Tag>Exemplo</Tag>}
      </p>
    </li>
  );
}
