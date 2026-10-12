/// <reference types="leaflet.markercluster" />
import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import type { FeatureCollection } from "geojson";
import L from "leaflet";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import {
  GeoJSON,
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
  ZoomControl,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { corDaCategoria } from "@/components/azulejo/cores";
import type { Coordenada, Item } from "@/data";
// contorno do estado (IBGE, malha de qualidade mínima), salvo no projeto
import contornoMaranhao from "@/data/geo/maranhao.json";
import { cn } from "@/lib/utils";

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
  /**
   * prévia da Home: sem tiles, só o contorno do Maranhão sobre um fundo cobalto bem claro,
   * enquadrado no estado inteiro, sem nomes de cidades e com todos os pins em cobalto
   */
  previa?: boolean;
  /** canto dos botões de zoom; em mapas pequenos, em cima, para não cobrir nomes e atribuição */
  zoomNoTopo?: boolean;
  className?: string;
  children?: ReactNode;
};

/**
 * Mapa base claro e dessaturado (Esri Light Gray Canvas, sem chave de API), para não brigar
 * com as cores da marca. Os nomes vêm numa camada separada, que a prévia da Home não usa.
 */
const ATRIBUICAO =
  'Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; <a href="https://www.openstreetmap.org/copyright">colaboradores do OpenStreetMap</a>';
const ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas";
const TILES_BASE = `${ESRI}/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}`;
const TILES_NOMES = `${ESRI}/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}`;

const CONTORNO = contornoMaranhao as FeatureCollection;
const LIMITES_CONTORNO = L.geoJSON(CONTORNO).getBounds();

/** `entra`: primeira vez que o pin aparece, cai em sequência (índice `i`). */
function iconePin(item: Item, ativo: boolean, entra: boolean, i: number, cobalto: boolean) {
  const classes = ["pin-azulejo", ativo && "is-ativo", entra && "pin-entra"]
    .filter(Boolean)
    .join(" ");
  return L.divIcon({
    className: "pin-azulejo-wrap",
    html: `<span class="${classes}" style="--i:${i}" data-cor="${cobalto ? "cobalto" : corDaCategoria(item.categoria)}"><span class="pin-azulejo-ponto"></span></span>`,
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

/** A linha da rota se desenha (stroke-dashoffset) quando o mapa entra na tela. */
function desenharRota(path: SVGPathElement) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const comprimento = path.getTotalLength();
  if (!comprimento) return;
  path.style.strokeDasharray = `${comprimento}`;
  path.style.strokeDashoffset = `${comprimento}`;
  const animar = () => {
    const anim = path.animate([{ strokeDashoffset: comprimento }, { strokeDashoffset: 0 }], {
      duration: 1600,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      delay: 300,
      fill: "forwards",
    });
    // depois de desenhada, volta ao traço normal (o zoom muda o comprimento)
    anim.onfinish = () => {
      anim.cancel();
      path.style.strokeDasharray = "";
      path.style.strokeDashoffset = "";
    };
  };
  const io = new IntersectionObserver(([e]) => {
    if (e?.isIntersecting) {
      io.disconnect();
      animar();
    }
  });
  io.observe(path.closest(".leaflet-container") ?? path);
}

/** Voa até o ponto selecionado; respeita movimento reduzido. */
function Controle({
  pontos,
  selecionado,
  enquadrar,
  previa,
}: Pick<MapaProps, "pontos" | "selecionado" | "enquadrar" | "previa">) {
  const map = useMap();
  const reduzido =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // enquadramento inicial e quando a lista muda (filtros)
  const assinatura = pontos.map(chaveItem).join("|");
  useEffect(() => {
    if (previa) {
      map.fitBounds(LIMITES_CONTORNO, { padding: [32, 32], animate: false });
      return;
    }
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
  previa = false,
  zoomNoTopo = false,
  className,
  children,
}: MapaProps) {
  // pins que já apareceram não caem de novo (ex.: ao selecionar)
  const jaVistos = useRef(new Set<string>());
  useEffect(() => {
    pontos.forEach((p) => jaVistos.current.add(chaveItem(p)));
  }, [pontos]);

  const marcadores = useMemo(
    () =>
      pontos.map((p, i) => {
        const chave = chaveItem(p);
        const ativo = chave === selecionado;
        return (
          <Marker
            key={chave}
            position={[p.lat, p.lng]}
            icon={iconePin(p, ativo, !jaVistos.current.has(chave), i, previa)}
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
    [pontos, selecionado, aoSelecionar, previa],
  );

  return (
    <div className={cn("relative", className)}>
      <MapContainer
        bounds={LIMITES_MARANHAO}
        scrollWheelZoom={rolagemZoom}
        zoomControl={false}
        zoomSnap={previa ? 0 : 1}
        // sem tiles na prévia, o agrupamento de pins precisa do zoom máximo explícito
        maxZoom={18}
        attributionControl
        className={cn("mapa-azulejo h-full w-full", previa && "mapa-previa")}
      >
        {previa ? (
          <GeoJSON
            data={CONTORNO}
            interactive={false}
            style={{ className: "contorno-maranhao" }}
            attribution='Contorno: <a href="https://www.ibge.gov.br/">IBGE</a>'
          />
        ) : (
          <>
            <TileLayer attribution={ATRIBUICAO} url={TILES_BASE} maxNativeZoom={16} />
            <TileLayer url={TILES_NOMES} maxNativeZoom={16} />
          </>
        )}
        {rota && rota.length > 1 && (
          <Polyline
            positions={rota.map((c) => [c.lat, c.lng] as [number, number])}
            pathOptions={{ className: "rota-mapa", weight: 4 }}
            eventHandlers={{
              add: (e) => {
                const el = (e.target as L.Polyline).getElement();
                if (el instanceof SVGPathElement) desenharRota(el);
              },
            }}
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
        <ZoomControl
          position={zoomNoTopo ? "topright" : "bottomright"}
          zoomInTitle="Aproximar"
          zoomOutTitle="Afastar"
        />
        <Controle pontos={pontos} selecionado={selecionado} enquadrar={enquadrar} previa={previa} />
      </MapContainer>
      {children}
    </div>
  );
}
