import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { BedDouble, Check, ChevronDown, Compass, UtensilsCrossed } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { Botao } from "@/components/azulejo/botao";
import { CaixaErro, CampoTexto, focarPrimeiroErro } from "@/components/conta/formulario";
import { aprovar } from "@/lib/admin";
import { FAIXAS } from "@/data";
import {
  CAMPOS_DA_ETAPA,
  criarNegocio,
  DESCRICAO_MAX,
  DESCRICAO_MIN,
  digitosWhatsapp,
  mascararWhatsapp,
  mensagemErroNegocio,
  RASCUNHO_VAZIO,
  rascunhoDe,
  salvarNegocio,
  sugerirNomeCurto,
  validar,
  type Campo,
  type Erros,
  type FotoDono,
  type NegocioDono,
  type Rascunho,
} from "@/lib/meus-negocios";
import type { SubtipoHospedagem, TipoNegocio } from "@/lib/negocios";
import { cn } from "@/lib/utils";
import { CampoArea, CampoCidade, GrupoOpcoes } from "./campos";
import { CampoLocalizacao } from "./CampoLocalizacao";
import { EtapaFotos } from "./EtapaFotos";
import { ExcluirNegocio } from "./ExcluirNegocio";
import { PreviaNegocio } from "./PreviaNegocio";

export const ETAPAS = ["Tipo", "Dados básicos", "Contato", "Fotos", "Revisão"];

const TIPOS: { valor: TipoNegocio; rotulo: string; detalhe: string; icone: ReactNode }[] = [
  {
    valor: "hospedagem",
    rotulo: "Hospedagem",
    detalhe: "Pousada, hotel, chalé, hostel ou casa",
    icone: <BedDouble className="size-6 shrink-0" aria-hidden />,
  },
  {
    valor: "restaurante",
    rotulo: "Restaurante",
    detalhe: "Restaurante, bar ou lanchonete",
    icone: <UtensilsCrossed className="size-6 shrink-0" aria-hidden />,
  },
  {
    valor: "passeio",
    rotulo: "Passeio",
    detalhe: "Passeio, trilha, barco ou guia",
    icone: <Compass className="size-6 shrink-0" aria-hidden />,
  },
];

const SUBTIPOS: { valor: SubtipoHospedagem; rotulo: string }[] = [
  { valor: "pousada", rotulo: "Pousada" },
  { valor: "hotel", rotulo: "Hotel" },
  { valor: "chale", rotulo: "Chalé" },
  { valor: "hostel", rotulo: "Hostel" },
  { valor: "casa_de_temporada", rotulo: "Casa de temporada" },
];

const id = (c: Campo) => `n-${c}`;

/**
 * Cadastro e edição de um negócio, em 5 etapas. Sem `negocio`, é um cadastro novo: ao sair
 * da etapa 3 ele vira rascunho (as fotos precisam da pasta do negócio no Storage).
 *
 * `modo="equipe"` é o mesmo formulário no /admin: sem dono, sem limite, com "Exemplo" e
 * "status ao terminar" no cadastro novo, e um único botão "Salvar" (status e exclusão ficam
 * no painel de ações do admin).
 */
