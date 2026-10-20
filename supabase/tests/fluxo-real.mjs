// Fluxo do dono contra o Supabase REAL (o do .env.local), com duas contas de teste:
// cadastrar, subir foto, salvar rascunho, enviar para análise, editar e excluir, e conferir
// que o banco e o Storage barram o que devem barrar. Apaga tudo o que criou no fim.
//
//   npm run test:real -- --criar-contas   cria as 2 contas (confirme os e-mails depois)
//   npm run test:real -- --reenviar       reenvia a confirmação (link expirado)
//   npm run test:real                     roda o fluxo
//
// As contas ficam no .env.local (TESTE_EMAIL_1/2, TESTE_SENHA_1/2), que não vai para o git.
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";
import { appendFileSync, readFileSync } from "node:fs";

const raiz = new URL("../../", import.meta.url);
const arquivoEnv = new URL(".env.local", raiz);
const env = Object.fromEntries(
  readFileSync(arquivoEnv, "utf8")
    .split(/\r?\n/)
    .filter((l) => /^[A-Z0-9_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim()]),
);
const URL_SB = env.VITE_SUPABASE_URL;
const CHAVE = env.VITE_SUPABASE_ANON_KEY;
const BUCKET = "fotos-negocios";
const novoCliente = () =>
  createClient(URL_SB, CHAVE, { auth: { persistSession: false, autoRefreshToken: false } });

// ——— criar contas ———
if (process.argv.includes("--criar-contas")) {
  if (env.TESTE_EMAIL_1) {
    console.log(`As contas já existem: ${env.TESTE_EMAIL_1} e ${env.TESTE_EMAIL_2}.`);
    process.exit(0);
  }
  const linhas = ["", "# contas de teste do fluxo do dono (npm run test:real)"];
  for (const n of [1, 2]) {
    const email = `danieljunior.me+azulejo${n}@gmail.com`;
    const senha = randomBytes(12).toString("base64url");
    const { data, error } = await novoCliente().auth.signUp({
      email,
      password: senha,
      options: {
        data: { nome: `Teste Azulejo ${n}` },
        emailRedirectTo: "http://localhost:8081/entrar",
      },
    });
    console.log(
      email,
      error
        ? `ERRO: ${error.code} ${error.message}`
        : `criada (já com sessão: ${Boolean(data.session)})`,
    );
    if (!error) linhas.push(`TESTE_EMAIL_${n}=${email}`, `TESTE_SENHA_${n}=${senha}`);
  }
  appendFileSync(arquivoEnv, linhas.join("\n") + "\n");
  console.log("Confirme os dois e-mails e rode: npm run test:real");
  process.exit(0);
}

// ——— conta de admin de teste (o papel admin é dado à mão, no SQL Editor) ———
if (process.argv.includes("--criar-admin")) {
  if (env.TESTE_EMAIL_3) {
    console.log(`A conta de admin de teste já existe: ${env.TESTE_EMAIL_3}.`);
    process.exit(0);
  }
  const email = "danieljunior.me+azulejo3@gmail.com";
  const senha = randomBytes(12).toString("base64url");
  const { error } = await novoCliente().auth.signUp({
    email,
    password: senha,
    options: { data: { nome: "Admin de Teste" }, emailRedirectTo: "http://localhost:8081/entrar" },
  });
  console.log(email, error ? `ERRO: ${error.code} ${error.message}` : "criada");
  if (!error)
    appendFileSync(
      arquivoEnv,
      `TESTE_EMAIL_3=${email}
TESTE_SENHA_3=${senha}
`,
    );
  console.log("No SQL Editor: confirme a conta e dê o papel admin (comando no README).");
  process.exit(0);
}

// ——— reenviar a confirmação (link expirado) ———
if (process.argv.includes("--reenviar")) {
  for (const n of [1, 2]) {
    const { error } = await novoCliente().auth.resend({
      type: "signup",
      email: env[`TESTE_EMAIL_${n}`],
      options: { emailRedirectTo: "http://localhost:8081/entrar" },
    });
    console.log(
      env[`TESTE_EMAIL_${n}`],
      error ? `ERRO: ${error.code} ${error.message}` : "e-mail reenviado",
    );
  }
  process.exit(0);
}

// ——— utilitários ———
let passaram = 0;
const falhas = [];
function confere(descricao, ok, detalhe = "") {
  if (ok) passaram++;
  else falhas.push(`${descricao} ${detalhe}`);
  console.log(`  ${ok ? "✓" : "✗"} ${descricao}${ok ? "" : `\n      ${detalhe}`}`);
}
const titulo = (t) => console.log(`\n${t}`);
const msg = (e) => (e ? `${e.code ?? e.statusCode ?? ""} ${e.message}` : "sem erro");

async function entrar(n) {
  const sb = novoCliente();
  const { data, error } = await sb.auth.signInWithPassword({
    email: env[`TESTE_EMAIL_${n}`],
    password: env[`TESTE_SENHA_${n}`],
  });
  if (error) {
    console.log(`Não deu para entrar com ${env[`TESTE_EMAIL_${n}`]}: ${msg(error)}`);
    if (error.code === "email_not_confirmed")
      console.log("Confirme o e-mail da conta e rode de novo.");
    process.exit(1);
  }
  return { sb, id: data.user.id };
}

