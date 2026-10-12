import { useRouter } from "@tanstack/react-router";
import { RotateCw } from "lucide-react";
import { useState } from "react";
import { Botao } from "@/components/azulejo/botao";
import { cn } from "@/lib/utils";
import { PageShell } from "./PageShell";

/**
 * Estado de erro simples quando o banco não respondeu: o resto da página continua de pé
 * e dá para tentar de novo sem recarregar.
 */
export function AvisoNegocios({ className }: { className?: string }) {
  const router = useRouter();
  const [tentando, setTentando] = useState(false);

  async function tentarDeNovo() {
    setTentando(true);
    try {
      await router.invalidate();
    } finally {
      setTentando(false);
    }
  }

  return (
    <div
      role="status"
      className={cn(
        "flex flex-col gap-4 rounded-md border border-linha bg-areia p-5 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="medida">
        Não conseguimos carregar restaurantes, hospedagens e passeios agora. O resto do guia
        continua funcionando.
      </p>
      <Botao variante="secundario" onClick={tentarDeNovo} disabled={tentando} className="shrink-0">
        <RotateCw aria-hidden /> {tentando ? "Tentando…" : "Tentar de novo"}
      </Botao>
    </div>
  );
}

/** Página de um negócio quando o banco não respondeu (em vez de "não encontrado"). */
export function PaginaNegocioIndisponivel() {
  return (
    <PageShell>
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-5 pt-10 pb-16 md:px-12 md:pt-16 md:pb-24">
        <h1 className="text-t1 text-cobalto">Essa página não carregou</h1>
        <AvisoNegocios />
      </div>
    </PageShell>
  );
}
