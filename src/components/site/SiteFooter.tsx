import { Link } from "@tanstack/react-router";
import { Instagram, Youtube, Mail } from "lucide-react";
import { BrandMark } from "./SiteHeader";

export function SiteFooter() {
  return (
    <footer className="mt-24 px-2 pb-2 sm:px-3 sm:pb-3">
      <div className="mx-auto max-w-350 overflow-hidden rounded-3xl bg-deep bg-stripes text-deep-foreground sm:rounded-4xl">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 sm:py-16">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <BrandMark />
              <p className="mt-4 max-w-sm text-sm text-white/65">
                Destinos, experiências e roteiros reunidos em um só lugar. Protótipo demonstrativo
                com conteúdo fictício para avaliação do produto.
              </p>
              <div className="mt-6 flex gap-2">
                {[Instagram, Youtube, Mail].map((Icon, i) => (
                  <span
                    key={i}
                    className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5"
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
                { to: "/destinos/carolina", label: "Chapada das Mesas" },
              ]}
            />
          </div>

          <p className="mt-12 border-t border-white/10 pt-6 text-xs text-white/50">
            © {new Date().getFullYear()} Descubra Maranhão. Preços, avaliações e empresas são dados
            demonstrativos.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h3 className="text-xs font-medium tracking-[0.08em] text-white/50 uppercase">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.to + l.label}>
            <Link to={l.to} className="text-sm text-white/80 transition-colors hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
