import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, RotateCcw } from "lucide-react";
import { useId, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { botao } from "@/components/azulejo/botao";
import { MarcaCategoria } from "@/components/azulejo/etiquetas";
import { MapaInterativo } from "@/components/mapa/MapaInterativo";
import { EditorRoteiro } from "@/components/paginas/EditorRoteiro";
import { CabecalhoPagina, PageShell } from "@/components/site/PageShell";
import {
  categoriaPorId,
  FAIXAS,
  pontosDoRoteiro,
  type CategoriaId,
  type DiaRoteiro,
  type Mes,
} from "@/data";
import { salvarRoteiro } from "@/lib/minha-viagem";
import {
  CHEGADAS,
  gerarRoteiro,
  type Chegada,
  type Orcamento,
  type Respostas,
  type Ritmo,
} from "@/lib/planejador";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/planejar")({
  head: () => ({
    meta: [
      { title: "Planejar viagem | Azulejo" },
      {
        name: "description",
        content:
          "Responda cinco perguntas e receba um roteiro pelo Maranhão que você pode mudar à vontade.",
      },
    ],
  }),
  component: Planejar,
});

const PASSOS = ["Dias", "Interesses", "Ritmo", "Orçamento", "Chegada"] as const;
const INTERESSES: CategoriaId[] = ["lagoas-praias", "cultura", "natureza", "gastronomia", "festas"];

type Rascunho = Omit<Respostas, "dias"> & { dias: number | null };

