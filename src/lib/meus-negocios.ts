import { getCidade } from "@/data/cidades";
import type { StatusNegocio, SubtipoHospedagem, TipoNegocio } from "./negocios";
import { BUCKET_FOTOS, supabase } from "./supabase";

/*
 * O que o dono lê e grava dos próprios negócios (/painel).
 * Nunca lê nem grava `extras`, `exemplo`, `notas_internas`, `aprovado_por` ou `aprovado_em`;
 * o banco também recusa (ver supabase/migrations e supabase/tests/permissoes.mjs).
 */

export type FotoDono = { id: string; caminho: string; ordem: number; legenda: string | null };

export type NegocioDono = {
  id: string;
  tipo: TipoNegocio;
  subtipo: string | null;
  nome: string;
  nome_curto: string | null;
  slug: string;
  cidade: string | null;
  descricao: string | null;
  endereco: string | null;
  ponto_encontro: string | null;
  latitude: number | null;
  longitude: number | null;
  whatsapp: string | null;
  instagram: string | null;
  site: string | null;
  preco: number | null;
  faixa_preco: "$" | "$$" | "$$$" | null;
  duracao: string | null;
  horario: string | null;
  status: StatusNegocio;
  motivo_recusa: string | null;
  alterado_desde_revisao: boolean;
  alterado_em: string | null;
  atualizado_em: string;
  negocio_fotos: FotoDono[];
};

const COLUNAS_DONO =
  "id, tipo, subtipo, nome, nome_curto, slug, cidade, descricao, endereco, ponto_encontro, latitude, longitude, whatsapp, instagram, site, preco, faixa_preco, duracao, horario, status, motivo_recusa, alterado_desde_revisao, alterado_em, atualizado_em, negocio_fotos (id, caminho, ordem, legenda)";

export const LIMITE_NEGOCIOS = 5;
export const LIMITE_FOTOS = 8;

const ordenarFotos = (n: NegocioDono): NegocioDono => ({
  ...n,
  negocio_fotos: [...n.negocio_fotos].sort((a, b) => a.ordem - b.ordem),
});

function cliente() {
  if (!supabase) throw new ErroNegocio("As contas ainda não estão ligadas neste ambiente.");
  return supabase;
}

// ——— erros em português ———

export class ErroNegocio extends Error {}

/** Traduz erros do banco, do Storage e da rede para uma frase clara. */
export function mensagemErroNegocio(erro: unknown): string {
  if (erro instanceof ErroNegocio) return erro.message;
  const e = (erro ?? {}) as { code?: string; message?: string; hint?: string; name?: string };
  const texto = e.message ?? "";
  if (e.hint === "limite_negocios" || e.hint === "incompleto" || e.hint === "limite_fotos")
    return texto;
  if (e.code === "42501")
    return texto.startsWith("Só a equipe") || texto.startsWith("Este campo")
      ? texto
      : "Você não tem permissão para essa alteração.";
  if (e.code === "23514")
    return "Algum campo passou do tamanho permitido. Confira e tente de novo.";
  if (e.name === "TypeError" || /fetch|network|Failed to fetch/i.test(texto))
    return "Sem conexão com o servidor. Confira sua internet e tente de novo.";
  return "Não conseguimos salvar agora. Tente de novo em instantes.";
}

// ——— leitura ———

export async function listarMeusNegocios(donoId: string) {
  const { data, error } = await cliente()
    .from("negocios")
    .select(COLUNAS_DONO)
    .eq("dono_id", donoId)
    .order("atualizado_em", { ascending: false });
  if (error) throw error;
  return (data as unknown as NegocioDono[]).map(ordenarFotos);
}

/** O negócio, se for da pessoa; null se não existe ou é de outra pessoa. */
export async function buscarMeuNegocio(id: string, donoId: string) {
  // ids que não são uuid fariam o banco responder com erro: tratamos como "não encontrado"
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data, error } = await cliente()
    .from("negocios")
    .select(COLUNAS_DONO)
    .eq("id", id)
    .eq("dono_id", donoId)
    .maybeSingle();
  if (error) throw error;
  return data ? ordenarFotos(data as unknown as NegocioDono) : null;
}

// ——— formulário ———

