import { useLoaderData } from "@tanstack/react-router";
import { criarCatalogo } from "@/data/catalogo";

/**
 * Catálogo com os negócios publicados. Os negócios são carregados uma vez no loader da raiz
 * (src/routes/__root.tsx), no servidor e depois a cada poucos minutos no navegador.
 */
export function useCatalogo() {
  const { negocios } = useLoaderData({ from: "__root__" });
  return criarCatalogo(negocios);
}
