import { useEffect, useSyncExternalStore } from "react";

/**
 * Aviso de "dados de exemplo" do rodapé: aparece só quando há na tela algum negócio com
 * exemplo = true. Cada card ou página de negócio de exemplo se marca enquanto está montado.
 */
let marcados = 0;
const ouvintes = new Set<() => void>();
const avisar = () => ouvintes.forEach((ouvinte) => ouvinte());

/** Marca que há um negócio de exemplo na tela enquanto o componente estiver montado. */
export function useMarcarExemplo(ativo: boolean | undefined) {
  useEffect(() => {
    if (!ativo) return;
    marcados += 1;
    avisar();
    return () => {
      marcados -= 1;
      avisar();
    };
  }, [ativo]);
}

/** Há algum negócio de exemplo na tela? (false no servidor; o aviso entra depois da hidratação) */
export function useHaExemplo() {
  return useSyncExternalStore(
    (ouvinte) => {
      ouvintes.add(ouvinte);
      return () => {
        ouvintes.delete(ouvinte);
      };
    },
    () => marcados > 0,
    () => false,
  );
}
