import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/azulejo/Logo";
import { FaixaAzulejo } from "@/components/azulejo/PadraoAzulejo";

type LinkRodape =
  | {
      to:
        | "/explorar"
        | "/destinos"
        | "/mapa"
        | "/eventos"
        | "/planejar"
        | "/roteiros"
        | "/minha-viagem";
      rotulo: string;
    }
  | { destino: string; rotulo: string };

const COLUNAS: { titulo: string; links: LinkRodape[] }[] = [
  {
    titulo: "Descobrir",
    links: [
      { to: "/explorar", rotulo: "O que fazer" },
      { to: "/destinos", rotulo: "Destinos" },
      { to: "/mapa", rotulo: "Mapa" },
      { to: "/eventos", rotulo: "Eventos" },
    ],
  },
  {
    titulo: "Planejar",
    links: [
      { to: "/planejar", rotulo: "Planejar viagem" },
      { to: "/roteiros", rotulo: "Roteiros prontos" },
      { to: "/minha-viagem", rotulo: "Minha viagem" },
    ],
  },
  {
    titulo: "Destinos",
    links: [
      { destino: "sao-luis", rotulo: "São Luís" },
      { destino: "barreirinhas", rotulo: "Barreirinhas" },
      { destino: "alcantara", rotulo: "Alcântara" },
      { destino: "carolina", rotulo: "Chapada das Mesas" },
    ],
  },
];

const classeLink = "inline-flex min-h-11 items-center underline-offset-4 hover:underline";

export function SiteFooter() {
  return (
    <footer className="bg-faixa text-sobre-faixa">
      <FaixaAzulejo azulejo={32} />
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-28 md:px-8 md:pb-12">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Logo sobre="foto" className="h-10" />
            <p className="mt-6 max-w-sm font-display text-t3">
              O que fazer no Maranhão, sem precisar procurar em dezenas de lugares diferentes.
            </p>
          </div>
          {COLUNAS.map((col) => (
            <div key={col.titulo}>
              <h2 className="text-rotulo opacity-80">{col.titulo}</h2>
              <ul className="mt-4 space-y-1">
                {col.links.map((l) => (
                  <li key={l.rotulo}>
                    {"destino" in l ? (
                      <Link
                        to="/destinos/$slug"
                        params={{ slug: l.destino }}
                        className={classeLink}
                      >
                        {l.rotulo}
                      </Link>
                    ) : (
                      <Link to={l.to} className={classeLink}>
                        {l.rotulo}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-sobre-faixa/25 pt-6 text-legenda opacity-85 md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} Azulejo. Protótipo navegável.</p>
          <p>
            Preços, horários, avaliações e empresas são dados de exemplo. Confira sempre as
            informações oficiais antes de viajar.
          </p>
        </div>
      </div>
    </footer>
  );
}
