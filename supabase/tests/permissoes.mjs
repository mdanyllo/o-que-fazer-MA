// Testes das regras do banco (RLS, permissões por coluna e gatilhos), sem Docker:
// roda as migrações e o seed num Postgres em memória (PGlite) com uma imitação mínima dos
// schemas auth e storage do Supabase, e faz cada operação como visitante, dono ou admin.
//
//   npm run test:banco
import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";

const pasta = new URL("../", import.meta.url);
const ler = (caminho) => readFileSync(new URL(caminho, pasta), "utf8");

const db = new PGlite();

// ——— imitação do que o Supabase já traz pronto ———
await db.exec(`
create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
grant usage on schema public to anon, authenticated, service_role;
create schema auth;
create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb default '{}');
create function auth.uid() returns uuid language sql stable
  as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to anon, authenticated;
create schema storage;
create table storage.buckets (id text primary key, name text, public boolean,
  file_size_limit bigint, allowed_mime_types text[]);
create table storage.objects (id uuid default gen_random_uuid() primary key, bucket_id text, name text);
alter table storage.objects enable row level security;
create function storage.foldername(name text) returns text[] language sql
  as $$ select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1] $$;
create function storage.extension(name text) returns text language sql
  as $$ select reverse(split_part(reverse(name), '.', 1)) $$;
grant usage on schema storage to anon, authenticated;
grant all on storage.objects to authenticated;
`);

for (const arquivo of readdirSync(new URL("migrations/", pasta)).sort())
  await db.exec(ler(`migrations/${arquivo}`));
const seed = ler("seed.sql");
await db.exec(seed);
await db.exec(seed); // idempotente

const U = {
  dona: "11111111-1111-1111-1111-111111111111",
  outro: "22222222-2222-2222-2222-222222222222",
  admin: "33333333-3333-3333-3333-333333333333",
  terceira: "44444444-4444-4444-4444-444444444444",
};
await db.exec(`
insert into auth.users (id, email, raw_user_meta_data) values
  ('${U.dona}', 'dona@x.com', '{"nome": "Dona Um", "papel": "admin"}'),
  ('${U.outro}', 'outro@x.com', '{"nome": "Dono Dois"}'),
  ('${U.admin}', 'admin@x.com', '{}'),
  ('${U.terceira}', 'terceira@x.com', '{"nome": "Dona Três"}');
update perfis set papel = 'admin' where id = '${U.admin}';`);

// ——— utilitários ———
let passaram = 0;
const falhas = [];
let secao = "";

/**
 * Roda `sql` como `papel` (e usuário `uid`).
 * `espera`: "erro", { erro: "trecho da mensagem" } ou função que confere as linhas.
 */
async function como(papel, uid, descricao, sql, espera) {
  await db.exec("begin");
  let ok;
  let detalhe;
  let linhas;
  try {
    await db.exec(
      `set local role ${papel}; select set_config('request.jwt.claim.sub', '${uid ?? ""}', true);`,
    );
    const { rows } = await db.query(sql);
    await db.exec("commit");
    linhas = rows;
    ok =
      espera !== "erro" &&
      typeof espera !== "object" &&
      (typeof espera !== "function" || espera(rows));
    detalhe = JSON.stringify(rows).slice(0, 160);
  } catch (e) {
    await db.exec("rollback");
    ok = espera === "erro" || (typeof espera === "object" && e.message.includes(espera.erro));
    detalhe = `erro: ${e.message}`;
  }
  if (ok) passaram++;
  else falhas.push(`${secao} › ${descricao}\n      ${detalhe}`);
  console.log(`  ${ok ? "✓" : "✗"} ${descricao}${ok ? "" : `\n      ${detalhe}`}`);
  return linhas;
}
const visitante = (d, sql, e) => como("anon", null, d, sql, e);
const dona = (d, sql, e) => como("authenticated", U.dona, d, sql, e);
const outro = (d, sql, e) => como("authenticated", U.outro, d, sql, e);
const terceira = (d, sql, e) => como("authenticated", U.terceira, d, sql, e);
const admin = (d, sql, e) => como("authenticated", U.admin, d, sql, e);
const valor = (v) => (rows) => rows.length === 1 && Object.values(rows[0])[0] === v;
const nenhuma = (rows) => rows.length === 0;
const uma = (rows) => rows.length === 1;
const titulo = (t) => {
  secao = t;
  console.log(`\n${t}`);
};
function confere(descricao, ok, detalhe = "") {
  if (ok) passaram++;
  else falhas.push(`${secao} › ${descricao} ${detalhe}`);
  console.log(`  ${ok ? "✓" : "✗"} ${descricao}${ok ? "" : ` ${detalhe}`}`);
}
const linha = async (slug) =>
  (await db.query(`select * from negocios where slug = '${slug}'`)).rows[0];

const DESCRICAO = "Cozinha maranhense do dia a dia, com arroz de cuxá e peixe-pedra frito.";
const COMPLETAR_RESTAURANTE = `cidade = 'São Luís', descricao = '${DESCRICAO}', whatsapp = '5598991234567',
  subtipo = 'Comida maranhense', faixa_preco = '$$', horario = 'Almoço todos os dias',
  endereco = 'Rua Portugal, 100'`;
