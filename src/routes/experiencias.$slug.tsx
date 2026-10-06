import { createFileRoute, notFound } from "@tanstack/react-router";
import { PaginaItem } from "@/components/paginas/PaginaItem";
import { Pagina404 } from "@/components/site/Pagina404";
import { getExperiencia } from "@/data";

export const Route = createFileRoute("/experiencias/$slug")({
  loader: ({ params }) => {
    const dados = getExperiencia(params.slug);
    if (!dados) throw notFound();
    return { dados };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Experiência não encontrada | Azulejo" }] };
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
      titulo="Experiência não encontrada"
      texto="Talvez ela ainda não esteja no Azulejo. Veja o que fazer no Maranhão."
    />
  ),
  component: Pagina,
});

function Pagina() {
  const { dados } = Route.useLoaderData();
  return <PaginaItem tipo="experiencia" dados={dados} />;
}
