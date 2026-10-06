import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { PadraoAzulejo } from "@/components/azulejo/PadraoAzulejo";

/**
 * Faixa de azulejos que desliza de lado enquanto a página rola. Com mais de uma fileira,
 * cada uma mostra uma linha diferente do padrão e vai no sentido oposto da vizinha.
 * Decorativa; parada com movimento reduzido e antes de montar (HTML do servidor igual).
 */
export function FaixaAzulejoRolagem({
  azulejo = 40,
  linhas = 1,
}: {
  azulejo?: number;
  linhas?: 1 | 2 | 3;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduzido = useReducedMotion();
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // o padrão se repete a cada 4 azulejos; andar dois ciclos não deixa emenda à vista
  const curso = azulejo * 8;
  const ida = useTransform(scrollYProgress, [0, 1], [0, -curso]);
  const volta = useTransform(scrollYProgress, [0, 1], [-curso, 0]);
  const ligado = montado && !reduzido;

  return (
    <div ref={ref} aria-hidden className="overflow-hidden" style={{ height: azulejo * linhas }}>
      {Array.from({ length: linhas }, (_, l) => (
        <motion.div
          key={l}
          style={{
            width: `calc(100% + ${curso}px)`,
            ...(ligado ? { x: l % 2 ? volta : ida } : {}),
          }}
        >
          <PadraoAzulejo
            azulejo={azulejo}
            style={{ height: azulejo, backgroundPositionY: -l * azulejo }}
          />
        </motion.div>
      ))}
    </div>
  );
}
