"use client";

import { motion } from "framer-motion";

type ResultDisplayProps = {
  pdMm: number | null;
  precision: "baixa" | "media" | "alta";
  history: string[];
  onSave: () => void;
};

export default function ResultDisplay({ pdMm, precision, history, onSave }: ResultDisplayProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5"
    >
      <h2 className="text-lg font-semibold">Resultado</h2>
      <div className="mt-3 flex items-end gap-2">
        <span className="text-5xl font-bold tracking-tight text-cyan-300">
          {pdMm ? pdMm.toFixed(1) : "--"}
        </span>
        <span className="pb-1 text-sm text-slate-300">mm</span>
      </div>

      <div className="mt-3 inline-flex rounded-full border border-slate-700 px-3 py-1 text-xs uppercase text-slate-300">
        Precisao: {precision}
      </div>

      <button
        onClick={onSave}
        disabled={!pdMm}
        className="mt-4 w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
      >
        Salvar Medicao
      </button>

      <div className="mt-4 border-t border-slate-800 pt-3">
        <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">Historico local</p>
        <div className="space-y-1 text-sm text-slate-200">
          {history.length ? (
            history.map((item, idx) => <p key={`${item}-${idx}`}>{item}</p>)
          ) : (
            <p className="text-slate-500">Nenhuma medicao salva ainda.</p>
          )}
        </div>
      </div>
    </motion.section>
  );
}
