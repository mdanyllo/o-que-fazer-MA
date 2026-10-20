import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  CreditCard,
  ExternalLink,
  LogOut,
  Menu,
  PlusCircle,
  Store,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { ContadorEmAnalise } from "@/components/admin/ContadorEmAnalise";
import { Logo } from "@/components/azulejo/Logo";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { nomeParaMostrar, useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

type Item = { to: string; rotulo: string; icone: LucideIcon; contador?: boolean };

const DO_DONO: Item[] = [
  { to: "/painel", rotulo: "Meus negócios", icone: Store },
  { to: "/painel/estatisticas", rotulo: "Estatísticas", icone: BarChart3 },
  { to: "/painel/assinatura", rotulo: "Plano e pagamento", icone: CreditCard },
];

const DA_EQUIPE: Item[] = [
  { to: "/admin", rotulo: "Negócios", icone: Store, contador: true },
  { to: "/admin/usuarios", rotulo: "Usuários", icone: Users },
  { to: "/admin/novo", rotulo: "Cadastrar negócio", icone: PlusCircle },
];

/** Qual item fica marcado: a seção da tela (editar um negócio marca "Meus negócios"). */
function itemAtivo(caminho: string) {
  if (caminho.startsWith("/painel/estatisticas")) return "/painel/estatisticas";
  if (caminho.startsWith("/painel/assinatura")) return "/painel/assinatura";
  if (caminho.startsWith("/painel")) return "/painel";
  if (caminho.startsWith("/admin/usuarios")) return "/admin/usuarios";
  if (caminho.startsWith("/admin/novo")) return "/admin/novo";
  if (caminho.startsWith("/admin")) return "/admin";
  return "";
}

/**
 * Moldura do painel do dono e do admin: sem o menu do site público (é área de trabalho, não
 * de turista). No desktop, menu lateral fixo; no celular, o mesmo menu numa gaveta.
 * Embaixo do menu ficam "Ver o site" e "Sair".
 */
export function MolduraPainel({ children }: { children: ReactNode }) {
  const [aberto, setAberto] = useState(false);
  const { usuario, perfil } = useAuth();
  return (
    <div className="flex min-h-svh flex-col bg-louca">
      <a
        href="#conteudo"
        className="fixed top-2 left-2 z-[60] -translate-y-20 rounded-md bg-cobalto px-4 py-3 font-bold text-sobre-cobalto focus:translate-y-0"
      >
        Pular para o conteúdo
      </a>
      <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-linha bg-louca px-5 lg:px-8">
        <Sheet open={aberto} onOpenChange={setAberto}>
          <SheetTrigger
            className="-ml-2 grid size-11 place-items-center rounded-md hover:bg-areia lg:hidden"
            aria-label="Abrir o menu do painel"
          >
            <Menu className="size-6" aria-hidden />
          </SheetTrigger>
          <SheetContent
            side="left"
            className="flex w-[82vw] max-w-xs flex-col gap-0 border-linha bg-louca p-0 text-ink"
          >
            <SheetTitle className="flex h-16 items-center border-b border-linha px-5">
              <Logo className="h-8" />
            </SheetTitle>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <MenuPainel aoNavegar={() => setAberto(false)} />
            </div>
          </SheetContent>
        </Sheet>
        <Link
          to="/painel"
          className="flex h-9 shrink-0 items-center gap-3 rounded-md"
          aria-label="Painel do Azulejo"
        >
          <Logo className="h-full" />
        </Link>
        {usuario && (
          <p className="ml-auto flex min-w-0 items-center gap-2 text-[0.9375rem] font-bold">
            <UserRound className="size-5 shrink-0" aria-hidden />
            <span className="truncate">{nomeParaMostrar(usuario, perfil)}</span>
          </p>
        )}
      </header>
      <div className="flex flex-1">
        <aside className="sticky top-16 hidden h-[calc(100svh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-linha lg:block">
          <MenuPainel />
        </aside>
        <main id="conteudo" tabIndex={-1} className="min-w-0 flex-1 outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}

function MenuPainel({ aoNavegar }: { aoNavegar?: () => void }) {
  const { usuario, perfil, sair } = useAuth();
  const navigate = useNavigate();
  const ativo = itemAtivo(useRouterState({ select: (s) => s.location.pathname }));
  const admin = perfil?.papel === "admin";
  const classe =
    "flex min-h-11 items-center gap-3 rounded-md px-3 font-bold text-ink-suave transition-colors duration-150 hover:bg-areia hover:text-ink data-[ativo=true]:bg-areia data-[ativo=true]:text-cobalto [&_svg]:size-5 [&_svg]:shrink-0";

  const grupo = (titulo: string, itens: Item[]) => (
    <div className="flex flex-col gap-1">
      <p className="px-3 pb-1 text-rotulo text-ink-suave">{titulo}</p>
      {itens.map((i) => (
        <Link
          key={i.to}
          to={i.to}
          onClick={aoNavegar}
          data-ativo={ativo === i.to}
          aria-current={ativo === i.to ? "page" : undefined}
          className={classe}
        >
          <i.icone aria-hidden /> {i.rotulo}
          {i.contador && <ContadorEmAnalise className="ml-auto" />}
        </Link>
      ))}
    </div>
  );

  return (
    <nav aria-label="Painel" className="flex min-h-full flex-col gap-6 p-4">
      {grupo("Seu negócio", DO_DONO)}
      {admin && grupo("Equipe Azulejo", DA_EQUIPE)}
      <div className="mt-auto flex flex-col gap-1 border-t border-linha pt-4">
        {usuario?.email && (
          <p className="truncate px-3 pb-1 text-legenda text-ink-suave">{usuario.email}</p>
        )}
        <Link to="/" onClick={aoNavegar} className={classe}>
          <ExternalLink aria-hidden /> Ver o site
        </Link>
        <button
          type="button"
          onClick={async () => {
            aoNavegar?.();
            await sair();
            void navigate({ to: "/" });
          }}
          className={cn(classe, "w-full text-left")}
        >
          <LogOut aria-hidden /> Sair
        </button>
      </div>
    </nav>
  );
}
