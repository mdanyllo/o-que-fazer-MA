/**
 * Gera supabase/seed.sql com os negócios de exemplo (restaurantes, hospedagens e passeios)
 * a partir de src/data/exemplo. Todos entram com status 'publicado', exemplo = true e sem dono.
 *
 *   npm run seed:gerar
 *
 * O SQL é idempotente (upsert pelo slug): pode rodar de novo depois de mudar os dados.
 * Usa só `import type` nos arquivos de dados, então roda direto no Node, sem compilar.
 */
import { writeFileSync } from "node:fs";
import { destinos } from "../src/data/destinos.ts";
import { experiencias } from "../src/data/exemplo/experiencias.ts";
import { hospedagens } from "../src/data/exemplo/hospedagens.ts";
import { lugaresNegocios } from "../src/data/exemplo/lugares-negocios.ts";
import type { Hospedagem, Lugar } from "../src/data/tipos.ts";
import type { ExtrasNegocio, TipoNegocio } from "../src/lib/negocios.ts";

type Linha = {
  slug: string;
  tipo: TipoNegocio;
  subtipo: string | null;
  nome: string;
  nome_curto: string | null;
  cidade: string;
  descricao: string | null;
  latitude: number | null;
  longitude: number | null;
  preco: number | null;
  faixa_preco: string | null;
  duracao: string | null;
  horario: string | null;
  extras: ExtrasNegocio;
  fotos: string[];
};

const cidade = (slug: string) => {
  const destino = destinos.find((d) => d.slug === slug);
  if (!destino) throw new Error(`Destino desconhecido: ${slug}`);
  return destino.nome;
};

const SIMBOLO = { 1: "$", 2: "$$", 3: "$$$" } as const;

const SUBTIPO: Record<Hospedagem["tipo"], string> = {
  Pousada: "pousada",
  Hotel: "hotel",
  Chalé: "chale",
  Hostel: "hostel",
  "Casa de temporada": "casa_de_temporada",
};

/** "A partir de R$ 120 por pessoa (exemplo)" → 120 */
function precoDe(texto: string) {
  const m = texto.match(/R\$\s*(\d+)/);
  return m ? Number(m[1]) : null;
}

/** Campos editoriais comuns de um lugar ou passeio dos dados antigos. */
const editoriais = (x: Lugar | (typeof experiencias)[number]): ExtrasNegocio => ({
  categoria: x.categoria,
  resumo: x.resumo,
  tags: x.tags,
  mesesBons: x.mesesBons,
  horas: x.horas,
  dicas: x.info.dicas,
});

const linhas: Linha[] = [];

// ——— passeios ———
experiencias.forEach((x, ordem) => {
  const preco = precoDe(x.info.preco);
  // o site monta "A partir de R$ X por pessoa (exemplo)"; guarda o texto só quando difere
  const precoTexto =
    x.info.preco === `A partir de R$ ${preco} por pessoa (exemplo)` ? undefined : x.info.preco;
  linhas.push({
    slug: x.slug,
    tipo: "passeio",
    subtipo: null,
    nome: x.nome,
    nome_curto: null,
    cidade: cidade(x.destino),
    descricao: x.descricao,
    latitude: x.lat,
    longitude: x.lng,
    preco,
    faixa_preco: null,
    duracao: x.info.duracao,
    horario: x.info.horario,
    extras: {
      ...editoriais(x),
      faixaPreco: x.faixaPreco,
      dificuldade: x.dificuldade,
      lugares: x.lugares,
      empresas: x.empresas,
      ordem,
      ...(precoTexto ? { precoTexto } : {}),
    },
    fotos: [x.foto],
  });
});

// ——— restaurantes ———
for (const x of lugaresNegocios.filter((l) => l.tipo === "restaurante")) {
  linhas.push({
    slug: x.slug,
    tipo: "restaurante",
    subtipo: null,
    nome: x.nome,
    nome_curto: null,
    cidade: cidade(x.destino),
    descricao: x.descricao,
    latitude: x.lat,
    longitude: x.lng,
    preco: null,
    faixa_preco: SIMBOLO[x.faixaPreco],
    duracao: null,
    horario: x.info.horario,
    extras: { ...editoriais(x), precoTexto: x.info.preco, duracaoTexto: x.info.duracao },
    fotos: [x.foto],
  });
}

