import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// As classes da escala tipográfica do Azulejo (text-display, text-rotulo…) são tamanhos,
// não cores: sem isso o tailwind-merge descarta uma delas ao combinar com text-ink etc.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["display", "t1", "t2", "t3", "corpo", "legenda", "rotulo"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