const COLUNAS =
  "id, slug, status, tipo, nome, cidade, alterado_desde_revisao, negocio_fotos (id, caminho, ordem)";

async function limpar(conta) {
  const { data } = await conta.sb
    .from("negocios")
    .select("id, negocio_fotos (caminho)")
    .eq("dono_id", conta.id);
  for (const n of data ?? []) {
    const { data: arquivos } = await conta.sb.storage.from(BUCKET).list(n.id);
    const caminhos = (arquivos ?? []).map((a) => `${n.id}/${a.name}`);
    if (caminhos.length) await conta.sb.storage.from(BUCKET).remove(caminhos);
    await conta.sb.from("negocios").delete().eq("id", n.id);
  }
}

// ——— fluxo ———
if (!env.TESTE_EMAIL_1 || !env.TESTE_EMAIL_2) {
  console.log("Crie as contas antes: npm run test:real -- --criar-contas");
  process.exit(1);
}
const dona = await entrar(1);
const outra = await entrar(2);
console.log(`Supabase: ${URL_SB}`);
await limpar(dona);
await limpar(outra);

const foto = readFileSync(new URL("src/assets/images/destinos/barreirinhas.jpg", raiz));
const DESCRICAO =
  "Chalés de madeira na beira do Rio Preguiças, com redário, café da manhã regional e traslado para os passeios.";

