import { createFileRoute, notFound } from "@tanstack/react-router";
import { Foto } from "@/components/azulejo/Foto";
import { corDaCategoria } from "@/components/azulejo/cores";
import { CabecalhoPagina, PageShell } from "@/components/site/PageShell";
import { getExperiencia } from "@/data";

// Provisório (etapa c): a página completa do lugar/experiência é feita na etapa (d).
export const Route = createFileRoute("/experiencias/$slug")({
  loader: ({ params }) => {
    const item = getExperiencia(params.slug);
    if (!item) throw notFound();
    return { item };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.item.nome} | Azulejo` : "Não encontrado | Azulejo" },
    ],
  }),
  component: Pagina,
});

function Pagina() {
  const { item } = Route.useLoaderData();
  return (
    <PageShell>
      <CabecalhoPagina titulo={item.nome} apoio={item.resumo} />
      <div className="mx-auto max-w-7xl px-5 pb-20 md:px-12">
        <Foto
          src={item.foto}
          alt={item.nome}
          rotulo={item.nome}
          cor={corDaCategoria(item.categoria)}
          className="aspect-[16/9] rounded-md"
        />
        <p className="mt-8 medida">{item.descricao}</p>
      </div>
    </PageShell>
  );
}
