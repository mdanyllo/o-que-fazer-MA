import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente único do Supabase (Auth, banco e Storage).
 *
 * Só usa a URL do projeto e a anon key, que são públicas por definição: quem protege os dados
 * é a Row Level Security do banco (supabase/migrations). Nunca coloque a service_role key
 * em variáveis VITE_*, porque elas vão para o navegador.
 *
 * Sem as variáveis (.env.local, ver README), `supabase` é null: o site abre, as seções de
 * negócios mostram o estado de erro e as páginas de login avisam que a conta não está configurada.
 */
const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const chaveAnon = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

const noNavegador = typeof window !== "undefined";

/**
 * O "#..." com que a página abriu, guardado antes de o cliente ler e limpar a URL: os links de
 * confirmação e de nova senha trazem ali o tipo (signup, recovery) ou o erro (link expirado).
 */
export const hashInicial = new URLSearchParams(noNavegador ? window.location.hash.slice(1) : "");

export const supabase: SupabaseClient | null =
  url && chaveAnon
    ? createClient(url, chaveAnon, {
        auth: {
          // a sessão fica no navegador; no servidor (SSR) o cliente só lê dados públicos
          persistSession: noNavegador,
          autoRefreshToken: noNavegador,
          // links de confirmação e de nova senha chegam com a sessão na URL
          detectSessionInUrl: noNavegador,
          // implícito: o link do e-mail funciona mesmo aberto em outro aparelho
          flowType: "implicit",
        },
      })
    : null;

export const BUCKET_FOTOS = "fotos-negocios";
