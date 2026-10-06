import { CalendarDays, Compass, Heart, House, Map, MapPinned, Route } from "lucide-react";

/** Navegação principal (header no desktop). */
export const NAV_PRINCIPAL = [
  { to: "/explorar", rotulo: "Explorar" },
  { to: "/destinos", rotulo: "Destinos" },
  { to: "/roteiros", rotulo: "Roteiros" },
  { to: "/mapa", rotulo: "Mapa" },
  { to: "/eventos", rotulo: "Eventos" },
] as const;

/** Bottom navigation no celular. */
export const NAV_INFERIOR = [
  { to: "/", rotulo: "Início", icone: House },
  { to: "/explorar", rotulo: "Explorar", icone: Compass },
  { to: "/mapa", rotulo: "Mapa", icone: Map },
  { to: "/roteiros", rotulo: "Roteiros", icone: Route },
  { to: "/minha-viagem", rotulo: "Minha viagem", icone: Heart },
] as const;

/** Links extras do menu do celular (o que não cabe na barra inferior). */
export const NAV_EXTRA = [
  { to: "/destinos", rotulo: "Destinos", icone: MapPinned },
  { to: "/eventos", rotulo: "Eventos", icone: CalendarDays },
] as const;