const COMPLETAR_PASSEIO = `cidade = 'Tutóia', descricao = '${DESCRICAO}', whatsapp = '5598991234567',
  preco = 150, duracao = 'Dia inteiro', ponto_encontro = 'Porto de Tutóia'`;

// ——— testes ———

titulo("Seed");
{
  const { rows } = await db.query(
    "select count(*)::int n, bool_and(exemplo) ex, bool_and(status = 'publicado') pub, bool_and(not alterado_desde_revisao) limpo from negocios",
  );
  const r = rows[0];
  confere(
    "24 negócios publicados, de exemplo e sem marca (rodou 2x)",
    r.n === 24 && r.ex && r.pub && r.limpo,
  );
}

titulo("Perfis");
await visitante("visitante não lê perfis", "select count(*) from perfis", "erro");
await dona(
  "papel mandado no cadastro é ignorado",
  "select papel from perfis where id = auth.uid()",
  valor("dono"),
);
await dona("lê só o próprio perfil", "select count(*)::int from perfis", valor(1));
await dona(
  "edita o próprio nome",
  "update perfis set nome = 'Dona Um da Silva' where id = auth.uid() returning nome",
  valor("Dona Um da Silva"),
);
await dona("não vira admin", "update perfis set papel = 'admin' where id = auth.uid()", "erro");
await dona(
  "não cria perfil",
  "insert into perfis (id, nome, papel) values (gen_random_uuid(), 'x', 'admin')",
  "erro",
);
await outro(
  "não edita perfil alheio",
  `update perfis set nome = 'x' where id = '${U.dona}' returning id`,
  nenhuma,
);
await admin("admin lê todos os perfis", "select count(*)::int from perfis", valor(4));

titulo("Visitante");
await visitante("lê os 24 publicados", "select count(*)::int from negocios", valor(24));
await visitante(
  "lê o ponto de encontro",
  "select count(ponto_encontro)::int from negocios",
  valor(0),
);
await visitante("não lê notas_internas", "select notas_internas from negocios limit 1", "erro");
await visitante(
  "select * falha (notas_internas fechada)",
  "select * from negocios limit 1",
  "erro",
);
await visitante("lê as fotos dos publicados", "select count(*)::int from negocio_fotos", valor(24));
await visitante(
  "não cria negócio",
  "insert into negocios (tipo, nome) values ('restaurante', 'X')",
  "erro",
);

titulo("Slug automático");
await outro(
  "gerado do nome e da cidade",
  "insert into negocios (tipo, nome, cidade) values ('restaurante', 'Bar da Um', 'São Luís') returning slug",
  valor("bar-da-um-sao-luis"),
);
await dona(
  "repetido ganha sufixo, mesmo com o outro rascunho escondido pela RLS",
  "insert into negocios (tipo, nome, cidade) values ('restaurante', 'Bar da Um', 'São Luís') returning slug",
  valor("bar-da-um-sao-luis-2"),
);
await outro(
  "o slug mandado pelo dono é ignorado",
  "insert into negocios (tipo, nome, cidade, slug) values ('passeio', 'Café & Cia.', 'Alcântara', 'meu-slug') returning slug",
  valor("cafe-cia-alcantara"),
);
await outro(
  "sem cidade, usa só o nome",
  "insert into negocios (tipo, nome) values ('passeio', 'Lancha Azul') returning slug",
  valor("lancha-azul"),
);
await outro(
  "nome sem letras vira 'negocio'",
  "insert into negocios (tipo, nome) values ('passeio', '!!!') returning slug",
  valor("negocio"),
);
await dona(
  "editar o nome não muda o slug",
  "update negocios set nome = 'Bar da Um e Meio' where slug = 'bar-da-um-sao-luis-2' returning slug",
  valor("bar-da-um-sao-luis-2"),
);
await dona(
  "o dono não muda o slug",
  "update negocios set slug = 'outro' where slug = 'bar-da-um-sao-luis-2'",
  "erro",
);
await admin(
  "nem o admin muda o slug",
  "update negocios set slug = 'outro' where slug = 'cozinha-do-cuxa'",
  "erro",
);
await admin(
  "admin pode escolher o slug ao criar",
  "insert into negocios (tipo, nome, slug) values ('passeio', 'Passeio da equipe', 'passeio-equipe') returning slug",
  valor("passeio-equipe"),
);
await admin(
  "admin sem slug também recebe um gerado",
  "insert into negocios (tipo, nome, cidade) values ('passeio', 'Cozinha do Cuxá', 'São Luís') returning slug",
  valor("cozinha-do-cuxa-sao-luis"),
);

titulo("Dono: criar");
await dona(
  "campos da equipe são zerados ao criar",
  `insert into negocios (tipo, nome, exemplo, extras, notas_internas, aprovado_por, alterado_desde_revisao, dono_id)
   values ('passeio', 'Barco do Zé', true, '{"avaliacao": 5}', 'oi', '${U.admin}', true, '${U.outro}')
   returning dono_id = auth.uid() and not exemplo and extras = '{}'
     and aprovado_por is null and not alterado_desde_revisao as ok`,
  valor(true),
);
confere("…e as notas internas também", (await linha("barco-do-ze"))?.notas_internas === null);
for (const s of ["pendente", "publicado", "recusado"])
  await dona(
    `não cria já como ${s}`,
    `insert into negocios (tipo, nome, status) values ('restaurante', 'Bar 3', '${s}')`,
    "erro",
  );
