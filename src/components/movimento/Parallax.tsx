import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Parallax suave: o conteúdo (uma foto) desliza no máximo 8% enquanto a página rola.
 * A camada é um pouco maior que a moldura para nunca mostrar borda vazia.
 * Só liga depois de montar, para o HTML do servidor e o do navegador começarem iguais.
 */
export function Parallax({
  children,
  intensidade = 6,
}: {
  children: ReactNode;
  intensidade?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduzido = useReducedMotion();
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const limite = Math.min(intensidade, 8);
  const y = useTransform(scrollYProgress, [0, 1], [`-${limite}%`, `${limite}%`]);
  const ligado = montado && !reduzido;

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -inset-x-[2px] -inset-y-[9%]"
        {...(ligado ? { style: { y } } : {})}
      >
        {children}
      </motion.div>
    </div>
  );
}
