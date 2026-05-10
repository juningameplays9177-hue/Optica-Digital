"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  applyDoctorOpticalBaseline,
  buildAssistMedicoNote,
  emptyDraft,
  loadReceitaDraft,
  mergeDraftWithPd,
  PUPILOMETRO_PD_MM_KEY,
  readStoredPdMm,
  type EyeFields,
  type ReceitaDraft,
  saveReceitaDraft,
  type DistanciaReceita
} from "../lib/receita-storage";

type EyeSide = "od" | "oe";

const fieldShell =
  "group relative flex flex-col gap-1.5 rounded-xl border border-zinc-700/50 bg-zinc-950/50 px-3 py-2.5 transition " +
  "focus-within:border-cyan-500/40 focus-within:bg-zinc-900/50 focus-within:shadow-[0_0_0_1px_rgba(6,182,212,0.15)]";

function RxField({
  label,
  value,
  onChange,
  emphasis
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  emphasis?: "dnp";
}) {
  const isDnp = emphasis === "dnp";
  return (
    <div
      className={
        fieldShell +
        (isDnp
          ? " border-emerald-500/35 bg-emerald-950/20 focus-within:border-emerald-400/45 focus-within:shadow-[0_0_0_1px_rgba(16,185,129,0.2)]"
          : "")
      }
    >
      <span
        className={
          "text-[10px] font-semibold uppercase tracking-[0.14em] " +
          (isDnp ? "text-emerald-400/90" : "text-zinc-500 group-focus-within:text-zinc-400")
        }
      >
        {label}
      </span>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="—"
        className={
          "w-full min-w-0 border-0 bg-transparent p-0 text-sm outline-none placeholder:text-zinc-700 " +
          (isDnp ? "font-mono tabular-nums text-emerald-100" : "text-zinc-100")
        }
      />
    </div>
  );
}