await visitante(
  "rascunho não aparece para o visitante",
  "select count(*)::int from negocios where slug like 'bar-da-um%'",
  valor(0),
);

titulo("Dono não vê nem mexe no negócio de outro dono");
await outro(
  "não vê os negócios da dona",
  `select count(*)::int from negocios where dono_id = '${U.dona}'`,
  valor(0),
);
await outro(
  "não lê pelo slug",
  "select id from negocios where slug = 'bar-da-um-sao-luis-2'",
  nenhuma,
);
await outro(
  "não edita",
  "update negocios set nome = 'roubado' where slug = 'bar-da-um-sao-luis-2' returning id",
  nenhuma,
);
await outro(
  "não apaga",
  "delete from negocios where slug = 'bar-da-um-sao-luis-2' returning id",
  nenhuma,
);
await dona(
  "não edita negócio de exemplo",
  "update negocios set nome = 'roubado' where slug = 'cozinha-do-cuxa' returning id",
  nenhuma,
);
await dona(
  "não apaga negócio de exemplo",
  "delete from negocios where slug = 'cozinha-do-cuxa' returning id",
  nenhuma,
);

titulo("Enviar para análise exige cadastro completo e 1 foto");
await dona(
  "rascunho incompleto não vai para análise",
  "update negocios set status = 'pendente' where slug = 'bar-da-um-sao-luis-2'",
  { erro: "falta: descrição" },
);
await dona(
  "salva os dados (continua rascunho)",
  `update negocios set ${COMPLETAR_RESTAURANTE} where slug = 'bar-da-um-sao-luis-2' returning status`,
  valor("rascunho"),
);
await dona(
  "sem foto ainda não vai",
  "update negocios set status = 'pendente' where slug = 'bar-da-um-sao-luis-2'",
  { erro: "falta: 1 foto" },
);
const idBar = (await linha("bar-da-um-sao-luis-2")).id;
await dona(
  "envia a capa",
  `insert into negocio_fotos (negocio_id, caminho, ordem) values ('${idBar}', '${idBar}/capa.webp', 0) returning id`,
  uma,
);
await dona(
  "WhatsApp inválido não vai",
  "update negocios set status = 'pendente', whatsapp = '5598' where slug = 'bar-da-um-sao-luis-2'",
  { erro: "falta: WhatsApp" },
);
await dona(
  "descrição curta não vai",
  "update negocios set status = 'pendente', descricao = 'Curta.' where slug = 'bar-da-um-sao-luis-2'",
  { erro: "descrição" },
);
await dona(
  "completo, vai para análise",
  "update negocios set status = 'pendente' where slug = 'bar-da-um-sao-luis-2' returning status",
  valor("pendente"),
);
await dona(
  "em análise, continua editando",
  "update negocios set horario = 'Almoço e jantar' where slug = 'bar-da-um-sao-luis-2' returning status",
  valor("pendente"),
);
await dona(
  "em análise, não pode apagar campo obrigatório",
  "update negocios set faixa_preco = null where slug = 'bar-da-um-sao-luis-2'",
  { erro: "falta: faixa de preço" },
);
await dona(
  "o horário de funcionamento é opcional (pode apagar em análise)",
  "update negocios set horario = null where slug = 'bar-da-um-sao-luis-2' returning id",
  uma,
);

titulo("Dono só muda o status para enviar à análise");
await dona(
  "não volta de análise para rascunho",
  "update negocios set status = 'rascunho' where slug = 'bar-da-um-sao-luis-2'",
  "erro",
);
await dona(
  "não se publica",
  "update negocios set status = 'publicado' where slug = 'bar-da-um-sao-luis-2'",
  "erro",
);
await dona(
  "não se recusa",
  "update negocios set status = 'recusado' where slug = 'bar-da-um-sao-luis-2'",
  "erro",
);

titulo("Dono não altera campos da equipe");
for (const [campo, expr] of [
  ["aprovado_por", "auth.uid()"],
  ["aprovado_em", "now()"],
  ["exemplo", "true"],
  ["notas_internas", "'oi'"],
  ["extras", `'{"avaliacao": 5}'`],
  ["motivo_recusa", "'nada'"],
  ["dono_id", "null"],
  ["alterado_desde_revisao", "true"],
  ["alterado_em", "now()"],
  ["criado_em", "now()"],
  ["slug", "'novo'"],
])
  await dona(
    `não muda ${campo}`,
    `update negocios set ${campo} = ${expr} where slug = 'bar-da-um-sao-luis-2'`,
    "erro",
  );
await dona(
  "não lê extras de outro jeito: filtrar por notas_internas falha",
  "update negocios set nome = 'x' where notas_internas is null",
  "erro",
);
await dona("não lê notas_internas pela função", `select public.notas_internas('${idBar}')`, "erro");

