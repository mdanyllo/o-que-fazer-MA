import { useSyncExternalStore } from "react";
import type { DiaRoteiro } from "@/data/tipos";

/**
 * "Minha viagem": favoritos e roteiros salvos, guardados só neste navegador.
 * Sem backend: se o armazenamento estiver bloqueado, tudo funciona durante a visita
 * e se perde ao fechar.
 */

export type TipoFavorito = "destino" | "lugar" | "experiencia" | "roteiro";
export type Favorito = { tipo: TipoFavorito; slug: string };

export type RoteiroSalvo = {
  id: string;
  titulo: string;
  origem: "pronto" | "planejador";
  /** slug do roteiro pronto que deu origem, se houver */
  baseSlug?: string;
  resumo: string;
  dias: DiaRoteiro[];
  criadoEm: string;
};

type Estado = { favoritos: Favorito[]; roteiros: RoteiroSalvo[] };

const CHAVE = "azulejo:minha-viagem";
const VAZIO: Estado = { favoritos: [], roteiros: [] };

let estado: Estado = VAZIO;
let carregado = false;
const ouvintes = new Set<() => void>();

function carregar() {
  if (carregado || typeof window === "undefined") return;
  carregado = true;
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (bruto) {
      const lido = JSON.parse(bruto) as Partial<Estado>;
      estado = {
        favoritos: Array.isArray(lido.favoritos) ? lido.favoritos : [],
        roteiros: Array.isArray(lido.roteiros) ? lido.roteiros : [],
      };
    }
  } catch {
    estado = VAZIO;
  }
}

function salvar(novo: Estado) {
  estado = novo;
  try {
    localStorage.setItem(CHAVE, JSON.stringify(novo));
  } catch {
    // sem armazenamento: mantém só em memória
  }
  ouvintes.forEach((fn) => fn());
}

function assinar(fn: () => void) {
  ouvintes.add(fn);
  const aoMudarEmOutraAba = (ev: StorageEvent) => {
    if (ev.key !== CHAVE) return;
    carregado = false;
    carregar();
    fn();
  };
  window.addEventListener("storage", aoMudarEmOutraAba);
  return () => {
    ouvintes.delete(fn);
    window.removeEventListener("storage", aoMudarEmOutraAba);
  };
}

function ler() {
  carregar();
  return estado;
}

export function useMinhaViagem() {
  return useSyncExternalStore(assinar, ler, () => VAZIO);
}

export function useFavorito(tipo: TipoFavorito, slug: string) {
  const { favoritos } = useMinhaViagem();
  const ativo = favoritos.some((f) => f.tipo === tipo && f.slug === slug);
  return [ativo, () => alternarFavorito(tipo, slug)] as const;
}

export function alternarFavorito(tipo: TipoFavorito, slug: string) {
  const atual = ler();
  const existe = atual.favoritos.some((f) => f.tipo === tipo && f.slug === slug);
  salvar({
    ...atual,
    favoritos: existe
      ? atual.favoritos.filter((f) => !(f.tipo === tipo && f.slug === slug))
      : [{ tipo, slug }, ...atual.favoritos],
  });
  return !existe;
}

export function salvarRoteiro(roteiro: Omit<RoteiroSalvo, "id" | "criadoEm"> & { id?: string }) {
  const atual = ler();
  const id = roteiro.id ?? `r-${Date.now().toString(36)}`;
  const novo: RoteiroSalvo = { ...roteiro, id, criadoEm: new Date().toISOString() };
  // se já existe, atualiza no mesmo lugar da lista; se é novo, entra no topo
  const existe = atual.roteiros.some((r) => r.id === id);
  salvar({
    ...atual,
    roteiros: existe
      ? atual.roteiros.map((r) => (r.id === id ? novo : r))
      : [novo, ...atual.roteiros],
  });
  return id;
}

export function removerRoteiro(id: string) {
  const atual = ler();
  salvar({ ...atual, roteiros: atual.roteiros.filter((r) => r.id !== id) });
}
