import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import {
  ChevronDown,
  Heart,
  LogIn,
  LogOut,
  Menu,
  ShieldCheck,
  Store,
  UserRound,
} from "lucide-react";
import { ContadorEmAnalise } from "@/components/admin/ContadorEmAnalise";
import { Logo } from "@/components/azulejo/Logo";
import { botao } from "@/components/azulejo/botao";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { nomeParaMostrar, useAuth } from "@/lib/auth";
import { useMinhaViagem } from "@/lib/minha-viagem";
import { cn } from "@/lib/utils";
import { BotaoTema } from "./BotaoTema";
import { NAV_EXTRA, NAV_INFERIOR, NAV_PRINCIPAL } from "./nav";

/** Header fixo em louça sólida (nada aparece por trás ao rolar), separado pela linha, sem sombra. */
export function SiteHeader() {
  const { favoritos, roteiros } = useMinhaViagem();
  const salvos = favoritos.length + roteiros.length;
  const caminho = useRouterState({ select: (st) => st.location.pathname });
  const ativo = (to: string) => caminho === to || caminho.startsWith(`${to}/`);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-linha bg-louca text-ink">
      <div className="flex h-16 items-center justify-between gap-4 px-[clamp(20px,5vw,80px)] md:h-20">
        <Link
          to="/"
          className="flex h-9 items-center rounded-md md:h-10"
          aria-label="Azulejo, início"
        >
          <Logo className="h-full" />
        </Link>

        <nav aria-label="Principal" className="ml-auto hidden items-center gap-1 lg:flex">
          {NAV_PRINCIPAL.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group relative flex min-h-11 items-center rounded-md px-3 text-base font-bold transition-colors duration-150 hover:text-cobalto data-[status=active]:text-cobalto"
            >
              {item.rotulo}
              {ativo(item.to) && (
                <motion.span
                  layoutId="ponto-nav"
                  aria-hidden
                  className="absolute bottom-0.5 left-1/2 -ml-1 size-2 rounded-full bg-guara"
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 lg:ml-4">
          <MenuConta />
          <BotaoTema className="hidden hover:bg-areia sm:grid" />
          <Link
            to="/minha-viagem"
            aria-label={`Minha viagem${salvos ? `, ${salvos} salvos` : ""}`}
            className="relative hidden size-11 place-items-center rounded-md transition-colors duration-150 hover:bg-areia data-[status=active]:text-cobalto md:grid"
          >
            <Heart className="size-5" />
            {salvos > 0 && (
              <span className="absolute top-1 right-1 grid min-w-5 place-items-center rounded-full bg-guara px-1 text-[11px] leading-5 font-bold text-louca">
                {salvos}
              </span>
            )}
          </Link>
          <Link to="/planejar" className={cn(botao(), "ml-1 px-4 sm:px-5")}>
            <span className="sm:hidden">Planejar</span>
            <span className="hidden sm:inline">Planejar viagem</span>
          </Link>
          <MenuCelular />
        </div>
      </div>
    </header>
  );
}

function MenuCelular() {
  const [aberto, setAberto] = useState(false);
  const fechar = () => setAberto(false);
  const linkClasses =
    "flex min-h-12 items-center gap-3 rounded-md px-3 font-bold hover:bg-areia data-[status=active]:text-cobalto";

  return (
    <Sheet open={aberto} onOpenChange={setAberto}>
      <SheetTrigger
        aria-label="Abrir menu"
        className="grid size-11 place-items-center rounded-md hover:bg-areia lg:hidden"
      >
        <Menu className="size-6" />
      </SheetTrigger>
      <SheetContent side="right" className="w-[86vw] max-w-sm border-linha bg-louca p-0 text-ink">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <div className="flex h-16 items-center border-b border-linha px-4">
          <Logo className="h-9" />
        </div>
        <nav aria-label="Menu" className="flex flex-col gap-1 p-3">
          {[...NAV_INFERIOR, ...NAV_EXTRA].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={fechar}
              activeOptions={{ exact: item.to === "/" }}
              className={linkClasses}
            >
              <item.icone className="size-5" /> {item.rotulo}
            </Link>
          ))}
        </nav>
        <div className="mx-3 flex min-h-12 items-center justify-between border-t border-linha px-3 pt-2 font-bold sm:hidden">
          Tema
          <BotaoTema className="hover:bg-areia" />
        </div>
        <ContaCelular fechar={fechar} />
        <div className="mt-auto border-t border-linha p-4">
          <Link to="/planejar" onClick={fechar} className={cn(botao({ tamanho: "lg" }), "w-full")}>
            Planejar viagem
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/** Conta no desktop: "Entrar" discreto, ou o menu com o nome de quem está logado. */
function MenuConta() {
  const { carregando, usuario, perfil, sair } = useAuth();
  const navigate = useNavigate();
  // enquanto a sessão é lida, reserva o lugar para o header não pular
  if (carregando) return <span aria-hidden className="hidden h-11 w-16 lg:block" />;

  if (!usuario)
    return (
      <Link
        to="/entrar"
        className="hidden min-h-11 items-center rounded-md px-3 text-[0.9375rem] text-ink-suave transition-colors duration-150 hover:text-cobalto lg:inline-flex"
      >
        Entrar
      </Link>
    );

  const nome = nomeParaMostrar(usuario, perfil);
  const item = "min-h-11 cursor-pointer gap-3 rounded-sm px-3 text-base focus:bg-areia";
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="hidden min-h-11 max-w-48 items-center gap-2 rounded-md px-3 font-bold transition-colors duration-150 hover:bg-areia data-[state=open]:bg-areia lg:inline-flex">
        <UserRound className="size-5 shrink-0" aria-hidden />
        <span className="truncate">{nome}</span>
        <ChevronDown className="size-4 shrink-0" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-56 rounded-md border-linha bg-louca p-1 text-ink shadow-flutua"
      >
        <DropdownMenuLabel className="truncate px-3 py-2 text-legenda font-normal text-ink-suave">
          {usuario.email}
        </DropdownMenuLabel>
        <DropdownMenuItem asChild className={item}>
          <Link to="/painel">
            <Store className="size-5" aria-hidden /> Meus negócios
          </Link>
        </DropdownMenuItem>
        {perfil?.papel === "admin" && (
          <DropdownMenuItem asChild className={item}>
            <Link to="/admin">
              <ShieldCheck className="size-5" aria-hidden /> Administração
              <ContadorEmAnalise className="ml-auto" />
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator className="bg-linha" />
        <DropdownMenuItem
          className={item}
          onSelect={async () => {
            await sair();
            void navigate({ to: "/" });
          }}
        >
          <LogOut className="size-5" aria-hidden /> Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Conta no menu do celular, depois da navegação. */
function ContaCelular({ fechar }: { fechar: () => void }) {
  const { carregando, usuario, perfil, sair } = useAuth();
  const navigate = useNavigate();
  const classe =
    "flex min-h-12 w-full items-center gap-3 rounded-md px-3 font-bold hover:bg-areia data-[status=active]:text-cobalto";
  if (carregando) return null;

  if (!usuario)
    return (
      <div className="mx-3 border-t border-linha pt-2">
        <Link to="/entrar" onClick={fechar} className={cn(classe, "font-normal text-ink-suave")}>
          <LogIn className="size-5" aria-hidden /> Entrar
        </Link>
      </div>
    );

  return (
    <div className="mx-3 flex flex-col gap-1 border-t border-linha pt-3">
      <p className="truncate px-3 text-legenda text-ink-suave">
        {nomeParaMostrar(usuario, perfil)}
      </p>
      <Link to="/painel" onClick={fechar} className={classe}>
        <Store className="size-5" aria-hidden /> Meus negócios
      </Link>
      {perfil?.papel === "admin" && (
        <Link to="/admin" onClick={fechar} className={classe}>
          <ShieldCheck className="size-5" aria-hidden /> Administração
          <ContadorEmAnalise className="ml-auto" />
        </Link>
      )}
      <button
        type="button"
        className={classe}
        onClick={async () => {
          fechar();
          await sair();
          void navigate({ to: "/" });
        }}
      >
        <LogOut className="size-5" aria-hidden /> Sair
      </button>
    </div>
  );
}