titulo("Admin aprova; dono edita o publicado");
await admin(
  "aprova",
  "update negocios set status = 'publicado', notas_internas = 'conferido' where slug = 'bar-da-um-sao-luis-2' returning status",
  valor("publicado"),
);
{
  const n = await linha("bar-da-um-sao-luis-2");
  confere(
    "aprovado_por preenchido pelo banco, sem marca",
    n.aprovado_por === U.admin && !n.alterado_desde_revisao,
  );
}
await dona(
  "salvar sem mudar nada não marca",
  "update negocios set nome = nome where slug = 'bar-da-um-sao-luis-2' returning alterado_desde_revisao",
  valor(false),
);
await dona(
  "editar mantém publicado e marca alterado com a data",
  "update negocios set descricao = descricao || ' Agora com jantar.' where slug = 'bar-da-um-sao-luis-2' returning status || ' ' || alterado_desde_revisao::text || ' ' || (alterado_em is not null)::text",
  valor("publicado true true"),
);
await visitante(
  "continua no site",
  "select count(*)::int from negocios where slug = 'bar-da-um-sao-luis-2'",
  valor(1),
);
await dona(
  "publicado não pode ficar incompleto",
  "update negocios set whatsapp = null where slug = 'bar-da-um-sao-luis-2'",
  { erro: "WhatsApp" },
);
for (const s of ["rascunho", "pendente", "recusado"])
  await dona(
    `não muda o status de publicado para ${s}`,
    `update negocios set status = '${s}' where slug = 'bar-da-um-sao-luis-2'`,
    "erro",
  );
await admin(
  "marca como revisado",
  "update negocios set alterado_desde_revisao = false where slug = 'bar-da-um-sao-luis-2' returning alterado_desde_revisao",
  valor(false),
);
await dona(
  "trocar a ordem das fotos do publicado também marca",
  `update negocio_fotos set ordem = 1 where negocio_id = '${idBar}' returning id`,
  uma,
);
confere("…marcado", (await linha("bar-da-um-sao-luis-2")).alterado_desde_revisao === true);
await admin(
  "revisa de novo",
  "update negocios set alterado_desde_revisao = false where slug = 'bar-da-um-sao-luis-2' returning id",
  uma,
);
await dona(
  "enviar foto nova no publicado marca",
  `insert into negocio_fotos (negocio_id, caminho, ordem) values ('${idBar}', '${idBar}/b.webp', 2) returning id`,
  uma,
);
confere("…marcado", (await linha("bar-da-um-sao-luis-2")).alterado_desde_revisao === true);
await admin(
  "editar como admin não marca",
  "update negocios set horario = 'Almoço' where slug = 'cozinha-do-cuxa' returning alterado_desde_revisao",
  valor(false),
);

titulo("Recusado volta para análise ao ser corrigido");
await admin(
  "admin recusa com motivo",
  "update negocios set status = 'recusado', motivo_recusa = 'Faltam fotos.' where slug = 'barco-do-ze' returning status",
  valor("recusado"),
);
await dona(
  "o dono vê o motivo",
  "select motivo_recusa from negocios where slug = 'barco-do-ze'",
  valor("Faltam fotos."),
);
await dona(
  "corrigir sem completar não reenvia",
  `update negocios set ${COMPLETAR_PASSEIO} where slug = 'barco-do-ze'`,
  { erro: "falta: 1 foto" },
);
const idBarco = (await linha("barco-do-ze")).id;
await dona(
  "foto no recusado",
  `insert into negocio_fotos (negocio_id, caminho) values ('${idBarco}', '${idBarco}/a.jpg') returning id`,
  uma,
);
await dona(
  "corrigido e completo, volta para análise",
  `update negocios set ${COMPLETAR_PASSEIO} where slug = 'barco-do-ze' returning status`,
  valor("pendente"),
);
await admin(
  "recusa de novo",
  "update negocios set status = 'recusado' where slug = 'barco-do-ze' returning status",
  valor("recusado"),
);
await dona(
  "reenviar explicitamente também vale",
  "update negocios set status = 'pendente' where slug = 'barco-do-ze' returning status",
  valor("pendente"),
);

titulo("Fotos e Storage");
await dona(
  "não aponta para foto fora da pasta do negócio",
  `insert into negocio_fotos (negocio_id, caminho) values ('${idBar}', '/images/lugares/lagoa-azul.jpg')`,
  "erro",
);
await outro(
  "não põe foto em negócio alheio",
  `insert into negocio_fotos (negocio_id, caminho) values ('${idBar}', '${idBar}/x.jpg')`,
  "erro",
);
await outro(
  "não vê as fotos de rascunho alheio",
  `select count(*)::int from negocio_fotos where negocio_id = '${idBarco}'`,
  valor(0),
);
await outro(
  "não apaga foto alheia",
  `delete from negocio_fotos where negocio_id = '${idBar}' returning id`,
  nenhuma,
);
for (let i = 3; i <= 8; i++)
  await dona(
    `foto ${i} de 8`,
    `insert into negocio_fotos (negocio_id, caminho, ordem) values ('${idBar}', '${idBar}/${i}.webp', ${i}) returning id`,
    uma,
  );
