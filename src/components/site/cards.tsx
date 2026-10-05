import { Link } from "@tanstack/react-router";
import { MapPin, Star, Clock, Mountain, Calendar, MessageCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getDestinationName,
  type Business,
  type Destination,
  type EventItem,
  type Experience,
  type Itinerary,
  type Category,
} from "@/data/maranhao";

/** Etiqueta de seção: pílula em maiúsculas seguida de uma linha fina. */
export function Eyebrow({
  children,
  tone = "light",
  line = true,
  className,
}: {
  children: React.ReactNode;
  tone?: "light" | "dark";
  line?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <span
        className={cn(
          "inline-flex h-7 shrink-0 items-center rounded-full border px-4 text-xs font-medium tracking-[0.04em] whitespace-nowrap uppercase",
          tone === "light"
            ? "border-sand-deep text-muted-foreground"
            : "border-white/25 bg-white/10 text-white/85 backdrop-blur-sm",
        )}
      >
        {children}
      </span>
      {line && (
        <span
          aria-hidden
          className={cn(
            "h-px w-16 shrink-0 sm:w-28",
            tone === "light" ? "bg-sand-deep" : "bg-white/25",
          )}
        />
      )}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  tone = "light",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
}) {
  const center = align === "center";
  return (
    <div
      className={cn(
        "mb-10 grid gap-5",
        center ? "justify-items-center text-center" : "sm:flex sm:items-end sm:justify-between",
      )}
    >
      <div className={cn("min-w-0", center ? "max-w-3xl" : "max-w-2xl")}>
        {eyebrow && (
          <Eyebrow tone={tone} line={!center} className={cn("mb-5", center && "justify-center")}>
            {eyebrow}
          </Eyebrow>
        )}
        <h2
          className={cn(
            "font-display text-[clamp(1.75rem,1.15rem+2.1vw,2.5rem)] leading-tight text-balance-title",
            tone === "dark" && "text-white",
          )}
        >
          {title}
        </h2>
        {description && (
          <p className={cn("mt-4", tone === "dark" ? "text-white/65" : "text-muted-foreground")}>
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

/** Botão secundário em pílula (branco com borda), usado nas ações de seção. */
export const pillButton =
  "inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-border bg-card px-5 text-sm font-medium text-foreground shadow-pill transition-colors hover:bg-secondary";

export function DestinationCard({
  destination,
  size = "md",
}: {
  destination: Destination;
  size?: "md" | "lg";
}) {
  return (
    <Link
      to="/destinos/$slug"
      params={{ slug: destination.slug }}
      className="group relative block overflow-hidden rounded-3xl card-lift"
    >
      <div
        className={cn(
          "relative overflow-hidden",
          size === "lg" ? "aspect-4/5 md:aspect-3/4" : "aspect-4/3",
        )}
      >
        <img
          src={destination.image}
          alt={destination.name}
          loading="lazy"
          className="h-full w-full object-cover img-zoom"
        />
        <div className="absolute inset-0 hero-scrim" />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-5">
        <p className="flex items-center gap-1.5 text-xs font-medium text-white/80">
          <MapPin className="h-3.5 w-3.5" /> {destination.state}
        </p>
        <h3 className="mt-1.5 font-display text-2xl text-white">{destination.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-white/80">{destination.tagline}</p>
        <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {destination.experiences} experiências
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </p>
      </div>
    </Link>
  );
}

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      to="/experiencias"
      search={{ categoria: category.id }}
      className="group relative block overflow-hidden rounded-3xl card-lift"
    >
      <div className="relative aspect-square overflow-hidden sm:aspect-4/5">
        <img
          src={category.image}
          alt={category.name}
          loading="lazy"
          className="h-full w-full object-cover img-zoom"
        />
        <div className="absolute inset-0 hero-scrim" />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3 className="font-display text-lg text-white">{category.name}</h3>
        <p className="hidden text-xs text-white/75 sm:block">{category.blurb}</p>
      </div>
    </Link>
  );
}

export function ExperienceCard({ experience }: { experience: Experience }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card p-2 card-lift">
      <div className="relative aspect-16/10 overflow-hidden rounded-[22px]">
        <img
          src={experience.image}
          alt={experience.title}
          loading="lazy"
          className="h-full w-full object-cover img-zoom"
        />
        <span className="glass absolute top-3 left-3 rounded-full border border-white/70 px-3 py-1 text-xs font-medium">
          {getDestinationName(experience.destinationSlug)}
        </span>
      </div>
      <div className="flex flex-1 flex-col px-3 pt-4 pb-3">
        <div className="flex items-center gap-1.5 text-sm">
          <Star className="h-4 w-4 fill-gold text-gold" />
          <span className="font-semibold">{experience.rating}</span>
          <span className="text-muted-foreground">({experience.reviews})</span>
        </div>
        <h3 className="mt-2 font-display text-xl leading-snug">{experience.title}</h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
          {experience.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> {experience.duration}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Mountain className="h-3.5 w-3.5" /> {experience.difficulty}
          </span>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <span className="text-sm">
            {experience.price === 0 ? (
              <span className="font-semibold text-forest">Gratuito</span>
            ) : (
              <>
                <span className="text-muted-foreground">a partir de </span>
                <span className="font-semibold">R$ {experience.price}</span>
              </>
            )}
          </span>
          <Link
            to="/destinos/$slug"
            params={{ slug: experience.destinationSlug }}
            className="rounded-full border border-border px-4 py-2 text-xs font-medium transition-colors hover:bg-secondary"
          >
            Ver detalhes
          </Link>
        </div>
      </div>
    </article>
  );
}

export function RouteCard({ itinerary }: { itinerary: Itinerary }) {
  return (
    <Link
      to="/roteiros/$slug"
      params={{ slug: itinerary.slug }}
      className="group grid gap-2 overflow-hidden rounded-3xl border border-border bg-card p-2 card-lift md:grid-cols-[1.1fr_1fr]"
    >
      <div className="relative aspect-16/10 overflow-hidden rounded-[22px] md:aspect-auto md:min-h-65">
        <img
          src={itinerary.image}
          alt={itinerary.title}
          loading="lazy"
          className="h-full w-full object-cover img-zoom"
        />
        <span className="glass absolute top-3 left-3 rounded-full border border-white/70 px-3 py-1 text-xs font-medium">
          {itinerary.days} {itinerary.days === 1 ? "dia" : "dias"}
        </span>
      </div>
      <div className="flex flex-col p-4 sm:p-5">
        <div className="flex flex-wrap gap-2">
          {itinerary.tags.map((t) => (
            <span key={t} className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium">
              {t}
            </span>
          ))}
        </div>
        <h3 className="mt-3 font-display text-2xl">{itinerary.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{itinerary.subtitle}</p>
        <p className="mt-4 text-sm font-medium text-lagoon">{itinerary.destinationsLabel}</p>
        <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4 text-xs">
          <div>
            <dt className="text-muted-foreground">Dificuldade</dt>
            <dd className="mt-0.5 font-semibold">{itinerary.difficulty}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Lugares</dt>
            <dd className="mt-0.5 font-semibold">{itinerary.places}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Estimativa</dt>
            <dd className="mt-0.5 font-semibold">{itinerary.budget}</dd>
          </div>
        </dl>
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
          Ver roteiro
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

export function EventCard({ event }: { event: EventItem }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card p-2 card-lift">
      <div className="relative aspect-16/10 overflow-hidden rounded-[22px]">
        <img
          src={event.image}
          alt={event.name}
          loading="lazy"
          className="h-full w-full object-cover img-zoom"
        />
        <div className="glass absolute top-3 left-3 rounded-2xl border border-white/70 px-3 py-2 text-center">
          <p className="text-sm leading-none font-bold">{event.day}</p>
          <p className="mt-1 text-[10px] tracking-widest uppercase">{event.month}</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col px-3 pt-4 pb-3">
        <span className="text-xs font-semibold tracking-wide text-lagoon uppercase">
          {event.category}
        </span>
        <h3 className="mt-1.5 font-display text-xl">{event.name}</h3>
        <p className="mt-2 flex-1 text-sm text-muted-foreground">{event.description}</p>
        <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> {getDestinationName(event.destinationSlug)}
          <Calendar className="ml-2 h-3.5 w-3.5" /> {event.month}
        </p>
      </div>
    </article>
  );
}

export function BusinessCard({ business }: { business: Business }) {
  return (
    <article className="group flex gap-4 overflow-hidden rounded-3xl border border-border bg-card p-2 card-lift">
      <div className="h-28 w-28 shrink-0 overflow-hidden rounded-[22px]">
        <img
          src={business.image}
          alt={business.name}
          loading="lazy"
          className="h-full w-full object-cover img-zoom"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col py-2 pr-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-secondary px-2 py-0.5 font-medium text-foreground">
            {business.category}
          </span>
          <span className="truncate">{getDestinationName(business.destinationSlug)}</span>
        </div>
        <h3 className="mt-1.5 truncate font-display text-lg">{business.name}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{business.description}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="inline-flex items-center gap-1 text-sm">
            <Star className="h-3.5 w-3.5 fill-gold text-gold" />
            <span className="font-semibold">{business.rating}</span>
            <span className="text-xs text-muted-foreground">({business.reviews})</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-forest/10 px-3 py-1.5 text-xs font-semibold text-forest">
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
          </span>
        </div>
      </div>
    </article>
  );
}
