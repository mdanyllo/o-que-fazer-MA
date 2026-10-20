import { Link } from "@tanstack/react-router";
import { BadgeCheck } from "lucide-react";
import { dataLonga, ehPro, usePlano } from "@/lib/plano";

/** Faixa do plano no topo de "Meus negócios": Gratuito com convite ao Pro, ou o Pro e até quando. */
export function ResumoPlano({ perfilId }: { perfilId: string }) {
  const { data: a, isPending } = usePlano(perfilId);
  if (isPending) return null;
  const pro = ehPro(a);
  const link = "font-bold text-cobalto underline underline-offset-4";

  if (pro && a)
    return (
      <p
        role="status"
        className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-linha p-4"
      >
        <span className="inline-flex items-center gap-1 font-bold text-cobalto">
          <BadgeCheck className="size-5" aria-hidden /> Pro
        </span>
        <span className="text-ink-suave">
          {a.status === "atrasada"
            ? `A mensalidade venceu: pague até ${dataLonga(a.pro_ate!)} para manter o Pro.`
            : `Estatísticas e selo de verificado até ${dataLonga(a.pro_ate!)}.`}
        </span>
        <Link to="/painel/assinatura" className={link}>
          {a.status === "atrasada" ? "Pagar agora" : "Plano e pagamento"}
        </Link>
      </p>
    );

  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md bg-areia p-4">
      <span className="font-bold">Plano Gratuito</span>
      <span className="text-ink-suave">
        {a?.status === "aguardando_pagamento"
          ? "Estamos esperando a confirmação do pagamento do Pro."
          : "Com o Pro, você vê visitas e conversas no WhatsApp e ganha o selo de verificado."}
      </span>
      <Link to="/painel/assinatura" className={link}>
        {a?.status === "aguardando_pagamento" ? "Ver pagamento" : "Conhecer o Pro"}
      </Link>
    </p>
  );
}
