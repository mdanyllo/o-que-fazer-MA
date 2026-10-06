import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { botao } from "@/components/azulejo/botao";
import { CardDestino, CardItem, CardRoteiro } from "@/components/azulejo/cards";
import { Tag } from "@/components/azulejo/etiquetas";
import { PadraoAzulejo } from "@/components/azulejo/PadraoAzulejo";
import { SecaoTitulo } from "@/components/azulejo/SecaoTitulo";
import { EditorRoteiro } from "@/components/paginas/EditorRoteiro";
import { LinhaDoTempo } from "@/components/paginas/LinhaDoTempo";
import { CabecalhoPagina, PageShell } from "@/components/site/PageShell";
import { getDestino, getItem, getRoteiro, type Destino, type Item, type Roteiro } from "@/data";
import {
  removerRoteiro,
  salvarRoteiro,
  useMinhaViagem,
  type RoteiroSalvo,
} from "@/lib/minha-viagem";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/minha-viagem")({
  head: () => ({ meta: [{ title: "Minha viagem | Azulejo" }] }),
  component: MinhaViagem,
});

function MinhaViagem() {
  const { favoritos, roteiros } = useMinhaViagem();
  const destinos = favoritos
    .filter((f) => f.tipo === "destino")
    .map((f) => getDestino(f.slug))
    .filter((d): d is Destino => Boolean(d));
  const lugares = favoritos
    .filter((f) => f.tipo === "lugar" || f.tipo === "experiencia")
    .map((f) => getItem(f.tipo as Item["tipo"], f.slug))
    .filter((i): i is Item => Boolean(i));
  const roteirosFavoritos = favoritos
    .filter((f) => f.tipo === "roteiro")
    .map((f) => getRoteiro(f.slug))
    .filter((r): r is Roteiro => Boolean(r));
  const vazio = favoritos.length === 0 && roteiros.length === 0;

  return (
    <PageShell>
      <CabecalhoPagina
        titulo="Minha viagem"
        apoio="Seus roteiros e lugares salvos. Fica tudo guardado só neste navegador, sem cadastro."
      />
      <div className="mx-auto flex max-w-7xl flex-col gap-16 px-5 pb-16 md:px-12 md:pb-24">
        {vazio && <Vazio />}

        {roteiros.length > 0 && (
          <section aria-labelledby="meus-roteiros" className="flex flex-col gap-6">
            <SecaoTitulo
              id="meus-roteiros"
              titulo="Meus roteiros"
              apoio="Abra para ver o dia a dia ou editar."
            />
            <ul className="flex flex-col gap-4">
              {roteiros.map((r) => (
                <RoteiroSalvoItem key={r.id} roteiro={r} />
              ))}
            </ul>
          </section>
        )}

        {lugares.length > 0 && (
          <section aria-labelledby="lugares" className="flex flex-col gap-6">
            <SecaoTitulo id="lugares" titulo="Lugares e experiências" />
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {lugares.map((i) => (
                <CardItem key={`${i.tipo}:${i.slug}`} item={i} />
              ))}
            </div>
          </section>
        )}

        {destinos.length > 0 && (
          <section aria-labelledby="destinos" className="flex flex-col gap-6">
            <SecaoTitulo id="destinos" titulo="Destinos" />
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {destinos.map((d) => (
                <CardDestino key={d.slug} destino={d} />
              ))}
            </div>
          </section>
        )}

        {roteirosFavoritos.length > 0 && (
          <section aria-labelledby="roteiros-fav" className="flex flex-col gap-6">
            <SecaoTitulo id="roteiros-fav" titulo="Roteiros favoritos" />
            <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
              {roteirosFavoritos.map((r) => (
                <CardRoteiro key={r.slug} roteiro={r} destaque />
              ))}
            </div>
          </section>
        )}
      </div>
    </PageShell>
  );
}

function RoteiroSalvoItem({ roteiro }: { roteiro: RoteiroSalvo }) {
  const [aberto, setAberto] = useState(false);
  const [editando, setEditando] = useState(false);
  const paradas = roteiro.dias.reduce((n, d) => n + d.paradas.length, 0);

  return (
    <li className="rounded-md border border-linha">
      <div className="flex flex-wrap items-center gap-3 p-4 md:p-5">
        <button
          type="button"
          aria-expanded={aberto}
          onClick={() => setAberto(!aberto)}
          className="flex min-h-11 min-w-0 flex-1 items-center gap-3 text-left"
        >
          <ChevronDown
            className={cn(
              "size-5 shrink-0 transition-transform duration-300",
              aberto && "rotate-180",
            )}
            aria-hidden
          />
          <span className="min-w-0">
            <span className="block font-display text-xl leading-tight font-semibold">
              {roteiro.titulo}
            </span>
            <span className="block text-legenda text-ink-suave">
              {roteiro.dias.length} dias · {paradas} paradas · {roteiro.resumo}
            </span>
          </span>
        </button>
        <Tag>{roteiro.origem === "planejador" ? "Feito no planejador" : "Roteiro pronto"}</Tag>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => {
              setAberto(true);
              setEditando(!editando);
            }}
            aria-pressed={editando}
            className={botao({ variante: "fantasma" })}
          >
            <Pencil /> {editando ? "Concluir" : "Editar"}
          </button>
          <button
            type="button"
            onClick={() => {
              removerRoteiro(roteiro.id);
              toast(`${roteiro.titulo} saiu de Minha viagem`, {
                action: { label: "Desfazer", onClick: () => salvarRoteiro(roteiro) },
              });
            }}
            aria-label={`Remover ${roteiro.titulo}`}
            className="grid size-11 place-items-center rounded-md hover:bg-areia hover:text-guara"
          >
            <Trash2 className="size-5" />
          </button>
        </div>
      </div>
      {aberto && (
        <div className="border-t border-linha p-4 md:p-6">
          {editando ? (
            <EditorRoteiro
              dias={roteiro.dias}
              aoMudar={(dias) => salvarRoteiro({ ...roteiro, dias })}
            />
          ) : (
            <LinhaDoTempo dias={roteiro.dias} />
          )}
          {roteiro.baseSlug && !editando && (
            <Link
              to="/roteiros/$slug"
              params={{ slug: roteiro.baseSlug }}
              className="mt-6 inline-flex min-h-11 items-center font-bold text-cobalto underline-offset-4 hover:underline"
            >
              Ver a página do roteiro original
            </Link>
          )}
        </div>
      )}
    </li>
  );
}

function Vazio() {
  return (
    <div className="relative overflow-hidden rounded-md bg-areia p-8 md:p-12">
      <PadraoAzulejo azulejo={64} className="absolute -top-8 -right-10 h-48 w-64 opacity-60" />
      <h2 className="relative max-w-lg text-t1">Sua viagem começa aqui</h2>
      <p className="relative mt-3 max-w-lg text-ink-suave">
        Toque no coração dos lugares que você quer conhecer, use um roteiro pronto ou monte o seu.
        Tudo aparece nesta página.
      </p>
      <div className="relative mt-8 flex flex-wrap gap-3">
        <Link to="/planejar" className={botao({ tamanho: "lg" })}>
          Planejar viagem
        </Link>
        <Link to="/roteiros" className={botao({ variante: "secundario", tamanho: "lg" })}>
          Ver roteiros prontos
        </Link>
      </div>
    </div>
  );
}