await dona(
  "a 9ª foto é recusada",
  `insert into negocio_fotos (negocio_id, caminho, ordem) values ('${idBar}', '${idBar}/9.webp', 9)`,
  { erro: "até 8 fotos" },
);
await dona(
  "upload jpg na própria pasta",
  `insert into storage.objects (bucket_id, name) values ('fotos-negocios', '${idBar}/capa.jpg') returning id`,
  uma,
);
await dona(
  "upload webp na própria pasta",
  `insert into storage.objects (bucket_id, name) values ('fotos-negocios', '${idBar}/capa.webp') returning id`,
  uma,
);
await dona(
  "upload gif é recusado",
  `insert into storage.objects (bucket_id, name) values ('fotos-negocios', '${idBar}/capa.gif')`,
  "erro",
);
await dona(
  "upload na pasta de outro negócio é recusado",
  `insert into storage.objects (bucket_id, name) values ('fotos-negocios', '${(await linha("cozinha-do-cuxa")).id}/capa.jpg')`,
  "erro",
);
await outro(
  "upload na pasta do negócio da dona é recusado",
  `insert into storage.objects (bucket_id, name) values ('fotos-negocios', '${idBar}/intruso.jpg')`,
  "erro",
);
await dona(
  "upload fora de pasta é recusado",
  "insert into storage.objects (bucket_id, name) values ('fotos-negocios', 'capa.jpg')",
  "erro",
);
await dona(
  "upload em pasta inventada é recusado",
  "insert into storage.objects (bucket_id, name) values ('fotos-negocios', 'qualquer/capa.jpg')",
  "erro",
);
await outro(
  "não lista os arquivos da dona",
  `select count(*)::int from storage.objects where name like '${idBar}/%'`,
  valor(0),
);
await outro(
  "não apaga arquivo da dona",
  `delete from storage.objects where name like '${idBar}/%' returning id`,
  nenhuma,
);
await dona(
  "apaga o próprio arquivo",
  `delete from storage.objects where name = '${idBar}/capa.jpg' returning id`,
  uma,
);
await admin(
  "admin envia em qualquer pasta",
  `insert into storage.objects (bucket_id, name) values ('fotos-negocios', '${idBarco}/equipe.webp') returning id`,
  uma,
);

titulo("Limite de 5 negócios por conta");
for (let i = 1; i <= 5; i++)
  await terceira(
    `cria o ${i}º`,
    `insert into negocios (tipo, nome) values ('restaurante', 'Casa ${i}') returning id`,
    uma,
  );
await terceira(
  "o 6º é recusado com mensagem clara",
  "insert into negocios (tipo, nome) values ('restaurante', 'Casa 6')",
  { erro: "limite de 5 negócios" },
);
await terceira(
  "apagando um, volta a caber",
  "delete from negocios where slug = 'casa-5' returning id",
  uma,
);
await terceira(
  "…e cria de novo",
  "insert into negocios (tipo, nome) values ('restaurante', 'Casa 6') returning slug",
  valor("casa-6"),
);
await admin(
  "o limite não vale para a equipe",
  "select count(*)::int from negocios where dono_id is null",
  (r) => r[0].count >= 24,
);

titulo("Só o admin");
// "Casa 1" é um rascunho da terceira; completamos como superusuário para poder publicar
await db.exec(`update negocios set cidade = 'Atins', descricao = '${DESCRICAO}', whatsapp = '5598991234567',
  subtipo = 'Peixes', faixa_preco = '$', horario = 'Almoço', endereco = 'Rua da Praia, 1' where slug = 'casa-1'`);
const idCasa = (await linha("casa-1")).id;
await db.exec(
  `insert into negocio_fotos (negocio_id, caminho) values ('${idCasa}', '${idCasa}/a.webp')`,
);
await terceira(
  "envia para análise",
  "update negocios set status = 'pendente' where slug = 'casa-1' returning status",
  valor("pendente"),
);
await outro(
  "outro dono não aprova",
  "update negocios set status = 'publicado' where slug = 'casa-1' returning id",
  nenhuma,
);
await terceira(
  "a própria dona não aprova",
  "update negocios set status = 'publicado' where slug = 'casa-1'",
  "erro",
);
await admin(
  "recusar sem motivo é barrado",
  "update negocios set status = 'recusado' where slug = 'casa-1'",
  { erro: "escreva o motivo" },
);
await admin(
  "recusar com motivo em branco também",
  "update negocios set status = 'recusado', motivo_recusa = '   ' where slug = 'casa-1'",
  { erro: "escreva o motivo" },
);
await terceira(
  "a dona não recusa",
  "update negocios set status = 'recusado', motivo_recusa = 'x' where slug = 'casa-1'",
  "erro",
);
await admin(
  "recusa com motivo",
  "update negocios set status = 'recusado', motivo_recusa = 'Foto escura.' where slug = 'casa-1' returning status",
  valor("recusado"),
);
await terceira(
  "a dona vê o motivo",
  "select motivo_recusa from negocios where slug = 'casa-1'",
  valor("Foto escura."),
);
await admin(
  "aprova (publica)",
  "update negocios set status = 'publicado' where slug = 'casa-1' returning status",
  valor("publicado"),
);
{
  const n = await linha("casa-1");
  confere(
    "aprovar registra quem e quando e limpa o motivo antigo",
    n.aprovado_por === U.admin && n.aprovado_em && n.motivo_recusa === null,
  );
}
await terceira(
  "a dona edita o publicado (fica marcado)",
  "update negocios set horario = 'Almoço e jantar' where slug = 'casa-1' returning alterado_desde_revisao",
  valor(true),
);
const aprovadoEm = (await linha("casa-1")).aprovado_em.getTime();
await terceira(
  "a dona não tira a marca",
  "update negocios set alterado_desde_revisao = false where slug = 'casa-1'",
  "erro",
);
await admin(
  "marcar como revisado tira só a marca",
  "update negocios set alterado_desde_revisao = false where slug = 'casa-1' returning status",
  valor("publicado"),
);
{
  const n = await linha("casa-1");
  confere(
    "…sem mudar status nem quem aprovou",
    !n.alterado_desde_revisao &&
      n.aprovado_em.getTime() === aprovadoEm &&
      n.aprovado_por === U.admin,
  );
}
await terceira(
  "a dona não despublica",
  "update negocios set status = 'rascunho' where slug = 'casa-1'",
  "erro",
);
await admin(
  "despublica (volta para rascunho)",
  "update negocios set status = 'rascunho' where slug = 'casa-1' returning status",
  valor("rascunho"),
);
await visitante(
  "despublicado sai do site",
  "select count(*)::int from negocios where slug = 'casa-1'",
  valor(0),
);
await admin(
  "edita as notas internas",
  "update negocios set notas_internas = 'Ligar para a dona.' where slug = 'casa-1' returning id",
  uma,
);
await admin(
  "lê as notas internas",
  `select public.notas_internas('${idCasa}')`,
  valor("Ligar para a dona."),
);
await terceira(
  "a dona não edita notas internas",
  "update negocios set notas_internas = 'x' where slug = 'casa-1'",
  "erro",
);
await terceira("nem lê", `select public.notas_internas('${idCasa}')`, "erro");
await admin(
  "edita qualquer campo de qualquer pessoa",
  "update negocios set nome = 'Casa Um' where slug = 'casa-1' returning nome",
  valor("Casa Um"),
);

