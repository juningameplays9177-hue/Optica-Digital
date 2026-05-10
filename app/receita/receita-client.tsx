"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  emptyDraft,
  loadReceitaDraft,
  mergeDraftWithPd,
  readStoredPdMm,
  type EyeFields,
  type ReceitaDraft,
  saveReceitaDraft,
  type DistanciaReceita
} from "../lib/receita-storage";

type EyeSide = "od" | "oe";

function Field({
  label,
  value,
  onChange,
  highlight,
  mono
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  highlight?: boolean;
  mono?: boolean;
}) {
  return (
    <label className="group flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 group-focus-within:text-cyan-400/90">
        {label}
      </span>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="—"
        className={`rounded-lg border px-2.5 py-2 text-sm outline-none transition placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 ${
          mono
            ? "border-cyan-500/30 bg-cyan-950/20 font-mono text-cyan-100"
            : highlight
              ? "border-cyan-500/25 bg-slate-900/80"
              : "border-slate-700/80 bg-slate-900/60"
        }`}
      />
    </label>
  );
}

function EyeBlock({
  title,
  prefix,
  data,
  onChange,
  dnpAuto
}: {
  title: string;
  prefix: string;
  data: DistanciaReceita;
  onChange: (side: EyeSide, field: keyof EyeFields, value: string) => void;
  dnpAuto: boolean;
}) {
  const row = (side: EyeSide, labelShort: string) => {
    const eye = data[side];
    const isOd = side === "od";
    return (
      <div
        key={side}
        className={`rounded-xl border p-3 sm:p-4 ${
          isOd ? "border-cyan-500/20 bg-cyan-950/10" : "border-violet-500/20 bg-violet-950/10"
        }`}
      >
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
          {labelShort} — {side === "od" ? "Olho direito" : "Olho esquerdo"}
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Field label="Esférico" value={eye.esferico} onChange={(v) => onChange(side, "esferico", v)} />
          <Field label="Cilíndrico" value={eye.cilindrico} onChange={(v) => onChange(side, "cilindrico", v)} />
          <Field label="Eixo" value={eye.eixo} onChange={(v) => onChange(side, "eixo", v)} />
          <Field label="Altura" value={eye.altura} onChange={(v) => onChange(side, "altura", v)} />
          <Field
            label="DNP (mm)"
            value={eye.dnp}
            onChange={(v) => onChange(side, "dnp", v)}
            mono
            highlight={dnpAuto}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-700/60 pb-2">
        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-300/90">{title}</h3>
        <span className="text-[10px] text-slate-500">{prefix}</span>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">{row("od", "OD")}{row("oe", "OE")}</div>
    </div>
  );
}

export default function ReceitaClient() {
  const [data, setData] = useState<ReceitaDraft>(() => emptyDraft());
  const [pdMm, setPdMm] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const refreshFromStorage = useCallback(() => {
    const pd = readStoredPdMm();
    setPdMm(pd);
    const draft = loadReceitaDraft();
    setData(mergeDraftWithPd(draft, pd));
  }, []);

  useEffect(() => {
    refreshFromStorage();
    setHydrated(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === "pupilometro-pd-mm" || e.key === "optica-receita-draft") refreshFromStorage();
    };
    window.addEventListener("storage", onStorage);
    const onFocus = () => refreshFromStorage();
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, [refreshFromStorage]);

  useEffect(() => {
    if (!hydrated) return;
    saveReceitaDraft(data);
  }, [data, hydrated]);

  const updateEye = useCallback(
    (section: "longe" | "perto", side: EyeSide, field: keyof EyeFields, value: string) => {
      setData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [side]: { ...prev[section][side], [field]: value }
        }
      }));
    },
    []
  );

  const dnpFromPd = useMemo(() => pdMm != null && pdMm > 0, [pdMm]);

  return (
    <div
      className="min-h-screen bg-[#06060a] text-slate-100"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 120% 80% at 50% -20%, rgba(6,182,212,0.12), transparent 55%), radial-gradient(ellipse 80% 50% at 100% 50%, rgba(139,92,246,0.06), transparent)"
      }}
    >
      <header className="sticky top-0 z-10 border-b border-slate-800/80 bg-[#06060a]/90 px-4 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-500/90">Ótica · Receituário</p>
            <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-white sm:text-2xl">
              <span className="mr-2" aria-hidden>
                👁️
              </span>
              Dados da receita
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {pdMm != null ? (
              <span className="rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs font-medium text-cyan-200">
                DP medição atual: <strong className="font-mono tabular-nums">{pdMm.toFixed(1)} mm</strong>
              </span>
            ) : (
              <span className="rounded-full border border-amber-500/20 bg-amber-950/30 px-3 py-1 text-xs text-amber-200/90">
                Sem DP no pupilômetro — DNP em branco ou preencha manualmente
              </span>
            )}
            <button
              type="button"
              onClick={refreshFromStorage}
              className="rounded-lg border border-slate-600 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
            >
              Atualizar DP
            </button>
            <Link
              href="/"
              className="rounded-lg border border-slate-600 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-700"
            >
              ← Pupilômetro
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 pb-16">
        <p className="mb-8 max-w-3xl text-sm leading-relaxed text-slate-400">
          Os campos <strong className="text-cyan-300/90">DNP</strong> são sugeridos automaticamente a partir da{" "}
          <strong className="text-slate-300">distância pupilar total</strong> guardada no pupilômetro (longe: metade por
          olho; perto: heurística habitual com redução de ~2,5 mm no total antes de dividir). Os restantes campos ficam
          para o profissional ou arquivo da receita física — editáveis aqui e gravados só no seu navegador.
        </p>

        <div className="glass space-y-10 rounded-3xl p-5 sm:p-8">
          <EyeBlock
            title="Longe"
            prefix="Visão ao longe"
            data={data.longe}
            onChange={(side, field, v) => updateEye("longe", side, field, v)}
            dnpAuto={dnpFromPd}
          />
          <EyeBlock
            title="Perto"
            prefix="Visão de perto"
            data={data.perto}
            onChange={(side, field, v) => updateEye("perto", side, field, v)}
            dnpAuto={dnpFromPd}
          />

          <div className="grid gap-6 border-t border-slate-800 pt-8 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Adição</span>
              <input
                type="text"
                value={data.adicao}
                onChange={(e) => setData((p) => ({ ...p, adicao: e.target.value }))}
                placeholder="—"
                className="rounded-lg border border-slate-700/80 bg-slate-900/60 px-3 py-2.5 text-sm outline-none placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Médico</span>
              <input
                type="text"
                value={data.medico}
                onChange={(e) => setData((p) => ({ ...p, medico: e.target.value }))}
                placeholder="—"
                className="rounded-lg border border-slate-700/80 bg-slate-900/60 px-3 py-2.5 text-sm outline-none placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
              />
            </label>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-slate-600">
          Rascunho armazenado localmente. Nada é enviado para servidores.
        </p>
      </main>
    </div>
  );
}