try {
  titulo("Cadastrar");
  const { data: criado, error: e1 } = await dona.sb
    .from("negocios")
    .insert({
      tipo: "hospedagem",
      nome: "Pousada Teste do Azulejo",
      cidade: "Barreirinhas",
      status: "rascunho",
      latitude: -2.747,
      longitude: -42.827,
    })
    .select("id, slug, status")
    .single();
  confere("cria como rascunho", !e1 && criado?.status === "rascunho", msg(e1));
  confere(
    "slug gerado pelo banco",
    criado?.slug?.startsWith("pousada-teste-do-azulejo-barreirinhas"),
    criado?.slug,
  );
  const id = criado.id;
  const { error: eStatus } = await dona.sb
    .from("negocios")
    .insert({ tipo: "passeio", nome: "Já publicado", status: "publicado" });
  confere("não cria já publicado", Boolean(eStatus), msg(eStatus));

  titulo("Outro dono não vê nem mexe");
  const { data: visto } = await outra.sb.from("negocios").select("id").eq("id", id);
  confere("não vê o rascunho da outra conta", visto?.length === 0);
  const { data: editado } = await outra.sb
    .from("negocios")
    .update({ nome: "Roubado" })
    .eq("id", id)
    .select("id");
  confere("não edita", (editado ?? []).length === 0);
  const { data: apagado } = await outra.sb.from("negocios").delete().eq("id", id).select("id");
  confere("não apaga", (apagado ?? []).length === 0);

  titulo("Fotos no Storage");
  const caminho = `${id}/capa.jpg`;
  const { error: eUp } = await dona.sb.storage
    .from(BUCKET)
    .upload(caminho, foto, { contentType: "image/jpeg" });
  confere("sobe foto na pasta do próprio negócio", !eUp, msg(eUp));
  const publica = dona.sb.storage.from(BUCKET).getPublicUrl(caminho).data.publicUrl;
  const resposta = await fetch(publica);
  confere("a foto abre pela URL pública", resposta.ok, `${resposta.status} ${publica}`);
  const { error: eOutra } = await outra.sb.storage
    .from(BUCKET)
    .upload(`${id}/intruso.jpg`, foto, { contentType: "image/jpeg" });
  confere("outra conta não sobe na pasta dela", Boolean(eOutra), msg(eOutra));
  const { error: eRaiz } = await dona.sb.storage
    .from(BUCKET)
    .upload(`solta-${Date.now()}.jpg`, foto, { contentType: "image/jpeg" });
  confere("não sobe fora de uma pasta de negócio", Boolean(eRaiz), msg(eRaiz));
  const { data: exemplo } = await dona.sb
    .from("negocios")
    .select("id")
    .eq("slug", "cozinha-do-cuxa")
    .single();
  const { error: eAlheia } = await dona.sb.storage
    .from(BUCKET)
    .upload(`${exemplo.id}/x.jpg`, foto, { contentType: "image/jpeg" });
  confere("não sobe na pasta de um negócio que não é dela", Boolean(eAlheia), msg(eAlheia));
  const { error: eGif } = await dona.sb.storage
    .from(BUCKET)
    .upload(`${id}/a.gif`, foto, { contentType: "image/gif" });
  confere("recusa GIF", Boolean(eGif), msg(eGif));
  const grande = Buffer.alloc(5 * 1024 * 1024 + 10, 1);
  const { error: eGrande } = await dona.sb.storage
    .from(BUCKET)
    .upload(`${id}/grande.jpg`, grande, { contentType: "image/jpeg" });
  confere("recusa arquivo acima de 5 MB", Boolean(eGrande), msg(eGrande));
  const { error: eFoto } = await dona.sb
    .from("negocio_fotos")
    .insert({ negocio_id: id, caminho, ordem: 0 });
  confere("registra a foto", !eFoto, msg(eFoto));

  titulo("Salvar rascunho e enviar para análise");
  const { error: eIncompleto } = await dona.sb
    .from("negocios")
    .update({ status: "pendente" })
    .eq("id", id);
  confere(
    "incompleto não vai para análise",
    eIncompleto?.message?.includes("falta"),
    msg(eIncompleto),
  );
  const dados = {
    subtipo: "chale",
    preco: 320,
    descricao: DESCRICAO,
    endereco: "Rua da Beira-Rio, 100",
    whatsapp: "5598991234567",
    instagram: "pousadateste",
  };
  const { error: eRasc } = await dona.sb.from("negocios").update(dados).eq("id", id);
  confere("salva rascunho completo", !eRasc, msg(eRasc));
  const { data: enviado, error: eEnv } = await dona.sb
    .from("negocios")
    .update({ status: "pendente" })
    .eq("id", id)
    .select("status")
    .single();
  confere("envia para análise", !eEnv && enviado?.status === "pendente", msg(eEnv));
  const { data: anon } = await novoCliente().from("negocios").select("id").eq("id", id);
  confere("em análise não aparece no site", (anon ?? []).length === 0);

  titulo("Editar");
  const { data: ed, error: eEd } = await dona.sb
    .from("negocios")
    .update({ preco: 350, nome: "Pousada Teste Renomeada" })
    .eq("id", id)
    .select("status, slug")
    .single();
  confere("edita em análise e continua em análise", !eEd && ed?.status === "pendente", msg(eEd));
  confere("o slug não muda com o nome", ed?.slug === criado.slug, ed?.slug);

  titulo("Campos proibidos");
  for (const [campo, valor] of [
    ["status", "publicado"],
    ["status", "rascunho"],
    ["exemplo", true],
    ["extras", { avaliacao: 5 }],
    ["notas_internas", "oi"],
    ["aprovado_por", dona.id],
    ["aprovado_em", new Date().toISOString()],
    ["alterado_desde_revisao", true],
    ["slug", "outro-slug"],
  ]) {
    const { error } = await dona.sb
      .from("negocios")
      .update({ [campo]: valor })
      .eq("id", id);
    confere(
      `não muda ${campo}${campo === "status" ? ` para ${valor}` : ""}`,
      Boolean(error),
      msg(error),
    );
  }
  const { error: eNotas } = await dona.sb.from("negocios").select("notas_internas").eq("id", id);
  confere("não lê notas_internas", Boolean(eNotas), msg(eNotas));
  const { error: eTudo } = await dona.sb.from("negocios").select("*").eq("id", id);
  confere("select * é recusado", Boolean(eTudo), msg(eTudo));

  titulo("Limite de 5 negócios");
  const extras = [];
  for (let i = 2; i <= 5; i++) {
    const { data, error } = await dona.sb
      .from("negocios")
      .insert({ tipo: "restaurante", nome: `Teste limite ${i}`, status: "rascunho" })
      .select("id")
      .single();
    if (!error) extras.push(data.id);
  }
  confere("chega a 5", extras.length === 4);
  const { error: eSexto } = await dona.sb
    .from("negocios")
    .insert({ tipo: "restaurante", nome: "Teste limite 6", status: "rascunho" });
  confere(
    "o 6º é recusado com a mensagem do limite",
    eSexto?.message?.includes("limite de 5"),
    msg(eSexto),
  );
  for (const x of extras) await dona.sb.from("negocios").delete().eq("id", x);

  titulo("Excluir");
  // o remove() não dá erro quando a RLS bloqueia: confere o que ele devolveu
  const { data: removidos, error: eRemove } = await dona.sb.storage.from(BUCKET).remove([caminho]);
  confere("apaga o arquivo do Storage", !eRemove && removidos?.length === 1, msg(eRemove));
  const { data: exc, error: eExc } = await dona.sb
    .from("negocios")
    .delete()
    .eq("id", id)
    .select("id");
  confere("exclui o negócio", !eExc && exc?.length === 1, msg(eExc));
  // sem cache: a URL "crua" pode continuar servindo a cópia da CDN por um tempo
  const depois = await fetch(`${publica}?sem-cache=${Date.now()}`);
  confere("o arquivo não existe mais no Storage", !depois.ok, String(depois.status));
  const { data: sobrou } = await dona.sb.from("negocio_fotos").select("id").eq("negocio_id", id);
  confere("não sobra registro de foto", (sobrou ?? []).length === 0);
} finally {
  await limpar(dona);
  await limpar(outra);
}

console.log(`\n${passaram} passaram, ${falhas.length} falharam`);
if (falhas.length) {
  console.log(`\nFalhas:\n  ${falhas.join("\n  ")}`);
  process.exit(1);
}