titulo("Cadastro pela equipe e transferência");
await admin(
  "cadastra já publicado, sem dono, sem ser exemplo",
  "insert into negocios (tipo, nome, cidade, status, exemplo) values ('passeio', 'Barco da Equipe', 'Tutóia', 'publicado', false) returning (dono_id is null and status = 'publicado' and not exemplo and aprovado_por = auth.uid())::text",
  valor("true"),
);
await visitante(
  "aparece no site",
  "select count(*)::int from negocios where slug = 'barco-da-equipe-tutoia'",
  valor(1),
);
await dona(
  "dono comum não cadastra para os outros",
  "insert into negocios (tipo, nome, status) values ('passeio', 'X', 'publicado')",
  "erro",
);
for (let i = 1; i <= 6; i++)
  await admin(
    `a equipe não tem limite (${i}/6)`,
    `insert into negocios (tipo, nome) values ('restaurante', 'Equipe ${i}') returning id`,
    uma,
  );
await outro(
  "o futuro dono ainda não vê o negócio",
  "select count(*)::int from negocios where slug = 'equipe-1'",
  valor(0),
);
await dona(
  "dono comum não transfere",
  `update negocios set dono_id = '${U.outro}' where slug = 'equipe-1' returning id`,
  nenhuma,
);
await admin(
  "transfere para um usuário",
  `update negocios set dono_id = '${U.outro}' where slug = 'equipe-1' returning dono_id`,
  valor(U.outro),
);
await outro(
  "o novo dono vê e edita",
  "update negocios set nome = 'Restaurante do Dois' where slug = 'equipe-1' returning nome",
  valor("Restaurante do Dois"),
);
await admin(
  "transfere de um dono para outro",
  `update negocios set dono_id = '${U.terceira}' where slug = 'equipe-1' returning dono_id`,
  valor(U.terceira),
);
await outro(
  "o dono anterior perde o acesso",
  "select count(*)::int from negocios where slug = 'equipe-1'",
  valor(0),
);

titulo("Convite para o dono assumir");
const idEquipe2 = (await linha("equipe-2")).id;
await dona("dono comum não gera convite", `select public.gerar_convite('${idEquipe2}')`, "erro");
await visitante("visitante não gera convite", `select public.gerar_convite('${idEquipe2}')`, "erro");
await admin(
  "não gera convite para negócio que já tem dono",
  `select public.gerar_convite((select id from negocios where slug = 'equipe-1'))`,
  { erro: "já tem dono" },
);
const primeiro = (await como("authenticated", U.admin, "admin gera o convite", `select public.gerar_convite('${idEquipe2}') ->> 'token' as t`, uma))?.[0]?.t;
const conviteDe = async () =>
  (await como("authenticated", U.admin, "admin gera outro convite", `select public.gerar_convite('${idEquipe2}') ->> 'token' as t`, uma))?.[0]?.t;