// ——— hospedagens: pousadas com página (lugares) + cards de "Onde ficar" ———
const comPagina = lugaresNegocios.filter((l) => l.tipo === "hospedagem");
for (const x of comPagina) {
  const ordem = hospedagens.findIndex((h) => h.lugar === x.slug);
  const card = hospedagens[ordem];
  linhas.push({
    slug: x.slug,
    tipo: "hospedagem",
    subtipo: SUBTIPO[card?.tipo ?? "Pousada"],
    nome: x.nome,
    nome_curto: card && card.nome !== x.nome ? card.nome : null,
    cidade: cidade(x.destino),
    descricao: x.descricao,
    latitude: x.lat,
    longitude: x.lng,
    // o preço do card de "Onde ficar" vale para a página também
    preco: card?.precoNoite ?? precoDe(x.info.preco),
    faixa_preco: null,
    duracao: null,
    horario: x.info.horario,
    extras: {
      ...editoriais(x),
      faixaPreco: x.faixaPreco,
      duracaoTexto: x.info.duracao,
      ...(card
        ? { ordem, avaliacao: card.avaliacao, avaliacoes: card.avaliacoes }
        : // pousada que só tinha página, sem card na Home
          { ondeFicar: false }),
    },
    fotos: [...new Set([x.foto, ...(card ? [card.foto] : [])])],
  });
}
hospedagens.forEach((h, ordem) => {
  if (h.lugar) return; // já entrou junto com a página
  linhas.push({
    slug: h.slug,
    tipo: "hospedagem",
    subtipo: SUBTIPO[h.tipo],
    nome: h.nome,
    nome_curto: null,
    cidade: cidade(h.destino),
    descricao: null,
    latitude: null,
    longitude: null,
    preco: h.precoNoite ?? null,
    faixa_preco: null,
    duracao: null,
    horario: null,
    extras: { ordem, avaliacao: h.avaliacao, avaliacoes: h.avaliacoes },
    fotos: [h.foto],
  });
});

// ——— conferências (as mesmas regras do banco) ———
const slugs = new Set<string>();
for (const l of linhas) {
  if (slugs.has(l.slug)) throw new Error(`Slug repetido: ${l.slug}`);
  slugs.add(l.slug);
  if (l.nome.length > 60) throw new Error(`Nome com mais de 60 caracteres: ${l.nome}`);
  if (l.nome_curto && l.nome_curto.length > 22)
    throw new Error(`Nome curto com mais de 22 caracteres: ${l.nome_curto}`);
}

// ——— SQL ———
const texto = (v: string | null) => (v === null ? "null" : `'${v.replaceAll("'", "''")}'`);
const numero = (v: number | null) => (v === null ? "null" : String(v));

const valores = linhas.map(
  (l) =>
    `  (${[
      texto(l.slug),
      texto(l.tipo),
      texto(l.subtipo),
      texto(l.nome),
      texto(l.nome_curto),
      texto(l.cidade),
      texto(l.descricao),
      numero(l.latitude),
      numero(l.longitude),
      numero(l.preco),
      texto(l.faixa_preco),
      texto(l.duracao),
      texto(l.horario),
      `${texto(JSON.stringify(l.extras))}::jsonb`,
    ].join(", ")})`,
);

const fotos = linhas.flatMap((l) =>
  l.fotos.map((caminho, ordem) => `  (${texto(l.slug)}, ${texto(caminho)}, ${ordem})`),
);

const sql = `-- GERADO por scripts/gerar-seed.ts (npm run seed:gerar). Não edite à mão.
-- Negócios de exemplo do MVP: publicados, sem dono, exemplo = true.
-- Rode no SQL Editor do Supabase (ou deixe o "supabase db reset" rodar). Pode rodar de novo.

begin;

insert into public.negocios (
  slug, tipo, subtipo, nome, nome_curto, cidade, descricao, latitude, longitude,
  preco, faixa_preco, duracao, horario, extras
)
select v.*
from (values
${valores.join(",\n")}
) as v (
  slug, tipo, subtipo, nome, nome_curto, cidade, descricao, latitude, longitude,
  preco, faixa_preco, duracao, horario, extras
)
on conflict (slug) do update set
  tipo = excluded.tipo,
  subtipo = excluded.subtipo,
  nome = excluded.nome,
  nome_curto = excluded.nome_curto,
  cidade = excluded.cidade,
  descricao = excluded.descricao,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  preco = excluded.preco,
  faixa_preco = excluded.faixa_preco,
  duracao = excluded.duracao,
  horario = excluded.horario,
  extras = excluded.extras;

-- os campos abaixo ficam fora do insert para valer também no update
update public.negocios
set status = 'publicado', exemplo = true, dono_id = null, aprovado_em = coalesce(aprovado_em, now())
where slug in (${linhas.map((l) => texto(l.slug)).join(", ")});

-- fotos: as dos exemplos são trocadas inteiras (caminhos "/images/..." são fotos do próprio site)
delete from public.negocio_fotos f
using public.negocios n
where f.negocio_id = n.id and n.exemplo;

insert into public.negocio_fotos (negocio_id, caminho, ordem)
select n.id, f.caminho, f.ordem
from (values
${fotos.join(",\n")}
) as f (slug, caminho, ordem)
join public.negocios n on n.slug = f.slug;

commit;
`;

writeFileSync(new URL("../supabase/seed.sql", import.meta.url), sql);
console.log(
  `supabase/seed.sql: ${linhas.length} negócios (${linhas.filter((l) => l.tipo === "passeio").length} passeios, ${linhas.filter((l) => l.tipo === "restaurante").length} restaurantes, ${linhas.filter((l) => l.tipo === "hospedagem").length} hospedagens), ${fotos.length} fotos.`,
);
