import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { SlidersHorizontal } from "lucide-react";
import { PageHero, PageShell } from "@/components/site/PageShell";
import { ExperienceCard, SectionHeading } from "@/components/site/cards";
import { cn } from "@/lib/utils";
import { categories, destinations, experiences, img } from "@/data/maranhao";

type Search = {
  categoria?: string | undefined;
  destino?: string | undefined;
  preco?: string | undefined;
  duracao?: string | undefined;
  dificuldade?: string | undefined;
};

const str = (v: unknown) => (typeof v === "string" && v.length > 0 ? v : undefined);

export const Route = createFileRoute("/experiencias")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    categoria: str(search["categoria"]),
    destino: str(search["destino"]),
    preco: str(search["preco"]),
    duracao: str(search["duracao"]),
    dificuldade: str(search["dificuldade"]),
  }),
  head: () => ({
    meta: [
      { title: "Experiências no Maranhão | Passeios, trilhas e sabores" },
      {
        name: "description",
        content:
          "Filtre experiências por destino, categoria, preço, duração e dificuldade: dunas, cachoeiras, cultura e gastronomia.",
      },
      { property: "og:title", content: "Experiências no Maranhão" },
      {
        property: "og:description",
        content: "Passeios, trilhas e sabores para viver no Maranhão.",
      },
    ],
  }),
  component: ExperienciasPage,
});

const precos = [
  { id: "ate-150", label: "Até R$ 150" },
  { id: "150-250", label: "R$ 150 a 250" },
  { id: "250+", label: "Acima de R$ 250" },
];
const duracoes = [
  { id: "curta", label: "Até 4h" },
  { id: "dia", label: "Meio dia ou mais" },
];
const dificuldades = [
  { id: "Fácil", label: "Fácil" },
  { id: "Moderado", label: "Moderado" },
  { id: "Desafiador", label: "Desafiador" },
];

function ExperienciasPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const set = (key: keyof Search, value?: string) =>
    navigate({
      search: (prev) => ({ ...prev, [key]: prev[key] === value ? undefined : value }),
    });

  const list = useMemo(() => {
    return experiences.filter((e) => {
      if (search.categoria && e.category !== search.categoria) return false;
      if (search.destino && e.destinationSlug !== search.destino) return false;
      if (search.dificuldade && e.difficulty !== search.dificuldade) return false;
      if (search.preco === "ate-150" && e.price > 150) return false;
      if (search.preco === "150-250" && (e.price < 150 || e.price > 250)) return false;
      if (search.preco === "250+" && e.price <= 250) return false;
      const hours = parseInt(e.duration);
      if (search.duracao === "curta" && hours > 4) return false;
      if (search.duracao === "dia" && hours < 5) return false;
      return true;
    });
  }, [search]);

  return (
    <PageShell>
      <PageHero
        image={img.rioPreguicas}
        eyebrow="Experiências"
        title="O que fazer no Maranhão"
        subtitle="Passeios de 4x4 nas dunas, descidas de rio, trilhas de cachoeira, cultura e gastronomia."
      />

      <section className="mx-auto max-w-7xl px-5 py-10 sm:py-14 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <p className="mb-4 inline-flex items-center gap-2 text-sm font-semibold">
            <SlidersHorizontal className="h-4 w-4 text-lagoon" /> Filtros
          </p>
          <div className="space-y-4">
            <FilterRow label="Destino">
              {destinations.map((d) => (
                <Chip
                  key={d.slug}
                  active={search.destino === d.slug}
                  onClick={() => set("destino", d.slug)}
                >
                  {d.name}
                </Chip>
              ))}
            </FilterRow>
            <FilterRow label="Categoria">
              {categories.map((c) => (
                <Chip
                  key={c.id}
                  active={search.categoria === c.id}
                  onClick={() => set("categoria", c.id)}
                >
                  {c.name}
                </Chip>
              ))}
            </FilterRow>
            <div className="grid gap-4 md:grid-cols-3">
              <FilterRow label="Preço">
                {precos.map((p) => (
                  <Chip
                    key={p.id}
                    active={search.preco === p.id}
                    onClick={() => set("preco", p.id)}
                  >
                    {p.label}
                  </Chip>
                ))}
              </FilterRow>
              <FilterRow label="Duração">
                {duracoes.map((d) => (
                  <Chip
                    key={d.id}
                    active={search.duracao === d.id}
                    onClick={() => set("duracao", d.id)}
                  >
                    {d.label}
                  </Chip>
                ))}
              </FilterRow>
              <FilterRow label="Dificuldade">
                {dificuldades.map((d) => (
                  <Chip
                    key={d.id}
                    active={search.dificuldade === d.id}
                    onClick={() => set("dificuldade", d.id)}
                  >
                    {d.label}
                  </Chip>
                ))}
              </FilterRow>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <SectionHeading
            title={`${list.length} experiências encontradas`}
            action={
              <button
                onClick={() => navigate({ search: {} })}
                className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary"
              >
                Limpar filtros
              </button>
            }
          />
          {list.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-16 text-center">
              <p className="font-display text-2xl">Nada com esses filtros</p>
              <p className="mt-2 text-muted-foreground">
                Tente combinar menos filtros para ver mais opções.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {list.map((e) => (
                <ExperienceCard key={e.id} experience={e} />
              ))}
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
        active
          ? "border-transparent bg-primary text-primary-foreground"
          : "border-border text-muted-foreground hover:border-turquoise hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
