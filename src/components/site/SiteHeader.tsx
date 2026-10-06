import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Menu, Sparkles } from "lucide-react";
import { Logo } from "@/components/azulejo/Logo";
import { botao } from "@/components/azulejo/botao";
import { PontoGuara } from "@/components/azulejo/etiquetas";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useMinhaViagem } from "@/lib/minha-viagem";
import { cn } from "@/lib/utils";
import { BotaoTema } from "./BotaoTema";
import { NAV_EXTRA, NAV_INFERIOR, NAV_PRINCIPAL } from "./nav";

/**
 * Header fixo. Com `sobreFoto`, começa transparente sobre o hero e fica sólido ao rolar.
 * Sem sombra: separa do conteúdo com a linha.
 */
export function SiteHeader({ sobreFoto = false }: { sobreFoto?: boolean }) {
  const [rolou, setRolou] = useState(false);
  const { favoritos, roteiros } = useMinhaViagem();
  const salvos = favoritos.length + roteiros.length;

  useEffect(() => {
    if (!sobreFoto) return;
    const aoRolar = () => setRolou(window.scrollY > 24);
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, [sobreFoto]);

  const transparente = sobreFoto && !rolou;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300 ease-saida",
        transparente
          ? "bg-transparent text-sobre-foto"
          : "border-b border-linha bg-louca/95 text-ink backdrop-blur-sm",
      )}
    >
      {transparente && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-28 bg-gradient-to-b from-[rgb(var(--veu-foto)/0.55)] to-transparent"
        />
      )}
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 md:h-18 md:px-8">
        <Link
          to="/"
          className="flex h-9 items-center rounded-md md:h-10"
          aria-label="Azulejo, início"
        >
          <Logo sobre={transparente ? "foto" : "superficie"} className="h-full" />
        </Link>

        <nav aria-label="Principal" className="ml-6 hidden flex-1 items-center gap-1 lg:flex">
          {NAV_PRINCIPAL.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "group relative flex min-h-11 items-center rounded-md px-3 font-bold text-[0.9375rem] transition-colors duration-150",
                transparente ? "hover:bg-sobre-foto/15" : "hover:text-cobalto",
                !transparente && "data-[status=active]:text-cobalto",
              )}
            >
              {item.rotulo}
              <PontoGuara className="absolute bottom-0.5 left-1/2 -translate-x-1/2 scale-0 transition-transform duration-300 ease-saida group-data-[status=active]:scale-100" />
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <BotaoTema
            className={cn(
              "hidden sm:grid",
              transparente ? "hover:bg-sobre-foto/15" : "hover:bg-areia",
            )}
          />
          <Link
            to="/minha-viagem"
            aria-label={`Minha viagem${salvos ? `, ${salvos} salvos` : ""}`}
            className={cn(
              "relative hidden size-11 place-items-center rounded-md transition-colors duration-150 md:grid",
              transparente
                ? "hover:bg-sobre-foto/15"
                : "hover:bg-areia data-[status=active]:text-cobalto",
            )}
          >
            <Heart className="size-5" />
            {salvos > 0 && (
              <span className="absolute top-1 right-1 grid min-w-5 place-items-center rounded-full bg-guara px-1 text-[11px] leading-5 font-bold text-louca">
                {salvos}
              </span>
            )}
          </Link>
          <Link
            to="/planejar"
            className={cn(
              botao({ variante: transparente ? "sobre-foto" : "principal" }),
              "ml-1 px-3 sm:px-5",
            )}
          >
            <Sparkles />
            <span className="sm:hidden">Planejar</span>
            <span className="hidden sm:inline">Planejar viagem</span>
          </Link>
          <MenuCelular transparente={transparente} />
        </div>
      </div>
    </header>
  );
}

function MenuCelular({ transparente }: { transparente: boolean }) {
  const [aberto, setAberto] = useState(false);
  const fechar = () => setAberto(false);
  const linkClasses =
    "flex min-h-12 items-center gap-3 rounded-md px-3 font-bold hover:bg-areia data-[status=active]:text-cobalto";

  return (
    <Sheet open={aberto} onOpenChange={setAberto}>
      <SheetTrigger
        aria-label="Abrir menu"
        className={cn(
          "grid size-11 place-items-center rounded-md lg:hidden",
          transparente ? "hover:bg-sobre-foto/15" : "hover:bg-areia",
        )}
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
        <div className="mt-auto border-t border-linha p-4">
          <Link to="/planejar" onClick={fechar} className={cn(botao({ tamanho: "lg" }), "w-full")}>
            <Sparkles /> Planejar viagem
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
