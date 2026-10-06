import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Plus, Minus, Star, X, Route as RouteIcon, Locate } from "lucide-react";
import { cn } from "@/lib/utils";
import { mapPoints, mapRoute, mapTypes, type MapPoint } from "@/data/maranhao";

const typeColor: Record<MapPoint["type"], string> = {
  atracao: "bg-gold text-gold-foreground",
  restaurante: "bg-[oklch(0.62_0.16_28)] text-white",
  hotel: "bg-deep text-deep-foreground",
  passeio: "bg-turquoise text-turquoise-foreground",
  praia: "bg-sand-deep text-foreground",
  natureza: "bg-forest text-white",
  cultura: "bg-[oklch(0.5_0.13_305)] text-white",
};

const typeLabel: Record<MapPoint["type"], string> = {
  atracao: "Atração",
  restaurante: "Restaurante",
  hotel: "Hotel",
  passeio: "Passeio",
  praia: "Praia",
  natureza: "Natureza",
  cultura: "Cultura",
};

export function MapExplorer({ compact = false }: { compact?: boolean }) {
  const [filter, setFilter] = useState<string>("todos");
  const [zoom, setZoom] = useState(1);
  const [selected, setSelected] = useState<MapPoint | null>(null);
  const [showRoute, setShowRoute] = useState(true);

  const visible = useMemo(
    () => (filter === "todos" ? mapPoints : mapPoints.filter((p) => p.type === filter)),
    [filter],
  );

  const routeStops = mapRoute.stops
    .map((id) => mapPoints.find((p) => p.id === id))
    .filter(Boolean) as MapPoint[];

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0">
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {mapTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                filter === t.id
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border border-border bg-[oklch(0.93_0.03_200)] shadow-soft",
            compact ? "h-[420px]" : "h-[520px] lg:h-[640px]",
          )}
        >
          <div
            className="absolute inset-0 origin-center transition-transform duration-500"
            style={{ transform: `scale(${zoom})` }}
          >
            <MapBackdrop />

            {showRoute && (
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full"
              >
                <polyline
                  points={routeStops.map((s) => `${s.x},${s.y}`).join(" ")}
                  fill="none"
                  stroke="oklch(0.34 0.085 240)"
                  strokeWidth="0.5"
                  strokeDasharray="1.6 1.2"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  className="opacity-80"
                />
              </svg>
            )}

            {visible.map((p, i) => (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                style={{ left: `${p.x}%`, top: `${p.y}%`, animationDelay: `${i * 40}ms` }}
                className="absolute -translate-x-1/2 -translate-y-full transition-transform duration-200 hover:z-20 hover:scale-110"
              >
                <span
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-semibold whitespace-nowrap shadow-soft ring-2 ring-white/70",
                    typeColor[p.type],
                    selected?.id === p.id && "ring-4 ring-turquoise",
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                  {p.name}
                </span>
                <span className="mx-auto block h-2 w-0.5 bg-white/70" />
              </button>
            ))}

            {showRoute &&
              routeStops.map((s, i) => (
                <span
                  key={`r-${s.id}`}
                  style={{ left: `${s.x}%`, top: `${s.y}%` }}
                  className="pointer-events-none absolute grid h-6 w-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground ring-2 ring-white"
                >
                  {i + 1}
                </span>
              ))}
          </div>

          <div className="absolute top-4 right-4 flex flex-col gap-1.5 rounded-xl border border-border bg-background/95 p-1.5 backdrop-blur-sm">
            <button
              aria-label="Aproximar"
              onClick={() => setZoom((z) => Math.min(1.8, +(z + 0.2).toFixed(2)))}
              className="grid h-8 w-8 place-items-center rounded-lg hover:bg-secondary"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              aria-label="Afastar"
              onClick={() => setZoom((z) => Math.max(1, +(z - 0.2).toFixed(2)))}
              className="grid h-8 w-8 place-items-center rounded-lg hover:bg-secondary"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              aria-label="Centralizar"
              onClick={() => setZoom(1)}
              className="grid h-8 w-8 place-items-center rounded-lg hover:bg-secondary"
            >
              <Locate className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => setShowRoute((v) => !v)}
            className={cn(
              "absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold shadow-soft backdrop-blur-sm transition-colors",
              showRoute ? "bg-primary text-primary-foreground" : "bg-background/95 text-foreground",
            )}
          >
            <RouteIcon className="h-4 w-4" />
            {mapRoute.name}
          </button>

          <p className="absolute right-4 bottom-4 rounded-full bg-background/85 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur-sm">
            Mapa ilustrativo · {visible.length} pontos
          </p>
        </div>
      </div>

      <aside className="min-w-0">
        {selected ? (
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft animate-rise">
            <div className="relative aspect-16/10">
              <img
                src={selected.image}
                alt={selected.name}
                className="h-full w-full object-cover"
              />
              <button
                aria-label="Fechar"
                onClick={() => setSelected(null)}
                className="absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-background/90 backdrop-blur-sm"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5">
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                  typeColor[selected.type],
                )}
              >
                {typeLabel[selected.type]}
              </span>
              <h3 className="mt-3 font-display text-2xl">{selected.name}</h3>
              <p className="text-sm text-muted-foreground">{selected.city}</p>
              <p className="mt-3 text-sm">{selected.description}</p>
              <p className="mt-3 inline-flex items-center gap-1.5 text-sm">
                <Star className="h-4 w-4 fill-gold text-gold" />
                <span className="font-semibold">{selected.rating}</span>
                <span className="text-muted-foreground">avaliação demonstrativa</span>
              </p>
              <Link
                to="/experiencias"
                className="mt-5 block rounded-full bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground"
              >
                Ver detalhes
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card/60 p-6">
            <h3 className="font-display text-xl">Roteiro em destaque</h3>
            <p className="mt-1 text-sm text-muted-foreground">{mapRoute.name}</p>
            <ol className="mt-5 space-y-4">
              {mapRoute.labels.map((label, i) => (
                <li key={label} className="flex gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{label}</span>
                    <span className="block text-xs text-muted-foreground">
                      {routeStops[i]?.city ?? "Lençóis Maranhenses"}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-xs text-muted-foreground">
              Toque em um pin no mapa para ver detalhes do lugar.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}

function MapBackdrop() {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
    >
      <rect width="100" height="100" fill="oklch(0.9 0.045 205)" />
      <path
        d="M0,38 C12,30 22,44 34,40 C48,35 60,44 74,38 C84,33 92,40 100,36 L100,100 L0,100 Z"
        fill="oklch(0.95 0.03 95)"
      />
      <path
        d="M6,44 C20,40 30,50 44,46 C58,42 70,52 84,46 C92,42 96,46 100,44 L100,100 L0,100 Z"
        fill="oklch(0.93 0.045 120)"
        opacity="0.75"
      />
      <path d="M30,14 C44,8 62,14 74,26 C60,32 44,30 32,24 Z" fill="oklch(0.97 0.02 95)" />
      <path
        d="M20,66 C34,58 50,64 62,74 C48,86 30,84 22,76 Z"
        fill="oklch(0.88 0.06 140)"
        opacity="0.7"
      />
      <path
        d="M58,32 C64,28 70,30 76,34 C80,37 86,36 92,34"
        stroke="oklch(0.72 0.09 220)"
        strokeWidth="0.7"
        fill="none"
      />
      <path
        d="M26,44 C36,48 46,44 56,48"
        stroke="oklch(0.72 0.09 220)"
        strokeWidth="0.5"
        fill="none"
        opacity="0.8"
      />
      <g stroke="oklch(0.86 0.02 95)" strokeWidth="0.15">
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 10} x2="100" y2={i * 10} />
        ))}
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 10} y1="0" x2={i * 10} y2="100" />
        ))}
      </g>
    </svg>
  );
}
