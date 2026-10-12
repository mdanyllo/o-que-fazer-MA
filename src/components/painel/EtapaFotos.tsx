import { ArrowLeft, ArrowRight, ImagePlus, Trash2, X } from "lucide-react";
import { useId, useRef, useState, type DragEvent } from "react";
import { Foto } from "@/components/azulejo/Foto";
import {
  enviarFoto,
  LIMITE_FOTOS,
  mensagemErroNegocio,
  removerFoto,
  reordenarFotos,
  TIPOS_FOTO,
  type FotoDono,
} from "@/lib/meus-negocios";
import { urlFotoNegocio } from "@/lib/negocios";
import { cn } from "@/lib/utils";

type Envio = { chave: string; nome: string; progresso: number; erro?: string };

const botaoIcone =
  "grid size-11 place-items-center rounded-md bg-louca text-ink transition-colors duration-150 hover:bg-areia disabled:pointer-events-none disabled:opacity-40";

/**
 * Fotos do negócio: cada mudança é gravada na hora (arquivo no Storage + registro no banco).
 * A primeira é a capa.
 */
export function EtapaFotos({
  negocioId,
  nome,
  fotos,
  aoMudar,
  erro,
}: {
  negocioId: string;
  nome: string;
  fotos: FotoDono[];
  aoMudar: (fotos: FotoDono[]) => void;
  erro?: string | undefined;
}) {
  const idInput = useId();
  const [envios, setEnvios] = useState<Envio[]>([]);
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [arrastando, setArrastando] = useState(false);
  const atuais = useRef(fotos);
  atuais.current = fotos;

  const restam = LIMITE_FOTOS - fotos.length;
  const enviando = envios.some((e) => !e.erro);

  async function receber(arquivos: File[]) {
    setAviso(null);
    if (!arquivos.length) return;
    const cabem = arquivos.slice(0, Math.max(0, restam));
    if (cabem.length < arquivos.length)
      setAviso(
        restam > 0
          ? `Cabem só mais ${restam} ${restam === 1 ? "foto" : "fotos"} (o limite é ${LIMITE_FOTOS}).`
          : `Você já tem ${LIMITE_FOTOS} fotos, o limite. Remova uma para enviar outra.`,
      );
    // uma de cada vez, para manter a ordem escolhida
    for (const arquivo of cabem) {
      const chave = crypto.randomUUID();
      setEnvios((l) => [...l, { chave, nome: arquivo.name, progresso: 0 }]);
      const atualizar = (m: Partial<Envio>) =>
        setEnvios((l) => l.map((e) => (e.chave === chave ? { ...e, ...m } : e)));
      try {
        const ordem = Math.max(-1, ...atuais.current.map((f) => f.ordem)) + 1;
        const foto = await enviarFoto(negocioId, arquivo, ordem, (p) =>
          atualizar({ progresso: p }),
        );
        aoMudar([...atuais.current, foto]);
        setEnvios((l) => l.filter((e) => e.chave !== chave));
      } catch (e) {
        atualizar({ erro: mensagemErroNegocio(e) });
      }
    }
  }

  async function mover(i: number, direcao: -1 | 1) {
    const nova = [...fotos];
    const [foto] = nova.splice(i, 1);
    nova.splice(i + direcao, 0, foto!);
    await operar(async () => aoMudar(await reordenarFotos(nova)));
  }

  async function remover(foto: FotoDono) {
    await operar(async () => {
      await removerFoto(foto);
      aoMudar(await reordenarFotos(atuais.current.filter((f) => f.id !== foto.id)));
    });
  }

  async function operar(acao: () => Promise<void>) {
    setOcupado(true);
    setAviso(null);
    try {
      await acao();
    } catch (e) {
      setAviso(mensagemErroNegocio(e));
    } finally {
      setOcupado(false);
    }
  }

  function soltar(e: DragEvent) {
    e.preventDefault();
    setArrastando(false);
    void receber([...e.dataTransfer.files]);
  }

  const capa = fotos[0];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-t2">Fotos</h2>
        <p className="mt-2 medida text-ink-suave">
          De 1 a {LIMITE_FOTOS} fotos em JPG, PNG ou WebP. A primeira é a capa. As fotos são
          reduzidas para até 1600px antes de enviar e ficam salvas na hora.
        </p>
      </div>

      {/* capa como aparece nos cards */}
      <div className="flex flex-col gap-2">
        <p className="text-rotulo">Capa, como aparece nos cards</p>
        <Foto
          src={capa ? urlFotoNegocio(capa.caminho) : ""}
          alt={capa ? `Capa de ${nome}` : "Ainda sem capa"}
          rotulo={nome}
          placeholderCor="cobalto"
          sizes="(min-width: 768px) 400px, 100vw"
          className="aspect-[4/3] w-full max-w-sm rounded-md"
        />
      </div>

      {restam > 0 && (
        <label
          htmlFor={idInput}
          onDragOver={(e) => {
            e.preventDefault();
            setArrastando(true);
          }}
          onDragLeave={() => setArrastando(false)}
          onDrop={soltar}
          className={cn(
            "flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-6 text-center transition-colors duration-150",
            "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-cobalto",
            arrastando ? "border-cobalto bg-areia" : "border-linha hover:border-cobalto",
            erro && "border-guara",
          )}
        >
          <ImagePlus className="size-8 text-cobalto" aria-hidden />
          <span className="font-bold text-cobalto">
            <span className="md:hidden">Toque para escolher fotos</span>
            <span className="hidden md:inline">Arraste as fotos aqui ou clique para escolher</span>
          </span>
          <span className="text-legenda text-ink-suave">
            Cabem mais {restam} {restam === 1 ? "foto" : "fotos"}
          </span>
          <input
            id={idInput}
            type="file"
            accept={TIPOS_FOTO.join(",")}
            multiple
            disabled={enviando}
            aria-invalid={erro ? true : undefined}
            aria-describedby={erro ? "fotos-erro" : undefined}
            onChange={(e) => {
              void receber([...(e.target.files ?? [])]);
              e.target.value = "";
            }}
            className="sr-only"
          />
        </label>
      )}
      {erro && (
        <p id="fotos-erro" className="-mt-6 text-legenda font-bold text-guara">
          {erro}
        </p>
      )}

      {aviso && (
        <p role="alert" className="rounded-md border-2 border-guara p-4">
          {aviso}
        </p>
      )}

      {envios.length > 0 && (
        <ul className="flex flex-col gap-3" aria-label="Envios">
          {envios.map((e) => (
            <li key={e.chave} className="rounded-md border border-linha p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 truncate font-bold">{e.nome}</p>
                {e.erro && (
                  <button
                    type="button"
                    onClick={() => setEnvios((l) => l.filter((x) => x.chave !== e.chave))}
                    aria-label={`Dispensar o erro de ${e.nome}`}
                    className="-m-2 grid size-11 shrink-0 place-items-center rounded-md hover:bg-areia"
                  >
                    <X className="size-5" />
                  </button>
                )}
              </div>
              {e.erro ? (
                <p role="alert" className="mt-1 text-legenda font-bold text-guara">
                  {e.erro}
                </p>
              ) : (
                <div className="mt-3">
                  <div
                    role="progressbar"
                    aria-label={`Enviando ${e.nome}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(e.progresso * 100)}
                    className="h-2 overflow-hidden rounded-full bg-areia"
                  >
                    <div
                      className="h-full rounded-full bg-cobalto transition-[width] duration-150"
                      style={{ width: `${Math.max(4, e.progresso * 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-legenda text-ink-suave">
                    {e.progresso === 0 ? "Preparando…" : `${Math.round(e.progresso * 100)}%`}
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {fotos.length > 0 && (
        <ol className="grid grid-cols-2 gap-4 sm:grid-cols-3" aria-label="Fotos enviadas">
          {fotos.map((f, i) => (
            <li key={f.id} className="flex flex-col gap-2">
              <div className="relative">
                <img
                  src={urlFotoNegocio(f.caminho)}
                  alt={`Foto ${i + 1} de ${nome}`}
                  loading="lazy"
                  className="aspect-[4/3] w-full rounded-md bg-areia object-cover"
                />
                {i === 0 && (
                  <span className="absolute top-2 left-2 rounded-sm bg-ouro px-2 py-0.5 text-rotulo text-sobre-ouro">
                    Capa
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-1">
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={i === 0 || ocupado}
                    onClick={() => void mover(i, -1)}
                    aria-label={
                      i === 1
                        ? `Usar a foto ${i + 1} como capa`
                        : `Mover a foto ${i + 1} para antes`
                    }
                    className={botaoIcone}
                  >
                    <ArrowLeft className="size-5" />
                  </button>
                  <button
                    type="button"
                    disabled={i === fotos.length - 1 || ocupado}
                    onClick={() => void mover(i, 1)}
                    aria-label={`Mover a foto ${i + 1} para depois`}
                    className={botaoIcone}
                  >
                    <ArrowRight className="size-5" />
                  </button>
                </div>
                <button
                  type="button"
                  disabled={ocupado}
                  onClick={() => void remover(f)}
                  aria-label={`Remover a foto ${i + 1}`}
                  className={cn(botaoIcone, "text-guara")}
                >
                  <Trash2 className="size-5" />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
