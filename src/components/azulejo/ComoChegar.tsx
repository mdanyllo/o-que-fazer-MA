import { Navigation } from "lucide-react";
import type { Coordenada } from "@/data";
import { cn } from "@/lib/utils";
import { botao } from "./botao";

/**
 * Botões que abrem o Google Maps ou o Waze com a rota da posição atual até o ponto.
 * Quem traça a rota é o app de mapas; o site não pede a localização aqui.
 */
export function ComoChegar({
  destino,
  nome,
  className,
}: {
  destino: Coordenada;
  nome: string;
  className?: string;
}) {
  const ll = `${destino.lat},${destino.lng}`;
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-wrap gap-2">
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${ll}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Como chegar a ${nome} pelo Google Maps (abre em nova aba)`}
          className={cn(botao(), "flex-1")}
        >
          <Navigation /> Como chegar
        </a>
        <a
          href={`https://waze.com/ul?ll=${ll}&navigate=yes`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Como chegar a ${nome} pelo Waze (abre em nova aba)`}
          className={botao({ variante: "secundario" })}
        >
          Waze
        </a>
      </div>
      <p className="text-legenda text-ink-suave">
        Abre a rota no app de mapas, saindo de onde você está. Em alguns lugares o último trecho é
        de 4x4 ou barco.
      </p>
    </div>
  );
}
