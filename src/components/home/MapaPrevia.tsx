import { useMemo } from "react";
import { MapaInterativo } from "@/components/mapa/MapaInterativo";
import { itens } from "@/data";

/** Prévia do mapa na Home: só os pins coloridos por categoria. */
export function MapaPrevia() {
  const pontos = useMemo(() => itens.filter((i) => i.tipo === "lugar" && !i.ficticio), []);
  return <MapaInterativo pontos={pontos} className="h-[360px] w-full rounded-md md:h-[440px]" />;
}