const token = await conviteDe();
confere("o token é longo e diferente do anterior", token?.length === 64 && token !== primeiro, `${primeiro} / ${token}`);
await visitante("o convite anterior deixa de valer", `select public.ver_convite('${primeiro}') ->> 'situacao'`, valor("invalido"));
await admin("admin vê o convite que está valendo", `select public.convite_do_negocio('${idEquipe2}') ->> 'token'`, valor(token));
await dona("dono comum não vê os convites", `select public.convite_do_negocio('${idEquipe2}')`, "erro");
await visitante("visitante vê o nome do negócio no convite", `select public.ver_convite('${token}') ->> 'nome'`, valor("Equipe 2"));
await visitante("token inventado é inválido", "select public.ver_convite('abc') ->> 'situacao'", valor("invalido"));
await visitante("ninguém lê a tabela de convites", "select * from negocio_convites", "erro");
await admin("nem o admin lê a tabela direto", "select * from negocio_convites", "erro");
await visitante("sem login não aceita", `select public.aceitar_convite('${token}')`, "erro");
await terceira(
  "quem está logado aceita e vira o dono",
  `select public.aceitar_convite('${token}') ->> 'nome'`,
  valor("Equipe 2"),
);
await terceira(
  "o negócio aparece para o novo dono",
  `select count(*)::int from negocios where id = '${idEquipe2}' and dono_id = auth.uid()`,
  valor(1),
);
await outro("o convite não serve duas vezes", `select public.aceitar_convite('${token}')`, { erro: "já foi usado" });
await visitante("depois de usado, aparece como usado", `select public.ver_convite('${token}') ->> 'situacao'`, valor("usado"));
await admin(
  "convite vencido",
  `select public.gerar_convite((select id from negocios where slug = 'equipe-3')) ->> 'token'`,
  uma,
);
await db.query("update negocio_convites set expira_em = now() - interval '1 minute' where usado_em is null");
{
  const { rows } = await db.query("select token from negocio_convites where usado_em is null");
  await visitante("…aparece como expirado", `select public.ver_convite('${rows[0].token}') ->> 'situacao'`, valor("expirado"));
  await outro("…e não é aceito", `select public.aceitar_convite('${rows[0].token}')`, { erro: "expirou" });
}

titulo("Contas (admin_usuarios)");
await visitante("visitante não lista contas", "select * from public.admin_usuarios()", "erro");
await dona("dono não lista contas", "select * from public.admin_usuarios()", "erro");
await admin(
  "admin lista contas com e-mail e número de negócios",
  "select email, negocios::int from public.admin_usuarios() where email = 'terceira@x.com'",
  // 6, mais o que ela assumiu pelo convite
  (r) => r.length === 1 && r[0].negocios === 7,
);
await admin("…todas as contas", "select count(*)::int from public.admin_usuarios()", valor(4));

titulo("Admin exclui de qualquer pessoa");
await admin(
  "exclui o negócio de outra pessoa",
  "delete from negocios where slug = 'casa-1' returning id",
  uma,
);
await db.exec(
  `insert into storage.objects (bucket_id, name) values ('fotos-negocios', '${idBar}/x.webp')`,
);
await admin(
  "apaga arquivo da pasta de outra pessoa",
  `delete from storage.objects where name = '${idBar}/x.webp' returning id`,
  uma,
);

titulo("Plano Pro: assinaturas");
const servidor = (d, sql, e) => como("service_role", null, d, sql, e);
await dona("o dono não cria a própria assinatura", `insert into assinaturas (perfil_id, status, pro_ate) values ('${U.dona}', 'ativa', now() + interval '1 year')`, "erro");
await servidor("o servidor (service_role) cria a assinatura", `insert into assinaturas (perfil_id, plano, forma, status, cpf_cnpj) values ('${U.dona}', 'mensal', 'pix', 'aguardando_pagamento', '12345678909') returning perfil_id`, uma);
await dona("o dono lê a própria assinatura", "select status from assinaturas", valor("aguardando_pagamento"));
await dona("o dono não se dá Pro", "update assinaturas set pro_ate = now() + interval '1 year'", "erro");
await dona("o dono não apaga a assinatura", "delete from assinaturas", "erro");
await outro("outro dono não vê a assinatura da dona", "select count(*)::int from assinaturas", valor(0));
await visitante("visitante não vê assinaturas", "select count(*) from assinaturas", "erro");
await admin("admin vê todas", "select count(*)::int from assinaturas", valor(1));
await admin("nem o admin escreve pela API", `update assinaturas set pro_ate = now() + interval '1 year' where perfil_id = '${U.dona}'`, "erro");
await visitante("sem pagamento, não é Pro", `select public.eh_pro('${U.dona}')`, valor(false));
await visitante("sem Pro, nenhum selo", "select count(*)::int from public.negocios_verificados()", valor(0));
await servidor("pagamento confirmado: Pro até o próximo vencimento + 3 dias", `update assinaturas set status = 'ativa', pro_ate = now() + interval '33 days' where perfil_id = '${U.dona}' returning status`, valor("ativa"));
await visitante("agora é Pro", `select public.eh_pro('${U.dona}')`, valor(true));
await visitante("o negócio publicado da dona ganha o selo", `select count(*)::int from public.negocios_verificados() id where id = '${idBar}'`, valor(1));
await visitante("rascunho não ganha selo", `select count(*)::int from public.negocios_verificados() id where id = '${idBarco}'`, valor(0));
await visitante("só os negócios dela têm selo", "select count(*)::int from public.negocios_verificados()", valor(1));

