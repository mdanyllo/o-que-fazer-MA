import { useSyncExternalStore } from "react";

export type Tema = "dia" | "noite";

const CHAVE = "azulejo:tema";

/**
 * Roda inline no <head>, antes da primeira pintura:
 * - adiciona a classe `js` (as animações de entrada só escondem conteúdo quando há JS);
 * - aplica o tema salvo, sem piscar o tema errado.
 */
export const themeBootScript = `(function(){var d=document.documentElement;d.classList.add('js');try{if(localStorage.getItem('${CHAVE}')==='noite')d.setAttribute('data-theme','noite')}catch(e){}})();`;

const ouvintes = new Set<() => void>();

function lerTema(): Tema {
  return document.documentElement.getAttribute("data-theme") === "noite" ? "noite" : "dia";
}

export function definirTema(tema: Tema) {
  const raiz = document.documentElement;
  if (tema === "noite") raiz.setAttribute("data-theme", "noite");
  else raiz.removeAttribute("data-theme");
  try {
    localStorage.setItem(CHAVE, tema);
  } catch {
    // armazenamento indisponível (aba anônima etc.): o tema vale só para esta visita
  }
  ouvintes.forEach((fn) => fn());
}

export function useTema(): [Tema, (tema: Tema) => void] {
  const tema = useSyncExternalStore(
    (fn) => {
      ouvintes.add(fn);
      return () => ouvintes.delete(fn);
    },
    lerTema,
    () => "dia" as Tema,
  );
  return [tema, definirTema];
}
