import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Botao } from "@/components/azulejo/botao";
import {
  CaixaAviso,
  CaixaErro,
  CampoTexto,
  focarPrimeiroErro,
  linkConta,
  SENHA_MINIMA,
  validarEmail,
  validarSenha,
} from "@/components/conta/formulario";
import { LayoutConta } from "@/components/conta/LayoutConta";
import { mensagemDeErro, urlDoSite, useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/cadastrar")({
  head: () => ({
    meta: [
      { title: "Cadastre seu negócio | Azulejo" },
      {
        name: "description",
        content: "Crie uma conta para cadastrar seu restaurante, hospedagem ou passeio no Azulejo.",
      },
    ],
  }),
  component: Cadastrar,
});

type Erros = {
  nome?: string | undefined;
  email?: string | undefined;
  senha?: string | undefined;
  termos?: string | undefined;
};

function Cadastrar() {
  const { usuario, carregando } = useAuth();
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [termos, setTermos] = useState(false);
  const [erros, setErros] = useState<Erros>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [enviadoPara, setEnviadoPara] = useState<string | null>(null);

  // quem já tem sessão vai direto para os negócios
  useEffect(() => {
    if (!carregando && usuario) void navigate({ to: "/painel", replace: true });
  }, [carregando, usuario, navigate]);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const novos: Erros = {
      nome: nome.trim() ? undefined : "Informe seu nome.",
      email: validarEmail(email),
      senha: validarSenha(senha),
      termos: termos ? undefined : "Para criar a conta, aceite os Termos e a Política.",
    };
    setErros(novos);
    setErroGeral(null);
    if (Object.values(novos).some(Boolean)) return focarPrimeiroErro();
    if (!supabase) return;
    setEnviando(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: senha,
      options: {
        data: { nome: nome.trim() },
        emailRedirectTo: urlDoSite("/entrar"),
      },
    });
    setEnviando(false);
    if (error) {
      setErroGeral(mensagemDeErro(error));
      return;
    }
    // com a confirmação de e-mail desligada no Supabase, a sessão já vem pronta
    if (data.session) void navigate({ to: "/painel" });
    else setEnviadoPara(email.trim());
  }

  if (enviadoPara)
    return (
      <LayoutConta titulo="Confira seu e-mail">
        <CaixaAviso titulo="Falta um passo">
          <p>
            Mandamos um link para <strong>{enviadoPara}</strong>. Abra o e-mail e toque no link para
            confirmar a conta. Se não aparecer em alguns minutos, olhe o spam.
          </p>
          <p>
            Já confirmou?{" "}
            <Link to="/entrar" className={linkConta}>
              Entrar
            </Link>
          </p>
        </CaixaAviso>
      </LayoutConta>
    );

  return (
    <LayoutConta
      titulo="Cadastre seu negócio"
      apoio="Crie sua conta. Depois você preenche os dados do restaurante, da hospedagem ou do passeio."
    >
      <form onSubmit={enviar} noValidate className="flex flex-col gap-5">
        {erroGeral && <CaixaErro>{erroGeral}</CaixaErro>}
        <CampoTexto
          id="nome"
          rotulo="Seu nome"
          autoComplete="name"
          maxLength={80}
          valor={nome}
          aoMudar={setNome}
          erro={erros.nome}
        />
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
          autoComplete="new-password"
          dica={`Pelo menos ${SENHA_MINIMA} caracteres.`}
          valor={senha}
          aoMudar={setSenha}
          erro={erros.senha}
        />
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-3">
            <input
              id="termos"
              type="checkbox"
              checked={termos}
              onChange={(e) => setTermos(e.target.checked)}
              aria-invalid={erros.termos ? true : undefined}
              aria-describedby={erros.termos ? "termos-erro" : undefined}
              className="mt-0.5 size-6 shrink-0 accent-cobalto"
            />
            <label htmlFor="termos">
              Li e aceito os{" "}
              <Link to="/termos" target="_blank" className={linkConta}>
                Termos de Uso
              </Link>{" "}
              e a{" "}
              <Link to="/privacidade" target="_blank" className={linkConta}>
                Política de Privacidade
              </Link>
              .
            </label>
          </div>
          {erros.termos && (
            <p id="termos-erro" className="text-legenda font-bold text-guara">
              {erros.termos}
            </p>
          )}
        </div>
        <Botao type="submit" tamanho="lg" disabled={enviando} className="w-full">
          {enviando ? "Criando a conta…" : "Criar conta"}
        </Botao>
      </form>
      <p className="border-t border-linha pt-6 text-ink-suave">
        Já tem conta?{" "}
        <Link to="/entrar" className={linkConta}>
          Entrar
        </Link>
      </p>
    </LayoutConta>
  );
}
