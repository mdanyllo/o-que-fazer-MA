/**
 * Fotos do site. Ficam em src/assets/images/<tipo>/<slug>.jpg e o Vite descobre, no build,
 * quais existem. Os dados usam o caminho lógico "/images/<tipo>/<slug>.jpg"; se o arquivo
 * não existir, o componente <Foto> mostra o fallback de azulejos sem fazer nenhuma requisição.
 * Para trocar ou acrescentar uma foto, basta salvar o arquivo com o nome listado em IMAGENS.md.
 */
const arquivos = import.meta.glob<string>("/src/assets/images/**/*.{jpg,jpeg,png,webp,avif}", {
  eager: true,
  query: "?url",
  import: "default",
});

const EXTENSAO = /\.(jpe?g|png|webp|avif)$/i;

const porCaminho = new Map(
  Object.entries(arquivos).map(([arquivo, url]) => [
    // "/src/assets/images/destinos/x.jpg" → "/images/destinos/x"
    arquivo.replace("/src/assets", "").replace(EXTENSAO, ""),
    url,
  ]),
);

/** URL final da foto, ou undefined se ela ainda não existe. Aceita qualquer extensão. */
export function urlFoto(caminho: string | undefined) {
  if (!caminho) return undefined;
  return porCaminho.get(caminho.replace(EXTENSAO, ""));
}
