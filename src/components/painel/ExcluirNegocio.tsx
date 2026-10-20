import { useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { botao } from "@/components/azulejo/botao";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { excluirNegocio, mensagemErroNegocio, type NegocioDono } from "@/lib/meus-negocios";
import { cn } from "@/lib/utils";

/** Excluir o negócio (com as fotos do Storage), depois de confirmar. */
export function ExcluirNegocio({
  negocio,
  aoExcluir,
  chave = ["meus-negocios"],
  naBarra = false,
}: {
  negocio: NegocioDono;
  aoExcluir: () => void;
  /** consulta a recarregar depois (painel do dono ou admin) */
  chave?: string[];
  /** na barra do dono na página pública: sem a linha de cima e com rótulo curto */
  naBarra?: boolean;
}) {
  const queryClient = useQueryClient();
  const [aberto, setAberto] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function confirmar() {
    setExcluindo(true);
    setErro(null);
    try {
      await excluirNegocio(negocio);
      await queryClient.invalidateQueries({ queryKey: chave });
      toast.success(`${negocio.nome} foi excluído.`);
      setAberto(false);
      aoExcluir();
    } catch (e) {
      setErro(mensagemErroNegocio(e));
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <section
      aria-label="Excluir negócio"
      className={naBarra ? undefined : "border-t border-linha pt-6"}
    >
      <AlertDialog open={aberto} onOpenChange={(a) => !excluindo && setAberto(a)}>
        <AlertDialogTrigger
          className={cn(botao({ variante: "fantasma" }), naBarra ? "px-3" : "-ml-3", "text-guara")}
        >
          <Trash2 aria-hidden /> {naBarra ? "Excluir" : "Excluir negócio"}
        </AlertDialogTrigger>
        <AlertDialogContent className="rounded-md border-linha bg-louca text-ink">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-t3">Excluir {negocio.nome}?</AlertDialogTitle>
            <AlertDialogDescription className="text-base text-ink-suave">
              {negocio.status === "publicado" ? "Ele sai do site na hora. " : ""}
              Os dados e as {negocio.negocio_fotos.length} fotos são apagados e não dá para
              desfazer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {erro && (
            <p role="alert" className="rounded-md border-2 border-guara p-3">
              {erro}
            </p>
          )}
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel
              disabled={excluindo}
              className={cn(botao({ variante: "secundario" }), "mt-0")}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={excluindo}
              onClick={(e) => {
                e.preventDefault();
                void confirmar();
              }}
              className={cn(botao(), "bg-guara hover:bg-guara/90")}
            >
              {excluindo ? "Excluindo…" : "Excluir de vez"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
