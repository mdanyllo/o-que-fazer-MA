import { Moon, Sun } from "lucide-react";
import { useTema } from "@/lib/tema";
import { cn } from "@/lib/utils";

export function BotaoTema({ className }: { className?: string }) {
  const [tema, definir] = useTema();
  const noite = tema === "noite";
  return (
    <button
      type="button"
      onClick={() => definir(noite ? "dia" : "noite")}
      aria-label={noite ? "Usar tema claro" : "Usar tema noite"}
      title={noite ? "Tema claro" : "Tema noite"}
      className={cn(
        "grid size-11 place-items-center rounded-md transition-colors duration-150",
        className,
      )}
    >
      {noite ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  );
}
