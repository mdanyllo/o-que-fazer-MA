import { createFileRoute, notFound } from "@tanstack/react-router";
import { PaginaItem } from "@/components/paginas/PaginaItem";
import { PaginaNegocioIndisponivel } from "@/components/site/AvisoNegocios";
import { Pagina404 } from "@/components/site/Pagina404";
import { criarCatalogo } from "@/data/catalogo";
import { buscarNegociosPublicados } from "@/lib/negocios";

export const Route = createFileRoute("/lugares/$slug")({
  loader: async ({ params }) => {
    const catalogo = criarCatalogo(await buscarNegociosPublicados());
    const dados = catalogo.getLugar(params.slug);
    if (dados) return { dados };
    // banco fora do ar: pode ser um negócio que existe; mostra o erro, não o 404
    if (!catalogo.negociosOk) return { dados: null };
    throw notFound();
  },
  head: ({ loaderData }) => {
    if (!loaderData?.dados) return { meta: [{ title: "Lugar não encontrado | Azulejo" }] };
    const { dados } = loaderData;
    return {
      meta: [
        { title: `${dados.nome} | Azulejo` },
        { name: "description", content: dados.resumo },
        { property: "og:title", content: `${dados.nome} | Azulejo` },
        { property: "og:description", content: dados.resumo },
      ],
    };
  },
  notFoundComponent: () => (
    <Pagina404
      titulo="Lugar não encontrado"
      texto="Talvez ele ainda não esteja no Azulejo. Veja o que fazer no Maranhão."
    />
  ),
  component: Pagina,
});

function Pagina() {
  const { dados } = Route.useLoaderData();
  if (!dados) return <PaginaNegocioIndisponivel />;
  return <PaginaItem tipo="lugar" dados={dados} />;
}
