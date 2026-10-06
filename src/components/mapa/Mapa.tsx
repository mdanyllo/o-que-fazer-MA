import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { LoadingAzulejo } from "@/components/azulejo/LoadingAzulejo";
import { PadraoAzulejo } from "@/components/azulejo/PadraoAzulejo";
import { cn } from "@/lib/utils";
import type { MapaProps } from "./MapaLeaflet";

export type { MapaProps } from "./MapaLeaflet";

// Leaflet usa `window`: o mapa só carrega no navegador, e só nas páginas que o usam.
const MapaLeaflet = lazy(() => import("./MapaLeaflet"));

function Carregando({ className }: { className?: string | undefined }) {
  return (
    <div className={cn("relative grid place-items-center overflow-hidden bg-areia", className)}>
      <PadraoAzulejo azulejo={48} className="absolute -top-6 -right-6 h-40 w-56 opacity-40" />
      <LoadingAzulejo rotulo="Carregando o mapa" />
    </div>
  );
}

/** Mapa do Azulejo (Leaflet + OpenStreetMap), carregado só no cliente. */
export function Mapa(props: MapaProps) {
  const fallback = <Carregando className={props.className} />;
  return (
    <ClientOnly fallback={fallback}>
      <Suspense fallback={fallback}>
        <MapaLeaflet {...props} />
      </Suspense>
    </ClientOnly>
  );
}
