/// <reference types="leaflet.markercluster" />
import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import L from "leaflet";
import { useEffect, useMemo, type ReactNode } from "react";
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { corDaCategoria } from "@/components/azulejo/cores";
import type { Coordenada, Item } from "@/data";

/** Enquadramento inicial do Maranhão. */
const LIMITES_MARANHAO: L.LatLngBoundsExpression = [
  [-10.3, -48.8],
  [-1.0, -41.8],
];

export const chaveItem = (i: Pick<Item, "tipo" | "slug">) => `${i.tipo}:${i.slug}`;

export type MapaProps = {
  pontos: Item[];
  /** chave `tipo:slug` do ponto selecionado */
  selecionado?: string | null;
  aoSelecionar?: (item: Item | null) => void;
  /** linha da rota, desenhada em cobalto */
  rota?: Coordenada[];
  agrupar?: boolean;
  /** "pontos" enquadra os pontos; "maranhao" mostra o estado todo */
  enquadrar?: "pontos" | "maranhao";
  rolagemZoom?: boolean;
  className?: string;
  children?: ReactNode;
};

function iconePin(item: Item, ativo: boolean) {
  return L.divIcon({
    className: "pin-azulejo-wrap",
    html: `<span class="pin-azulejo${ativo ? " is-ativo" : ""}" data-cor="${corDaCategoria(item.categoria)}"><span class="pin-azulejo-ponto"></span></span>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    tooltipAnchor: [0, -18],
  });
}

function iconeGrupo(cluster: L.MarkerCluster) {
  const n = cluster.getChildCount();
  return L.divIcon({
    className: "pin-azulejo-wrap",
    html: `<span class="grupo-azulejo"><span>${n}</span></span>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

/** Voa até o ponto selecionado; respeita movimento reduzido. */
function Controle({
  pontos,
  selecionado,
  enquadrar,
}: Pick<MapaProps, "pontos" | "selecionado" | "enquadrar">) {
  const map = useMap();
  const reduzido =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // enquadramento inicial e quando a lista muda (filtros)
  const assinatura = pontos.map(chaveItem).join("|");
  useEffect(() => {
    if (enquadrar === "maranhao" || pontos.length === 0) {
      map.fitBounds(LIMITES_MARANHAO, { animate: false });
      return;
    }
    const limites = L.latLngBounds(pontos.map((p) => [p.lat, p.lng]));
    map.fitBounds(limites, { padding: [40, 40], maxZoom: 13, animate: !reduzido });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assinatura, enquadrar]);

  useEffect(() => {
    if (!selecionado) return;
    const p = pontos.find((x) => chaveItem(x) === selecionado);
    if (!p) return;
    const zoom = Math.max(map.getZoom(), 11);
    if (reduzido) map.setView([p.lat, p.lng], zoom);
    else map.flyTo([p.lat, p.lng], zoom, { duration: 0.9 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selecionado]);

  return null;
}

export default function MapaLeaflet({
  pontos,
  selecionado = null,
  aoSelecionar,
  rota,
  agrupar = true,
  enquadrar = "pontos",
  rolagemZoom = false,
  className,
  children,
}: MapaProps) {
  const marcadores = useMemo(
    () =>
      pontos.map((p) => {
        const chave = chaveItem(p);
        const ativo = chave === selecionado;
        return (
          <Marker
            key={chave}
            position={[p.lat, p.lng]}
            icon={iconePin(p, ativo)}
            zIndexOffset={ativo ? 1000 : 0}
            keyboard
            eventHandlers={{
              click: () => aoSelecionar?.(ativo ? null : p),
              add: (e) => {
                const el = (e.target as L.Marker).getElement();
                el?.setAttribute("aria-label", p.nome);
                el?.setAttribute("aria-pressed", String(ativo));
              },
            }}
          >
            {/* nome só no hover/toque, ou fixo quando o pin está selecionado */}
            <Tooltip
              key={ativo ? "fixo" : "hover"}
              direction="top"
              permanent={ativo}
              className="rotulo-mapa"
            >
              {p.nome}
            </Tooltip>
          </Marker>
        );
      }),
    [pontos, selecionado, aoSelecionar],
  );

  return (
    <div className={className} style={{ position: "relative" }}>
      <MapContainer
        bounds={LIMITES_MARANHAO}
        scrollWheelZoom={rolagemZoom}
        zoomControl
        attributionControl
        className="mapa-azulejo h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">colaboradores do OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {rota && rota.length > 1 && (
          <Polyline
            positions={rota.map((c) => [c.lat, c.lng] as [number, number])}
            pathOptions={{ className: "rota-mapa", weight: 4 }}
          />
        )}
        {agrupar ? (
          <MarkerClusterGroup
            iconCreateFunction={iconeGrupo}
            showCoverageOnHover={false}
            maxClusterRadius={44}
            spiderfyOnMaxZoom
          >
            {marcadores}
          </MarkerClusterGroup>
        ) : (
          marcadores
        )}
        <Controle pontos={pontos} selecionado={selecionado} enquadrar={enquadrar} />
      </MapContainer>
      {children}
    </div>
  );
}
