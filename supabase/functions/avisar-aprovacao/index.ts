// E-mail para o dono quando a equipe aprova (publica) o negócio dele.
// Chamada pelo admin logo depois de aprovar (src/lib/admin.ts). Envio pelo Resend.
//
// Secrets: RESEND_API_KEY (obrigatória para enviar), EMAIL_REMETENTE (ex.: "Azulejo
// <contato@azulejo.com.br>", de um domínio verificado no Resend) e SITE_URL (endereço do site).
// Sem RESEND_API_KEY, responde { enviado: false } e a aprovação segue normalmente.
//
// Corpo: { negocio: uuid }. Resposta: { enviado: boolean, motivo?: string }
import { CORS, json } from "../_shared/asaas.ts";
import { servidor, usuarioDaRequisicao } from "../_shared/supabase.ts";

type Negocio = {
  id: string;
  nome: string;
  slug: string;
  tipo: "restaurante" | "hospedagem" | "passeio";
  status: string;
  dono_id: string | null;
};

const escapar = (t: string) =>
  t.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

function html({
  nome,
  pessoa,
  pagina,
  painel,
}: {
  nome: string;
  pessoa: string;
  pagina: string;
  painel: string;
}) {
  const n = escapar(nome);
  const ola = pessoa ? `Olá, ${escapar(pessoa)}!` : "Olá!";
  return `<!doctype html>
<html lang="pt-BR"><body style="margin:0;background:#f7f3ea;font-family:Arial,Helvetica,sans-serif;color:#1d1d1b">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f3ea;padding:32px 16px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e6dcc8;border-radius:10px">
<tr><td style="padding:32px 32px 8px">
<p style="margin:0;font-size:22px;font-weight:bold;color:#1f4e8c">azulejo</p>
</td></tr>
<tr><td style="padding:16px 32px 8px">
<h1 style="margin:0 0 16px;font-size:26px;line-height:1.2;color:#1f4e8c">${n} está no ar!</h1>
<p style="margin:0 0 12px;font-size:16px;line-height:1.6">${ola}</p>
<p style="margin:0 0 12px;font-size:16px;line-height:1.6">A equipe do Azulejo revisou e aprovou o cadastro de <strong>${n}</strong>. A partir de agora ele aparece para quem está planejando a viagem pelo Maranhão: nos destinos, no mapa e nos roteiros.</p>
<p style="margin:0 0 24px;font-size:16px;line-height:1.6">Dica: compartilhe o link da página no seu Instagram e no WhatsApp para mais gente chegar até você.</p>
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="border-radius:10px;background:#1f4e8c"><a href="${pagina}" style="display:inline-block;padding:14px 24px;font-size:16px;font-weight:bold;color:#ffffff;text-decoration:none">Ver a página</a></td>
<td style="width:12px"></td>
<td style="border-radius:10px;border:2px solid #1f4e8c"><a href="${painel}" style="display:inline-block;padding:12px 22px;font-size:16px;font-weight:bold;color:#1f4e8c;text-decoration:none">Abrir meu painel</a></td>
</tr></table>
</td></tr>
<tr><td style="padding:24px 32px 32px;font-size:13px;line-height:1.5;color:#6b6457">
Se mudar alguma coisa no negócio, é só editar pelo painel. Você recebeu este e-mail porque cadastrou um negócio no Azulejo.
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ erro: "Método não aceito." }, 405);

  // só o admin dispara
  const usuario = await usuarioDaRequisicao(req);
  if (!usuario) return json({ erro: "Entre na sua conta." }, 401);
  const sb = servidor();
  const { data: perfil } = await sb
    .from("perfis")
    .select("papel")
    .eq("id", usuario.id)
    .maybeSingle();
  if (perfil?.papel !== "admin") return json({ erro: "Só a equipe pode avisar." }, 403);

  const { negocio: id } = (await req.json().catch(() => ({}))) as { negocio?: string };
  if (!id) return json({ erro: "Informe o negócio." }, 400);

  const { data: n } = await sb
    .from("negocios")
    .select("id, nome, slug, tipo, status, dono_id")
    .eq("id", id)
    .maybeSingle<Negocio>();
  if (!n) return json({ erro: "Negócio não encontrado." }, 404);
  if (n.status !== "publicado") return json({ enviado: false, motivo: "não está publicado" });
  if (!n.dono_id) return json({ enviado: false, motivo: "sem dono" });

  const chave = Deno.env.get("RESEND_API_KEY");
  if (!chave) return json({ enviado: false, motivo: "e-mail não configurado" });

  const { data: dono } = await sb.auth.admin.getUserById(n.dono_id);
  const email = dono.user?.email;
  if (!email) return json({ enviado: false, motivo: "dono sem e-mail" });
  const { data: perfilDono } = await sb
    .from("perfis")
    .select("nome")
    .eq("id", n.dono_id)
    .maybeSingle();

  const site = (Deno.env.get("SITE_URL") ?? req.headers.get("origin") ?? "").replace(/\/$/, "");
  const pagina = `${site}/${n.tipo === "passeio" ? "experiencias" : "lugares"}/${n.slug}`;

  const resposta = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${chave}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: Deno.env.get("EMAIL_REMETENTE") ?? "Azulejo <onboarding@resend.dev>",
      to: [email],
      subject: `${n.nome} foi aprovado e já está no Azulejo`,
      html: html({
        nome: n.nome,
        pessoa: (perfilDono?.nome ?? "").split(" ")[0] ?? "",
        pagina,
        painel: `${site}/painel`,
      }),
    }),
  });
  if (!resposta.ok) {
    console.error("[avisar-aprovacao]", resposta.status, await resposta.text());
    return json({ enviado: false, motivo: "o serviço de e-mail recusou" }, 502);
  }
  return json({ enviado: true });
});
