import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { themeBootScript } from "../lib/tema";
import { Logo } from "../components/azulejo/Logo";
import { botao } from "../components/azulejo/botao";
import { FaixaAzulejo } from "../components/azulejo/PadraoAzulejo";
import { Pagina404 } from "../components/site/Pagina404";
import { Toaster } from "../components/ui/sonner";
import { RolagemSuave } from "../components/movimento/RolagemSuave";
import { TransicaoAzulejo } from "../components/movimento/TransicaoAzulejo";
import { MotionConfig } from "motion/react";

function NotFoundComponent() {
  return <Pagina404 />;
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-svh flex-col bg-louca text-ink">
      <FaixaAzulejo azulejo={40} />
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="max-w-md">
          <Logo variante="simbolo" className="h-14" />
          <h1 className="mt-8 text-t1">Essa página não carregou</h1>
          <p className="mt-4 text-corpo text-ink-suave">
            Algo deu errado do nosso lado. Tente de novo ou volte para o início.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                router.invalidate();
                reset();
              }}
              className={botao()}
            >
              Tentar de novo
            </button>
            <a href="/" className={botao({ variante: "secundario" })}>
              Voltar para o início
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Azulejo — o que fazer no Maranhão" },
      {
        name: "description",
        content:
          "O que fazer no Maranhão, sem precisar procurar em dezenas de lugares diferentes. Destinos, experiências, roteiros, mapa e eventos.",
      },
      { name: "theme-color", content: "#1F4E8C" },
      { property: "og:title", content: "Azulejo — o que fazer no Maranhão" },
      {
        property: "og:description",
        content: "Destinos, experiências, roteiros, mapa e eventos do Maranhão num lugar só.",
      },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=DM+Sans:wght@400;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/brand/azulejo-simbolo.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/brand/azulejo-simbolo.svg" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Antes da primeira pintura: marca que há JS (animações de entrada) e aplica o tema salvo. */}
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* respeita prefers-reduced-motion em todas as animações do Motion */}
      <MotionConfig reducedMotion="user">
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
        <TransicaoAzulejo />
        <RolagemSuave />
      </MotionConfig>
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}
