import { Car, MapPinned, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import { botao } from "./botao";

/**
 * "Como chegar": abre o ponto no Google Maps, no Waze ou no Uber (no celular, no app;
 * no computador, no site). Só links, sem chave de API.
 */
export function ComoChegar({
  lat,
  lng,
  nome,
  className,
}: {
  lat: number;
  lng: number;
  nome: string;
  className?: string;
}) {
  const ponto = `${lat},${lng}`;
  const uber = new URLSearchParams({
    action: "setPickup",
    pickup: "my_location",
    "dropoff[latitude]": String(lat),
    "dropoff[longitude]": String(lng),
    "dropoff[nickname]": nome,
  });
  const destinos = [
    {
      rotulo: "Google Maps",
      icone: <MapPinned aria-hidden />,
      href: `https://www.google.com/maps/dir/?api=1&destination=${ponto}`,
    },
    {
      rotulo: "Waze",
      icone: <Navigation aria-hidden />,
      href: `https://waze.com/ul?ll=${ponto}&navigate=yes`,
    },
    { rotulo: "Uber", icone: <Car aria-hidden />, href: `https://m.uber.com/ul/?${uber}` },
  ];
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <p className="text-rotulo">Como chegar</p>
      <div className="grid grid-cols-3 gap-2">
        {destinos.map((d) => (
          <a
            key={d.rotulo}
            href={d.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(botao({ variante: "secundario" }), "px-2 text-legenda [&_svg]:size-4")}
          >
            {d.icone} {d.rotulo}
            <span className="sr-only"> (abre em outra aba)</span>
          </a>
        ))}
      </div>
    </div>
  );
}
