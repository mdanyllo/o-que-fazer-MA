import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Classes de botão do Azulejo. Use em <button> (via <Botao>) ou direto em <Link>/<a>.
 * Principal: fundo cobalto. Secundário: borda 2px cobalto. Alvo mínimo de 44px.
 */
export const botao = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md font-bold whitespace-nowrap select-none transition-[background-color,color,border-color,transform] duration-150 ease-saida active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variante: {
        principal: "bg-cobalto text-sobre-cobalto hover:bg-cobalto-forte",
        secundario:
          "border-2 border-cobalto text-cobalto hover:bg-cobalto hover:text-sobre-cobalto",
        fantasma: "text-cobalto hover:bg-areia",
        "sobre-foto": "bg-louca text-ink hover:bg-areia",
        "contorno-foto":
          "border-2 border-sobre-foto text-sobre-foto hover:bg-sobre-foto hover:text-ink",
      },
      tamanho: {
        md: "px-5 text-[0.9375rem]",
        lg: "min-h-13 px-7 text-base",
        icone: "size-11 p-0",
      },
    },
    defaultVariants: { variante: "principal", tamanho: "md" },
  },
);

export type BotaoProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof botao>;

export function Botao({ className, variante, tamanho, type = "button", ...props }: BotaoProps) {
  return <button type={type} className={cn(botao({ variante, tamanho }), className)} {...props} />;
}