function Planejar() {
  const [passo, setPasso] = useState(0);
  const [r, setR] = useState<Rascunho>({
    dias: null,
    interesses: [],
    ritmo: "Equilibrado",
    orcamento: "Confortável",
    chegada: "sao-luis",
  });
  const [resultado, setResultado] = useState<{
    titulo: string;
    resumo: string;
    dias: DiaRoteiro[];
  } | null>(null);
  const navigate = useNavigate();

  const podeSeguir = passo !== 0 || (r.dias !== null && r.dias > 0);

  function gerar() {
    if (!r.dias) return;
    setResultado(gerarRoteiro({ ...r, dias: r.dias }));
    window.scrollTo({ top: 0 });
  }

  if (resultado) {
    return (
      <Resultado
        resultado={resultado}
        aoMudar={(dias) => setResultado({ ...resultado, dias })}
        recomecar={() => {
          setResultado(null);
          setPasso(0);
        }}
        salvar={() => {
          salvarRoteiro({ ...resultado, origem: "planejador" });
          toast.success("Roteiro salvo em Minha viagem");
          navigate({ to: "/minha-viagem" });
        }}
      />
    );
  }

  return (
    <PageShell>
      <CabecalhoPagina
        titulo="Planejar viagem"
        apoio="Conte como você quer viajar. A gente monta o caminho, e você muda o que quiser depois."
        className="pb-6 md:pb-8"
      />
      <div className="mx-auto max-w-7xl px-5 pb-16 md:px-12 md:pb-24">
        {/* progresso: um azulejo por passo */}
        <ol aria-label="Passos" className="flex flex-wrap gap-2">
          {PASSOS.map((nome, i) => (
            <li key={nome} className="flex items-center gap-2">
              <span
                aria-hidden
                className={cn(
                  "grid size-8 place-items-center rounded-sm text-rotulo transition-colors duration-300",
                  i < passo && "bg-cobalto text-sobre-cobalto",
                  i === passo && "bg-ouro text-sobre-ouro",
                  i > passo && "bg-areia text-ink-suave",
                )}
              >
                {i < passo ? <Check className="size-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden text-rotulo sm:inline",
                  i === passo ? "text-ink" : "text-ink-suave",
                )}
                {...(i === passo ? { "aria-current": "step" as const } : {})}
              >
                {nome}
              </span>
            </li>
          ))}
        </ol>

        <form
          className="mt-10 max-w-3xl"
          onSubmit={(e) => {
            e.preventDefault();
            if (!podeSeguir) return;
            if (passo < PASSOS.length - 1) setPasso(passo + 1);
            else gerar();
          }}
        >
          {passo === 0 && <PassoDias r={r} setR={setR} />}
          {passo === 1 && (
            <Pergunta
              titulo="O que você quer viver?"
              apoio="Escolha quantos quiser. Se não escolher nenhum, a gente mistura um pouco de tudo."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {INTERESSES.map((id) => {
                  const ativo = r.interesses.includes(id);
                  return (
                    <Opcao
                      key={id}
                      ativo={ativo}
                      onClick={() =>
                        setR({
                          ...r,
                          interesses: ativo
                            ? r.interesses.filter((x) => x !== id)
                            : [...r.interesses, id],
                        })
                      }
                      titulo={categoriaPorId[id].nome}
                      detalhe={categoriaPorId[id].chamada}
                      icone={<MarcaCategoria categoria={id} />}
                    />
                  );
                })}
              </div>
            </Pergunta>
          )}
          {passo === 2 && (
            <Pergunta titulo="Em que ritmo?" apoio="Quantas paradas por dia, mais ou menos.">
              <div className="grid gap-3 sm:grid-cols-3">
                {(
                  [
                    ["Tranquilo", "Duas paradas por dia, tempo para rede e almoço longo"],
                    ["Equilibrado", "Três paradas por dia"],
                    ["Intenso", "Quatro paradas por dia, acordando cedo"],
                  ] as [Ritmo, string][]
                ).map(([v, d]) => (
                  <Opcao
                    key={v}
                    ativo={r.ritmo === v}
                    onClick={() => setR({ ...r, ritmo: v })}
                    titulo={v}
                    detalhe={d}
                  />
                ))}
              </div>
            </Pergunta>
          )}
          {passo === 3 && (
            <Pergunta
              titulo="Quanto pretende gastar?"
              apoio="Faixas de exemplo, por passeio e por pessoa."
            >
              <div className="grid gap-3 sm:grid-cols-3">
                {(
                  [
                    ["Econômico", FAIXAS[1].texto],
                    ["Confortável", `Até ${FAIXAS[2].texto.toLowerCase()}`],
                    ["Premium", "Sem limite de faixa"],
                  ] as [Orcamento, string][]
                ).map(([v, d]) => (
                  <Opcao
                    key={v}
                    ativo={r.orcamento === v}
                    onClick={() => setR({ ...r, orcamento: v })}
                    titulo={v}
                    detalhe={d}
                  />
                ))}
              </div>
            </Pergunta>
          )}
          {passo === 4 && (
            <Pergunta titulo="Por onde você chega?" apoio="Isso decide por onde o roteiro começa.">
              <div className="grid gap-3">
                {CHEGADAS.map((c) => (
                  <Opcao
                    key={c.valor}
                    ativo={r.chegada === c.valor}
                    onClick={() => setR({ ...r, chegada: c.valor as Chegada })}
                    titulo={c.rotulo}
                    detalhe={c.detalhe}
                  />
                ))}
              </div>
            </Pergunta>
          )}

          <div className="mt-10 flex flex-wrap gap-3">
            {passo > 0 && (
              <button
                type="button"
                onClick={() => setPasso(passo - 1)}
                className={botao({ variante: "secundario", tamanho: "lg" })}
              >
                <ArrowLeft /> Voltar
              </button>
            )}
            <button type="submit" disabled={!podeSeguir} className={botao({ tamanho: "lg" })}>
              {passo < PASSOS.length - 1 ? (
                <>
                  Continuar <ArrowRight />
                </>
              ) : (
                "Montar meu roteiro"
              )}
            </button>
          </div>
        </form>
      </div>
    </PageShell>
  );
}

function Pergunta({
  titulo,
  apoio,
  children,
}: {
  titulo: string;
  apoio?: string;
  children: ReactNode;
}) {
  return (
    <fieldset>
      <legend className="text-t1">{titulo}</legend>
      {apoio && <p className="mt-2 text-ink-suave">{apoio}</p>}
      <div className="mt-6">{children}</div>
    </fieldset>
  );
}

function Opcao({
  ativo,
  onClick,
  titulo,
  detalhe,
  icone,
}: {
  ativo: boolean;
  onClick: () => void;
  titulo: string;
  detalhe?: string;
  icone?: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      onClick={onClick}
      className={cn(
        "flex min-h-16 w-full items-center gap-4 rounded-md border-2 p-4 text-left transition-colors duration-150",
        ativo ? "border-cobalto bg-areia" : "border-linha hover:border-cobalto",
      )}
    >
      {icone}
      <span className="min-w-0 flex-1">
        <span className="block font-bold">{titulo}</span>
        {detalhe && <span className="block text-legenda text-ink-suave">{detalhe}</span>}
      </span>
      <span
        aria-hidden
        className={cn(
          "grid size-6 shrink-0 place-items-center rounded-sm border-2",
          ativo ? "border-cobalto bg-cobalto text-sobre-cobalto" : "border-linha",
        )}
      >
        {ativo && <Check className="size-4" />}
      </span>
    </button>
  );
}

