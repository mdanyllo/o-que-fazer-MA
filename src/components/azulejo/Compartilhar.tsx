import { Check, Instagram, Link2, MessageCircle, Share2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { registrarEvento, useEhPrevia } from "@/lib/estatisticas";
import { cn } from "@/lib/utils";
import { botao } from "./botao";
import { Foto } from "./Foto";

type Canal = "whatsapp" | "instagram" | "link";

async function copiar(texto: string) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    // sem permissão para a área de transferência (alguns navegadores e apps): jeito antigo
    const campo = document.createElement("textarea");
    campo.value = texto;
    campo.setAttribute("readonly", "");
    campo.style.position = "fixed";
    campo.style.opacity = "0";
    document.body.append(campo);
    campo.select();
    const ok = document.execCommand("copy");
    campo.remove();
    return ok;
  }
}

/** Celular ou tablet com a folha de compartilhar do sistema (onde o Instagram aparece). */
function temFolhaDoSistema() {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    window.matchMedia("(pointer: coarse)").matches
  );
}

/**
 * "Compartilhar" com WhatsApp, Instagram e copiar o link, e uma prévia de como o link aparece
 * (a mesma foto, título e resumo das meta tags de src/lib/compartilhar.ts).
 * Em negócio do banco, cada canal conta nas estatísticas (fora da prévia do painel).
 */
export function Compartilhar({
  caminho,
  nome,
  onde,
  resumo,
  foto,
  negocioId,
}: {
  /** "/lugares/slug" */
  caminho: string;
  nome: string;
  /** cidade ou destino, para o título */
  onde?: string | undefined;
  resumo: string;
  foto: string;
  negocioId?: string | undefined;
}) {
  const previa = useEhPrevia();
  const [copiado, setCopiado] = useState(false);
  const titulo = onde ? `${nome} · ${onde}` : nome;
  const url = () => `${window.location.origin}${caminho}`;
  const contar = (canal: Canal) => {
    if (!previa) registrarEvento(negocioId, `compartilhar_${canal}`);
  };

  function whatsapp() {
    contar("whatsapp");
    const texto = `Olha o que eu achei no Azulejo: ${titulo}\n${url()}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank", "noopener");
  }

  async function instagram() {
    contar("instagram");
    // no celular, a folha do sistema leva direto ao Direct ou aos Stories do Instagram
    if (temFolhaDoSistema()) {
      try {
        await navigator.share({ title: titulo, text: resumo, url: url() });
      } catch {
        /* a pessoa fechou a folha */
      }
      return;
    }
    // no computador o Instagram não recebe links de fora: copia e explica onde colar
    if (await copiar(url()))
      toast.success("Link copiado", {
        description: "Cole no Direct, na bio ou num sticker de link nos Stories do Instagram.",
      });
  }

  async function copiarLink() {
    contar("link");
    if (await copiar(url())) {
      setCopiado(true);
      toast.success("Link copiado");
      setTimeout(() => setCopiado(false), 2500);
    } else {
      toast.error("Não deu para copiar. Copie o endereço:", { description: url() });
    }
  }

  return (
    <Dialog>
      <DialogTrigger
        className={cn(botao({ variante: "fantasma" }), "-my-2 -mr-3 px-3")}
        aria-label={`Compartilhar ${nome}`}
      >
        <Share2 aria-hidden /> Compartilhar
      </DialogTrigger>
      <DialogContent className="max-w-md gap-5 rounded-md border-linha bg-louca p-5 text-ink sm:p-6">
        <div className="flex flex-col gap-1 pr-10">
          <DialogTitle className="text-t2">Compartilhar</DialogTitle>
          <DialogDescription className="text-base text-ink-suave">
            É assim que o link aparece numa conversa.
          </DialogDescription>
        </div>

        {/* prévia do link, no formato das conversas */}
        <figure className="overflow-hidden rounded-md border border-linha bg-white noite:bg-areia">
          <Foto src={foto} alt="" rotulo={nome} className="aspect-[1200/630]" sizes="28rem" />
          <figcaption className="flex flex-col gap-0.5 p-3">
            <span className="text-legenda text-ink-suave uppercase">
              {typeof window === "undefined" ? "" : window.location.host}
            </span>
            <span className="line-clamp-1 font-bold">{titulo}</span>
            <span className="line-clamp-2 text-legenda text-ink-suave">{resumo}</span>
          </figcaption>
        </figure>

        <div className="grid grid-cols-3 gap-2">
          <Canal icone={<MessageCircle />} rotulo="WhatsApp" onClick={whatsapp} />
          <Canal icone={<Instagram />} rotulo="Instagram" onClick={instagram} />
          <Canal
            icone={copiado ? <Check /> : <Link2 />}
            rotulo={copiado ? "Copiado" : "Copiar link"}
            onClick={copiarLink}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Canal({
  icone,
  rotulo,
  onClick,
}: {
  icone: ReactNode;
  rotulo: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-md border border-linha p-3 font-bold transition-colors duration-150 hover:border-cobalto hover:bg-areia active:scale-[0.98]"
    >
      <span
        className="grid size-11 place-items-center rounded-full bg-cobalto text-sobre-cobalto [&_svg]:size-5"
        aria-hidden
      >
        {icone}
      </span>
      <span className="text-legenda">{rotulo}</span>
    </button>
  );
}
