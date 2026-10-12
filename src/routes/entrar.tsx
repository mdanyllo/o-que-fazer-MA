import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Botao } from "@/components/azulejo/botao";
import {
  CaixaAviso,
  CaixaErro,
  CampoTexto,
  focarPrimeiroErro,
  linkConta,
  validarEmail,
} from "@/components/conta/formulario";
import { LayoutConta } from "@/components/conta/LayoutConta";
import { destinoSeguro, mensagemDeErro, urlDoSite, useAuth } from "@/lib/auth";
import { hashInicial, supabase } from "@/lib/supabase";

type BuscaEntrar = { redirect?: string };

export const Route = createFileRoute("/entrar")({
  validateSearch: (s: Record<string, unknown>): BuscaEntrar =>
    typeof s["redirect"] === "string" ? { redirect: s["redirect"] } : {},
  head: () => ({
    meta: [{ title: "Entrar | Azulejo" }, { name: "robots", content: "noindex" }],
  }),
  component: Entrar,
});

function Entrar() {
  const { redirect } = Route.useSearch();
  const { usuario, carregando } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erros, setErros] = useState<{ email?: string | undefined; senha?: string | undefined }>(
    {},
  );
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [naoConfirmado, setNaoConfirmado] = useState(false);
  const [reenviado, setReenviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  // link do e-mail que chegou expirado ou já usado (lido depois da hidratação)
  const [linkVencido, setLinkVencido] = useState(false);
  useEffect(() => setLinkVencido(hashInicial.get("error_code") === "otp_expired"), []);

  // já entrou (ou acabou de confirmar o e-mail pelo link): segue para onde ia
  useEffect(() => {
    if (carregando || !usuario) return;
    if (hashInicial.get("type") === "signup") toast.success("E-mail confirmado. Boas-vindas!");
    void navigate({ to: destinoSeguro(redirect), replace: true });
  }, [carregando, usuario, redirect, navigate]);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const novos = { email: validarEmail(email), senha: senha ? undefined : "Informe sua senha." };
    setErros(novos);
    setErroGeral(null);
    setNaoConfirmado(false);
    if (novos.email || novos.senha) return focarPrimeiroErro();
    if (!supabase) return;
    setEnviando(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });
    setEnviando(false);
    if (error) {
      setErroGeral(mensagemDeErro(error));
      setNaoConfirmado(error.code === "email_not_confirmed");
    }
  }

  async function reenviar() {
    if (!supabase) return;
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim(),
      options: { emailRedirectTo: urlDoSite("/entrar") },
    });
    if (error) setErroGeral(mensagemDeErro(error));
    else setReenviado(true);
  }

  return (
    <LayoutConta
      titulo="Entrar"
      apoio="Para quem cadastra restaurante, hospedagem ou passeio no Azulejo."
    >
      <form onSubmit={enviar} noValidate className="flex flex-col gap-5">
        {linkVencido && !erroGeral && (
          <CaixaErro>
            Esse link expirou ou já foi usado. Entre com seu e-mail e senha; se a conta ainda não
            foi confirmada, mandamos outro link.
          </CaixaErro>
        )}
        {erroGeral && (
          <CaixaErro>
            <p>{erroGeral}</p>
            {naoConfirmado && !reenviado && (
              <button type="button" onClick={reenviar} className={`${linkConta} mt-2 min-h-11`}>
                Reenviar o e-mail de confirmação
              </button>
            )}
          </CaixaErro>
        )}
        {reenviado && (
          <CaixaAviso titulo="Mandamos um novo link">
            <p>Confira a caixa de entrada (e o spam) de {email.trim()}.</p>
          </CaixaAviso>
        )}
        <CampoTexto
          id="email"
          rotulo="E-mail"
          type="email"
          autoComplete="email"
          inputMode="email"
          valor={email}
          aoMudar={setEmail}
          erro={erros.email}
        />
        <CampoTexto
          id="senha"
          rotulo="Senha"
          type="password"
          autoComplete="current-password"
          valor={senha}
          aoMudar={setSenha}
          erro={erros.senha}
        />
        <Link to="/esqueci-senha" className={`${linkConta} self-start`}>
          Esqueci minha senha
        </Link>
        <Botao type="submit" tamanho="lg" disabled={enviando} className="w-full">
          {enviando ? "Entrando…" : "Entrar"}
        </Botao>
      </form>
      <p className="border-t border-linha pt-6 text-ink-suave">
        Ainda não tem conta?{" "}
        <Link to="/cadastrar" className={linkConta}>
          Cadastre seu negócio
        </Link>
      </p>
    </LayoutConta>
  );
}
