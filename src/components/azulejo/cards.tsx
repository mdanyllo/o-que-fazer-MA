import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, Clock, MapPin, Route as RouteIcon } from "lucide-react";
import {
  FAIXAS,
  categoriaPorId,
  formatarHoras,
  nomeDestino,
  nomeMes,
  type Destino,
  type Evento,
  type Item,
  type Roteiro,
} from "@/data";
import { cn } from "@/lib/utils";
import { corDaCategoria } from "./cores";
import { MarcaCategoria, Tag } from "./etiquetas";
import { Favoritar } from "./Favoritar";
import { Foto } from "./Foto";

/*
 * Cards no estilo da referência: foto com raio de 10px, título em Bricolage 600,
 * texto em ink-suave. O link cobre o card inteiro (alvo grande no celular);
 * o botão de favoritar fica por cima.
 */

const linkEsticado = "after:absolute after:inset-0 after:content-['']";

export function CardDestino({
  destino,
  titulo,
  texto,
  className,
}: {
  destino: Destino;
  titulo?: string;
  texto?: string;
  className?: string;
}) {
  return (
    <article className={cn("group relative flex min-w-0 flex-col gap-3", className)}>
      <Foto
        src={destino.foto}
        alt={`${destino.nome}, ${destino.regiao}`}
        rotulo={destino.nome}
        cor="cobalto"
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        className="aspect-[4/3] rounded-md"
        imgClassName="transition-transform duration-600 ease-saida group-hover:scale-[1.04]"
      >
        <Favoritar
          tipo="destino"
          slug={destino.slug}
          nome={destino.nome}
          className="absolute top-3 right-3 z-10"
        />
      </Foto>
      <h3 className="text-t3">
        <Link
          to="/destinos/$slug"
          params={{ slug: destino.slug }}
          className={cn(linkEsticado, "hover:text-cobalto")}
        >
          {titulo ?? destino.nome}
        </Link>
      </h3>
      <p className="text-base text-ink-suave">{texto ?? destino.chamada}</p>
      <p className="mt-auto flex items-center gap-1.5 text-legenda text-ink-suave">
        <Clock className="size-4" aria-hidden /> {destino.tempoDeSaoLuis}
      </p>
      <span
        aria-hidden
        className="sobe-no-hover inline-flex items-center gap-1 text-rotulo text-cobalto"
      >
        Ver destino <ArrowRight className="size-4" />
      </span>
    </article>
  );
}

export function CardItem({
  item,
  nota,
  className,
}: {
  item: Item;
  /** informação extra em destaque (ex.: distância no "perto de mim") */
  nota?: string;
  className?: string;
}) {
  const categoria = categoriaPorId[item.categoria];
  return (
    <article className={cn("group relative flex min-w-0 flex-col gap-3", className)}>
      <Foto
        src={item.foto}
        alt={item.nome}
        rotulo={item.nome}
        cor={corDaCategoria(item.categoria)}
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="aspect-[4/3] rounded-md"
        imgClassName="transition-transform duration-600 ease-saida group-hover:scale-[1.04]"
      >
        <Favoritar
          tipo={item.tipo}
          slug={item.slug}
          nome={item.nome}
          className="absolute top-3 right-3 z-10"
        />
      </Foto>
      <div className="flex items-center gap-2 text-legenda text-ink-suave">
        <MarcaCategoria categoria={item.categoria} tamanho="sm" />
        <span>{categoria.nome}</span>
        <span aria-hidden>·</span>
        <span>{nomeDestino(item.destino)}</span>
      </div>
      <h3 className="text-t3">
        <Link
          to={item.href}
          params={{ slug: item.slug }}
          className={cn(linkEsticado, "hover:text-cobalto")}
        >
          {item.nome}
        </Link>
      </h3>
      <p className="text-base text-ink-suave">{item.resumo}</p>
      <div className="mt-auto flex flex-wrap gap-2">
        {nota && (
          <Tag className="bg-cobalto text-sobre-cobalto">
            <MapPin className="size-3.5" aria-hidden /> {nota}
          </Tag>
        )}
        {item.horas > 0 && (
          <Tag>
            <Clock className="size-3.5" aria-hidden /> {formatarHoras(item.horas)}
          </Tag>
        )}
        <Tag>
          <span className="sr-only">Faixa de preço: </span>
          {FAIXAS[item.faixaPreco].simbolo}
        </Tag>
        {item.ficticio && <Tag>Exemplo</Tag>}
      </div>
      <span
        aria-hidden
        className="sobe-no-hover inline-flex items-center gap-1 text-rotulo text-cobalto"
      >
        {item.tipo === "experiencia" ? "Ver experiência" : "Ver lugar"}{" "}
        <ArrowRight className="size-4" />
      </span>
    </article>
  );
}

