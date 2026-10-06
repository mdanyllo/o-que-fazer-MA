import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/azulejo/Logo";
import { NAV_PRINCIPAL } from "./nav";

const classeLink =
  "inline-flex min-h-11 items-center text-[0.9375rem] underline-offset-4 hover:underline";

/** Rodapé em cobalto-forte com o logo negativo. */
export function SiteFooter() {
  return (
    <footer className="bg-faixa text-sobre-faixa">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 pt-12 pb-28 md:px-12 md:pb-12">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <Link to="/" aria-label="Azulejo, início" className="inline-flex h-9 rounded-md">
            <Logo sobre="foto" className="h-full" />
          </Link>
          <nav aria-label="Rodapé" className="flex flex-wrap gap-x-6">
            {NAV_PRINCIPAL.map((item) => (
              <Link key={item.to} to={item.to} className={classeLink}>
                {item.rotulo}
              </Link>
            ))}
            <Link to="/planejar" className={classeLink}>
              Planejar viagem
            </Link>
            <Link to="/minha-viagem" className={classeLink}>
              Minha viagem
            </Link>
          </nav>
          <p className="text-legenda opacity-85">Feito em São Luís, Maranhão.</p>
        </div>
        <p className="border-t border-sobre-faixa/20 pt-6 text-legenda opacity-85">
          Preços, horários, avaliações e empresas são dados de exemplo. Confira sempre as
          informações oficiais antes de viajar.
        </p>
      </div>
    </footer>
  );
}
