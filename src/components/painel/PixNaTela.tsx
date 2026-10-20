import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { Botao } from "@/components/azulejo/botao";
import { LoadingAzulejo } from "@/components/azulejo/LoadingAzulejo";
import { CaixaErro } from "@/components/conta/formulario";
import { buscarPix, dataLonga, reais } from "@/lib/plano";

/**
 * Pix da cobrança em aberto, pago dentro do site: QR Code (computador) e "copia e cola"
 * (celular). Enquanto está na tela, consulta o plano a cada 5 s; quando o webhook do Asaas
 * confirma, a página troca sozinha.
 */
export function PixNaTela({ linkFatura }: { linkFatura: string | null }) {
  const queryClient = useQueryClient();
  const pix = useQuery({
    // um QR Code por fatura: muda o link, busca de novo
    queryKey: ["pix", linkFatura],
    queryFn: buscarPix,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    const t = setInterval(() => void queryClient.invalidateQueries({ queryKey: ["plano"] }), 5000);
    return () => clearInterval(t);
  }, [queryClient]);

  async function copiar() {
    if (!pix.data) return;
    try {
      await navigator.clipboard.writeText(pix.data.copiaECola);
    } catch {
      // sem permissão de área de transferência: seleciona para copiar à mão
      const campo = document.getElementById("pix-copia-e-cola") as HTMLTextAreaElement | null;
      campo?.select();
      return;
    }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  }

  if (pix.isPending) return <LoadingAzulejo className="self-center py-10" />;
  if (pix.isError)
    return (
      <CaixaErro>
        <p>{(pix.error as Error).message}</p>
        <button
          type="button"
          onClick={() => void pix.refetch()}
          className="mt-2 min-h-11 font-bold text-cobalto underline underline-offset-4"
        >
          Tentar de novo
        </button>
      </CaixaErro>
    );

  const p = pix.data;
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
      <img
        src={`data:image/png;base64,${p.imagem}`}
        alt="QR Code do Pix"
        width={224}
        height={224}
        className="order-2 size-56 self-center rounded-md border border-linha bg-white p-2 md:order-1 md:self-start"
      />
      <div className="order-1 flex min-w-0 flex-1 flex-col gap-4 md:order-2">
        <div>
          <p className="font-display text-[2rem] leading-none font-extrabold">{reais(p.valor)}</p>
          <p className="mt-1 text-legenda text-ink-suave">Vencimento: {dataLonga(p.vencimento)}</p>
        </div>
        <ol className="flex list-decimal flex-col gap-1 pl-5 text-[0.9375rem]">
          <li>Abra o app do seu banco e escolha pagar com Pix.</li>
          <li>Leia o QR Code ou use o código "copia e cola".</li>
          <li>Confirme o pagamento. Esta tela atualiza sozinha.</li>
        </ol>
        <div className="flex flex-col gap-2">
          <label htmlFor="pix-copia-e-cola" className="text-rotulo">
            Pix copia e cola
          </label>
          <textarea
            id="pix-copia-e-cola"
            readOnly
            rows={2}
            value={p.copiaECola}
            onFocus={(e) => e.currentTarget.select()}
            className="w-full resize-none rounded-md border-2 border-linha bg-louca px-3 py-2 font-mono text-legenda break-all text-ink-suave"
          />
          <Botao
            tamanho="lg"
            onClick={() => void copiar()}
            className="w-full sm:w-auto sm:self-start"
          >
            {copiado ? (
              <>
                <Check aria-hidden /> Código copiado
              </>
            ) : (
              <>
                <Copy aria-hidden /> Copiar código
              </>
            )}
          </Botao>
          <span role="status" className="sr-only">
            {copiado ? "Código Pix copiado" : ""}
          </span>
        </div>
        <p role="status" className="flex items-center gap-2 text-legenda font-bold text-cobalto">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-cobalto opacity-60 motion-reduce:animate-none" />
            <span className="relative inline-flex size-2.5 rounded-full bg-cobalto" />
          </span>
          Esperando o pagamento
        </p>
      </div>
    </div>
  );
}
