import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { mensagemDeErro, urlDoSite } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { CaixaErro, linkConta } from "./formulario";

/**
 * O Google está ligado no Supabase (Authentication → Providers)? O /auth/v1/settings é público.
 * Enquanto estiver desligado, o botão não aparece (senão levaria a uma página de erro do Supabase).
 */
let googleLigado: Promise<boolean> | null = null;
function conferirGoogle() {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const chave = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
  if (!url || !chave) return Promise.resolve(false);
  googleLigado ??= fetch(`${url}/auth/v1/settings`, { headers: { apikey: chave } })
    .then((r) => r.json())
    .then((j: { external?: { google?: boolean } }) => j.external?.google === true)
    .catch(() => false);
  return googleLigado;
}

function LogoGoogle() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

/**
 * "Continuar com o Google", abaixo do formulário de e-mail e separado dele pela linha "ou".
 * O Google volta para /entrar (com o ?redirect=), que segue para onde a pessoa ia.
 * Conta nova pelo Google cria o perfil com o nome do Google (migração perfil_google).
 */
export function EntrarComGoogle({
  redirect,
  termos = false,
}: {
  redirect?: string | undefined;
  /** no cadastro: avisa que continuar com o Google aceita os Termos e a Política */
  termos?: boolean;
}) {
  const [ligado, setLigado] = useState(false);
  const [indo, setIndo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    void conferirGoogle().then((sim) => ativo && setLigado(sim));
    return () => {
      ativo = false;
    };
  }, []);

  if (!ligado || !supabase) return null;

  async function entrar() {
    if (!supabase) return;
    setIndo(true);
    setErro(null);
    const volta = redirect ? `/entrar?redirect=${encodeURIComponent(redirect)}` : "/entrar";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: urlDoSite(volta) },
    });
    // sem erro, o navegador já está indo para o Google
    if (error) {
      setIndo(false);
      setErro(mensagemDeErro(error));
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4 text-legenda text-ink-suave" aria-hidden>
        <span className="h-px flex-1 bg-linha" />
        ou
        <span className="h-px flex-1 bg-linha" />
      </div>
      {erro && <CaixaErro>{erro}</CaixaErro>}
      <button
        type="button"
        onClick={entrar}
        disabled={indo}
        className="flex min-h-12 w-full items-center justify-center gap-3 rounded-md border border-linha bg-white px-5 font-bold text-ink transition-colors duration-150 hover:bg-areia disabled:opacity-60 noite:bg-areia noite:hover:bg-louca"
      >
        <LogoGoogle />
        {indo ? "Abrindo o Google…" : "Continuar com o Google"}
      </button>
      {termos && (
        <p className="-mt-2 text-legenda text-ink-suave">
          Ao continuar com o Google, você aceita os{" "}
          <Link to="/termos" target="_blank" className={linkConta}>
            Termos de Uso
          </Link>{" "}
          e a{" "}
          <Link to="/privacidade" target="_blank" className={linkConta}>
            Política de Privacidade
          </Link>
          .
        </p>
      )}
    </div>
  );
}
