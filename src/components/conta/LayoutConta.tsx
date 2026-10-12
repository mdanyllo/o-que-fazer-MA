import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, type ReactNode } from "react";
import { LoadingAzulejo } from "@/components/azulejo/LoadingAzulejo";
import { Pagina404 } from "@/components/site/Pagina404";
import { PageShell } from "@/components/site/PageShell";
import { useAuth, type Perfil } from "@/lib/auth";
import type { User } from "@supabase/supabase-js";

/**
 * Páginas de conta (entrar, cadastrar, senha): uma coluna estreita, celular primeiro.
 * No desktop, ao lado, um bloco em areia explica para quem é a conta.
 */
export function LayoutConta({
  titulo,
  apoio,
  children,
}: {
  titulo: string;
  apoio?: ReactNode;
  children: ReactNode;
}) {
  const { disponivel } = useAuth();
  return (
    <PageShell>
      <div className="mx-auto grid max-w-7xl gap-12 px-5 pt-10 pb-16 md:px-12 md:pt-16 md:pb-24 lg:grid-cols-[minmax(0,28rem)_1fr] lg:gap-24">
        <div className="flex min-w-0 flex-col gap-8">
          <div className="flex flex-col gap-3">
            <h1 className="text-t1 text-cobalto">{titulo}</h1>
            {apoio && <p className="text-ink-suave">{apoio}</p>}
          </div>
          {disponivel ? (
            children
          ) : (
            <div role="status" className="rounded-md border border-linha bg-areia p-5">
              As contas ainda não estão ligadas neste ambiente. Quem cuida do site precisa
              configurar o Supabase (veja o README).
            </div>
          )}
        </div>
        <aside className="hidden self-start rounded-md bg-areia p-8 lg:block">
          <p className="text-rotulo text-cobalto">Para negócios do Maranhão</p>
          <p className="mt-3 text-t3">
            Restaurantes, hospedagens e passeios aparecem dentro dos destinos e dos roteiros.
          </p>
          <p className="mt-3 medida text-ink-suave">
            Quem viaja continua usando o Azulejo sem conta. O login é só para quem cadastra um
            negócio. Antes de ir para o site, a equipe revisa cada cadastro.
          </p>
        </aside>
      </div>
    </PageShell>
  );
}

/** Tela de espera enquanto a sessão é lida no navegador. */
export function TelaCarregando() {
  return (
    <PageShell>
      <div className="grid min-h-[50svh] place-items-center px-5">
        <LoadingAzulejo rotulo="Carregando sua conta" />
      </div>
    </PageShell>
  );
}

/**
 * Proteção das áreas logadas. A segurança de verdade está na RLS do banco; aqui é a navegação:
 * - sem login: vai para /entrar (e volta depois);
 * - saiu da conta nesta tela: vai para o início;
 * - `papel="admin"`: quem não é admin (logado ou não) vê "Página não encontrada".
 */
export function AreaRestrita({
  papel,
  children,
}: {
  papel?: "admin";
  children: (conta: { usuario: User; perfil: Perfil | null }) => ReactNode;
}) {
  const { carregando, usuario, perfil } = useAuth();
  const navigate = useNavigate();
  // o endereço desta tela, guardado na entrada (durante a navegação a URL já é a próxima)
  const aqui = useRef(useRouterState({ select: (s) => s.location.href })).current;
  const estavaLogado = useRef(false);
  const navegou = useRef(false);
  if (usuario) estavaLogado.current = true;
  const mandarEntrar = !carregando && !usuario && !papel;

  useEffect(() => {
    if (!mandarEntrar || navegou.current) return;
    navegou.current = true;
    if (estavaLogado.current) void navigate({ to: "/", replace: true });
    else void navigate({ to: "/entrar", search: { redirect: aqui }, replace: true });
  }, [mandarEntrar, aqui, navigate]);

  if (carregando || mandarEntrar) return <TelaCarregando />;
  if (!usuario || (papel === "admin" && perfil?.papel !== "admin")) return <Pagina404 />;
  return <>{children({ usuario, perfil })}</>;
}
