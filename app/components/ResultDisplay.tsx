"use client";

import { useState } from "react";
import { parsePdMmFromHistoryLine, PUPILOMETRO_PD_MM_KEY } from "../lib/receita-storage";

type ResultDisplayProps = {
  pdMm: number | null;
  precision: "baixa" | "media" | "alta";
  qualityMessage: string;
  history: string[];
  onRemoveHistoryItem: (index: number) => void;
  onClearHistory: () => void;
};

type ConfirmKind = "item" | "all" | null;

/** Botões de ação destrutiva: brilho no hover, feedback no clique, foco acessível. */
const btnDanger =
  "relative overflow-hidden border border-red-400/30 bg-gradient-to-b from-red-500 to-red-700 text-white " +
  "shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_0_0_1px_rgba(248,113,113,0.2),0_4px_14px_-2px_rgba(220,38,38,0.45)] " +
  "transition-[transform,box-shadow,filter,border-color] duration-200 ease-out " +
  "hover:border-red-300/50 hover:from-red-500 hover:to-red-600 " +
  "hover:shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_0_0_1px_rgba(252,165,165,0.45),0_0_28px_rgba(239,68,68,0.55),0_8px_24px_-4px_rgba(185,28,28,0.5)] " +
  "hover:brightness-[1.05] active:scale-[0.97] active:brightness-95 " +
  "active:shadow-[inset_0_3px_10px_rgba(0,0,0,0.35),0_0_20px_rgba(239,68,68,0.35)] " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900";

const btnDangerSm = `${btnDanger} shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold tracking-wide`;

const btnDangerHeader = `${btnDanger} shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wide uppercase`;

const btnDangerConfirm = `${btnDanger} min-w-[9rem] rounded-xl px-4 py-2.5 text-sm font-semibold`;

const btnReceitaHist =
  "shrink-0 rounded-lg border border-cyan-500/40 bg-gradient-to-b from-cyan-600/90 to-cyan-800/95 px-2.5 py-1.5 text-xs font-bold tracking-wide text-white " +
  "shadow-[0_0_0_1px_rgba(34,211,238,0.25),0_4px_14px_-2px_rgba(6,182,212,0.4)] transition duration-200 " +
  "hover:border-cyan-400/60 hover:from-cyan-500 hover:to-cyan-700 hover:shadow-[0_0_20px_rgba(6,182,212,0.35)] " +
  "active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 " +
  "disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none";

export default function ResultDisplay({
  pdMm,
  precision,
  qualityMessage,
  history,
  onRemoveHistoryItem,
  onClearHistory
}: ResultDisplayProps) {
  const [confirmKind, setConfirmKind] = useState<ConfirmKind>(null);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);

  const qualityTone =
    precision === "alta"
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
      : precision === "media"
        ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
        : "border-rose-500/40 bg-rose-500/10 text-rose-300";

  const openRemoveOne = (index: number) => {
    setPendingIndex(index);
    setConfirmKind("item");
  };

  const openRemoveAll = () => {
    setPendingIndex(null);
    setConfirmKind("all");
  };

  const closeDialog = () => {
    setConfirmKind(null);
    setPendingIndex(null);
  };

  const confirmAction = () => {
    if (confirmKind === "item" && pendingIndex !== null) {
      onRemoveHistoryItem(pendingIndex);
    } else if (confirmKind === "all") {
      onClearHistory();
    }
    closeDialog();
  };

  const openReceitaFromHistory = (item: string) => {
    const pd = parsePdMmFromHistoryLine(item);
    if (pd == null || typeof window === "undefined") return;
    localStorage.setItem(PUPILOMETRO_PD_MM_KEY, String(pd));
    const u = new URL("/receita", window.location.origin);
    u.searchParams.set("pd", String(pd));
    u.searchParams.set("assist", "1");
    u.searchParams.set("label", item.slice(0, 380));
    window.open(u.toString(), "_blank", "noopener,noreferrer");
  };

  return (
    <section className="glass relative rounded-2xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Resultado</h2>
        {history.length > 0 ? (
          <button type="button" onClick={openRemoveAll} className={btnDangerHeader}>
            Remover tudo
          </button>
        ) : null}
      </div>

      <div className="mt-3 flex items-end gap-2">
        <span className="text-5xl font-bold tracking-tight text-cyan-300">
          {pdMm ? pdMm.toFixed(1) : "--"}
        </span>
        <span className="pb-1 text-sm text-slate-300">mm</span>
      </div>

      <div className="mt-3 inline-flex rounded-full border border-slate-700 px-3 py-1 text-xs uppercase text-slate-300">
        Precisao: {precision}
      </div>
      <p className={`mt-3 rounded-xl border px-3 py-2 text-sm ${qualityTone}`}>{qualityMessage}</p>

      <div className="mt-4 border-t border-slate-800 pt-3">
        <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">Historico local</p>
        <div className="space-y-2 text-sm text-slate-200">
          {history.length ? (
            history.map((item, idx) => (
              <div
                key={`${item}-${idx}`}
                className="flex flex-col gap-2 rounded-lg border border-slate-800/80 bg-slate-900/40 px-2 py-2 sm:flex-row sm:items-center"
              >
                <p className="min-w-0 flex-1 break-words leading-snug">{item}</p>
                <div className="flex shrink-0 flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openReceitaFromHistory(item)}
                    disabled={parsePdMmFromHistoryLine(item) == null}
                    className={btnReceitaHist}
                    title="Abrir receita numa nova aba: DNP calculados e campos-base a partir desta medição"
                  >
                    Receita
                  </button>
                  <button type="button" onClick={() => openRemoveOne(idx)} className={btnDangerSm}>
                    Remover
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-500">Nenhuma medicao salva ainda.</p>
          )}
        </div>
      </div>

      {confirmKind ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-remove-title"
        >
          <div className="w-full max-w-sm rounded-2xl border border-slate-600/80 bg-zinc-900/95 p-6 shadow-2xl shadow-black/50 ring-1 ring-white/5">
            <h3 id="confirm-remove-title" className="text-center text-base font-semibold text-slate-100">
              {confirmKind === "item" ? "Remover esta medicao?" : "Remover todo o historico?"}
            </h3>
            <p className="mt-2 text-center text-sm text-slate-400">
              {confirmKind === "item"
                ? "Deseja remover esta entrada do historico local? Esta acao nao pode ser desfeita."
                : "Deseja apagar todas as medicoes guardadas? Esta acao nao pode ser desfeita."}
            </p>
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row-reverse sm:justify-center">
              <button type="button" onClick={confirmAction} className={btnDangerConfirm}>
                Sim, remover
              </button>
              <button
                type="button"
                onClick={closeDialog}
                className="min-w-[9rem] rounded-xl border border-slate-500/60 bg-slate-800/90 px-4 py-2.5 text-sm font-semibold text-slate-200 shadow-sm transition duration-200 hover:border-slate-400 hover:bg-slate-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
