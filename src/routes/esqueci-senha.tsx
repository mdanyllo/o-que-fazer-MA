import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
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
import { mensagemDeErro, urlDoSite } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/esqueci-senha")({
  head: () => ({
    meta: [{ title: "Esqueci minha senha | Azulejo" }, { name: "robots", content: "noindex" }],
  }),
  component: EsqueciSenha,
});

function EsqueciSenha() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState<string | undefined>();
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const invalido = validarEmail(email);
    setErro(invalido);
    setErroGeral(null);
    if (invalido) return focarPrimeiroErro();
    if (!supabase) return;
    setEnviando(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: urlDoSite("/redefinir-senha"),
    });
    setEnviando(false);
    if (error) setErroGeral(mensagemDeErro(error));
    else setEnviado(true);
  }

  return (
    <LayoutConta
      titulo="Esqueci minha senha"
      apoio="Informe o e-mail da conta. Mandamos um link para você criar uma senha nova."
    >
      {enviado ? (
        // mesma resposta exista ou não a conta, para não revelar quem tem cadastro
        <CaixaAviso titulo="Confira seu e-mail">
          <p>
            Se houver uma conta com <strong>{email.trim()}</strong>, o link chega em alguns minutos.
            Ele vale por pouco tempo; se expirar, é só pedir outro.
          </p>
          <Link to="/entrar" className={`${linkConta} self-start`}>
            Voltar para entrar
          </Link>
        </CaixaAviso>
      ) : (
        <form onSubmit={enviar} noValidate className="flex flex-col gap-5">
          {erroGeral && <CaixaErro>{erroGeral}</CaixaErro>}
          <CampoTexto
            id="email"
            rotulo="E-mail"
            type="email"
            autoComplete="email"
            inputMode="email"
            valor={email}
            aoMudar={setEmail}
            erro={erro}
          />
          <Botao type="submit" tamanho="lg" disabled={enviando} className="w-full">
            {enviando ? "Enviando…" : "Enviar link"}
          </Botao>
          <Link to="/entrar" className={`${linkConta} self-start`}>
            Lembrei, quero entrar
          </Link>
        </form>
      )}
    </LayoutConta>
  );
}
