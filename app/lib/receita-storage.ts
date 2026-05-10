/** DP total (mm) escrito pelo pupilometro na pagina principal */
export const PUPILOMETRO_PD_MM_KEY = "pupilometro-pd-mm";

/** Rascunho editavel da receita (tudo exceto DNP recalculado ao abrir) */
export const RECEITA_DRAFT_KEY = "optica-receita-draft";

export type EyeFields = {
  esferico: string;
  cilindrico: string;
  eixo: string;
  altura: string;
  dnp: string;
};

export type DistanciaReceita = {
  od: EyeFields;
  oe: EyeFields;
};

export type ReceitaDraft = {
  longe: DistanciaReceita;
  perto: DistanciaReceita;
  adicao: string;
  medico: string;
};

export const emptyEye = (): EyeFields => ({
  esferico: "",
  cilindrico: "",
  eixo: "",
  altura: "",
  dnp: ""
});

export const emptyDraft = (): ReceitaDraft => ({
  longe: { od: emptyEye(), oe: emptyEye() },
  perto: { od: emptyEye(), oe: emptyEye() },
  adicao: "",
  medico: ""
});

export function parsePdMmFromHistoryLine(line: string): number | null {
  const m = line.match(/(\d+[.,]\d+|\d+)\s*mm/i);
  if (!m) return null;
  const n = parseFloat(m[1].replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Preenche campos ópticos ainda vazios com valores-base neutros (ausência de astigmatismo / esfera plana),
 * típicos de modelo antes da conferência com a receita do prescritor. Não altera DNP.
 */
export function applyDoctorOpticalBaseline(draft: ReceitaDraft): ReceitaDraft {
  const eye = (e: EyeFields): EyeFields => ({
    esferico: e.esferico.trim() ? e.esferico : "0.00",
    cilindrico: e.cilindrico.trim() ? e.cilindrico : "0.00",
    eixo: e.eixo.trim() ? e.eixo : "180",
    altura: e.altura.trim() ? e.altura : "",
    dnp: e.dnp
  });
  return {
    longe: { od: eye(draft.longe.od), oe: eye(draft.longe.oe) },
    perto: { od: eye(draft.perto.od), oe: eye(draft.perto.oe) },
    adicao: draft.adicao,
    medico: draft.medico
  };
}

export function buildAssistMedicoNote(pdMm: number, historyLabel: string): string {
  const label = historyLabel.trim() || "(histórico sem descrição)";
  return (
    `Assistência Pupilômetro Digital — DP total ${pdMm.toFixed(1)} mm. ` +
    `Registo: ${label}. ` +
    `DNP calculados automaticamente; esfera, cilindro e eixo seguem modelo neutro até conferência com o prescritor.`
  );
}

/** DNP monocular (mm) a partir do DP total: longe ≈ metade; perto ≈ metade do (total − inseto), heuristica comum. */
export function dnpsFromPdTotalMm(pdMm: number) {
  const safe = Number.isFinite(pdMm) && pdMm > 0 ? pdMm : null;
  if (safe == null) {
    return { longeOd: "", longeOe: "", pertoOd: "", pertoOe: "" };
  }
  const halfLonge = (safe / 2).toFixed(1);
  const pertoTotal = Math.max(safe - 2.5, 0);
  const halfPerto = (pertoTotal / 2).toFixed(1);
  return {
    longeOd: halfLonge,
    longeOe: halfLonge,
    pertoOd: halfPerto,
    pertoOe: halfPerto
  };
}

export function readStoredPdMm(): number | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PUPILOMETRO_PD_MM_KEY);
  if (!raw) return null;
  const n = parseFloat(raw.replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function loadReceitaDraft(): ReceitaDraft {
  if (typeof window === "undefined") return emptyDraft();
  try {
    const raw = localStorage.getItem(RECEITA_DRAFT_KEY);
    if (!raw) return emptyDraft();
    const p = JSON.parse(raw) as Partial<ReceitaDraft>;
    const base = emptyDraft();
    return {
      longe: {
        od: { ...base.longe.od, ...p.longe?.od },
        oe: { ...base.longe.oe, ...p.longe?.oe }
      },
      perto: {
        od: { ...base.perto.od, ...p.perto?.od },
        oe: { ...base.perto.oe, ...p.perto?.oe }
      },
      adicao: p.adicao ?? "",
      medico: p.medico ?? ""
    };
  } catch {
    return emptyDraft();
  }
}

export function saveReceitaDraft(data: ReceitaDraft) {
  if (typeof window === "undefined") return;
  localStorage.setItem(RECEITA_DRAFT_KEY, JSON.stringify(data));
}

export function mergeDraftWithPd(draft: ReceitaDraft, pdMm: number | null): ReceitaDraft {
  if (pdMm == null || !Number.isFinite(pdMm) || pdMm <= 0) {
    return {
      longe: {
        od: { ...draft.longe.od },
        oe: { ...draft.longe.oe }
      },
      perto: {
        od: { ...draft.perto.od },
        oe: { ...draft.perto.oe }
      },
      adicao: draft.adicao,
      medico: draft.medico
    };
  }
  const dnp = dnpsFromPdTotalMm(pdMm);
  return {
    longe: {
      od: { ...draft.longe.od, dnp: dnp.longeOd },
      oe: { ...draft.longe.oe, dnp: dnp.longeOe }
    },
    perto: {
      od: { ...draft.perto.od, dnp: dnp.pertoOd },
      oe: { ...draft.perto.oe, dnp: dnp.pertoOe }
    },
    adicao: draft.adicao,
    medico: draft.medico
  };
}