/** Estado do formulário (tudo em texto, como o dono digita). */
export type Rascunho = {
  tipo: TipoNegocio | null;
  nome: string;
  nome_curto: string;
  cidade: string;
  descricao: string;
  endereco: string;
  /** só os dígitos, sem o 55 (DDD + número) */
  whatsapp: string;
  instagram: string;
  site: string;
  subtipo_hospedagem: SubtipoHospedagem | "";
  culinaria: string;
  preco: string;
  faixa_preco: "$" | "$$" | "$$$" | "";
  horario: string;
  duracao: string;
  ponto_encontro: string;
  /** ponto marcado no mapa pelo dono; null = centro da cidade */
  latitude: number | null;
  longitude: number | null;
};

export const RASCUNHO_VAZIO: Rascunho = {
  tipo: null,
  nome: "",
  nome_curto: "",
  cidade: "",
  descricao: "",
  endereco: "",
  whatsapp: "",
  instagram: "",
  site: "",
  subtipo_hospedagem: "",
  culinaria: "",
  preco: "",
  faixa_preco: "",
  horario: "",
  duracao: "",
  ponto_encontro: "",
  latitude: null,
  longitude: null,
};

const reaisInput = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

export function rascunhoDe(n: NegocioDono): Rascunho {
  return {
    tipo: n.tipo,
    nome: n.nome,
    nome_curto: n.nome_curto ?? "",
    cidade: n.cidade ?? "",
    descricao: n.descricao ?? "",
    endereco: n.endereco ?? "",
    whatsapp: n.whatsapp?.replace(/^55/, "") ?? "",
    instagram: n.instagram ? `@${n.instagram}` : "",
    site: n.site ?? "",
    subtipo_hospedagem: n.tipo === "hospedagem" ? ((n.subtipo as SubtipoHospedagem) ?? "") : "",
    culinaria: n.tipo === "restaurante" ? (n.subtipo ?? "") : "",
    preco: n.preco != null ? reaisInput.format(n.preco) : "",
    faixa_preco: n.faixa_preco ?? "",
    horario: n.horario ?? "",
    duracao: n.duracao ?? "",
    ponto_encontro: n.ponto_encontro ?? "",
    latitude: n.latitude,
    longitude: n.longitude,
  };
}

// WhatsApp: DDDs brasileiros válidos e celular com 9 dígitos começando por 9
const DDDS = new Set(
  "11 12 13 14 15 16 17 18 19 21 22 24 27 28 31 32 33 34 35 37 38 41 42 43 44 45 46 47 48 49 51 53 54 55 61 62 63 64 65 66 67 68 69 71 73 74 75 77 79 81 82 83 84 85 86 87 88 89 91 92 93 94 95 96 97 98 99".split(
    " ",
  ),
);

/** Mantém só os dígitos (até 11), tirando o 55 de um número colado completo. */
export function digitosWhatsapp(valor: string) {
  let d = valor.replace(/\D/g, "");
  if (d.length > 11 && d.startsWith("55")) d = d.slice(2);
  return d.slice(0, 11);
}

