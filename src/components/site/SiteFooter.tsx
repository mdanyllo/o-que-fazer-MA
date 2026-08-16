import { Link } from "@tanstack/react-router";
import { Compass, Instagram, Youtube, Mail } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-turquoise text-turquoise-foreground">
                <Compass className="h-5 w-5" />
              </span>
              <span className="font-display text-lg font-semibold">Descubra Maranhão</span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-primary-foreground/70">
              Destinos, experiências e roteiros reunidos em um só lugar. Protótipo demonstrativo com
              conteúdo fictício para avaliação do produto.
            </p>
            <div className="mt-5 flex gap-2">
              {[Instagram, Youtube, Mail].map((Icon, i) => (
                <span
                  key={i}
                  className="grid h-9 w-9 place-items-center rounded-full bg-primary-foreground/10"
                >
                  <Icon className="h-4 w-4" />
                </span>
              ))}
            </div>
          </div>

          <FooterCol
            title="Explorar"
            links={[
              { to: "/destinos", label: "Destinos" },
              { to: "/experiencias", label: "Experiências" },
              { to: "/mapa", label: "Mapa turístico" },
            ]}
          />
          <FooterCol
            title="Planejar"
            links={[
              { to: "/roteiros", label: "Roteiros" },
              { to: "/planejar", label: "Monte minha viagem" },
              { to: "/eventos", label: "Eventos" },
            ]}
          />
          <FooterCol
            title="Local"
            links={[
              { to: "/empresas", label: "Empresas locais" },
              { to: "/destinos/sao-luis", label: "São Luís" },
              { to: "/destinos/chapada-das-mesas", label: "Chapada das Mesas" },
            ]}
          />
        </div>

        <p className="mt-12 border-t border-primary-foreground/15 pt-6 text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} Descubra Maranhão · Preços, avaliações e empresas são dados
          demonstrativos.
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h3 className="font-display text-sm tracking-wide text-primary-foreground/90">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.to + l.label}>
            <Link
              to={l.to}
              className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
