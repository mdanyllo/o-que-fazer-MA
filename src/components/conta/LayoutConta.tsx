import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { BadgeCheck } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { LoadingAzulejo } from "@/components/azulejo/LoadingAzulejo";
import { Pagina404 } from "@/components/site/Pagina404";
import { PageShell } from "@/components/site/PageShell";
import { useAuth, type Perfil } from "@/lib/auth";
import { MolduraPainel } from "@/components/painel/MolduraPainel";
import { linkConta } from "./formulario";
import type { User } from "@supabase/supabase-js";

/** Como funciona, no bloco ao lado do formulário (desktop). */
const PASSOS = [
  { titulo: "Crie sua conta", texto: "Com e-mail e senha ou com o Google. É grátis." },
  {
    titulo: "Cadastre o negócio",
    texto: "Fotos, horário, preço, WhatsApp e a localização no mapa.",
  },
  {
    titulo: "A equipe revisa",
    texto: "Depois de aprovado, seu negócio aparece nos destinos, no mapa e nos roteiros.",
  },
];

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
      <div className="mx-auto grid max-w-site gap-12 px-site pt-10 pb-16 md:pt-16 md:pb-24 lg:grid-cols-[minmax(0,28rem)_1fr] lg:gap-24">
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
          <ol className="mt-8 flex flex-col gap-5 border-t border-linha pt-8">
            {PASSOS.map((passo, i) => (
              <li key={passo.titulo} className="flex gap-4">
                <span
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-cobalto font-bold text-sobre-cobalto"
                  aria-hidden
                >
                  {i + 1}
                </span>
                <div>
                  <p className="font-bold">{passo.titulo}</p>
                  <p className="text-ink-suave">{passo.texto}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-col gap-2 rounded-md bg-louca p-5">
            <p className="flex items-center gap-2 font-bold">
              <BadgeCheck className="size-5 text-cobalto" aria-hidden /> Quer aparecer mais?
            </p>
            <p className="text-ink-suave">
              Com o Pro, seu negócio ganha o selo de verificado e você vê quantas pessoas visitam a
              página, chamam no WhatsApp e compartilham.
            </p>
            <Link to="/planos" className={`${linkConta} self-start`}>
              Conhecer o Pro
            </Link>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}

/** Tela de espera enquanto a sessão é lida no navegador (só o painel e o admin usam). */
export function TelaCarregando() {
  return (
    <MolduraPainel>
      <div className="grid min-h-[50svh] place-items-center px-5">
        <LoadingAzulejo rotulo="Carregando sua conta" />
      </div>
    </MolduraPainel>
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
