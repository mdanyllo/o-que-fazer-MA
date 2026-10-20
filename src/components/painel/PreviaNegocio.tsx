import { CardHospedagem, CardItem } from "@/components/azulejo/cards";
import { ConteudoItem } from "@/components/paginas/PaginaItem";
import { getCidade } from "@/data/cidades";
import { previaDoNegocio } from "@/data/catalogo";
import {
  lerPreco,
  normalizarInstagram,
  normalizarSite,
  type FotoDono,
  type Rascunho,
} from "@/lib/meus-negocios";
import { ContextoPrevia } from "@/lib/estatisticas";
import type { NegocioPublico } from "@/lib/negocios";
import { Miniatura } from "./Miniatura";

/** O formulário no formato do site público (sem `extras`: o site usa os padrões do tipo). */
function comoPublico(
  r: Rascunho,
  base: { id: string; slug: string; latitude: number | null; longitude: number | null },
  fotos: FotoDono[],
): NegocioPublico {
  const cidade = getCidade(r.cidade);
  const texto = (v: string) => v.trim() || null;
  return {
    id: base.id,
    tipo: r.tipo ?? "restaurante",
    subtipo:
      r.tipo === "hospedagem"
        ? r.subtipo_hospedagem || null
        : r.tipo === "restaurante"
          ? texto(r.culinaria)
          : null,
    nome: r.nome.trim() || "Nome do negócio",
    nome_curto: texto(r.nome_curto),
    slug: base.slug,
    cidade: texto(r.cidade),
    descricao: texto(r.descricao),
    endereco: texto(r.endereco),
    // o ponto que a equipe ajustou, ou o centro da cidade escolhida
    latitude: base.latitude ?? cidade?.lat ?? null,
    longitude: base.longitude ?? cidade?.lng ?? null,
    whatsapp: r.whatsapp ? `55${r.whatsapp}` : null,
    instagram: texto(normalizarInstagram(r.instagram)),
    site: texto(normalizarSite(r.site)),
    preco: r.tipo === "restaurante" ? null : lerPreco(r.preco),
    faixa_preco: r.tipo === "restaurante" ? r.faixa_preco || null : null,
    duracao: r.tipo === "passeio" ? texto(r.duracao) : null,
    horario: r.tipo === "restaurante" ? texto(r.horario) : null,
    exemplo: false,
    extras: {},
    negocio_fotos: fotos.map(({ caminho, ordem, legenda }) => ({ caminho, ordem, legenda })),
  };
}

/**
 * "Como vai aparecer": o card e a página do site, com os mesmos componentes.
 * Fica `inert` (sem cliques nem foco), porque os links ainda não levam a lugar nenhum.
 */
export function PreviaNegocio({
  rascunho,
  base,
  fotos,
}: {
  rascunho: Rascunho;
  base: { id: string; slug: string; latitude: number | null; longitude: number | null };
  fotos: FotoDono[];
}) {
  const { lugar, experiencia, hospedagem, item } = previaDoNegocio(
    comoPublico(rascunho, base, fotos),
  );

  return (
    <ContextoPrevia.Provider value>
      <section aria-labelledby="previa" className="flex flex-col gap-8">
        <div>
          <h2 id="previa" className="text-t2">
            Como vai aparecer
          </h2>
          <p className="mt-2 medida text-ink-suave">
            O card e a página do seu negócio no Azulejo, com os dados de agora. O ponto no mapa é o
            que você marcou em Contato.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-rotulo">Card</p>
          <div inert className="w-full max-w-xs">
            {hospedagem ? (
              <CardHospedagem hospedagem={hospedagem} />
            ) : item ? (
              <CardItem item={item} />
            ) : (
              <SemPagina />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-rotulo">Página</p>
          {lugar || experiencia ? (
            <div inert className="overflow-hidden rounded-md border border-linha bg-louca">
              <Miniatura>
                {experiencia ? (
                  <ConteudoItem
                    tipo="experiencia"
                    dados={experiencia}
                    {...(item ? { itemPrevia: item } : {})}
                  />
                ) : (
                  <ConteudoItem
                    tipo="lugar"
                    dados={lugar!}
                    {...(item ? { itemPrevia: item } : {})}
                  />
                )}
              </Miniatura>
            </div>
          ) : (
            <SemPagina />
          )}
        </div>
      </section>
    </ContextoPrevia.Provider>
  );
}

function SemPagina() {
  return (
    <p className="rounded-md bg-areia p-5 text-ink-suave">
      A página aparece quando houver cidade e uma descrição.
    </p>
  );
}
