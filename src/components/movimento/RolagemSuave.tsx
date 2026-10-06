import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

/**
 * Rolagem suave com Lenis, carregado sob demanda. Desligada com movimento reduzido.
 * Mapas, menus e diálogos rolam do jeito nativo (Lenis não intercepta).
 */
export function RolagemSuave() {
  const router = useRouter();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ativo = true;
    let raf = 0;
    let destruir = () => {};
    let tirarRota = () => {};

    import("lenis").then(({ default: Lenis }) => {
      if (!ativo) return;
      const lenis = new Lenis({
        duration: 1.1,
        prevent: (no: HTMLElement) =>
          Boolean(
            no.closest?.(
              ".leaflet-container, [data-lenis-prevent], [role='dialog'], [data-vaul-drawer], select",
            ),
          ),
      });
      const loop = (t: number) => {
        lenis.raf(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      // ao trocar de página o conteúdo muda de altura
      tirarRota = router.subscribe("onResolved", () => lenis.resize());
      destruir = () => lenis.destroy();
    });

    return () => {
      ativo = false;
      cancelAnimationFrame(raf);
      tirarRota();
      destruir();
    };
  }, [router]);

  return null;
}