function PassoDias({ r, setR }: { r: Rascunho; setR: (r: Rascunho) => void }) {
  const [comDatas, setComDatas] = useState(false);
  const [ida, setIda] = useState("");
  const [volta, setVolta] = useState("");
  const idIda = useId();
  const idVolta = useId();

  function aplicarDatas(novaIda: string, novaVolta: string) {
    setIda(novaIda);
    setVolta(novaVolta);
    if (!novaIda || !novaVolta) return setR({ ...r, dias: null });
    const a = new Date(`${novaIda}T12:00`);
    const b = new Date(`${novaVolta}T12:00`);
    const dias = Math.round((b.getTime() - a.getTime()) / 86_400_000) + 1;
    const { mes: _mes, ...resto } = r;
    setR(
      dias > 0
        ? { ...resto, dias: Math.min(dias, 21), mes: (a.getMonth() + 1) as Mes }
        : { ...resto, dias: null },
    );
  }

  return (
    <Pergunta titulo="Quantos dias você tem?" apoio="Contando o dia da chegada e o da volta.">
      {!comDatas ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[3, 5, 7, 10].map((n) => (
            <Opcao
              key={n}
              ativo={r.dias === n}
              onClick={() => setR({ ...r, dias: n })}
              titulo={n === 10 ? "10 ou mais" : `${n} dias`}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor={idIda} className="text-rotulo">
              Chegada
            </label>
            <input
              id={idIda}
              type="date"
              value={ida}
              onChange={(e) => aplicarDatas(e.target.value, volta)}
              className="min-h-12 rounded-md border-2 border-linha bg-louca px-3 text-base focus:border-cobalto focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={idVolta} className="text-rotulo">
              Volta
            </label>
            <input
              id={idVolta}
              type="date"
              min={ida || undefined}
              value={volta}
              onChange={(e) => aplicarDatas(ida, e.target.value)}
              className="min-h-12 rounded-md border-2 border-linha bg-louca px-3 text-base focus:border-cobalto focus:outline-none"
            />
          </div>
          {r.dias && <p className="text-ink-suave sm:col-span-2">São {r.dias} dias de viagem.</p>}
        </div>
      )}
      <button
        type="button"
        onClick={() => {
          setComDatas(!comDatas);
          setR({ ...r, dias: null });
        }}
        className="mt-4 inline-flex min-h-11 items-center font-bold text-cobalto underline-offset-4 hover:underline"
      >
        {comDatas ? "Prefiro dizer só o número de dias" : "Já tenho as datas"}
      </button>
    </Pergunta>
  );
}

function Resultado({
  resultado,
  aoMudar,
  recomecar,
  salvar,
}: {
  resultado: { titulo: string; resumo: string; dias: DiaRoteiro[] };
  aoMudar: (dias: DiaRoteiro[]) => void;
  recomecar: () => void;
  salvar: () => void;
}) {
  const pontos = useMemo(() => pontosDoRoteiro(resultado.dias), [resultado.dias]);
  return (
    <PageShell>
      <CabecalhoPagina
        titulo="Seu roteiro está pronto."
        apoio={`${resultado.titulo}: ${resultado.resumo} Mude a ordem, tire ou acrescente paradas e salve em Minha viagem.`}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" onClick={salvar} className={botao({ tamanho: "lg" })}>
            Salvar em Minha viagem
          </button>
          <button
            type="button"
            onClick={recomecar}
            className={botao({ variante: "secundario", tamanho: "lg" })}
          >
            <RotateCcw /> Recomeçar
          </button>
        </div>
      </CabecalhoPagina>
      <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-16 md:px-12 md:pb-24 lg:grid-cols-[1.25fr_1fr]">
        <section aria-label="Dia a dia" className="min-w-0">
          <EditorRoteiro dias={resultado.dias} aoMudar={aoMudar} />
        </section>
        <aside aria-label="Mapa da rota" className="lg:sticky lg:top-28 lg:self-start">
          <MapaInterativo
            pontos={pontos}
            rota={pontos.map(({ lat, lng }) => ({ lat, lng }))}
            agrupar={false}
            className="h-[400px] rounded-md lg:h-[540px]"
          />
          <p className="mt-3 text-legenda text-ink-suave">
            Roteiro sugerido com dados de exemplo. Confira horários e marés antes de ir.
          </p>
        </aside>
      </div>
    </PageShell>
  );
}
