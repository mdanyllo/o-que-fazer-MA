import { createFileRoute, notFound } from "@tanstack/react-router";
import { PaginaItem } from "@/components/paginas/PaginaItem";
import { Pagina404 } from "@/components/site/Pagina404";
import { getLugar } from "@/data";

export const Route = createFileRoute("/lugares/$slug")({
  loader: ({ params }) => {
    const dados = getLugar(params.slug);
    if (!dados) throw notFound();
    return { dados };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Lugar não encontrado | Azulejo" }] };
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
  return <PaginaItem tipo="lugar" dados={dados} />;
}
