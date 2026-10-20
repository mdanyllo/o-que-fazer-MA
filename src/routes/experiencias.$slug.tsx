import { createFileRoute, notFound } from "@tanstack/react-router";
import { PaginaItem } from "@/components/paginas/PaginaItem";
import { PaginaNegocioIndisponivel } from "@/components/site/AvisoNegocios";
import { Pagina404 } from "@/components/site/Pagina404";
import { criarCatalogo } from "@/data/catalogo";
import { nomeDestino } from "@/data";
import { metaDaPagina, origemDoSite } from "@/lib/compartilhar";
import { buscarNegociosPublicados } from "@/lib/negocios";

export const Route = createFileRoute("/experiencias/$slug")({
  loader: async ({ params }) => {
    const catalogo = criarCatalogo(await buscarNegociosPublicados());
    const dados = catalogo.getExperiencia(params.slug);
    // endereço completo do site, para a prévia do link (WhatsApp, Instagram...)
    if (dados) return { dados, origem: origemDoSite() };
    // banco fora do ar: pode ser um negócio que existe; mostra o erro, não o 404
    if (!catalogo.negociosOk) return { dados: null };
    throw notFound();
  },
  head: ({ loaderData }) => {
    if (!loaderData?.dados) return { meta: [{ title: "Experiência não encontrada | Azulejo" }] };
    const { dados, origem } = loaderData;
    const onde = dados.negocio?.cidade ?? nomeDestino(dados.destino);
    return metaDaPagina({
      titulo: onde ? `${dados.nome} · ${onde}` : dados.nome,
      descricao: dados.resumo,
      caminho: `/experiencias/${dados.slug}`,
      foto: dados.foto,
      origem,
    });
  },
  notFoundComponent: () => (
    <Pagina404
      titulo="Experiência não encontrada"
      texto="Talvez ela ainda não esteja no Azulejo. Veja o que fazer no Maranhão."
    />
  ),
  component: Pagina,
});

function Pagina() {
  const { dados } = Route.useLoaderData();
  if (!dados) return <PaginaNegocioIndisponivel />;
  return <PaginaItem tipo="experiencia" dados={dados} />;
}
