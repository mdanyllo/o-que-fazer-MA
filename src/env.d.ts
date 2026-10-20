/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL do projeto no Supabase (Project Settings → API). */
  readonly VITE_SUPABASE_URL?: string;
  /** anon key (pública). Nunca a service_role. */
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
