import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestUrl } from "@tanstack/react-start/server";
import { urlFoto } from "./imagens";

/*
 * Link bonito para compartilhar: as meta tags Open Graph que o WhatsApp, o Instagram, o
 * Facebook e companhia leem para montar a prévia (foto grande, título e resumo).
 * Quem lê é um robô que não roda JavaScript: tudo sai pronto no HTML do servidor, com
 * endereços completos (https://...), que é o que os robôs exigem.
 */

/** "https://site.com.br": no servidor vem da requisição; no navegador, da barra de endereço. */
export const origemDoSite = createIsomorphicFn()
  .server(() => getRequestUrl({ xForwardedHost: true }).origin)
  .client(() => window.location.origin);

/** Tamanho que as redes recomendam para a foto da prévia. */
const PREVIA = { largura: 1200, altura: 630 };

/**
 * Foto da prévia em endereço completo. Fotos enviadas pelos negócios passam pelo recorte do
 * Supabase (1200×630, bem mais leve que o original: o WhatsApp ignora foto pesada).
 * Sem foto, fica a imagem padrão do site.
 */
export function fotoDaPrevia(foto: string | undefined, origem: string) {
  const url = urlFoto(foto);
  if (!url) return { url: `${origem}/og-image.jpg`, recortada: false };
  const doStorage = url.match(/^(https:\/\/[^/]+)\/storage\/v1\/object\/public\/(.+)$/);
  if (doStorage)
    return {
      url: `${doStorage[1]}/storage/v1/render/image/public/${doStorage[2]}?width=${PREVIA.largura}&height=${PREVIA.altura}&resize=cover&quality=75`,
      recortada: true,
    };
  return { url: /^https?:\/\//.test(url) ? url : `${origem}${url}`, recortada: false };
}

/** Meta tags da página de um lugar ou experiência. */
export function metaDaPagina({
  titulo,
  descricao,
  caminho,
  foto,
  origem,
}: {
  titulo: string;
  descricao: string;
  caminho: string;
  foto: string | undefined;
  origem: string;
}) {
  const previa = fotoDaPrevia(foto, origem);
  const url = `${origem}${caminho}`;
  return {
    meta: [
      { title: `${titulo} | Azulejo` },
      { name: "description", content: descricao },
      { property: "og:site_name", content: "Azulejo" },
      { property: "og:title", content: titulo },
      { property: "og:description", content: descricao },
      { property: "og:url", content: url },
      { property: "og:image", content: previa.url },
      { property: "og:image:alt", content: titulo },
      ...(previa.recortada
        ? [
            { property: "og:image:width", content: String(PREVIA.largura) },
            { property: "og:image:height", content: String(PREVIA.altura) },
          ]
        : []),
      { name: "twitter:title", content: titulo },
      { name: "twitter:description", content: descricao },
      { name: "twitter:image", content: previa.url },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