function EyeColumn({
  code,
  title,
  accent,
  eye,
  onField,
  dnpAuto
}: {
  code: string;
  title: string;
  accent: "cyan" | "violet";
  eye: EyeFields;
  onField: (field: keyof EyeFields, value: string) => void;
  dnpAuto: boolean;
}) {
  const bar =
    accent === "cyan"
      ? "from-cyan-400 via-cyan-500 to-cyan-600 shadow-[0_0_24px_rgba(6,182,212,0.25)]"
      : "from-violet-400 via-violet-500 to-fuchsia-600 shadow-[0_0_24px_rgba(139,92,246,0.22)]";

  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/25">
      <div
        className={`absolute inset-y-3 left-0 w-1 rounded-full bg-gradient-to-b ${bar}`}
        aria-hidden
      />
      <div className="relative pl-5 pr-4 pt-5 pb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg text-xs font-extrabold tracking-tight ${
                accent === "cyan"
                  ? "bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-500/25"
                  : "bg-violet-500/15 text-violet-200 ring-1 ring-violet-500/25"
              }`}
            >
              {code}
            </span>
            <div>
              <p className="text-[13px] font-semibold tracking-tight text-white">{title}</p>
              <p className="text-[11px] text-zinc-500">Prescrição por olho</p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
          <RxField label="Esférico" value={eye.esferico} onChange={(v) => onField("esferico", v)} />
          <RxField label="Cilíndrico" value={eye.cilindrico} onChange={(v) => onField("cilindrico", v)} />
          <RxField label="Eixo" value={eye.eixo} onChange={(v) => onField("eixo", v)} />
          <RxField label="Altura" value={eye.altura} onChange={(v) => onField("altura", v)} />
          <div className="relative col-span-2 lg:col-span-1">
            <RxField label="DNP (mm)" value={eye.dnp} onChange={(v) => onField("dnp", v)} emphasis="dnp" />
            {dnpAuto ? (
              <span
                className="pointer-events-none absolute -right-1 -top-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-950 shadow-md shadow-emerald-900/40"
                title="Sugerido a partir da DP no pupilômetro"
              >
                auto
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function RxDistanceBlock({
  step,
  label,
  caption,
  block,
  onChange,
  dnpAuto
}: {
  step: string;
  label: string;
  caption: string;
  block: DistanciaReceita;
  onChange: (side: EyeSide, field: keyof EyeFields, value: string) => void;
  dnpAuto: boolean;
}) {
  return (
    <section className="relative">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="font-mono text-3xl font-bold leading-none text-zinc-800 tabular-nums select-none sm:text-4xl">
            {step}
          </span>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">{label}</h2>
            <p className="mt-0.5 max-w-xl text-sm leading-relaxed text-zinc-500">{caption}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <EyeColumn
          code="OD"
          title="Olho direito"
          accent="cyan"
          eye={block.od}
          onField={(f, v) => onChange("od", f, v)}
          dnpAuto={dnpAuto}
        />
        <EyeColumn
          code="OE"
          title="Olho esquerdo"
          accent="violet"
          eye={block.oe}
          onField={(f, v) => onChange("oe", f, v)}
          dnpAuto={dnpAuto}
        />
      </div>
    </section>
  );
}

function MarkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="2" y="2" width="28" height="28" rx="8" className="stroke-cyan-500/40" strokeWidth="1.5" />
      <path
        d="M10 16c2-4 4-6 6-6s4 2 6 6-4 6-6 6-4-2-6-6z"
        className="stroke-cyan-400/90"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="16" cy="16" r="2" className="fill-cyan-300/90" />
    </svg>
  );
}

export default function ReceitaClient() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<ReceitaDraft>(() => emptyDraft());
  const [pdMm, setPdMm] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [assistHint, setAssistHint] = useState<string | null>(null);

  const refreshFromStorage = useCallback(() => {
    const pd = readStoredPdMm();
    setPdMm(pd);
    const draft = loadReceitaDraft();
    setData(mergeDraftWithPd(draft, pd));
  }, []);

  useEffect(() => {
    const assist = searchParams.get("assist") === "1";
    const pdRaw = searchParams.get("pd");
    const labelEnc = searchParams.get("label") ?? "";
    let label = labelEnc;
    try {
      label = decodeURIComponent(labelEnc.replace(/\+/g, " "));
    } catch {
      label = labelEnc;
    }

    const pdParsed = pdRaw ? parseFloat(String(pdRaw).replace(",", ".")) : NaN;
    const pd = Number.isFinite(pdParsed) && pdParsed > 0 ? pdParsed : null;

    if (assist && pd != null && typeof window !== "undefined") {
      const draft = loadReceitaDraft();
      let next = mergeDraftWithPd(draft, pd);
      next = applyDoctorOpticalBaseline(next);
      if (!next.adicao.trim()) {
        next = { ...next, adicao: "0.00" };
      }
      next = { ...next, medico: buildAssistMedicoNote(pd, label) };
      localStorage.setItem(PUPILOMETRO_PD_MM_KEY, String(pd));
      saveReceitaDraft(next);
      setPdMm(pd);
      setData(next);
      setAssistHint(
        `Preenchimento assistido com base no registo: ${label.length > 180 ? `${label.slice(0, 180)}…` : label}`
      );
    } else {
      refreshFromStorage();
      setAssistHint(null);
    }

    setHydrated(true);

    const onStorage = (e: StorageEvent) => {
      if (e.key === PUPILOMETRO_PD_MM_KEY || e.key === "optica-receita-draft") refreshFromStorage();
    };
    window.addEventListener("storage", onStorage);
    const onFocus = () => refreshFromStorage();
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, [searchParams, refreshFromStorage]);

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
    <div className="relative min-h-screen overflow-x-hidden bg-[#020203] text-zinc-100">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(6,182,212,0.18),transparent),radial-gradient(ellipse_50%_40%_at_100%_0%,rgba(139,92,246,0.11),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.35] mix-blend-soft-light"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "28px 28px"
        }}
        aria-hidden
      />

      <header className="relative z-10 border-b border-white/[0.06] bg-[#020203]/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/15 to-transparent shadow-lg shadow-cyan-950/30">
              <MarkIcon className="h-7 w-7" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-cyan-400/85">Ótica · receituário</p>
              <h1 className="mt-1 text-xl font-extrabold tracking-tight text-white sm:text-2xl">Dados da receita</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            {pdMm != null ? (
              <div className="flex items-center gap-3 rounded-2xl border border-cyan-500/25 bg-cyan-950/30 px-4 py-2.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300/70">DP</span>
                <span className="font-mono text-base font-bold tabular-nums text-cyan-50">{pdMm.toFixed(1)} mm</span>
              </div>
            ) : (
              <div className="max-w-xs rounded-2xl border border-amber-500/20 bg-amber-950/25 px-4 py-2.5 text-xs leading-snug text-amber-100/90">
                Sem DP sincronizada. Use o pupilômetro e clique em <strong className="font-semibold">Atualizar</strong>.
              </div>
            )}
            <button
              type="button"
              onClick={refreshFromStorage}
              className="rounded-2xl border border-zinc-600/80 bg-zinc-900/80 px-4 py-2.5 text-xs font-semibold text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800 hover:text-white"
            >
              Atualizar DP
            </button>
            <Link
              href="/"
              className="rounded-2xl bg-gradient-to-b from-cyan-400 to-cyan-600 px-5 py-2.5 text-xs font-bold text-cyan-950 shadow-lg shadow-cyan-950/40 transition hover:from-cyan-300 hover:to-cyan-500"
            >
              Pupilômetro
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-10 pb-16 sm:px-6 sm:py-14">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-gradient-to-b from-zinc-900/40 to-zinc-950/90 p-[1px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.85)]">
          <div
            className="rounded-[calc(2rem-1px)] bg-[#08080c]/95 px-5 py-8 sm:px-10 sm:py-10"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 12%), linear-gradient(90deg, rgba(6,182,212,0.06), transparent 35%)"
            }}
          >
            <div className="space-y-6 border-b border-white/[0.06] pb-8">
              {assistHint ? (
                <div className="w-full rounded-xl border border-cyan-500/30 bg-cyan-950/35 px-4 py-3 text-sm leading-relaxed text-cyan-100/95">
                  <strong className="font-semibold text-cyan-200">Modo assistido.</strong>{" "}
                  {assistHint} Esfera, cilindro e eixo usam modelo neutro; substitua pelos valores da receita clínica.
                </div>
              ) : null}
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">
                  Formulário clínico em duas distâncias. Os campos{" "}
                  <strong className="font-semibold text-emerald-400/95">DNP</strong> são calculados a partir da{" "}
                  <strong className="text-zinc-200">distância pupilar</strong> guardada pelo pupilômetro; os restantes
                  valores ficam para transcrição da receita física e são salvos apenas no seu navegador.
                </p>
                {pdMm != null ? (
                  <div className="shrink-0 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-xs text-zinc-500">
                    <span className="font-mono font-semibold text-cyan-200/90">Longe ≈ {(pdMm / 2).toFixed(1)} mm</span>
                    <span className="mx-2 text-zinc-600">·</span>
                    <span className="font-mono font-semibold text-emerald-200/80">
                      Perto ≈ {(Math.max(pdMm - 2.5, 0) / 2).toFixed(1)} mm
                    </span>
                    <span className="ml-2 text-zinc-600">por olho</span>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-10 space-y-14">
              <RxDistanceBlock
                step="01"
                label="Visão ao longe"
                caption="Valores habituais para distância de sala de aula, rua ou condução."
                block={data.longe}
                onChange={(side, f, v) => updateEye("longe", side, f, v)}
                dnpAuto={dnpFromPd}
              />
              <RxDistanceBlock
                step="02"
                label="Visão de perto"
                caption="Leitura, trabalho próximo ou multifocais — ajuste fino conforme receita original."
                block={data.perto}
                onChange={(side, f, v) => updateEye("perto", side, f, v)}
                dnpAuto={dnpFromPd}
              />
            </div>

            <section className="mt-14 border-t border-white/[0.06] pt-10">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.28em] text-zinc-500">Complemento da prescrição</h3>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className={fieldShell}>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Adição</span>
                  <input
                    type="text"
                    value={data.adicao}
                    onChange={(e) => setData((p) => ({ ...p, adicao: e.target.value }))}
                    placeholder="—"
                    className="w-full border-0 bg-transparent p-0 text-sm text-zinc-100 outline-none placeholder:text-zinc-700"
                  />
                </div>
                <div className={fieldShell}>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">Médico</span>
                  <input
                    type="text"
                    value={data.medico}
                    onChange={(e) => setData((p) => ({ ...p, medico: e.target.value }))}
                    placeholder="—"
                    className="w-full border-0 bg-transparent p-0 text-sm text-zinc-100 outline-none placeholder:text-zinc-700"
                  />
                </div>
              </div>
            </section>

            <p className="mt-10 text-center text-[11px] text-zinc-600 sm:text-left">
              Rascunho armazenado localmente. Nenhum dado é transmitido a servidores externos.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
