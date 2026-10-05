import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, ArrowLeft, ArrowRight, MapPin, Wallet, Sparkles, Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { img, itineraries } from "@/data/maranhao";

type Step = {
  key: string;
  question: string;
  hint: string;
  options: string[];
  multi?: boolean;
};

const steps: Step[] = [
  {
    key: "dias",
    question: "Quantos dias você tem?",
    hint: "Isso define o ritmo do roteiro.",
    options: ["3 dias", "5 dias", "7 dias", "10+ dias"],
  },
  {
    key: "companhia",
    question: "Quem vai viajar?",
    hint: "Adaptamos as sugestões ao grupo.",
    options: ["Sozinho", "Casal", "Família", "Amigos"],
  },
  {
    key: "interesses",
    question: "O que você quer viver?",
    hint: "Escolha quantos quiser.",
    options: ["Natureza", "Praia", "Aventura", "Cultura", "Gastronomia", "Descanso"],
    multi: true,
  },
  {
    key: "orcamento",
    question: "Quanto pretende gastar?",
    hint: "Estimativa por pessoa, sem passagens.",
    options: ["Econômico", "Confortável", "Premium"],
  },
  {
    key: "transporte",
    question: "Como você prefere viajar?",
    hint: "Podemos ajustar depois.",
    options: ["Carro", "Transfer", "Passeios", "Ainda não sei"],
  },
];

const budgetMap: Record<string, string> = {
  Econômico: "R$ 1.800 a R$ 2.400",
  Confortável: "R$ 2.400 a R$ 3.600",
  Premium: "R$ 4.200 a R$ 6.500",
};

export function TripPlanner() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [done, setDone] = useState(false);

  const step = steps[index]!;
  const current = answers[step.key] ?? [];
  const progress = done ? 100 : Math.round((index / steps.length) * 100);

  const select = (option: string) => {
    setAnswers((prev) => {
      const existing = prev[step.key] ?? [];
      if (step.multi) {
        return {
          ...prev,
          [step.key]: existing.includes(option)
            ? existing.filter((o) => o !== option)
            : [...existing, option],
        };
      }
      return { ...prev, [step.key]: [option] };
    });
    if (!step.multi) {
      window.setTimeout(() => {
        if (index === steps.length - 1) setDone(true);
        else setIndex((i) => i + 1);
      }, 220);
    }
  };

  if (done)
    return (
      <PlannerResult
        answers={answers}
        onRestart={() => {
          setDone(false);
          setIndex(0);
          setAnswers({});
        }}
      />
    );

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Etapa {index + 1} de {steps.length}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-turquoise transition-all duration-500"
            style={{ width: `${Math.max(progress, 6)}%` }}
          />
        </div>
      </div>

      <div key={step.key} className="animate-rise">
        <h2 className="font-display text-3xl sm:text-4xl">{step.question}</h2>
        <p className="mt-2 text-muted-foreground">{step.hint}</p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {step.options.map((option) => {
            const active = current.includes(option);
            return (
              <button
                key={option}
                onClick={() => select(option)}
                className={cn(
                  "flex items-center justify-between rounded-2xl border px-5 py-5 text-left text-lg font-medium transition-all duration-200",
                  active
                    ? "border-turquoise bg-turquoise/12 shadow-soft"
                    : "border-border bg-card hover:-translate-y-0.5 hover:border-turquoise/50 hover:shadow-soft",
                )}
              >
                {option}
                <span
                  className={cn(
                    "grid h-6 w-6 place-items-center rounded-full border transition-colors",
                    active
                      ? "border-turquoise bg-turquoise text-turquoise-foreground"
                      : "border-border",
                  )}
                >
                  {active && <Check className="h-3.5 w-3.5" />}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>
          <button
            onClick={() => (index === steps.length - 1 ? setDone(true) : setIndex((i) => i + 1))}
            disabled={current.length === 0}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-40"
          >
            {index === steps.length - 1 ? "Montar roteiro" : "Continuar"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function PlannerResult({
  answers,
  onRestart,
}: {
  answers: Record<string, string[]>;
  onRestart: () => void;
}) {
  const days = answers["dias"]?.[0] ?? "5 dias";
  const budget = budgetMap[answers["orcamento"]?.[0] ?? "Confortável"] ?? budgetMap["Confortável"];
  const base = itineraries[0]!;
  const stops = [
    { name: "São Luís", note: "Centro histórico e gastronomia", image: img.saoLuis },
    { name: "Barreirinhas", note: "Base para os Lençóis", image: img.barreirinhas },
    { name: "Lençóis Maranhenses", note: "Lagoa Azul e Lagoa Bonita", image: img.lencois },
    { name: "Atins", note: "Praia, vento e cozinha autoral", image: img.atins },
  ];

  return (
    <div className="mx-auto max-w-5xl animate-rise">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-turquoise/15 px-4 py-1.5 text-xs font-semibold tracking-wide text-lagoon uppercase">
          <Sparkles className="h-3.5 w-3.5" /> Seu roteiro está pronto
        </span>
        <h2 className="mt-4 font-display text-4xl sm:text-5xl">
          {days.replace("+", " ou mais")} no Maranhão
        </h2>
        <p className="mt-3 text-muted-foreground">
          Montado a partir das suas respostas: {Object.values(answers).flat().join(", ")}
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <ol className="space-y-3">
          {stops.map((s, i) => (
            <li
              key={s.name}
              className="flex items-center gap-4 overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-soft"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {i + 1}
              </span>
              <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl">
                <img
                  src={s.image}
                  alt={s.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate font-display text-lg">{s.name}</p>
                <p className="truncate text-sm text-muted-foreground">{s.note}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            <div className="relative aspect-16/10">
              <img src={img.lencois} alt="Mapa do roteiro" className="h-full w-full object-cover" />
              <svg viewBox="0 0 100 60" className="absolute inset-0 h-full w-full">
                <polyline
                  points="14,44 38,34 60,22 84,16"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.2"
                  strokeDasharray="3 2"
                />
                {[
                  [14, 44],
                  [38, 34],
                  [60, 22],
                  [84, 16],
                ].map(([x, y]) => (
                  <circle key={`${x}`} cx={x} cy={y} r="2" fill="white" />
                ))}
              </svg>
            </div>
            <div className="p-5">
              <p className="inline-flex items-center gap-2 text-sm font-semibold">
                <MapPin className="h-4 w-4 text-lagoon" /> 4 paradas, {base.places} lugares
              </p>
              <p className="mt-3 inline-flex items-center gap-2 text-sm">
                <Wallet className="h-4 w-4 text-gold" />
                <span className="font-semibold">{budget}</span>
                <span className="text-muted-foreground">estimativa</span>
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              toast.success("Viagem salva", {
                description: "Protótipo: nada é enviado a um servidor.",
              })
            }
            className="flex w-full items-center justify-center gap-2 rounded-full bg-turquoise px-6 py-3.5 text-sm font-semibold text-turquoise-foreground transition-transform hover:scale-[1.02]"
          >
            <Heart className="h-4 w-4" /> Salvar viagem
          </button>
          <Link
            to="/roteiros/$slug"
            params={{ slug: base.slug }}
            className="block rounded-full border border-border bg-card px-6 py-3.5 text-center text-sm font-semibold transition-colors hover:bg-secondary"
          >
            Ver roteiro completo dia a dia
          </Link>
          <button
            onClick={onRestart}
            className="w-full text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Refazer o planejamento
          </button>
        </div>
      </div>
    </div>
  );
}
