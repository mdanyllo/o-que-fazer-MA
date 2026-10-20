import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, MessageCircle, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { botao, Botao } from "@/components/azulejo/botao";
import { LoadingAzulejo } from "@/components/azulejo/LoadingAzulejo";
import { conviteDoNegocio, gerarConvite, urlDoConvite } from "@/lib/convites";
import { dataLonga } from "@/lib/plano";
import { cn } from "@/lib/utils";

/**
 * Negócio cadastrado pela equipe, sem dono: gera o link para o dono assumir, com atalhos para
 * copiar e mandar pelo WhatsApp do próprio negócio.
 */
export function ConviteDono({
  negocioId,
  nome,
  whatsapp,
}: {
  negocioId: string;
  nome: string;
  whatsapp: string | null;
}) {
  const queryClient = useQueryClient();
  const chave = ["admin-convite", negocioId];
  const atual = useQuery({ queryKey: chave, queryFn: () => conviteDoNegocio(negocioId) });
  const [gerando, setGerando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  async function gerar() {
    setGerando(true);
    try {
      const novo = await gerarConvite(negocioId);
      queryClient.setQueryData(chave, novo);
      toast.success(atual.data ? "Novo link gerado. O anterior não vale mais." : "Link gerado.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setGerando(false);
    }
  }

  const link = atual.data ? urlDoConvite(atual.data.token) : null;
  async function copiar() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    } catch {
      (document.getElementById(`convite-${negocioId}`) as HTMLInputElement | null)?.select();
    }
  }
  const mensagem = link
    ? `Olá! Cadastramos ${nome} no Azulejo, o guia do Maranhão. Por este link você assume a página do seu negócio, edita as informações e acompanha as visitas: ${link}`
    : "";
  const numero = whatsapp?.replace(/\D/g, "");

  return (
    <section
      aria-label="Convite para o dono"
      className="flex flex-col gap-4 rounded-md border border-linha p-5"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-t3">Convite para o dono</h2>
        <p className="text-legenda text-ink-suave">
          Este negócio não tem dono. Mande o link: quem abrir, entrar ou criar a conta, passa a ser
          o dono. Vale 7 dias e uma vez só.
        </p>
      </div>
      {atual.isPending ? (
        <LoadingAzulejo className="self-center py-4" />
      ) : link ? (
        <>
          <div className="flex flex-col gap-2">
            <label htmlFor={`convite-${negocioId}`} className="text-rotulo">
              Link do convite
            </label>
            <input
              id={`convite-${negocioId}`}
              readOnly
              value={link}
              onFocus={(e) => e.currentTarget.select()}
              className="min-h-12 w-full rounded-md border-2 border-linha bg-louca px-3 font-mono text-legenda text-ink-suave"
            />
            <p className="text-legenda text-ink-suave">
              Vale até {dataLonga(atual.data!.expira_em)}.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Botao onClick={() => void copiar()}>
              {copiado ? <Check aria-hidden /> : <Copy aria-hidden />}
              {copiado ? "Copiado" : "Copiar link"}
            </Botao>
            {numero && (
              <a
                href={`https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={botao({ variante: "secundario" })}
              >
                <MessageCircle aria-hidden /> Enviar no WhatsApp
              </a>
            )}
            <Botao
              variante="fantasma"
              disabled={gerando}
              onClick={() => void gerar()}
              className="text-ink-suave"
            >
              <RefreshCw aria-hidden /> {gerando ? "Gerando…" : "Gerar outro"}
            </Botao>
          </div>
        </>
      ) : (
        <Botao disabled={gerando} onClick={() => void gerar()} className={cn("self-start")}>
          {gerando ? "Gerando…" : "Gerar link de convite"}
        </Botao>
      )}
    </section>
  );
}
