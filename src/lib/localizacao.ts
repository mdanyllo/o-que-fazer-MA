import { useEffect, useState } from "react";
import type { Coordenada } from "@/data";

/** Ponto usado quando não dá para usar a posição real (permissão negada, fora do Maranhão…). */
export const POSICAO_RESERVA = {
  lat: -2.5297,
  lng: -44.3028,
  nome: "Centro Histórico de São Luís",
};

export type Localizacao =
  | { status: "buscando"; posicao: Coordenada }
  | { status: "real"; posicao: Coordenada }
  | { status: "fora" | "negada" | "indisponivel"; posicao: Coordenada };

/** Retângulo aproximado do Maranhão; fora dele, a posição real não serve para o "perto de mim". */
const noMaranhao = ({ lat, lng }: Coordenada) =>
  lat >= -10.3 && lat <= -1.0 && lng >= -48.8 && lng <= -41.7;

// guardada fora do componente para não pedir de novo a cada vez que o filtro liga
let emCache: Localizacao | undefined;

/**
 * Posição do visitante para o "perto de mim". Só pede ao navegador quando `ativo`;
 * enquanto espera (ou se não der), usa POSICAO_RESERVA.
 */
export function useLocalizacao(ativo: boolean): Localizacao {
  const [local, setLocal] = useState<Localizacao>(
    () => emCache ?? { status: "buscando", posicao: POSICAO_RESERVA },
  );

  useEffect(() => {
    if (!ativo || emCache) return;
    const fim = (l: Localizacao) => {
      emCache = l;
      setLocal(l);
    };
    if (!("geolocation" in navigator)) {
      fim({ status: "indisponivel", posicao: POSICAO_RESERVA });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const posicao = { lat: coords.latitude, lng: coords.longitude };
        fim(
          noMaranhao(posicao)
            ? { status: "real", posicao }
            : { status: "fora", posicao: POSICAO_RESERVA },
        );
      },
      (erro) =>
        fim({
          status: erro.code === erro.PERMISSION_DENIED ? "negada" : "indisponivel",
          posicao: POSICAO_RESERVA,
        }),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 10 * 60 * 1000 },
    );
  }, [ativo]);

  return local;
}
