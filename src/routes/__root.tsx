import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Compass, Map as MapIcon, RotateCw, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

import { HeroFrame, PageShell } from "@/components/site/PageShell";
import { img } from "@/data/maranhao";
import appCss from "../styles.css?url";

const quickLinks = [
  { to: "/destinos", label: "Destinos", hint: "Cidades, vilas e parques" },
  { to: "/experiencias", label: "Experiências", hint: "Passeios, trilhas e sabores" },
  { to: "/roteiros", label: "Roteiros", hint: "De 1 a 5 dias, prontos" },
  { to: "/mapa", label: "Mapa", hint: "O estado inteiro em pins" },
] as const;

function NotFoundComponent() {
  return (
    <PageShell>
      <HeroFrame image={img.lencois} alt="Dunas dos Lençóis Maranhenses" className="min-h-[52vh]">
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-10 sm:px-10 sm:pb-12 lg:pb-14">
          <p className="mb-3 text-xs font-semibold tracking-[0.22em] text-white/80 uppercase">
            Erro 404
          </p>
          <h1 className="max-w-3xl font-display text-4xl text-white text-balance-title sm:text-5xl lg:text-6xl">
            Essa página se perdeu nas dunas.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/85">
            O endereço que você abriu não existe por aqui, mas o Maranhão continua inteiro logo
            abaixo.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full bg-turquoise px-6 py-3.5 text-sm font-semibold text-turquoise-foreground transition-transform hover:scale-[1.03]"
            >
              <Compass className="h-4 w-4" /> Voltar para o início
            </Link>
            <Link
              to="/planejar"
              className="inline-flex items-center gap-2 rounded-full bg-background/95 px-6 py-3.5 text-sm font-semibold backdrop-blur-sm transition-transform hover:scale-[1.03]"
            >
              <Sparkles className="h-4 w-4 text-lagoon" /> Monte minha viagem
            </Link>
          </div>
        </div>
      </HeroFrame>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:py-16 lg:px-8">
        <h2 className="font-display text-2xl">Continue explorando</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-colors hover:border-turquoise"
            >
              <p className="font-display text-lg">{l.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{l.hint}</p>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <PageShell>
      <section className="mx-auto max-w-2xl px-5 pt-32 sm:pt-40 pb-16 sm:pb-24 text-center lg:px-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-4 py-1.5 text-xs font-semibold tracking-[0.18em] text-gold-foreground uppercase">
          Algo saiu do rumo
        </span>
        <h1 className="mt-5 font-display text-4xl text-balance-title sm:text-5xl">
          Não conseguimos carregar esta página.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Foi um problema do nosso lado. Tente de novo em um instante ou volte para a página
          inicial.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
          >
            <RotateCw className="h-4 w-4" /> Tentar de novo
          </button>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-sm font-semibold transition-colors hover:bg-secondary"
          >
            <Compass className="h-4 w-4 text-lagoon" /> Voltar para o início
          </Link>
          <Link
            to="/mapa"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-sm font-semibold transition-colors hover:bg-secondary"
          >
            <MapIcon className="h-4 w-4 text-lagoon" /> Ver o mapa
          </Link>
        </div>
      </section>
    </PageShell>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Descubra Maranhão | Destinos, experiências e roteiros" },
      {
        name: "description",
        content:
          "Descubra, explore e planeje viagens pelo Maranhão: destinos, experiências, roteiros e eventos em um só lugar.",
      },
      { name: "theme-color", content: "#002b4b" },
      { property: "og:site_name", content: "Descubra Maranhão" },
      { property: "og:title", content: "Descubra Maranhão | Destinos, experiências e roteiros" },
      {
        property: "og:description",
        content:
          "Descubra, explore e planeje viagens pelo Maranhão: destinos, experiências, roteiros e eventos em um só lugar.",
      },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:image", content: "/og-image.jpg" },
      { property: "og:image:alt", content: "Dunas e lagoas dos Lençóis Maranhenses ao entardecer" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "/og-image.jpg" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Plus+Jakarta+Sans:wght@500;600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
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
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
