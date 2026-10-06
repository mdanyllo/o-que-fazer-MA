import { Link } from "@tanstack/react-router";
import { MapPin, Star, Clock, Mountain, Calendar, MessageCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  Business,
  Destination,
  EventItem,
  Experience,
  Itinerary,
  Category,
} from "@/data/maranhao";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 grid gap-4 sm:flex sm:items-end sm:justify-between">
      <div className="min-w-0 max-w-2xl">
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-turquoise uppercase">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-3xl text-balance-title sm:text-4xl">{title}</h2>
        {description && <p className="mt-3 text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

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
      className="group relative block overflow-hidden rounded-2xl card-lift"
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
        <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
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
      className="group relative block overflow-hidden rounded-2xl card-lift"
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
        <span className="text-xl">{category.emoji}</span>
        <h3 className="font-display text-lg text-white">{category.name}</h3>
        <p className="hidden text-xs text-white/75 sm:block">{category.blurb}</p>
      </div>
    </Link>
  );
}

export function ExperienceCard({ experience }: { experience: Experience }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft card-lift">
      <div className="relative aspect-16/10 overflow-hidden">
        <img
          src={experience.image}
          alt={experience.title}
          loading="lazy"
          className="h-full w-full object-cover img-zoom"
        />
        <span className="absolute top-3 left-3 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
          {experience.destination}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
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
            className="rounded-full bg-secondary px-4 py-2 text-xs font-semibold transition-colors hover:bg-accent"
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
      className="group grid overflow-hidden rounded-2xl border border-border bg-card shadow-soft card-lift md:grid-cols-[1.1fr_1fr]"
    >
      <div className="relative aspect-16/10 overflow-hidden md:aspect-auto md:min-h-[260px]">
        <img
          src={itinerary.image}
          alt={itinerary.title}
          loading="lazy"
          className="h-full w-full object-cover img-zoom"
        />
        <span className="absolute top-3 left-3 rounded-full bg-deep/85 px-3 py-1 text-xs font-semibold text-deep-foreground backdrop-blur-sm">
          {itinerary.days} {itinerary.days === 1 ? "dia" : "dias"}
        </span>
      </div>
      <div className="flex flex-col p-6">
        <div className="flex flex-wrap gap-2">
          {itinerary.tags.map((t) => (
            <span key={t} className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium">
              {t}
            </span>
          ))}
        </div>
        <h3 className="mt-3 font-display text-2xl">{itinerary.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{itinerary.subtitle}</p>
        <p className="mt-4 text-sm font-medium text-turquoise">{itinerary.destinationsLabel}</p>
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
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft card-lift">
      <div className="relative aspect-16/10 overflow-hidden">
        <img
          src={event.image}
          alt={event.name}
          loading="lazy"
          className="h-full w-full object-cover img-zoom"
        />
        <div className="absolute top-3 left-3 rounded-xl bg-background/95 px-3 py-2 text-center backdrop-blur-sm">
          <p className="text-sm leading-none font-bold">{event.day}</p>
          <p className="mt-1 text-[10px] tracking-widest uppercase">{event.month}</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <span className="text-xs font-semibold tracking-wide text-turquoise uppercase">
          {event.category}
        </span>
        <h3 className="mt-1.5 font-display text-xl">{event.name}</h3>
        <p className="mt-2 flex-1 text-sm text-muted-foreground">{event.description}</p>
        <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> {event.city}
          <Calendar className="ml-2 h-3.5 w-3.5" /> {event.month}
        </p>
      </div>
    </article>
  );
}

export function BusinessCard({ business }: { business: Business }) {
  return (
    <article className="group flex gap-4 overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-soft card-lift">
      <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl">
        <img
          src={business.image}
          alt={business.name}
          loading="lazy"
          className="h-full w-full object-cover img-zoom"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col py-1 pr-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-secondary px-2 py-0.5 font-medium text-foreground">
            {business.category}
          </span>
          <span className="truncate">{business.city}</span>
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
