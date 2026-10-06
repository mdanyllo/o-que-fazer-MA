import {
  Children,
  createElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type Tag = "div" | "section" | "li" | "article" | "ul" | "ol" | "p" | "header" | "aside";

/**
 * Revela o conteúdo uma vez, quando entra na tela: fade + 24px para cima (ou para o lado).
 * Sem JS ou com falha, o CSS mostra tudo (ver [data-revelar] em styles.css).
 */
export function Revelar({
  as = "div",
  atraso = 0,
  variante,
  className,
  style,
  children,
  id,
}: {
  as?: Tag;
  /** em ms, para escalonar itens de uma lista (60–80ms entre eles) */
  atraso?: number;
  variante?: "esquerda" | "direita" | "escala";
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") return setVisivel(true);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setVisivel(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return createElement(
    as,
    {
      ref,
      id,
      className,
      "data-revelar": variante ?? "",
      "data-visivel": visivel ? "" : undefined,
      style: { "--atraso": `${atraso}ms`, ...style } as CSSProperties,
    },
    children,
  );
}

/**
 * Grade com revelação escalonada: cada filho entra 70ms depois do anterior,
 * recomeçando a cada `colunas` itens (para a segunda linha não esperar demais).
 */
export function GradeRevelar({
  className,
  colunas = 3,
  passo = 70,
  as = "div",
  itemAs = "div",
  children,
}: {
  className?: string;
  colunas?: number;
  passo?: number;
  as?: Tag;
  itemAs?: Tag;
  children: ReactNode;
}) {
  return createElement(
    as,
    { className },
    Children.toArray(children).map((filho, i) => (
      <Revelar key={i} as={itemAs} atraso={(i % colunas) * passo} className="grid">
        {filho}
      </Revelar>
    )),
  );
}