export function CardRoteiro({
  roteiro,
  destaque = false,
  cortina = false,
  className,
}: {
  roteiro: Roteiro;
  destaque?: boolean;
  /** foto abre com a cortina ao entrar na tela (só no destaque) */
  cortina?: boolean;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "group relative grid min-w-0 gap-4",
        destaque
          ? "md:grid-rows-[auto_1fr]"
          : "grid-cols-[112px_1fr] items-center sm:grid-cols-[160px_1fr]",
        className,
      )}
    >
      <Foto
        src={roteiro.foto}
        alt={roteiro.titulo}
        rotulo={roteiro.titulo}
        sizes={destaque ? "(min-width: 768px) 50vw, 100vw" : "160px"}
        cortina={destaque && cortina}
        className={cn("rounded-md", destaque ? "aspect-[3/2]" : "aspect-square")}
        imgClassName="transition-transform duration-600 ease-saida group-hover:scale-[1.04]"
      >
        {destaque && (
          <Favoritar
            tipo="roteiro"
            slug={roteiro.slug}
            nome={roteiro.titulo}
            className="absolute top-3 right-3 z-10"
          />
        )}
      </Foto>
      <div className="flex min-w-0 flex-col gap-2">
        <p className="flex flex-wrap items-center gap-x-2 text-legenda text-ink-suave">
          <span className="font-bold text-cobalto">{roteiro.dias.length} dias</span>
          <span aria-hidden>·</span>
          <span>Ritmo {roteiro.ritmo.toLowerCase()}</span>
        </p>
        <h3 className={destaque ? "text-t2" : "text-t3"}>
          <Link
            to="/roteiros/$slug"
            params={{ slug: roteiro.slug }}
            className={cn(linkEsticado, "hover:text-cobalto")}
          >
            {roteiro.titulo}
          </Link>
        </h3>
        <p className={cn("text-ink-suave", destaque ? "text-base" : "line-clamp-2 text-base")}>
          {roteiro.chamada}
        </p>
        {destaque && (
          <p className="flex items-center gap-1.5 text-legenda text-ink-suave">
            <RouteIcon className="size-4" aria-hidden />
            {roteiro.destinos.map(nomeDestino).join(" → ")}
          </p>
        )}
        <span
          aria-hidden
          className="sobe-no-hover inline-flex items-center gap-1 text-rotulo text-cobalto"
        >
          Ver roteiro dia a dia <ArrowRight className="size-4" />
        </span>
      </div>
    </article>
  );
}

export function LinhaEvento({ evento }: { evento: Evento }) {
  return (
    <li className="flex items-start gap-4 border-t border-linha py-4">
      <span className="grid w-14 shrink-0 place-items-center rounded-sm bg-louca py-1.5 text-center">
        <CalendarDays className="size-4 text-guara" aria-hidden />
        <span className="text-rotulo">{nomeMes(evento.mes).slice(0, 3)}</span>
      </span>
      <div className="min-w-0">
        <p className="font-bold">{evento.nome}</p>
        <p className="flex items-center gap-1 text-legenda text-ink-suave">
          <MapPin className="size-3.5" aria-hidden /> {nomeDestino(evento.destino)} ·{" "}
          {evento.periodo}
        </p>
      </div>
    </li>
  );
}

export function CardComida({
  nome,
  texto,
  foto,
  cor,
}: {
  nome: string;
  texto: string;
  foto?: string;
  cor: "jucara" | "babacu" | "ouro";
}) {
  return (
    <article className="group relative flex min-w-0 items-center gap-4 rounded-md bg-areia p-4">
      <Foto
        {...(foto ? { src: foto } : {})}
        alt={nome}
        rotulo={nome}
        cor={cor}
        sizes="104px"
        className="size-26 shrink-0 rounded-sm"
      />
      <div className="flex min-w-0 flex-col gap-1">
        <h3 className="font-display text-[1.375rem] leading-tight font-semibold">
          <Link
            to="/explorar"
            search={{ categoria: "gastronomia" }}
            className={cn(linkEsticado, "hover:text-cobalto")}
          >
            {nome}
          </Link>
        </h3>
        <p className="text-[0.9375rem] leading-normal text-ink-suave">{texto}</p>
      </div>
      <ArrowRight
        aria-hidden
        className="ml-auto size-5 shrink-0 text-cobalto transition-transform duration-150 group-hover:translate-x-1"
      />
    </article>
  );
}
