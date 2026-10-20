import { Images, X } from "lucide-react";
import { useEffect, useState } from "react";
import { botao } from "@/components/azulejo/botao";
import type { CorMaranhense } from "@/components/azulejo/cores";
import { Foto } from "@/components/azulejo/Foto";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { urlFoto } from "@/lib/imagens";
import { cn } from "@/lib/utils";

/**
 * Galeria da página de um negócio: só as fotos dele, na ordem do dono.
 * 1 foto: largura toda. 2: lado a lado. 3 ou mais: uma grande e duas menores, e o resto
 * abre no lightbox ("Ver as N fotos"). Tocar numa foto também abre o lightbox nela.
 */
export function GaleriaNegocio({
  fotos,
  nome,
  cor,
}: {
  fotos: string[];
  nome: string;
  cor: CorMaranhense;
}) {
  const [aberta, setAberta] = useState<number | null>(null);
  const lista = fotos.length ? fotos : [""];
  const n = fotos.length;
  const alt = (i: number) => (n > 1 ? `${nome}, foto ${i + 1} de ${n}` : nome);

  const foto = (i: number, className: string, sizes: string) => (
    <button
      key={i}
      type="button"
      disabled={n === 0}
      onClick={() => setAberta(i)}
      aria-label={n ? `Ampliar a foto ${i + 1} de ${n}` : undefined}
      className={cn(
        "group relative block overflow-hidden rounded-md disabled:cursor-default",
        className,
      )}
    >
      <Foto
        src={lista[i] ?? ""}
        alt={alt(i)}
        rotulo={nome}
        cor={cor}
        prioridade={i === 0}
        entrada={i === 0}
        sizes={sizes}
        className="h-full w-full"
        imgClassName="transition-transform duration-600 ease-saida group-hover:scale-[1.02]"
      />
    </button>
  );

  return (
    <>
      {n <= 1 ? (
        <div className="mt-10">
          {foto(0, "aspect-[4/3] w-full md:aspect-[21/9]", "(min-width: 768px) 90vw, 100vw")}
        </div>
      ) : n === 2 ? (
        <div className="mt-10 grid grid-cols-2 gap-2 md:gap-3">
          {foto(0, "aspect-[4/3]", "50vw")}
          {foto(1, "aspect-[4/3]", "50vw")}
        </div>
      ) : (
        <div className="relative mt-10 grid grid-cols-2 gap-2 md:grid-cols-[2fr_1fr] md:grid-rows-2 md:gap-3">
          {foto(
            0,
            "col-span-2 aspect-[4/3] md:col-span-1 md:row-span-2 md:aspect-auto md:min-h-[480px]",
            "(min-width: 768px) 66vw, 100vw",
          )}
          {foto(1, "aspect-[4/3] md:aspect-auto", "(min-width: 768px) 33vw, 50vw")}
          {foto(2, "aspect-[4/3] md:aspect-auto", "(min-width: 768px) 33vw, 50vw")}
          <button
            type="button"
            onClick={() => setAberta(0)}
            className={cn(
              botao({ variante: "sobre-foto" }),
              "absolute top-3 right-3 z-10 border border-linha md:top-auto md:bottom-3",
            )}
          >
            <Images aria-hidden /> Ver as {n} fotos
          </button>
        </div>
      )}

      <Lightbox fotos={fotos} nome={nome} inicio={aberta} fechar={() => setAberta(null)} />
    </>
  );
}

function Lightbox({
  fotos,
  nome,
  inicio,
  fechar,
}: {
  fotos: string[];
  nome: string;
  inicio: number | null;
  fechar: () => void;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [atual, setAtual] = useState(0);

  useEffect(() => {
    if (!api) return;
    const mudar = () => setAtual(api.selectedScrollSnap());
    mudar();
    api.on("select", mudar);
    return () => {
      api.off("select", mudar);
    };
  }, [api]);

  return (
    <Dialog open={inicio !== null} onOpenChange={(v) => !v && fechar()}>
      <DialogContent
        // o botão de fechar do shadcn fica escondido: usamos o nosso, com alvo de 44px
        className="max-w-5xl gap-4 rounded-md border-linha bg-louca p-4 text-ink sm:p-6 [&>button:last-child]:hidden"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") api?.scrollNext();
          if (e.key === "ArrowLeft") api?.scrollPrev();
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <DialogTitle className="truncate text-t3">{nome}</DialogTitle>
          <div className="flex shrink-0 items-center gap-2">
            <p aria-live="polite" className="text-legenda text-ink-suave tabular-nums">
              {atual + 1} de {fotos.length}
            </p>
            <DialogClose
              aria-label="Fechar"
              className="grid size-11 place-items-center rounded-md hover:bg-areia"
            >
              <X className="size-5" />
            </DialogClose>
          </div>
        </div>
        <Carousel setApi={setApi} opts={{ startIndex: inicio ?? 0, loop: fotos.length > 1 }}>
          <CarouselContent>
            {fotos.map((src, i) => (
              <CarouselItem key={src + i} className="grid place-items-center">
                <img
                  src={urlFoto(src)}
                  alt={`${nome}, foto ${i + 1} de ${fotos.length}`}
                  className="max-h-[70svh] w-auto max-w-full rounded-md object-contain"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          {fotos.length > 1 && (
            <>
              <CarouselPrevious
                aria-label="Foto anterior"
                className="left-2 size-11 border-linha bg-louca text-ink hover:bg-areia"
              />
              <CarouselNext
                aria-label="Próxima foto"
                className="right-2 size-11 border-linha bg-louca text-ink hover:bg-areia"
              />
            </>
          )}
        </Carousel>
      </DialogContent>
    </Dialog>
  );
}