export function FormularioNegocio({
  negocio,
  etapaInicial = 1,
  modo = "dono",
  publicarAoSalvar = false,
  aoSalvar,
}: {
  negocio?: NegocioDono;
  etapaInicial?: number;
  modo?: "dono" | "equipe";
  /** equipe: o cadastro novo foi marcado "publicar"; o "Salvar" da revisão também publica */
  publicarAoSalvar?: boolean;
  /** equipe: depois de salvar (para recarregar a página do admin) */
  aoSalvar?: () => void;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const equipe = modo === "equipe";
  const chave = equipe ? ["admin-negocios"] : ["meus-negocios"];
  const [opcoesEquipe, setOpcoesEquipe] = useState({ exemplo: false, publicar: false });
  const [r, setR] = useState<Rascunho>(() => (negocio ? rascunhoDe(negocio) : RASCUNHO_VAZIO));
  const [fotos, setFotos] = useState<FotoDono[]>(negocio?.negocio_fotos ?? []);
  const [etapa, setEtapa] = useState(negocio ? etapaInicial : 1);
  const [vistas, setVistas] = useState(negocio ? 5 : 1);
  const [erros, setErros] = useState<Erros>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const salvo = useRef(JSON.stringify(negocio ? rascunhoDe(negocio) : RASCUNHO_VAZIO));
  const alterado = JSON.stringify(r) !== salvo.current;
  const topo = useRef<HTMLDivElement>(null);

  const status = negocio?.status ?? "rascunho";
  const emEdicaoNoAr = status === "pendente" || status === "publicado";

  // aviso ao fechar a aba com mudanças não salvas
  useEffect(() => {
    if (!alterado) return;
    const avisar = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, [alterado]);

  const mudar = <K extends keyof Rascunho>(campo: K, valor: Rascunho[K]) => {
    setR((atual) => ({
      ...atual,
      [campo]: valor,
      // outra cidade: o ponto marcado no mapa não vale mais
      ...(campo === "cidade" && valor !== atual.cidade ? { latitude: null, longitude: null } : {}),
    }));
    if (erros[campo]) setErros(({ [campo]: _, ...resto }) => resto);
    // o resumo "Faltam N itens" vale para o envio que falhou; ao corrigir, sai
    setErroGeral(null);
  };

  function irPara(n: number) {
    setEtapa(n);
    setVistas((v) => Math.max(v, n));
    setErroGeral(null);
    topo.current?.scrollIntoView({ block: "start" });
  }

  /** Mostra os erros; leva à etapa do primeiro e põe o foco nele. */
  function mostrarErros(e: Erros) {
    setErros(e);
    const primeira = [1, 2, 3, 4].find((n) => CAMPOS_DA_ETAPA[n]!.some((c) => e[c]));
    if (primeira && primeira !== etapa) setEtapa(primeira);
    setErroGeral(
      Object.keys(e).length > 1
        ? `Faltam ${Object.keys(e).length} itens. Confira os campos marcados.`
        : null,
    );
    focarPrimeiroErro();
  }

  const errosDaEtapa = (e: Erros, n: number) =>
    Object.fromEntries(Object.entries(e).filter(([c]) => CAMPOS_DA_ETAPA[n]?.includes(c as Campo)));

  async function executar(acao: () => Promise<void>) {
    setSalvando(true);
    setErroGeral(null);
    try {
      await acao();
    } catch (e) {
      setErroGeral(mensagemErroNegocio(e));
    } finally {
      setSalvando(false);
    }
  }

  /** Cadastro novo: grava o rascunho e passa para a página de edição dele. */
  async function criar(proximaEtapa: number) {
    const e = validar(r, "rascunho", 0);
    if (Object.keys(e).length) return mostrarErros(e);
    await executar(async () => {
      const novoId = await criarNegocio(r, equipe ? { exemplo: opcoesEquipe.exemplo } : undefined);
      salvo.current = JSON.stringify(r);
      await queryClient.invalidateQueries({ queryKey: chave });
      toast.success("Rascunho salvo.");
      if (equipe)
        void navigate({
          to: "/admin/$id",
          params: { id: novoId },
          search: { etapa: proximaEtapa, ...(opcoesEquipe.publicar ? { publicar: true } : {}) },
          replace: true,
        });
      else
        void navigate({
          to: "/painel/$id",
          params: { id: novoId },
          search: { etapa: proximaEtapa },
          replace: true,
        });
    });
  }

  async function continuar() {
    if (etapa < 4) {
      const e = errosDaEtapa(validar(r, "completo", fotos.length), etapa);
      if (Object.keys(e).length) return mostrarErros(e);
    }
    if (!negocio && etapa === 3) return criar(4);
    irPara(etapa + 1);
  }

  async function salvarRascunho() {
    if (!negocio) return criar(etapa);
    const e = validar(r, "rascunho", fotos.length);
    if (Object.keys(e).length) return mostrarErros(e);
    await executar(async () => {
      await salvarNegocio(negocio, r);
      salvo.current = JSON.stringify(r);
      await queryClient.invalidateQueries({ queryKey: chave });
      toast.success("Rascunho salvo.");
    });
  }

  /** Equipe: grava o que estiver preenchido; no cadastro marcado para publicar, publica. */
  async function salvarEquipe() {
    if (!negocio) return criar(etapa);
    const publicar = publicarAoSalvar && etapa === 5 && status !== "publicado";
    const e = validar(r, publicar ? "completo" : "rascunho", fotos.length);
    if (Object.keys(e).length) return mostrarErros(e);
    await executar(async () => {
      await salvarNegocio(negocio, r);
      if (publicar) await aprovar(negocio.id);
      salvo.current = JSON.stringify(r);
      await queryClient.invalidateQueries({ queryKey: chave });
      toast.success(publicar ? "Salvo e publicado." : "Alterações salvas.");
      aoSalvar?.();
    });
  }

  /** Enviar para análise (rascunho/recusado) ou salvar (em análise/publicado): tudo completo. */
  async function concluir() {
    if (!negocio) return;
    const e = validar(r, "completo", fotos.length);
    if (Object.keys(e).length) return mostrarErros(e);
    await executar(async () => {
      await salvarNegocio(negocio, r, { enviar: !emEdicaoNoAr });
      salvo.current = JSON.stringify(r);
      await queryClient.invalidateQueries({ queryKey: ["meus-negocios"] });
      toast.success(
        status === "publicado"
          ? "Alterações salvas. Elas já estão no ar."
          : status === "pendente"
            ? "Alterações salvas."
            : "Enviado para análise. Volte aqui para ver o status.",
      );
      void navigate({ to: "/painel" });
    });
  }

  const textoConcluir =
    status === "publicado" || status === "pendente"
      ? "Salvar alterações"
      : status === "recusado"
        ? "Corrigir e reenviar"
        : "Enviar para análise";
  // em análise, publicado ou recusado não existe "rascunho": salva já completo
  const mostraRascunho = status === "rascunho";
  const mostraConcluir = Boolean(negocio) && (etapa === 5 || status !== "rascunho");

  function enviarFormulario(e: FormEvent) {
    e.preventDefault();
    if (etapa < 5) void continuar();
    else if (equipe) void salvarEquipe();
    else if (negocio) void concluir();
  }

  return (
    <div ref={topo} className="flex scroll-mt-24 flex-col gap-8">
      <Progresso
        etapa={etapa}
        vistas={negocio ? 5 : vistas}
        aoEscolher={(n) => (negocio || n <= vistas ? irPara(n) : undefined)}
      />

      {negocio && !equipe && <AvisoStatus negocio={negocio} />}

      <form onSubmit={enviarFormulario} noValidate className="flex flex-col gap-8">
        {erroGeral && <CaixaErro>{erroGeral}</CaixaErro>}

        {etapa === 1 && equipe && !negocio && (
          <OpcoesEquipe valor={opcoesEquipe} aoMudar={setOpcoesEquipe} />
        )}

        {etapa === 1 && (
          <GrupoOpcoes
            id={id("tipo")}
            rotulo="Que tipo de negócio você quer cadastrar?"
            opcoes={TIPOS}
            valor={r.tipo}
            aoMudar={(v) => mudar("tipo", v)}
            erro={erros.tipo}
            tamanho="lg"
            className="sm:grid-cols-3"
          />
        )}

        {etapa === 2 && <EtapaDados r={r} erros={erros} mudar={mudar} />}
        {etapa === 3 && <EtapaContato r={r} erros={erros} mudar={mudar} />}

        {etapa === 4 &&
          (negocio ? (
            <EtapaFotos
              negocioId={negocio.id}
              nome={r.nome || negocio.nome}
              fotos={fotos}
              aoMudar={(f) => {
                setFotos(f);
                setErros(({ fotos: _, ...resto }) => resto);
                void queryClient.invalidateQueries({ queryKey: chave });
              }}
              erro={erros.fotos}
            />
          ) : (
            <p className="rounded-md bg-areia p-5">Salve o rascunho para enviar as fotos.</p>
          ))}

        {etapa === 5 && negocio && (
          <EtapaRevisao
            r={r}
            fotos={fotos}
            negocio={negocio}
            irPara={irPara}
            faltando={validar(r, "completo", fotos.length)}
            textoFalta={equipe ? "Para publicar, falta:" : "Para enviar para análise, falta:"}
          />
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-linha pt-6 sm:flex-row sm:items-center sm:justify-between">
          {etapa > 1 ? (
            <Botao variante="fantasma" onClick={() => irPara(etapa - 1)} disabled={salvando}>
              Voltar
            </Botao>
          ) : (
            <span />
          )}
          {equipe ? (
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              {etapa < 5 && (
                <Botao
                  type="submit"
                  variante={negocio ? "secundario" : "principal"}
                  disabled={salvando}
                >
                  {!negocio && etapa === 3 ? "Salvar e enviar fotos" : "Continuar"}
                </Botao>
              )}
              {(negocio || etapa === 5) && (
                <Botao
                  type={etapa === 5 ? "submit" : "button"}
                  onClick={etapa === 5 ? undefined : () => void salvarEquipe()}
                  disabled={salvando}
                >
                  {salvando
                    ? "Salvando…"
                    : publicarAoSalvar && etapa === 5 && status !== "publicado"
                      ? "Salvar e publicar"
                      : "Salvar"}
                </Botao>
              )}
            </div>
          ) : (
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              {mostraRascunho && (
                <Botao
                  variante="secundario"
                  onClick={() => void salvarRascunho()}
                  disabled={salvando || (!r.tipo && !negocio)}
                >
                  Salvar rascunho
                </Botao>
              )}
              {etapa < 5 && (
                <Botao
                  type="submit"
                  variante={mostraConcluir ? "secundario" : "principal"}
                  disabled={salvando}
                >
                  {!negocio && etapa === 3 ? "Salvar e enviar fotos" : "Continuar"}
                </Botao>
              )}
              {mostraConcluir && (
                <Botao
                  type={etapa === 5 ? "submit" : "button"}
                  onClick={etapa === 5 ? undefined : () => void concluir()}
                  disabled={salvando}
                >
                  {salvando ? "Salvando…" : textoConcluir}
                </Botao>
              )}
            </div>
          )}
        </div>
      </form>

      {negocio && !equipe && (
        <ExcluirNegocio
          negocio={{ ...negocio, negocio_fotos: fotos }}
          aoExcluir={() => {
            salvo.current = JSON.stringify(r);
            void navigate({ to: "/painel" });
          }}
        />
      )}
    </div>
  );
}

// ——— etapas ———

type PropsEtapa = {
  r: Rascunho;
  erros: Erros;
  mudar: <K extends keyof Rascunho>(campo: K, valor: Rascunho[K]) => void;
};

function EtapaDados({ r, erros, mudar }: PropsEtapa) {
  const sugestao = sugerirNomeCurto(r.nome);
  const mostrarSugestao = r.nome.trim() && !r.nome_curto && sugestao;
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-t2">Dados básicos</h2>
      <CampoTexto
        id={id("nome")}
        rotulo="Nome do negócio"
        valor={r.nome}
        aoMudar={(v) => mudar("nome", v)}
        erro={erros.nome}
        maxLength={60}
        autoComplete="organization"
        dica={`${r.nome.trim().length} de 60 caracteres`}
      />
      <div className="flex flex-col gap-2">
        <CampoTexto
          id={id("nome_curto")}
          rotulo="Nome curto"
          opcional
          valor={r.nome_curto}
          aoMudar={(v) => mudar("nome_curto", v)}
          erro={erros.nome_curto}
          maxLength={22}
          placeholder={sugestao || undefined}
          dica="Aparece nos cards, onde cabem até 22 caracteres."
        />
        {mostrarSugestao && sugestao !== r.nome.trim() && (
          <button
            type="button"
            onClick={() => mudar("nome_curto", sugestao)}
            className="min-h-11 self-start font-bold text-cobalto underline underline-offset-4"
          >
            Usar “{sugestao}”
          </button>
        )}
      </div>
      <CampoCidade
        id={id("cidade")}
        valor={r.cidade}
        aoMudar={(v) => mudar("cidade", v)}
        erro={erros.cidade}
      />
      <CampoArea
        id={id("descricao")}
        rotulo="Descrição"
        valor={r.descricao}
        aoMudar={(v) => mudar("descricao", v)}
        erro={erros.descricao}
        minimo={DESCRICAO_MIN}
        maximo={DESCRICAO_MAX}
        dica={`Como é o lugar, o que oferece e o que o torna especial. De ${DESCRICAO_MIN} a ${DESCRICAO_MAX} caracteres.`}
      />

      {r.tipo === "hospedagem" && (
        <>
          <GrupoOpcoes
            id={id("subtipo_hospedagem")}
            rotulo="Tipo de hospedagem"
            opcoes={SUBTIPOS}
            valor={r.subtipo_hospedagem}
            aoMudar={(v) => mudar("subtipo_hospedagem", v)}
            erro={erros.subtipo_hospedagem}
            className="grid-cols-2 sm:grid-cols-3"
          />
          <CampoPreco
            r={r}
            erros={erros}
            mudar={mudar}
            rotulo="Preço por noite"
            dica="A diária mais barata, em reais."
          />
        </>
      )}

      {r.tipo === "restaurante" && (
        <>
          <CampoTexto
            id={id("culinaria")}
            rotulo="Tipo de culinária"
            valor={r.culinaria}
            aoMudar={(v) => mudar("culinaria", v)}
            erro={erros.culinaria}
            maxLength={40}
            placeholder="Comida maranhense, frutos do mar…"
          />
          <GrupoOpcoes
            id={id("faixa_preco")}
            rotulo="Faixa de preço por pessoa"
            opcoes={(["$", "$$", "$$$"] as const).map((v, i) => ({
              valor: v,
              rotulo: v,
              detalhe: FAIXAS[(i + 1) as 1 | 2 | 3].texto,
            }))}
            valor={r.faixa_preco}
            aoMudar={(v) => mudar("faixa_preco", v)}
            erro={erros.faixa_preco}
            className="sm:grid-cols-3"
          />
        </>
      )}

      {r.tipo === "passeio" && (
        <>
          <CampoPreco r={r} erros={erros} mudar={mudar} rotulo="Preço por pessoa" />
          <CampoTexto
            id={id("duracao")}
            rotulo="Duração"
            valor={r.duracao}
            aoMudar={(v) => mudar("duracao", v)}
            erro={erros.duracao}
            maxLength={60}
            placeholder="Cerca de 4 horas"
          />
        </>
      )}

      {r.tipo && (
        <CampoTexto
          id={id("horario")}
          rotulo="Horário de funcionamento"
          opcional
          valor={r.horario}
          aoMudar={(v) => mudar("horario", v)}
          erro={erros.horario}
          maxLength={160}
          placeholder={EXEMPLO_HORARIO[r.tipo]}
        />
      )}
    </div>
  );
}

const EXEMPLO_HORARIO: Record<TipoNegocio, string> = {
  hospedagem: "Recepção das 7h às 22h, check-in a partir das 14h",
  restaurante: "Terça a domingo, das 11h às 22h",
  passeio: "Saídas todos os dias às 8h e às 14h",
};

function CampoPreco({
  r,
  erros,
  mudar,
  rotulo,
  dica,
}: PropsEtapa & { rotulo: string; dica?: string }) {
  return (
    <CampoTexto
      id={id("preco")}
      rotulo={rotulo}
      prefixo="R$"
      inputMode="decimal"
      valor={r.preco}
      aoMudar={(v) => mudar("preco", v.replace(/[^\d,.]/g, ""))}
      erro={erros.preco}
      maxLength={12}
      placeholder="280"
      {...(dica ? { dica } : {})}
    />
  );
}

function EtapaContato({ r, erros, mudar }: PropsEtapa) {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-t2">Contato</h2>
      <CampoTexto
        id={id("whatsapp")}
        rotulo="WhatsApp Comercial"
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        valor={mascararWhatsapp(r.whatsapp)}
        aoMudar={(v) => mudar("whatsapp", digitosWhatsapp(v))}
        erro={erros.whatsapp}
        placeholder="(98) 99123-4567"
        dica="Número onde os clientes mandam mensagem para você. Com DDD."
      />
      <CampoTexto
        id={id("instagram")}
        rotulo="Instagram"
        opcional
        valor={r.instagram}
        aoMudar={(v) => mudar("instagram", v)}
        erro={erros.instagram}
        maxLength={80}
        autoCapitalize="none"
        placeholder="@seunegocio"
      />
      <CampoTexto
        id={id("site")}
        rotulo="Site"
        opcional
        type="url"
        inputMode="url"
        valor={r.site}
        aoMudar={(v) => mudar("site", v)}
        erro={erros.site}
        maxLength={200}
        autoCapitalize="none"
        placeholder="seunegocio.com.br"
      />
      <CampoTexto
        id={id("endereco")}
        rotulo="Endereço"
        opcional={r.tipo === "passeio"}
        valor={r.endereco}
        aoMudar={(v) => mudar("endereco", v)}
        erro={erros.endereco}
        maxLength={160}
        autoComplete="street-address"
        placeholder="Rua, número e bairro"
      />
      {r.tipo === "passeio" && (
        <CampoTexto
          id={id("ponto_encontro")}
          rotulo="Ponto de encontro"
          valor={r.ponto_encontro}
          aoMudar={(v) => mudar("ponto_encontro", v)}
          erro={erros.ponto_encontro}
          maxLength={160}
          placeholder="Porto de Barreirinhas, em frente à praça"
        />
      )}
      <CampoLocalizacao
        cidade={r.cidade}
        latitude={r.latitude}
        longitude={r.longitude}
        passeio={r.tipo === "passeio"}
        aoMudar={(lat, lng) => {
          mudar("latitude", lat);
          mudar("longitude", lng);
        }}
      />
    </div>
  );
}

const SUBTIPO_ROTULO = Object.fromEntries(SUBTIPOS.map((s) => [s.valor, s.rotulo]));
const TIPO_ROTULO = Object.fromEntries(TIPOS.map((t) => [t.valor, t.rotulo]));

function EtapaRevisao({
  r,
  fotos,
  negocio,
  irPara,
  faltando,
  textoFalta,
}: {
  r: Rascunho;
  fotos: FotoDono[];
  negocio: NegocioDono;
  irPara: (n: number) => void;
  faltando: Erros;
  textoFalta: string;
}) {
  const linhas: { rotulo: string; valor: string; etapa: number }[] = [
    { rotulo: "Tipo", valor: r.tipo ? TIPO_ROTULO[r.tipo]! : "", etapa: 1 },
    { rotulo: "Nome", valor: r.nome, etapa: 2 },
    { rotulo: "Nome curto", valor: r.nome_curto || "—", etapa: 2 },
    { rotulo: "Cidade", valor: r.cidade, etapa: 2 },
    ...(r.tipo === "hospedagem"
      ? [
          {
            rotulo: "Tipo de hospedagem",
            valor: SUBTIPO_ROTULO[r.subtipo_hospedagem] ?? "",
            etapa: 2,
          },
          { rotulo: "Preço por noite", valor: r.preco ? `R$ ${r.preco}` : "", etapa: 2 },
        ]
      : []),
    ...(r.tipo === "restaurante"
      ? [
          { rotulo: "Culinária", valor: r.culinaria, etapa: 2 },
          { rotulo: "Faixa de preço", valor: r.faixa_preco, etapa: 2 },
        ]
      : []),
    ...(r.tipo === "passeio"
      ? [
          { rotulo: "Preço por pessoa", valor: r.preco ? `R$ ${r.preco}` : "", etapa: 2 },
          { rotulo: "Duração", valor: r.duracao, etapa: 2 },
          { rotulo: "Ponto de encontro", valor: r.ponto_encontro, etapa: 3 },
        ]
      : []),
    { rotulo: "Horário de funcionamento", valor: r.horario || "—", etapa: 2 },
    { rotulo: "WhatsApp Comercial", valor: mascararWhatsapp(r.whatsapp), etapa: 3 },
    { rotulo: "Instagram", valor: r.instagram || "—", etapa: 3 },
    { rotulo: "Site", valor: r.site || "—", etapa: 3 },
    { rotulo: "Endereço", valor: r.endereco || "—", etapa: 3 },
    {
      rotulo: "Localização",
      valor:
        r.latitude != null
          ? "Marcada no mapa"
          : r.cidade
            ? `Não marcada (centro de ${r.cidade})`
            : "Não marcada",
      etapa: 3,
    },
    { rotulo: "Fotos", valor: `${fotos.length} de 8`, etapa: 4 },
  ];
  const itensFaltando = Object.values(faltando);

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-6">
        <h2 className="text-t2">Revisão</h2>
        {itensFaltando.length > 0 && (
          <div className="rounded-md border-2 border-ouro p-5">
            <p className="font-bold">{textoFalta}</p>
            <ul className="mt-2 flex list-disc flex-col gap-1 pl-5">
              {itensFaltando.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        )}
        <dl className="flex flex-col">
          {linhas.map((l) => (
            <div
              key={l.rotulo}
              className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 border-t border-linha py-3 sm:grid-cols-[12rem_1fr_auto]"
            >
              <dt className="text-rotulo text-ink-suave">{l.rotulo}</dt>
              <dd
                className={cn(
                  "col-start-1 min-w-0 break-words sm:col-start-2",
                  !l.valor && "text-guara",
                )}
              >
                {l.valor || "Não preenchido"}
              </dd>
              <dd className="col-start-2 row-span-2 row-start-1 sm:col-start-3 sm:row-span-1">
                <button
                  type="button"
                  onClick={() => irPara(l.etapa)}
                  className="min-h-11 px-2 font-bold text-cobalto underline-offset-4 hover:underline"
                  aria-label={`Editar ${l.rotulo.toLowerCase()}`}
                >
                  Editar
                </button>
              </dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-col gap-2 border-t border-linha pt-3">
          <p className="text-rotulo text-ink-suave">Descrição</p>
          <p className="medida whitespace-pre-line">{r.descricao || "Não preenchida"}</p>
        </div>
      </div>

      <PreviaNegocio
        rascunho={r}
        fotos={fotos}
        base={{
          id: negocio.id,
          slug: negocio.slug,
          latitude: r.latitude,
          longitude: r.longitude,
        }}
      />
    </div>
  );
}

// ——— topo ———

function Progresso({
  etapa,
  vistas,
  aoEscolher,
}: {
  etapa: number;
  vistas: number;
  aoEscolher: (n: number) => void;
}) {
  return (
    <nav aria-label="Etapas do cadastro">
      {/* celular: texto + barra em 5 partes */}
      <p className="text-legenda text-ink-suave md:hidden">
        Etapa {etapa} de {ETAPAS.length} ·{" "}
        <span className="font-bold text-ink">{ETAPAS[etapa - 1]}</span>
      </p>
      <ol className="-mt-1 grid grid-cols-5 gap-1.5 md:mt-0 md:gap-2">
        {ETAPAS.map((nome, i) => {
          const n = i + 1;
          const atual = n === etapa;
          const liberada = n <= vistas;
          return (
            <li key={nome}>
              <button
                type="button"
                onClick={() => aoEscolher(n)}
                disabled={!liberada}
                aria-current={atual ? "step" : undefined}
                aria-label={`Etapa ${n}: ${nome}`}
                className="group flex min-h-11 w-full flex-col justify-center gap-2 text-left disabled:cursor-default md:justify-end"
              >
                <span className="hidden items-center gap-2 text-legenda md:flex">
                  <span
                    className={cn(
                      "grid size-6 shrink-0 place-items-center rounded-sm text-rotulo",
                      atual
                        ? "bg-cobalto text-sobre-cobalto"
                        : n < etapa
                          ? "bg-areia text-cobalto"
                          : "bg-areia text-ink-suave",
                    )}
                  >
                    {n < etapa ? <Check className="size-4" aria-hidden /> : n}
                  </span>
                  <span
                    className={cn(
                      "truncate",
                      atual ? "font-bold text-ink" : "text-ink-suave",
                      liberada && !atual && "group-hover:text-cobalto",
                    )}
                  >
                    {nome}
                  </span>
                </span>
                <span
                  aria-hidden
                  className={cn("h-1.5 rounded-full", n <= etapa ? "bg-cobalto" : "bg-linha")}
                />
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function AvisoStatus({ negocio }: { negocio: NegocioDono }) {
  if (negocio.status === "pendente") {
    const texto =
      "A equipe do Azulejo está conferindo o cadastro. Você ainda pode editar; as mudanças entram na mesma análise.";
    return (
      <div role="status">
        {/* celular: uma linha; o texto completo abre ao tocar */}
        <details className="group rounded-md border border-linha bg-areia md:hidden">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-2 [&::-webkit-details-marker]:hidden">
            <span className="truncate">
              <span className="font-bold">Estamos revisando</span>
              <span className="text-ink-suave"> · ver mais</span>
            </span>
            <ChevronDown
              className="size-5 shrink-0 text-cobalto transition-transform duration-150 group-open:rotate-180"
              aria-hidden
            />
          </summary>
          <p className="px-4 pb-3 text-ink-suave">{texto}</p>
        </details>
        <div className="hidden rounded-md border border-linha bg-areia p-5 md:block">
          <p className="font-bold">Estamos revisando</p>
          <p className="mt-1 medida text-ink-suave">{texto}</p>
        </div>
      </div>
    );
  }
  if (negocio.status === "recusado")
    return (
      <div role="status" className="rounded-md border-2 border-guara p-5">
        <p className="font-bold">A equipe pediu ajustes</p>
        {negocio.motivo_recusa && (
          <p className="mt-2 medida">
            <span className="font-bold text-guara">Motivo: </span>
            {negocio.motivo_recusa}
          </p>
        )}
        <p className="mt-2 medida text-ink-suave">
          Corrija o que foi pedido e reenvie. O cadastro volta para análise.
        </p>
      </div>
    );
  if (negocio.status === "publicado")
    return (
      <p role="status" className="text-legenda text-ink-suave">
        Suas alterações já estão no ar e serão conferidas pela equipe.{" "}
        <Link
          to={negocio.tipo === "passeio" ? "/experiencias/$slug" : "/lugares/$slug"}
          params={{ slug: negocio.slug }}
          className="font-bold text-cobalto underline underline-offset-4"
        >
          Ver no site
        </Link>
      </p>
    );
  return null;
}

/** Equipe, cadastro novo: o negócio é de exemplo? Publica ao terminar ou fica em rascunho? */
function OpcoesEquipe({
  valor,
  aoMudar,
}: {
  valor: { exemplo: boolean; publicar: boolean };
  aoMudar: (v: { exemplo: boolean; publicar: boolean }) => void;
}) {
  return (
    <div className="flex flex-col gap-6 rounded-md border border-linha p-5">
      <p className="text-rotulo text-cobalto">Cadastro pela equipe</p>
      <GrupoOpcoes
        id="n-status-inicial"
        rotulo="Status ao terminar"
        opcoes={[
          { valor: "rascunho", rotulo: "Rascunho", detalhe: "Fica fora do site" },
          {
            valor: "publicado",
            rotulo: "Publicado",
            detalhe: "Vai para o site ao salvar a revisão",
          },
        ]}
        valor={valor.publicar ? "publicado" : "rascunho"}
        aoMudar={(v) => aoMudar({ ...valor, publicar: v === "publicado" })}
        className="sm:grid-cols-2"
      />
      <GrupoOpcoes
        id="n-exemplo"
        rotulo="É um dado de exemplo?"
        opcoes={[
          { valor: "nao", rotulo: "Não", detalhe: "Negócio real" },
          { valor: "sim", rotulo: "Sim", detalhe: "Mostra o aviso de exemplo no site" },
        ]}
        valor={valor.exemplo ? "sim" : "nao"}
        aoMudar={(v) => aoMudar({ ...valor, exemplo: v === "sim" })}
        className="sm:grid-cols-2"
      />
      <p className="text-legenda text-ink-suave">
        Sem dono: o negócio fica com a equipe até ser transferido em Usuários.
      </p>
    </div>
  );
}
