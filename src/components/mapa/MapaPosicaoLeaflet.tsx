import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, TileLayer, ZoomControl, useMap, useMapEvents } from "react-leaflet";
import { cn } from "@/lib/utils";

const ATRIBUICAO =
  'Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; <a href="https://www.openstreetmap.org/copyright">colaboradores do OpenStreetMap</a>';
const ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas";

export type MapaPosicaoProps = {
  lat: number;
  lng: number;
  aoMudar: (lat: number, lng: number) => void;
  className?: string;
};

const icone = L.divIcon({
  className: "pin-azulejo-wrap",
  html: '<span class="pin-azulejo is-ativo" data-cor="cobalto"><span class="pin-azulejo-ponto"></span></span>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

/** Clique no mapa move o pin. */
function Cliques({ aoMudar }: Pick<MapaPosicaoProps, "aoMudar">) {
  useMapEvents({ click: (e) => aoMudar(e.latlng.lat, e.latlng.lng) });
  return null;
}

/** Quando os números mudam por fora (campos), o mapa acompanha. */
function Seguir({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    if (!map.getBounds().pad(-0.2).contains([lat, lng])) map.panTo([lat, lng], { animate: false });
  }, [lat, lng, map]);
  return null;
}

/** Mapa do admin para ajustar o ponto do negócio: clicar ou arrastar o pin. */
export default function MapaPosicaoLeaflet({ lat, lng, aoMudar, className }: MapaPosicaoProps) {
  const eventos = useMemo(
    () => ({
      dragend: (e: L.LeafletEvent) => {
        const p = (e.target as L.Marker).getLatLng();
        aoMudar(p.lat, p.lng);
      },
    }),
    [aoMudar],
  );
  return (
    <div className={cn("relative isolate overflow-hidden", className)}>
      <MapContainer
        center={[lat, lng]}
        zoom={14}
        className="mapa-azulejo mapa-posicao h-full w-full"
        zoomControl={false}
        scrollWheelZoom
      >
        <TileLayer
          attribution={ATRIBUICAO}
          url={`${ESRI}/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}`}
          maxNativeZoom={16}
        />
        <TileLayer
          url={`${ESRI}/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}`}
          maxNativeZoom={16}
        />
        <Marker
          position={[lat, lng]}
          icon={icone}
          draggable
          keyboard={false}
          eventHandlers={eventos}
        />
        <Cliques aoMudar={aoMudar} />
        <Seguir lat={lat} lng={lng} />
        <ZoomControl position="topright" zoomInTitle="Aproximar" zoomOutTitle="Afastar" />
      </MapContainer>
    </div>
  );
}
