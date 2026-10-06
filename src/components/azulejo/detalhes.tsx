import { CalendarCheck, Check, Clock, Lightbulb, MessageCircle, Star, Wallet } from "lucide-react";
import { useId, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Empresa, InfoPratica } from "@/data";
import { nomeDestino } from "@/data";
import { botao } from "./botao";
import { PontoGuara, Tag } from "./etiquetas";

/** Ficha de informações práticas (horário, preço, duração) + dicas. */
export function InfoPraticas({ info, extra }: { info: InfoPratica; extra?: ReactNode }) {
  const linhas: [ReactNode, string, string][] = [
    [<Clock key="h" className="size-5" />, "Horário", info.horario],
    [<Wallet key="p" className="size-5" />, "Preço", info.preco],
    [<CalendarCheck key="d" className="size-5" />, "Duração", info.duracao],
  ];
  return (
    <div className="rounded-md bg-areia p-5 md:p-6">
      <h2 className="text-t3">Informações práticas</h2>
      <dl className="mt-4 divide-y divide-linha">
        {linhas
          .filter(([, , v]) => v && v !== "—")
          .map(([icone, rotulo, valor]) => (
            <div key={rotulo} className="flex gap-3 py-3">
              <span className="mt-0.5 text-cobalto" aria-hidden>
                {icone}
              </span>
              <div>
                <dt className="text-rotulo">{rotulo}</dt>
                <dd className="text-base">{valor}</dd>
              </div>
            </div>
          ))}
        {extra}
      </dl>
      {info.dicas.length > 0 && (
        <div className="mt-4 border-t border-linha pt-4">
          <p className="flex items-center gap-2 text-rotulo">
            <Lightbulb className="size-4 text-cobalto" aria-hidden /> Dicas de quem conhece
          </p>
          <ul className="mt-3 space-y-2">
            {info.dicas.map((d) => (
              <li key={d} className="flex gap-3 text-base">
                <PontoGuara className="mt-2.5" /> {d}
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="mt-4 text-legenda text-ink-suave">
        Horários e preços são de exemplo. Confirme com quem oferece antes de ir.
      </p>
    </div>
  );
}

/** Empresa local (fictícia) no contexto do lugar, com reserva simulada. */
export function CardEmpresa({ empresa, oQue }: { empresa: Empresa; oQue: string }) {
  return (
    <li className="flex flex-col gap-3 rounded-md border border-linha p-4 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-bold">{empresa.nome}</p>
          <Tag>{empresa.tipo}</Tag>
          <Tag>Exemplo</Tag>
        </div>
        <p className="mt-1 text-base text-ink-suave">{empresa.descricao}</p>
        <p className="mt-1 flex items-center gap-1 text-legenda text-ink-suave">
          <Star className="size-4 fill-ouro text-ouro" aria-hidden />
          <span className="font-bold text-ink">
            {empresa.avaliacao.toFixed(1).replace(".", ",")}
          </span>
          <span>({empresa.avaliacoes} avaliações de exemplo)</span>
        </p>
      </div>
      <Reservar empresa={empresa} oQue={oQue} />
    </li>
  );
}

function Reservar({ empresa, oQue }: { empresa: Empresa; oQue: string }) {
  const [aberto, setAberto] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [pessoas, setPessoas] = useState(2);
  const [data, setData] = useState("");
  const idData = useId();
  const idPessoas = useId();

  function enviar(e: FormEvent) {
    e.preventDefault();
    setEnviado(true);
    toast.success(`Pedido de reserva enviado para ${empresa.nome} (simulação)`);
  }

  return (
    <Dialog
      open={aberto}
      onOpenChange={(v) => {
        setAberto(v);
        if (!v) setEnviado(false);
      }}
    >
      <DialogTrigger className={botao({ variante: "secundario" })}>
        Reservar
        {empresa.aPartirDe ? (
          <span className="font-normal">· a partir de R$ {empresa.aPartirDe}</span>
        ) : null}
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-md border-linha bg-louca text-ink">
        {enviado ? (
          <div className="flex flex-col items-start gap-4 pt-2">
            <span className="grid size-12 place-items-center rounded-full bg-babacu text-louca">
              <Check className="size-6" />
            </span>
            <DialogTitle className="text-t2">Pedido enviado</DialogTitle>
            <DialogDescription className="text-base text-ink-suave">
              {empresa.nome} recebeu seu pedido para {oQue}, {pessoas}{" "}
              {pessoas === 1 ? "pessoa" : "pessoas"}
              {data ? `, em ${new Date(`${data}T12:00`).toLocaleDateString("pt-BR")}` : ""}. Isto é
              uma simulação: nenhum dado foi enviado e nada foi cobrado.
            </DialogDescription>
            <button type="button" className={botao()} onClick={() => setAberto(false)}>
              Fechar
            </button>
          </div>
        ) : (
          <form onSubmit={enviar} className="flex flex-col gap-4 pt-2">
            <DialogTitle className="pr-10 text-t2">Reservar com {empresa.nome}</DialogTitle>
            <DialogDescription className="text-base text-ink-suave">
              {oQue} · {nomeDestino(empresa.destino)}. Simulação: nenhum pagamento é feito.
            </DialogDescription>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={idData} className="text-rotulo">
                Data
              </label>
              <input
                id={idData}
                type="date"
                required
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="min-h-12 rounded-md border-2 border-linha bg-louca px-3 text-base focus:border-cobalto focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={idPessoas} className="text-rotulo">
                Pessoas
              </label>
              <input
                id={idPessoas}
                type="number"
                min={1}
                max={20}
                value={pessoas}
                onChange={(e) => setPessoas(Math.max(1, Number(e.target.value) || 1))}
                className="min-h-12 rounded-md border-2 border-linha bg-louca px-3 text-base focus:border-cobalto focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <button type="submit" className={botao({ tamanho: "lg" })}>
                Enviar pedido
              </button>
              <a
                href={`https://wa.me/${empresa.whatsapp.replace(/\D/g, "")}`}
                onClick={(e) => {
                  e.preventDefault();
                  toast("WhatsApp de exemplo: este número não existe.");
                }}
                className={botao({ variante: "fantasma", tamanho: "lg" })}
              >
                <MessageCircle /> WhatsApp
              </a>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