/** "98991234567" → "(98) 99123-4567", conforme digita. */
export function mascararWhatsapp(digitos: string) {
  const d = digitos;
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function erroWhatsapp(digitos: string) {
  if (!digitos) return "Informe o WhatsApp.";
  if (digitos.length < 11) return "Digite o DDD e os 9 dígitos do celular.";
  if (!DDDS.has(digitos.slice(0, 2)))
    return "Esse DDD não existe. Confira os dois primeiros números.";
  if (digitos[2] !== "9") return "O número de celular começa com 9, depois do DDD.";
  return undefined;
}

/** "@nome", "nome" ou o link do perfil → "nome". */
export function normalizarInstagram(valor: string) {
  const v = valor.trim();
  if (!v) return "";
  const doLink = v.match(/instagram\.com\/([^/?#]+)/i);
  return (doLink ? doLink[1]! : v).replace(/^@/, "");
}

export function normalizarSite(valor: string) {
  const v = valor.trim();
  if (!v) return "";
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

/** "280", "280,50" ou "1.200" → número; null se vazio ou inválido. */
export function lerPreco(valor: string) {
  const v = valor
    .replace(/[^\d,.]/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "")
    .replace(",", ".");
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
}

const PREFIXOS =
  /^(pousada|hotel|chal[eé]s?|hostel|casa|restaurante|bar|lanchonete|passeios?|ag[eê]ncia|turismo)\s+(d[aeo]s?\s+)?/i;

/** Sugestão de nome curto (até 22 caracteres) para os cards. */
export function sugerirNomeCurto(nome: string) {
  const limpo = nome.trim().replace(/\s+/g, " ");
  if (limpo.length <= 22) return limpo;
  const semPrefixo = limpo.replace(PREFIXOS, "");
  const base = semPrefixo.length >= 3 ? semPrefixo : limpo;
  if (base.length <= 22) return base.charAt(0).toUpperCase() + base.slice(1);
  const palavras = base.split(" ");
  let curto = "";
  for (const p of palavras) {
    if ((curto ? `${curto} ${p}` : p).length > 22) break;
    curto = curto ? `${curto} ${p}` : p;
  }
  // tira preposição solta no fim ("Margem do")
  curto = curto.replace(/\s+(d[aeo]s?|e|em)$/i, "");
  return curto || base.slice(0, 22);
}

export type Campo = keyof Rascunho | "fotos";
export type Erros = Partial<Record<Campo, string>>;

export const DESCRICAO_MIN = 50;
export const DESCRICAO_MAX = 600;

/** Campos de cada etapa (para levar o dono à etapa do primeiro erro). */
export const CAMPOS_DA_ETAPA: Record<number, Campo[]> = {
  1: ["tipo"],
  2: [
    "nome",
    "nome_curto",
    "cidade",
    "descricao",
    "subtipo_hospedagem",
    "culinaria",
    "preco",
    "faixa_preco",
    "horario",
    "duracao",
  ],
  3: ["whatsapp", "instagram", "site", "endereco", "ponto_encontro"],
  4: ["fotos"],
};

/**
 * Valida o formulário.
 * - "rascunho": só o que impede gravar (tipo, nome e tamanhos/formatos do que foi preenchido);
 * - "completo": tudo o que a análise exige, inclusive 1 foto.
 */
export function validar(r: Rascunho, nivel: "rascunho" | "completo", fotos: number): Erros {
  const e: Erros = {};
  const completo = nivel === "completo";
  const preenchido = (v: string) => v.trim().length > 0;

  if (!r.tipo) e.tipo = "Escolha o tipo do negócio.";
  if (!preenchido(r.nome)) e.nome = "Informe o nome do negócio.";
  else if (r.nome.trim().length > 60) e.nome = "Use até 60 caracteres.";
  if (r.nome_curto.trim().length > 22) e.nome_curto = "Use até 22 caracteres.";
  if (completo && !r.cidade) e.cidade = "Escolha a cidade.";

  const desc = r.descricao.trim().length;
  if (desc > DESCRICAO_MAX) e.descricao = `Use até ${DESCRICAO_MAX} caracteres.`;
  else if (completo && desc < DESCRICAO_MIN)
    e.descricao = desc
      ? `Escreva pelo menos ${DESCRICAO_MIN} caracteres (faltam ${DESCRICAO_MIN - desc}).`
      : "Conte em poucas linhas como é o seu negócio.";

  if (completo || r.whatsapp) {
    const erro = erroWhatsapp(r.whatsapp);
    if (erro) e.whatsapp = erro;
  }
  if (preenchido(r.instagram) && !/^[a-z0-9._]{1,30}$/i.test(normalizarInstagram(r.instagram)))
    e.instagram = "Use o nome do perfil, como @pousadadamaria.";
  if (preenchido(r.site)) {
    try {
      const url = new URL(normalizarSite(r.site));
      if (!url.hostname.includes(".")) throw new Error();
    } catch {
      e.site = "Confira o endereço do site, como pousadadamaria.com.br.";
    }
  }
  if (r.endereco.trim().length > 160) e.endereco = "Use até 160 caracteres.";
  else if (completo && r.tipo !== "passeio" && !preenchido(r.endereco))
    e.endereco = "Informe o endereço, para quem viaja chegar até você.";

  const preco = lerPreco(r.preco);
  if (preenchido(r.preco) && (preco === null || preco <= 0))
    e.preco = "Digite só o valor, como 280.";

  if (r.tipo === "hospedagem") {
    if (completo && !r.subtipo_hospedagem) e.subtipo_hospedagem = "Escolha o tipo de hospedagem.";
    if (completo && !preenchido(r.preco)) e.preco = "Informe o preço por noite.";
  }
  if (r.tipo === "restaurante") {
    if (completo && !preenchido(r.culinaria)) e.culinaria = "Conte o tipo de culinária.";
    if (r.culinaria.trim().length > 40) e.culinaria = "Use até 40 caracteres.";
    if (completo && !r.faixa_preco) e.faixa_preco = "Escolha a faixa de preço.";
  }
  if (r.tipo === "passeio") {
    if (completo && !preenchido(r.preco)) e.preco = "Informe o preço por pessoa.";
    if (completo && !preenchido(r.duracao)) e.duracao = "Informe quanto tempo dura o passeio.";
    if (completo && !preenchido(r.ponto_encontro))
      e.ponto_encontro = "Diga onde o grupo se encontra.";
  }
  if (r.horario.trim().length > 160) e.horario = "Use até 160 caracteres.";
  if (r.duracao.trim().length > 60) e.duracao = "Use até 60 caracteres.";
  if (r.ponto_encontro.trim().length > 160) e.ponto_encontro = "Use até 160 caracteres.";

  if (completo && fotos === 0) e.fotos = "Envie pelo menos 1 foto.";
  return e;
}

/** Só os campos que o dono pode gravar, já no formato do banco. */
function payload(r: Rascunho) {
  const vazio = (v: string) => (v.trim() ? v.trim() : null);
  const tipo = r.tipo!;
  const cidade = getCidade(r.cidade);
  return {
    tipo,
    nome: r.nome.trim(),
    nome_curto: vazio(r.nome_curto),
    cidade: vazio(r.cidade),
    descricao: vazio(r.descricao),
    endereco: vazio(r.endereco),
    whatsapp: r.whatsapp ? `55${r.whatsapp}` : null,
    instagram: vazio(normalizarInstagram(r.instagram)),
    site: vazio(normalizarSite(r.site)),
    subtipo:
      tipo === "hospedagem"
        ? r.subtipo_hospedagem || null
        : tipo === "restaurante"
          ? vazio(r.culinaria)
          : null,
    preco: tipo === "restaurante" ? null : lerPreco(r.preco),
    faixa_preco: tipo === "restaurante" ? r.faixa_preco || null : null,
    horario: vazio(r.horario),
    duracao: tipo === "passeio" ? vazio(r.duracao) : null,
    ponto_encontro: tipo === "passeio" ? vazio(r.ponto_encontro) : null,
    // o ponto marcado no mapa; sem ele, o centro da cidade (o formulário desmarca o ponto
    // quando a cidade muda)
    latitude: r.latitude ?? cidade?.lat ?? null,
    longitude: r.longitude ?? cidade?.lng ?? null,
  };
}

const ehSlugRepetido = (e: { code?: string; message?: string } | null) =>
  e?.code === "23505" && /slug/.test(e.message ?? "");

/**
 * Cria o negócio como rascunho. O slug é gerado pelo banco; se colidir, tenta de novo (2x).
 * `equipe`: cadastro feito pelo admin, sem dono, marcando se é dado de exemplo.
 */
export async function criarNegocio(r: Rascunho, equipe?: { exemplo: boolean }) {
  const dados = {
    ...payload(r),
    status: "rascunho" as const,
    ...(equipe ? { dono_id: null, exemplo: equipe.exemplo } : {}),
  };
  for (let tentativa = 0; ; tentativa++) {
    const { data, error } = await cliente().from("negocios").insert(dados).select("id").single();
    if (!error) return data.id as string;
    if (!ehSlugRepetido(error) || tentativa >= 2) throw error;
  }
}

/**
 * Grava as alterações. `enviar`: manda para análise (de rascunho ou recusado).
 * Publicado continua publicado; em análise continua em análise (regras no banco).
 */
export async function salvarNegocio(
  original: NegocioDono,
  r: Rascunho,
  { enviar = false }: { enviar?: boolean } = {},
) {
  const dados = {
    ...payload(r),
    ...(enviar ? { status: "pendente" as const } : {}),
  };
  for (let tentativa = 0; ; tentativa++) {
    // a RLS só deixa gravar o que é da pessoa; sem linha de volta, não era dela
    const { data, error } = await cliente()
      .from("negocios")
      .update(dados)
      .eq("id", original.id)
      .select("id");
    if (!error) {
      if (!data?.length) throw new ErroNegocio("Não encontramos esse negócio na sua conta.");
      return;
    }
    if (!ehSlugRepetido(error) || tentativa >= 2) throw error;
  }
}

/** Exclui o negócio e os arquivos dele no Storage. */
export async function excluirNegocio(n: NegocioDono) {
  const sb = cliente();
  // arquivos registrados + qualquer sobra na pasta do negócio
  const registrados = n.negocio_fotos.map((f) => f.caminho).filter((c) => !c.startsWith("/"));
  const { data: naPasta } = await sb.storage.from(BUCKET_FOTOS).list(n.id, { limit: 100 });
  const caminhos = [
    ...new Set([...registrados, ...(naPasta ?? []).map((o) => `${n.id}/${o.name}`)]),
  ];
  // primeiro os arquivos: a permissão do Storage depende de o negócio ainda existir
  if (caminhos.length) {
    // sem permissão o remove() não dá erro, só não apaga: confere o que voltou
    const { data, error } = await sb.storage.from(BUCKET_FOTOS).remove(caminhos);
    if (error || (data?.length ?? 0) < caminhos.length)
      throw new ErroNegocio("Não conseguimos apagar as fotos. Tente de novo.");
  }
  const { error } = await sb.from("negocios").delete().eq("id", n.id);
  if (error) throw error;
}

// ——— fotos ———

export const TIPOS_FOTO = ["image/jpeg", "image/png", "image/webp"];
const LADO_MAXIMO = 1600;
export const TAMANHO_MAXIMO = 5 * 1024 * 1024;
/** acima disso nem tentamos abrir no navegador */
const TAMANHO_ORIGINAL_MAXIMO = 25 * 1024 * 1024;

/** Reduz para no máximo 1600px no lado maior e converte para WebP (ou JPEG). */
export async function prepararFoto(arquivo: File): Promise<Blob> {
  if (!TIPOS_FOTO.includes(arquivo.type))
    throw new ErroNegocio(`"${arquivo.name}" não é JPG, PNG nem WebP.`);
  if (arquivo.size > TAMANHO_ORIGINAL_MAXIMO)
    throw new ErroNegocio(`"${arquivo.name}" é grande demais (mais de 25 MB).`);

  let imagem: ImageBitmap;
  try {
    imagem = await createImageBitmap(arquivo, { imageOrientation: "from-image" });
  } catch {
    throw new ErroNegocio(`Não conseguimos abrir "${arquivo.name}". Tente outra foto.`);
  }
  const escala = Math.min(1, LADO_MAXIMO / Math.max(imagem.width, imagem.height));
  const largura = Math.round(imagem.width * escala);
  const altura = Math.round(imagem.height * escala);
  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;
  canvas.getContext("2d")!.drawImage(imagem, 0, 0, largura, altura);
  imagem.close();

  const gerar = (tipo: string) => new Promise<Blob | null>((ok) => canvas.toBlob(ok, tipo, 0.85));
  let blob = await gerar("image/webp");
  // navegadores sem WebP no canvas devolvem PNG: usamos JPEG
  if (!blob || blob.type !== "image/webp") blob = await gerar("image/jpeg");
  if (!blob) throw new ErroNegocio(`Não conseguimos preparar "${arquivo.name}".`);
  if (blob.size > TAMANHO_MAXIMO)
    throw new ErroNegocio(`"${arquivo.name}" passou de 5 MB mesmo reduzida. Tente outra foto.`);
  return blob;
}

/** Envia ao Storage com progresso (o cliente do Supabase não informa o andamento). */
async function enviarComProgresso(
  caminho: string,
  blob: Blob,
  aoProgredir: (fracao: number) => void,
) {
  const sessao = (await cliente().auth.getSession()).data.session;
  if (!sessao) throw new ErroNegocio("Sua sessão expirou. Entre de novo.");
  return new Promise<void>((ok, falha) => {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/${BUCKET_FOTOS}/${caminho}`;
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("Authorization", `Bearer ${sessao.access_token}`);
    xhr.setRequestHeader("apikey", import.meta.env.VITE_SUPABASE_ANON_KEY ?? "");
    xhr.setRequestHeader("Content-Type", blob.type);
    xhr.setRequestHeader("x-upsert", "false");
    // 1 hora: uma foto apagada não fica muito tempo na CDN
    xhr.setRequestHeader("cache-control", "max-age=3600");
    xhr.upload.onprogress = (ev) => ev.lengthComputable && aoProgredir(ev.loaded / ev.total);
    xhr.onerror = () =>
      falha(
        new ErroNegocio("A conexão caiu durante o envio. Confira sua internet e tente de novo."),
      );
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return ok();
      let corpo: { message?: string; error?: string; statusCode?: string } = {};
      try {
        corpo = JSON.parse(xhr.responseText);
      } catch {
        /* resposta sem JSON */
      }
      const texto = `${corpo.error ?? ""} ${corpo.message ?? ""}`.toLowerCase();
      console.error("[fotos] envio recusado:", xhr.status, xhr.responseText);
      if (xhr.status === 413 || /size|too large/.test(texto))
        return falha(new ErroNegocio("A foto passou do limite de 5 MB."));
      if (/mime|type/.test(texto))
        return falha(new ErroNegocio("Esse formato não é aceito. Use JPG, PNG ou WebP."));
      if (xhr.status === 401 || xhr.status === 403 || /security|unauthorized|policy/.test(texto))
        return falha(
          new ErroNegocio("O Storage recusou o envio por falta de permissão nesta pasta."),
        );
      falha(new ErroNegocio(`O envio falhou (erro ${xhr.status}). Tente de novo.`));
    };
    xhr.send(blob);
  });
}

/** Prepara, envia e registra uma foto no fim da lista. Devolve a foto registrada. */
export async function enviarFoto(
  negocioId: string,
  arquivo: File,
  ordem: number,
  aoProgredir: (fracao: number) => void,
): Promise<FotoDono> {
  const blob = await prepararFoto(arquivo);
  const extensao = blob.type === "image/webp" ? "webp" : "jpg";
  const caminho = `${negocioId}/${crypto.randomUUID()}.${extensao}`;
  await enviarComProgresso(caminho, blob, aoProgredir);
  const { data, error } = await cliente()
    .from("negocio_fotos")
    .insert({ negocio_id: negocioId, caminho, ordem })
    .select("id, caminho, ordem, legenda")
    .single();
  if (error) {
    // não deixa arquivo órfão
    await cliente().storage.from(BUCKET_FOTOS).remove([caminho]);
    throw error;
  }
  return data as FotoDono;
}

/** Apaga o arquivo do Storage e o registro da foto. */
export async function removerFoto(foto: FotoDono) {
  const sb = cliente();
  if (!foto.caminho.startsWith("/")) {
    // sem permissão o remove() não dá erro, só não apaga: confere o que voltou
    const { data, error } = await sb.storage.from(BUCKET_FOTOS).remove([foto.caminho]);
    if (error || data?.length !== 1)
      throw new ErroNegocio("Não conseguimos apagar o arquivo da foto. Tente de novo.");
  }
  const { error } = await sb.from("negocio_fotos").delete().eq("id", foto.id);
  if (error) throw error;
}

/** Grava a nova ordem (a primeira é a capa). */
export async function reordenarFotos(fotos: FotoDono[]) {
  const sb = cliente();
  const mudaram = fotos.map((f, i) => ({ ...f, ordem: i })).filter((f, i) => fotos[i]!.ordem !== i);
  for (const f of mudaram) {
    const { error } = await sb.from("negocio_fotos").update({ ordem: f.ordem }).eq("id", f.id);
    if (error) throw error;
  }
  return fotos.map((f, i) => ({ ...f, ordem: i }));
}
