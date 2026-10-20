import { createContext, useContext, useEffect, type RefObject } from "react";
import { supabase } from "./supabase";

/*
 * Estatísticas dos negócios (plano Pro): visitas à página, cliques no WhatsApp, no Instagram
 * e no site, aparições em listas e compartilhamentos (por canal). Cada evento vira +1 no dia (função registrar_evento).
 * Nada de dado pessoal: só o negócio, o tipo e o dia.
 */

export type Evento =
  | "visita"
  | "whatsapp"
  | "instagram"
  | "site"
  | "aparicao"
  | "compartilhar_whatsapp"
  | "compartilhar_instagram"
  | "compartilhar_link";

/** Dentro da prévia do painel nada é contado (o dono olhando o próprio negócio). */
export const ContextoPrevia = createContext(false);
export const useEhPrevia = () => useContext(ContextoPrevia);

const jaContado = (chave: string) => {
  try {
    if (sessionStorage.getItem(chave)) return true;
    sessionStorage.setItem(chave, "1");
  } catch {
    /* sem armazenamento: conta assim mesmo */
  }
  return false;
};

/**
 * Conta um evento. Visitas e aparições valem uma vez por negócio a cada sessão do navegador
 * (recarregar a página não infla o número); cliques contam sempre.
 */
export function registrarEvento(negocioId: string | undefined, evento: Evento) {
  if (!negocioId || !supabase || typeof window === "undefined") return;
  if ((evento === "visita" || evento === "aparicao") && jaContado(`azulejo:${evento}:${negocioId}`))
    return;
  // o .then() é o que dispara a requisição: sem ele o Supabase monta a chamada e não envia
  void supabase.rpc("registrar_evento", { negocio: negocioId, evento }).then(
    () => {},
    () => {},
  );
}

/** Conta a visita à página do negócio (fora da prévia). */
export function useContarVisita(negocioId: string | undefined) {
  const previa = useEhPrevia();
  useEffect(() => {
    if (!previa) registrarEvento(negocioId, "visita");
  }, [negocioId, previa]);
}

/** Conta uma aparição quando o card fica pelo menos metade visível na tela. */
export function useContarAparicao(
  ref: RefObject<HTMLElement | null>,
  negocioId: string | undefined,
) {
  const previa = useEhPrevia();
  useEffect(() => {
    const el = ref.current;
    if (!el || !negocioId || previa || typeof IntersectionObserver === "undefined") return;
    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          registrarEvento(negocioId, "aparicao");
          observador.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, [ref, negocioId, previa]);
}

// ——— leitura (painel do dono Pro) ———

export type LinhaEstatistica = { dia: string; tipo: Evento; total: number };

export async function buscarEstatisticas(negocioId: string, desde: string) {
  if (!supabase) throw new Error("As contas ainda não estão ligadas neste ambiente.");
  const { data, error } = await supabase.rpc("estatisticas_negocio", {
    negocio: negocioId,
    desde,
  });
  if (error) throw error;
  return (data ?? []) as LinhaEstatistica[];
}
