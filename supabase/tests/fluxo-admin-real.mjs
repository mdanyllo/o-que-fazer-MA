// Fluxo do admin contra o Supabase REAL (o do .env.local), com as contas de teste:
// TESTE_*_1 (dono), TESTE_*_2 (outra conta) e TESTE_*_3 (admin, papel dado no SQL Editor).
//
//   npm run test:admin-real              roda tudo e apaga o que criou
//   npm run test:admin-real -- --manter  deixa um negócio publicado (com alteração do dono)
//                                        e um recusado, para ver no site e no /admin
//   npm run test:admin-real -- --limpar  só apaga o que os testes criaram
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const raiz = new URL("../../", import.meta.url);
const env = Object.fromEntries(
  readFileSync(new URL(".env.local", raiz), "utf8")
    .split(/\r?\n/)
    .filter((l) => /^[A-Z0-9_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim()]),
);
const BUCKET = "fotos-negocios";
const novoCliente = () =>
  createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

// nomes dos negócios que este teste cria (a limpeza procura por eles)
const NOMES = ["Chalés Beira do Preguiças", "Restaurante Maré Cheia", "Passeio Revoada dos Guarás"];

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
    console.log(`Não deu para entrar com a conta de teste ${n}: ${msg(error)}`);
    process.exit(1);
  }
  return { sb, id: data.user.id };
}

const dona = await entrar(1);
const outra = await entrar(2);
const admin = await entrar(3);

async function limpar() {
  const { data } = await admin.sb
    .from("negocios")
    .select("id, nome, dono_id")
    .or(`dono_id.in.(${dona.id},${outra.id}),nome.in.(${NOMES.map((n) => `"${n}"`).join(",")})`);
  for (const n of data ?? []) {
    const { data: arquivos } = await admin.sb.storage.from(BUCKET).list(n.id);
    const caminhos = (arquivos ?? []).map((a) => `${n.id}/${a.name}`);
    if (caminhos.length) await admin.sb.storage.from(BUCKET).remove(caminhos);
    await admin.sb.from("negocios").delete().eq("id", n.id);
  }
  return data?.length ?? 0;
}

if (process.argv.includes("--limpar")) {
  console.log(`Apagados: ${await limpar()} negócios de teste.`);
  process.exit(0);
}
const manter = process.argv.includes("--manter");
await limpar();

const foto = (arquivo) => readFileSync(new URL(`src/assets/images/${arquivo}`, raiz));
async function subirFotos(conta, id, arquivos) {
  for (const [i, arquivo] of arquivos.entries()) {
    const caminho = `${id}/${i}-${arquivo.split("/").pop()}`;
    const { error: eUp } = await conta.sb.storage
      .from(BUCKET)
      .upload(caminho, foto(arquivo), { contentType: "image/jpeg" });
    if (eUp) return eUp;
    const { error } = await conta.sb
      .from("negocio_fotos")
      .insert({ negocio_id: id, caminho, ordem: i });
    if (error) return error;
  }
  return null;
}

const DESCRICAO_CHALES =
  "Quatro chalés de madeira na beira do Rio Preguiças, com redário, café da manhã regional e saída dos passeios na porta.";
const DESCRICAO_RESTAURANTE =
  "Peixe na brasa e caldeirada de camarão na orla de Barreirinhas, com mesas de frente para o rio no fim da tarde.";
const DESCRICAO_PASSEIO =
  "Barco pelos igarapés do Delta das Américas até a revoada dos guarás no fim da tarde, com guia nascido em Tutóia.";

