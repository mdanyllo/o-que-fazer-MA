import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Botao } from "@/components/azulejo/botao";
import {
  CaixaErro,
  CampoTexto,
  focarPrimeiroErro,
  linkConta,
  SENHA_MINIMA,
  validarSenha,
} from "@/components/conta/formulario";
import { LayoutConta, TelaCarregando } from "@/components/conta/LayoutConta";
import { mensagemDeErro, useAuth } from "@/lib/auth";
import { hashInicial, supabase } from "@/lib/supabase";

/** Destino do link "nova senha" do e-mail: o Supabase abre a sessão pela URL. */
export const Route = createFileRoute("/redefinir-senha")({
  head: () => ({
    meta: [{ title: "Nova senha | Azulejo" }, { name: "robots", content: "noindex" }],
  }),
  component: RedefinirSenha,
});

function RedefinirSenha() {
  const { carregando, usuario } = useAuth();
  const navigate = useNavigate();
  const [senha, setSenha] = useState("");
  const [repetir, setRepetir] = useState("");
  const [erros, setErros] = useState<{ senha?: string | undefined; repetir?: string | undefined }>(
    {},
  );
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [linkComErro, setLinkComErro] = useState(false);
  useEffect(() => setLinkComErro(hashInicial.has("error_code")), []);

  if (carregando) return <TelaCarregando />;

  if (!usuario)
    return (
      <LayoutConta titulo="Nova senha">
        <CaixaErro>
          {linkComErro
            ? "Esse link expirou ou já foi usado."
            : "Para criar uma senha nova, abra o link que mandamos por e-mail."}{" "}
          <Link to="/esqueci-senha" className={linkConta}>
            Pedir um link novo
          </Link>
        </CaixaErro>
      </LayoutConta>
    );

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const novos = {
      senha: validarSenha(senha),
      repetir: repetir === senha ? undefined : "As duas senhas não são iguais.",
    };
    setErros(novos);
    setErroGeral(null);
    if (novos.senha || novos.repetir) return focarPrimeiroErro();
    if (!supabase) return;
    setEnviando(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    setEnviando(false);
    if (error) {
      setErroGeral(mensagemDeErro(error));
      return;
    }
    toast.success("Senha nova salva.");
    void navigate({ to: "/painel" });
  }

  return (
    <LayoutConta titulo="Nova senha" apoio={`Conta: ${usuario.email ?? ""}`}>
      <form onSubmit={enviar} noValidate className="flex flex-col gap-5">
        {erroGeral && <CaixaErro>{erroGeral}</CaixaErro>}
        <CampoTexto
          id="senha"
          rotulo="Senha nova"
          type="password"
          autoComplete="new-password"
          dica={`Pelo menos ${SENHA_MINIMA} caracteres.`}
          valor={senha}
          aoMudar={setSenha}
          erro={erros.senha}
        />
        <CampoTexto
          id="repetir"
          rotulo="Repita a senha nova"
          type="password"
          autoComplete="new-password"
          valor={repetir}
          aoMudar={setRepetir}
          erro={erros.repetir}
        />
        <Botao type="submit" tamanho="lg" disabled={enviando} className="w-full">
          {enviando ? "Salvando…" : "Salvar senha nova"}
        </Botao>
      </form>
    </LayoutConta>
  );
}
