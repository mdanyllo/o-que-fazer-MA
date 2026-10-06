import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Menu } from "lucide-react";
import { Logo } from "@/components/azulejo/Logo";
import { botao } from "@/components/azulejo/botao";
import { PontoGuara } from "@/components/azulejo/etiquetas";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useMinhaViagem } from "@/lib/minha-viagem";
import { cn } from "@/lib/utils";
import { BotaoTema } from "./BotaoTema";
import { NAV_EXTRA, NAV_INFERIOR, NAV_PRINCIPAL } from "./nav";

/** Header fixo sobre fundo louça, separado do conteúdo pela linha (sem sombra). */
export function SiteHeader() {
  const { favoritos, roteiros } = useMinhaViagem();
  const salvos = favoritos.length + roteiros.length;

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-linha bg-louca/95 text-ink backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-5 md:h-20 md:px-12">
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
              <PontoGuara className="absolute bottom-0.5 left-1/2 -translate-x-1/2 scale-0 transition-transform duration-300 ease-saida group-data-[status=active]:scale-100" />
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 lg:ml-4">
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
        <div className="mt-auto border-t border-linha p-4">
          <Link to="/planejar" onClick={fechar} className={cn(botao({ tamanho: "lg" }), "w-full")}>
            Planejar viagem
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