try {
  titulo("Quem não é admin");
  const { error: eContas } = await dona.sb.rpc("admin_usuarios");
  confere("dono não lista as contas", Boolean(eContas), msg(eContas));
  const { error: eContasAnon } = await novoCliente().rpc("admin_usuarios");
  confere("visitante não lista as contas", Boolean(eContasAnon), msg(eContasAnon));

  titulo("Dono envia; admin aprova");
  const { data: chales, error: eCria } = await dona.sb
    .from("negocios")
    .insert({
      tipo: "hospedagem",
      subtipo: "chale",
      nome: NOMES[0],
      nome_curto: "Beira do Preguiças",
      cidade: "Barreirinhas",
      descricao: DESCRICAO_CHALES,
      endereco: "Rua da Beira-Rio, 210",
      whatsapp: "5598991234567",
      preco: 340,
      latitude: -2.7465,
      longitude: -42.8262,
      status: "rascunho",
    })
    .select("id, slug")
    .single();
  confere("dono cadastra", !eCria, msg(eCria));
  const eFotos = await subirFotos(dona, chales.id, [
    "lugares/lagoa-bonita.jpg",
    "destinos/barreirinhas.jpg",
    "experiencias/passeio-rio-preguicas.jpg",
    "categorias/hospedagem.jpg",
  ]);
  confere("dono sobe 4 fotos", !eFotos, msg(eFotos));
  const { error: eEnvia } = await dona.sb
    .from("negocios")
    .update({ status: "pendente" })
    .eq("id", chales.id);
  confere("dono envia para análise", !eEnvia, msg(eEnvia));
  const { error: eAutoAprova } = await dona.sb
    .from("negocios")
    .update({ status: "publicado" })
    .eq("id", chales.id);
  confere("dono não se aprova", Boolean(eAutoAprova), msg(eAutoAprova));
  const { data: pendentes } = await admin.sb
    .from("negocios")
    .select("id")
    .eq("status", "pendente")
    .eq("id", chales.id);
  confere("admin vê o negócio em análise", pendentes?.length === 1);
  const { data: aprovado, error: eAprova } = await admin.sb
    .from("negocios")
    .update({ status: "publicado" })
    .eq("id", chales.id)
    .select("status, aprovado_por, aprovado_em")
    .single();
  confere("admin aprova", !eAprova && aprovado?.status === "publicado", msg(eAprova));
  confere(
    "aprovado_por e aprovado_em gravados",
    aprovado?.aprovado_por === admin.id && Boolean(aprovado?.aprovado_em),
  );
  const { data: publico } = await novoCliente()
    .from("negocios")
    .select("id, negocio_fotos (caminho, ordem)")
    .eq("id", chales.id)
    .single();
  confere(
    "visitante vê o negócio com as 4 fotos",
    publico?.negocio_fotos?.length === 4,
    JSON.stringify(publico),
  );
  const urlCapa = novoCliente()
    .storage.from(BUCKET)
    .getPublicUrl(publico.negocio_fotos.find((f) => f.ordem === 0).caminho).data.publicUrl;
  confere("a capa abre pela URL pública", (await fetch(urlCapa)).ok);

  titulo("Dono altera o publicado; admin revisa");
  const { data: alterado } = await dona.sb
    .from("negocios")
    .update({ preco: 360 })
    .eq("id", chales.id)
    .select("status, alterado_desde_revisao")
    .single();
  confere(
    "continua publicado, marcado como alterado",
    alterado?.status === "publicado" && alterado?.alterado_desde_revisao === true,
  );
  const { data: alterados } = await admin.sb
    .from("negocios")
    .select("id, alterado_em")
    .eq("status", "publicado")
    .eq("alterado_desde_revisao", true);
  confere(
    "aparece para o admin em Alterados",
    alterados?.some((n) => n.id === chales.id && n.alterado_em),
  );
  if (!manter) {
    const { data: revisado } = await admin.sb
      .from("negocios")
      .update({ alterado_desde_revisao: false })
      .eq("id", chales.id)
      .select("status, aprovado_em")
      .single();
    confere(
      "marcar como revisado tira a marca sem mudar status nem a aprovação",
      revisado?.status === "publicado" && revisado?.aprovado_em === aprovado?.aprovado_em,
    );
  }

  titulo("Admin recusa com motivo");
  const { data: rest } = await dona.sb
    .from("negocios")
    .insert({
      tipo: "restaurante",
      subtipo: "Peixes e frutos do mar",
      nome: NOMES[1],
      cidade: "Barreirinhas",
      descricao: DESCRICAO_RESTAURANTE,
      endereco: "Av. Beira-Rio, 45",
      whatsapp: "5598991234567",
      faixa_preco: "$$",
      horario: "Todos os dias, das 11h às 22h",
      status: "rascunho",
    })
    .select("id")
    .single();
  await subirFotos(dona, rest.id, ["categorias/gastronomia.jpg"]);
  await dona.sb.from("negocios").update({ status: "pendente" }).eq("id", rest.id);
  const { error: eSemMotivo } = await admin.sb
    .from("negocios")
    .update({ status: "recusado" })
    .eq("id", rest.id);
  confere("recusar sem motivo é barrado", eSemMotivo?.message?.includes("motivo"), msg(eSemMotivo));
  const MOTIVO = "A foto de capa não mostra o restaurante. Envie uma foto da fachada ou do salão.";
  const { error: eRecusa } = await admin.sb
    .from("negocios")
    .update({ status: "recusado", motivo_recusa: MOTIVO })
    .eq("id", rest.id);
  confere("admin recusa com motivo", !eRecusa, msg(eRecusa));
  const { data: visto } = await dona.sb
    .from("negocios")
    .select("status, motivo_recusa")
    .eq("id", rest.id)
    .single();
  confere("o dono vê o motivo", visto?.status === "recusado" && visto?.motivo_recusa === MOTIVO);

  titulo("Cadastro pela equipe e transferência");
  const { data: passeio, error: eEquipe } = await admin.sb
    .from("negocios")
    .insert({
      tipo: "passeio",
      nome: NOMES[2],
      cidade: "Tutóia",
      descricao: DESCRICAO_PASSEIO,
      whatsapp: "5598991234567",
      preco: 190,
      duracao: "Cerca de 6 horas",
      ponto_encontro: "Porto de Tutóia",
      latitude: -2.762,
      longitude: -42.274,
      status: "rascunho",
      exemplo: false,
    })
    .select("id, dono_id, exemplo")
    .single();
  confere(
    "admin cadastra sem dono",
    !eEquipe && passeio?.dono_id === null && passeio?.exemplo === false,
    msg(eEquipe),
  );
  const eFotoEquipe = await subirFotos(admin, passeio.id, [
    "experiencias/passeio-rio-preguicas.jpg",
  ]);
  confere("admin sobe foto na pasta do negócio da equipe", !eFotoEquipe, msg(eFotoEquipe));
  const { error: ePublica } = await admin.sb
    .from("negocios")
    .update({ status: "publicado" })
    .eq("id", passeio.id);
  confere("admin publica direto", !ePublica, msg(ePublica));
  const { data: contas, error: eListaContas } = await admin.sb.rpc("admin_usuarios");
  const contaOutra = contas?.find((c) => c.id === outra.id);
  confere(
    "admin lista as contas com e-mail",
    !eListaContas && contaOutra?.email === env.TESTE_EMAIL_2,
    msg(eListaContas),
  );
  const { error: eTransf } = await admin.sb
    .from("negocios")
    .update({ dono_id: outra.id })
    .eq("id", passeio.id);
  confere("admin transfere para a outra conta", !eTransf, msg(eTransf));
  const { data: daOutra } = await outra.sb
    .from("negocios")
    .select("id, status")
    .eq("id", passeio.id);
  confere("a nova dona vê o negócio (ainda publicado)", daOutra?.[0]?.status === "publicado");
  const { data: transferidoDeDona } = await dona.sb
    .from("negocios")
    .update({ dono_id: dona.id })
    .eq("id", passeio.id)
    .select("id");
  confere("outro dono não pega o negócio para si", (transferidoDeDona ?? []).length === 0);

  titulo("Notas, despublicar e excluir");
  const { error: eNotas } = await admin.sb
    .from("negocios")
    .update({ notas_internas: "Guia confirmou por telefone." })
    .eq("id", passeio.id);
  const { data: notas } = await admin.sb.rpc("notas_internas", { negocio: passeio.id });
  confere(
    "admin grava e lê notas internas",
    !eNotas && notas === "Guia confirmou por telefone.",
    msg(eNotas),
  );
  const { error: eNotasDona } = await outra.sb.rpc("notas_internas", { negocio: passeio.id });
  confere("a dona não lê as notas internas", Boolean(eNotasDona), msg(eNotasDona));
  const { error: eDespub } = await admin.sb
    .from("negocios")
    .update({ status: "rascunho" })
    .eq("id", passeio.id);
  const { data: anonDepois } = await novoCliente()
    .from("negocios")
    .select("id")
    .eq("id", passeio.id);
  confere(
    "admin despublica e sai do site",
    !eDespub && (anonDepois ?? []).length === 0,
    msg(eDespub),
  );
  const { data: arquivos } = await admin.sb.storage.from(BUCKET).list(passeio.id);
  const { data: removidos } = await admin.sb.storage
    .from(BUCKET)
    .remove((arquivos ?? []).map((a) => `${passeio.id}/${a.name}`));
  confere(
    "admin apaga as fotos de um negócio de outra pessoa",
    removidos?.length === arquivos?.length && arquivos.length > 0,
  );
  const { data: excluido } = await admin.sb
    .from("negocios")
    .delete()
    .eq("id", passeio.id)
    .select("id");
  confere("admin exclui o negócio de outra pessoa", excluido?.length === 1);

  if (manter) {
    console.log(
      `\nMantidos para ver no site: /lugares/${chales.slug} (publicado e alterado) e o restaurante recusado.`,
    );
    console.log("Para apagar depois: npm run test:admin-real -- --limpar");
  }
} finally {
  if (!manter) await limpar();
}

console.log(`\n${passaram} passaram, ${falhas.length} falharam`);
if (falhas.length) {
  console.log(`\nFalhas:\n  ${falhas.join("\n  ")}`);
  process.exit(1);
}
