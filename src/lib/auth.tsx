import type { Session, User } from "@supabase/supabase-js";
import { useNavigate } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "./supabase";

/**
 * Sessão de quem tem conta (donos de negócio e admin). O turista não faz login.
 * A sessão fica salva no navegador pelo próprio Supabase e volta sozinha ao abrir o site.
 * No servidor não há sessão: tudo começa em `carregando` e se resolve no navegador.
 */

export type Papel = "dono" | "admin";
export type Perfil = { nome: string; papel: Papel };

type EstadoAuth = {
  carregando: boolean;
  usuario: User | null;
  perfil: Perfil | null;
};

type ValorAuth = EstadoAuth & {
  /** o Supabase está configurado neste ambiente (.env.local)? */
  disponivel: boolean;
  sair: () => Promise<void>;
};

const AuthContexto = createContext<ValorAuth | null>(null);

async function buscarPerfil(usuario: User): Promise<Perfil> {
  const reserva: Perfil = {
    nome: (usuario.user_metadata?.["nome"] as string | undefined) ?? "",
    papel: "dono",
  };
  if (!supabase) return reserva;
  const { data, error } = await supabase
    .from("perfis")
    .select("nome, papel")
    .eq("id", usuario.id)
    .maybeSingle();
  if (error || !data) return reserva;
  return { nome: data.nome || reserva.nome, papel: data.papel === "admin" ? "admin" : "dono" };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoAuth>({
    carregando: true,
    usuario: null,
    perfil: null,
  });

  useEffect(() => {
    if (!supabase) {
      setEstado({ carregando: false, usuario: null, perfil: null });
      return;
    }
    let ultima = 0;
    let ativo = true;

    async function aplicar(sessao: Session | null) {
      const vez = ++ultima;
      const usuario = sessao?.user ?? null;
      const perfil = usuario ? await buscarPerfil(usuario) : null;
      // ignora respostas atrasadas de eventos anteriores
      if (ativo && vez === ultima) setEstado({ carregando: false, usuario, perfil });
    }

    // dispara INITIAL_SESSION logo ao assinar, e de novo a cada entrada, saída ou renovação
    const { data } = supabase.auth.onAuthStateChange((_evento, sessao) => {
      // fora do callback: chamar o Supabase dentro dele pode travar o cliente
      setTimeout(() => void aplicar(sessao), 0);
    });
    return () => {
      ativo = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const valor = useMemo<ValorAuth>(
    () => ({
      ...estado,
      disponivel: supabase !== null,
      sair: async () => {
        await supabase?.auth.signOut();
      },
    }),
    [estado],
  );

  return <AuthContexto.Provider value={valor}>{children}</AuthContexto.Provider>;
}

// Fora do provider (ex.: página de erro da raiz), age como visitante sem login.
const SEM_PROVIDER: ValorAuth = {
  carregando: false,
  usuario: null,
  perfil: null,
  disponivel: supabase !== null,
  sair: async () => {},
};

export function useAuth() {
  return useContext(AuthContexto) ?? SEM_PROVIDER;
}

/** Nome para mostrar no menu: o do perfil ou, sem ele, o começo do e-mail. */
export function nomeParaMostrar(usuario: User | null, perfil: Perfil | null) {
  return perfil?.nome?.trim() || usuario?.email?.split("@")[0] || "Minha conta";
}

/**
 * O site foi aberto pela página inicial (digitando o endereço, pelo favorito...)?
 * Lido uma vez, quando o app carrega: navegar até o início depois (pelo logo) não conta.
 */
let abriuPeloInicio = typeof window !== "undefined" && window.location.pathname === "/";

/**
 * Quem tem conta e abre o site pelo início vai direto para "Meus negócios". Vale uma vez
 * por carregamento: depois disso o início abre normalmente (ex.: clicando no logo).
 */
export function useIrParaOsNegociosAoChegar() {
  const { carregando, usuario } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (carregando || !abriuPeloInicio) return;
    abriuPeloInicio = false;
    if (usuario) void navigate({ to: "/painel", replace: true });
  }, [carregando, usuario, navigate]);
}

/** Só aceita caminhos internos no ?redirect= (nada de mandar para outro site). */
export function destinoSeguro(redirect: string | undefined, padrao = "/painel") {
  return redirect && redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : padrao;
}

/** Endereço de volta dos e-mails (confirmação e nova senha). */
export function urlDoSite(caminho: string) {
  return typeof window === "undefined" ? caminho : `${window.location.origin}${caminho}`;
}

/**
 * Mensagem em português, sem detalhe técnico, para os erros do Supabase Auth.
 * Códigos: https://supabase.com/docs/guides/auth/debugging/error-codes
 */
export function mensagemDeErro(erro: unknown): string {
  const e = (erro ?? {}) as { code?: string; message?: string; name?: string };
  switch (e.code) {
    case "invalid_credentials":
      return "E-mail ou senha incorretos.";
    case "email_not_confirmed":
      return "Você ainda não confirmou seu e-mail. Abra o link que enviamos para liberar o acesso.";
    case "user_already_exists":
    case "email_exists":
      return "Já existe uma conta com esse e-mail. Tente entrar ou recuperar a senha.";
    case "weak_password":
      return "Essa senha é fácil de adivinhar. Use pelo menos 8 caracteres, misturando letras e números.";
    case "same_password":
      return "A nova senha precisa ser diferente da anterior.";
    case "email_address_invalid":
    case "validation_failed":
      return "Confira o e-mail: ele parece incompleto.";
    case "over_email_send_rate_limit":
      return "Enviamos muitos e-mails em pouco tempo. Espere alguns minutos e tente de novo.";
    case "over_request_rate_limit":
      return "Muitas tentativas seguidas. Espere um pouco e tente de novo.";
    case "signup_disabled":
    case "email_provider_disabled":
      return "Os cadastros estão fechados no momento.";
    case "otp_expired":
      return "Esse link expirou ou já foi usado. Peça um novo.";
    case "session_not_found":
    case "session_expired":
    case "refresh_token_not_found":
      return "Sua sessão expirou. Entre de novo.";
  }
  const texto = (e.message ?? "").toLowerCase();
  if (e.name === "AuthRetryableFetchError" || texto.includes("fetch") || texto.includes("network"))
    return "Não conseguimos falar com o servidor. Confira sua internet e tente de novo.";
  return "Algo deu errado. Tente de novo em instantes.";
}
