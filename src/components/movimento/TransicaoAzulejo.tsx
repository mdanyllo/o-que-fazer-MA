import { useRouter } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/**
 * Transição azulejo: uma grade de quadrados se preenche em cascata diagonal, cobre a tela
 * e se desfaz revelando a próxima página. Usada com moderação: só ao abrir um destino ou
 * um roteiro. Duração total até 900ms. Desligada com movimento reduzido.
 */
const ALVO = /^\/(destinos|roteiros)\/[^/]+\/?$/;
const COLUNAS = 8;
const LINHAS = 5;
const PASSO = 0.03; // s entre diagonais
const DUR = 0.22; // s de cada azulejo
const COBRIR_MS = ((COLUNAS + LINHAS - 2) * PASSO + DUR) * 1000; // ~550ms

type Fase = "parado" | "cobrindo" | "revelando";

export function TransicaoAzulejo() {
  const router = useRouter();
  const reduzido = useReducedMotion();
  const [fase, setFase] = useState<Fase>("parado");
  const [rodada, setRodada] = useState(0);
  const inicio = useRef(0);
  const pendente = useRef(false);

  useEffect(() => {
    if (reduzido) return;
    const tirar1 = router.subscribe("onBeforeNavigate", (e) => {
      const para = e.toLocation.pathname;
      if (!ALVO.test(para) || para === e.fromLocation?.pathname) return;
      inicio.current = performance.now();
      pendente.current = true;
      setRodada((r) => r + 1);
      setFase("cobrindo");
    });
    const tirar2 = router.subscribe("onResolved", () => {
      if (!pendente.current) return;
      pendente.current = false;
      // espera a cobertura terminar antes de revelar
      const falta = Math.max(0, COBRIR_MS - (performance.now() - inicio.current));
      window.setTimeout(() => setFase("revelando"), falta);
    });
    return () => {
      tirar1();
      tirar2();
    };
  }, [router, reduzido]);

  if (fase === "parado") return null;

  const cobrindo = fase === "cobrindo";
  return (
    <div
      key={rodada}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[90] grid"
      style={{
        gridTemplateColumns: `repeat(${COLUNAS}, 1fr)`,
        gridTemplateRows: `repeat(${LINHAS}, 1fr)`,
      }}
    >
      {Array.from({ length: COLUNAS * LINHAS }, (_, i) => {
        const c = i % COLUNAS;
        const l = Math.floor(i / COLUNAS);
        const diagonal = c + l;
        // a cada 7 azulejos, um em cobalto-forte com o ponto do guará
        const especial = (c * 3 + l * 5) % 7 === 0;
        return (
          <motion.div
            key={i}
            className={`relative ${especial ? "bg-cobalto-forte" : "bg-cobalto"}`}
            style={{ margin: -1 }}
            initial={{ scale: cobrindo ? 0 : 1, opacity: cobrindo ? 0 : 1 }}
            animate={{ scale: cobrindo ? 1 : 0, opacity: cobrindo ? 1 : 0 }}
            transition={{
              duration: DUR,
              ease: [0.22, 1, 0.36, 1],
              delay: (cobrindo ? diagonal : COLUNAS + LINHAS - 2 - diagonal) * PASSO,
            }}
            onAnimationComplete={() => {
              if (!cobrindo && i === 0) setFase("parado");
            }}
          >
            {especial && (
              <span className="absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-guara" />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
