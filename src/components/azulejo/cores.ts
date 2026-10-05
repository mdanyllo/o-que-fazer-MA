import {
  BedDouble,
  Drum,
  Landmark,
  TreePalm,
  UtensilsCrossed,
  Waves,
  type LucideIcon,
} from "lucide-react";
import { categoriaPorId } from "@/data/categorias";
import type { CategoriaId } from "@/data/tipos";

export type CorMaranhense = "lagoa" | "cobalto" | "babacu" | "ouro" | "guara" | "jucara";

/**
 * Classes literais por cor (o Tailwind só gera o que aparece escrito no código).
 * `sobre` é a cor de ícone/texto curto sobre o fundo da cor.
 */
export const COR: Record<
  CorMaranhense,
  { bg: string; text: string; sobre: string; borda: string }
> = {
  lagoa: { bg: "bg-lagoa", text: "text-lagoa", sobre: "text-louca", borda: "border-lagoa" },
  cobalto: {
    bg: "bg-cobalto",
    text: "text-cobalto",
    sobre: "text-sobre-cobalto",
    borda: "border-cobalto",
  },
  babacu: { bg: "bg-babacu", text: "text-babacu", sobre: "text-louca", borda: "border-babacu" },
  ouro: { bg: "bg-ouro", text: "text-ouro", sobre: "text-sobre-ouro", borda: "border-ouro" },
  guara: { bg: "bg-guara", text: "text-guara", sobre: "text-louca", borda: "border-guara" },
  jucara: { bg: "bg-jucara", text: "text-jucara", sobre: "text-louca", borda: "border-jucara" },
};

export const ICONE_CATEGORIA: Record<CategoriaId, LucideIcon> = {
  "lagoas-praias": Waves,
  cultura: Landmark,
  natureza: TreePalm,
  gastronomia: UtensilsCrossed,
  festas: Drum,
  hospedagem: BedDouble,
};

export function corDaCategoria(id: CategoriaId): CorMaranhense {
  return categoriaPorId[id].cor;
}