titulo("Plano Pro: estatísticas");
await visitante("visitante registra uma visita", `select public.registrar_evento('${idBar}', 'visita')`, uma);
await visitante("…e um clique no WhatsApp", `select public.registrar_evento('${idBar}', 'whatsapp')`, uma);
await visitante("…outra visita", `select public.registrar_evento('${idBar}', 'visita')`, uma);
await visitante("tipo desconhecido é ignorado", `select public.registrar_evento('${idBar}', 'hackear')`, uma);
await visitante("negócio não publicado não conta", `select public.registrar_evento('${idBarco}', 'visita')`, uma);
{
  const { rows } = await db.query("select negocio_id, tipo, total from negocio_estatisticas order by tipo");
  confere("contou 2 visitas e 1 WhatsApp, só do publicado", rows.length === 2 && rows[0].tipo === "visita" && rows[0].total === 2 && rows[1].total === 1 && rows.every((r) => r.negocio_id === idBar), JSON.stringify(rows));
}
await visitante("visitante não lê a tabela de estatísticas", "select * from negocio_estatisticas", "erro");
await dona("nem o dono lê a tabela direto", "select * from negocio_estatisticas", "erro");
await dona("o dono Pro lê as estatísticas do próprio negócio", `select sum(total)::int from public.estatisticas_negocio('${idBar}', current_date - 30)`, valor(3));
await outro("outro dono não lê", `select * from public.estatisticas_negocio('${idBar}', current_date - 30)`, { erro: "plano Pro" });
await visitante("visitante não lê", `select * from public.estatisticas_negocio('${idBar}', current_date - 30)`, "erro");
await admin("admin lê", `select sum(total)::int from public.estatisticas_negocio('${idBar}', current_date - 30)`, valor(3));
await servidor("parou de pagar: passou da data, acabou o Pro", `update assinaturas set status = 'atrasada', pro_ate = now() - interval '1 minute' where perfil_id = '${U.dona}' returning status`, valor("atrasada"));
await dona("sem Pro, o dono não lê mais as estatísticas", `select * from public.estatisticas_negocio('${idBar}', current_date - 30)`, { erro: "plano Pro" });
await visitante("…e o selo some", "select count(*)::int from public.negocios_verificados()", valor(0));
await visitante("os eventos continuam sendo contados no Gratuito", `select public.registrar_evento('${idBar}', 'site')`, uma);
for (const canal of ["whatsapp", "instagram", "link", "link"])
  await visitante(`compartilhou (${canal})`, `select public.registrar_evento('${idBar}', 'compartilhar_${canal}')`, uma);
{
  const { rows } = await db.query("select tipo, total from negocio_estatisticas where tipo like 'compartilhar_%' order by tipo");
  confere("conta os compartilhamentos por canal", JSON.stringify(rows) === JSON.stringify([{ tipo: "compartilhar_instagram", total: 1 }, { tipo: "compartilhar_link", total: 2 }, { tipo: "compartilhar_whatsapp", total: 1 }]), JSON.stringify(rows));
}
await visitante("canal inventado é ignorado", `select public.registrar_evento('${idBar}', 'compartilhar_orkut')`, uma);
await visitante("visitante não lê os avisos do Asaas", "select * from asaas_eventos", "erro");
await admin("nem o admin lê os avisos do Asaas pela API", "select * from asaas_eventos", "erro");

titulo("Excluir");
await visitante("visitante não apaga", "delete from negocios where slug = 'barco-do-ze'", "erro");
await dona(
  "dono apaga o próprio em análise",
  "delete from negocios where slug = 'barco-do-ze' returning id",
  uma,
);
await dona(
  "dono apaga o próprio publicado (fotos vão junto)",
  "delete from negocios where slug = 'bar-da-um-sao-luis-2' returning id",
  uma,
);
confere(
  "nenhuma foto órfã no banco",
  (
    await db.query(
      `select count(*)::int n from negocio_fotos where negocio_id in ('${idBar}', '${idBarco}')`,
    )
  ).rows[0].n === 0,
);

// ——— entrar com o Google ———
secao = "Perfil de quem entra com o Google";
await db.exec(`
insert into auth.users (id, email, raw_user_meta_data) values
  ('55555555-5555-5555-5555-555555555555', 'google@x.com', '{"full_name": "Maria do Google", "name": "Maria"}'),
  ('66666666-6666-6666-6666-666666666666', 'so-name@x.com', '{"name": "  Zé  "}');`);
const nomeDoPerfil = async (id) =>
  (await db.query(`select nome from perfis where id = '${id}'`)).rows[0]?.nome;
confere(
  "usa o full_name do Google",
  (await nomeDoPerfil("55555555-5555-5555-5555-555555555555")) === "Maria do Google",
);
confere(
  "sem full_name, usa o name",
  (await nomeDoPerfil("66666666-6666-6666-6666-666666666666")) === "Zé",
);
confere(
  "cadastro por e-mail continua usando o nome do formulário",
  (await nomeDoPerfil(U.outro)) === "Dono Dois",
);
await db.exec(
  "delete from auth.users where id in ('55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666')",
);

// ——— resultado ———
console.log(`\n${passaram} passaram, ${falhas.length} falharam`);
if (falhas.length) {
  console.log(`\nFalhas:\n  ${falhas.join("\n  ")}`);
  process.exit(1);
}
