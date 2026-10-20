import { ClientOnly } from "@tanstack/react-router";
import { Check, LocateFixed, MapPin } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { Botao } from "@/components/azulejo/botao";
import { LoadingAzulejo } from "@/components/azulejo/LoadingAzulejo";
import { getCidade } from "@/data/cidades";

const MapaPosicao = lazy(() => import("@/components/mapa/MapaPosicaoLeaflet"));

const SAO_LUIS = { lat: -2.5297, lng: -44.3028 };
const arredondar = (v: number) => Math.round(v * 1e6) / 1e6;

/**
 * O próprio dono marca onde fica o negócio (ou o ponto de encontro do passeio): tocando no
 * mapa, arrastando o pin ou com a localização do aparelho. Sem marcar, fica no centro da cidade.
 */
export function CampoLocalizacao({
  cidade,
  latitude,
  longitude,
  passeio,
  aoMudar,
}: {
  cidade: string;
  latitude: number | null;
  longitude: number | null;
  passeio: boolean;
  aoMudar: (latitude: number, longitude: number) => void;
}) {
  const [buscando, setBuscando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const centro = getCidade(cidade) ?? SAO_LUIS;
  const marcado = latitude != null && longitude != null;
  const lat = latitude ?? centro.lat;
  const lng = longitude ?? centro.lng;
  const oQue = passeio ? "o ponto de encontro" : "o negócio";

  function mudar(a: number, b: number) {
    setErro(null);
    aoMudar(arredondar(a), arredondar(b));
  }

  function usarLocalAtual() {
    if (!navigator.geolocation) {
      setErro("Este aparelho não informa a localização. Marque no mapa.");
      return;
    }
    setBuscando(true);
    setErro(null);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setBuscando(false);
        mudar(p.coords.latitude, p.coords.longitude);
      },
      (e) => {
        setBuscando(false);
        setErro(
          e.code === e.PERMISSION_DENIED
            ? "Você não liberou a localização. Libere no navegador ou marque no mapa."
            : "Não conseguimos pegar sua localização agora. Marque no mapa.",
        );
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }

  const carregando = (
    <div className="grid h-80 place-items-center rounded-md bg-areia">
      <LoadingAzulejo rotulo="Carregando o mapa" />
    </div>
  );

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-rotulo">
        {passeio ? "Ponto de encontro no mapa" : "Localização no mapa"}
      </legend>
      <p className="medida text-ink-suave">
        Toque no mapa ou arraste o pin até onde fica {oQue}. Se estiver lá agora, use a sua
        localização. É esse ponto que abre no Google Maps, no Waze e no Uber para quem quiser ir.
      </p>
      <Botao
        variante="secundario"
        onClick={usarLocalAtual}
        disabled={buscando}
        className="self-start"
      >
        <LocateFixed aria-hidden />{" "}
        {buscando ? "Buscando sua localização…" : "Usar minha localização atual"}
      </Botao>
      {erro && (
        <p role="alert" className="text-legenda font-bold text-guara">
          {erro}
        </p>
      )}
      <ClientOnly fallback={carregando}>
        <Suspense fallback={carregando}>
          <MapaPosicao lat={lat} lng={lng} aoMudar={mudar} className="h-80 rounded-md" />
        </Suspense>
      </ClientOnly>
      <p role="status" className="flex items-center gap-2 text-legenda text-ink-suave">
        {marcado ? (
          <>
            <Check className="size-4 text-babacu" aria-hidden /> Ponto marcado.
          </>
        ) : (
          <>
            <MapPin className="size-4 text-cobalto" aria-hidden />
            {cidade
              ? `Ainda não marcado: por enquanto aparece no centro de ${cidade}.`
              : "Escolha a cidade em Dados básicos para o mapa abrir no lugar certo."}
          </>
        )}
      </p>
    </fieldset>
  );
}
