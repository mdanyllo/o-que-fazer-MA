import { useMemo } from "react";
import { MapaInterativo } from "@/components/mapa/MapaInterativo";
import { useCatalogo } from "@/lib/use-catalogo";

/** Prévia do mapa na Home: só o Maranhão, mapa base claro e pins em cobalto. */
export function MapaPrevia() {
  const { itens } = useCatalogo();
  // só os atrativos (os negócios não entram na prévia)
  const pontos = useMemo(() => itens.filter((i) => i.tipo === "lugar" && !i.negocio), [itens]);
  return (
    <MapaInterativo pontos={pontos} previa className="h-[440px] w-full rounded-md lg:h-[540px]" />
  );
}
