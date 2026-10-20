import { useEffect, useRef, useState, type ReactNode } from "react";

/** Largura de tela grande em que a página é montada antes de ser reduzida. */
const LARGURA = 1280;

/**
 * Mostra uma página inteira "em miniatura": no computador, monta o conteúdo com 1280px de
 * largura (o layout de verdade, com as duas colunas) e reduz até caber no espaço. No celular
 * não reduz nada: a página já está no layout de celular.
 */
export function Miniatura({ children }: { children: ReactNode }) {
  const fora = useRef<HTMLDivElement>(null);
  const dentro = useRef<HTMLDivElement>(null);
  const [medidas, setMedidas] = useState<{ escala: number; altura: number } | null>(null);

  useEffect(() => {
    const a = fora.current;
    const b = dentro.current;
    if (!a || !b || typeof ResizeObserver === "undefined") return;
    const grande = window.matchMedia("(min-width: 1024px)");
    const medir = () => {
      if (!grande.matches) return setMedidas(null);
      const escala = Math.min(1, a.clientWidth / LARGURA);
      setMedidas({ escala, altura: b.offsetHeight * escala });
    };
    const observador = new ResizeObserver(medir);
    observador.observe(a);
    observador.observe(b);
    grande.addEventListener("change", medir);
    medir();
    return () => {
      observador.disconnect();
      grande.removeEventListener("change", medir);
    };
  }, []);

  return (
    <div
      ref={fora}
      className="overflow-hidden"
      style={medidas ? { height: medidas.altura } : undefined}
    >
      <div
        ref={dentro}
        style={
          medidas
            ? { width: LARGURA, transform: `scale(${medidas.escala})`, transformOrigin: "0 0" }
            : undefined
        }
      >
        {children}
      </div>
    </div>
  );
}
