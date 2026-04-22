"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Calibration from "./components/Calibration";
import Camera, { type FacingMode } from "./components/Camera";
import FaceDetector, { FaceDetectorOutput } from "./components/FaceDetector";
import ResultDisplay from "./components/ResultDisplay";

const HISTORY_KEY = "pupilometro-history";
const DEFAULT_PX_PER_MM = 3.4;

function calculateStability(values: number[]) {
  if (values.length < 4) return 999;
  const mean = values.reduce((acc, v) => acc + v, 0) / values.length;
  const variance = values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export default function HomeClient() {
  const searchParams = useSearchParams();
  const [cameraFacing, setCameraFacing] = useState<FacingMode>("user");
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const [status, setStatus] = useState("Aguardando inicializacao...");
  const [pxPerMm, setPxPerMm] = useState(DEFAULT_PX_PER_MM);
  const [pdMm, setPdMm] = useState<number | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [eyeCenters, setEyeCenters] = useState<{
    left: { x: number; y: number };
    right: { x: number; y: number };
  } | null>(null);
  const [measureWindow, setMeasureWindow] = useState<number[]>([]);
  const [confidence, setConfidence] = useState(0);
  const [qualityMessage, setQualityMessage] = useState("Aguardando deteccao...");
  const lastAutoSavedRef = useRef<{ value: number; at: number } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    // Remove apenas SWs antigos; nao apaga toda a CacheStorage (evita efeito colateral em dev).
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((r) => r.unregister().catch(() => undefined));
    });
  }, []);

  useEffect(() => {
    const c = searchParams.get("camera");
    if (c === "environment") setCameraFacing("environment");
    else if (c === "user") setCameraFacing("user");
  }, [searchParams]);

  useEffect(() => {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as string[];
        setHistory(parsed.slice(0, 8));
      } catch {
        setHistory([]);
      }
    }
  }, []);

  const handleDetection = useCallback(
    (result: FaceDetectorOutput | null) => {
      if (!result) {
        setEyeCenters(null);
        setPdMm(null);
        return;
      }

      setEyeCenters({ left: result.left, right: result.right });
      setConfidence(result.confidence);

      const nextMm = result.pdPx / pxPerMm;
      setPdMm(nextMm);
      setMeasureWindow((prev) => [...prev.slice(-19), nextMm]);
    },
    [pxPerMm]
  );

  const precision = useMemo(() => {
    const stability = calculateStability(measureWindow);
    if (confidence > 0.88 && stability < 0.7) return "alta";
    if (confidence > 0.75 && stability < 1.4) return "media";
    return "baixa";
  }, [confidence, measureWindow]);

  useEffect(() => {
    if (!pdMm) {
      setQualityMessage("Centralize o rosto para iniciar a medicao.");
      return;
    }

    if (precision === "alta") {
      setQualityMessage("Medição boa: rosto bem posicionado e leitura estável.");
      return;
    }

    if (precision === "media") {
      setQualityMessage("Medição aceitável: ajuste levemente o posicionamento para melhorar.");
      return;
    }

    setQualityMessage("Medição ruim: aproxime o rosto e mantenha-se parado.");
  }, [pdMm, precision]);

  const saveMeasurement = () => {
    if (!pdMm) return;
    const item = `${new Date().toLocaleString("pt-BR")} - ${pdMm.toFixed(1)} mm`;
    const next = [item, ...history].slice(0, 8);
    setHistory(next);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  };

  useEffect(() => {
    if (!pdMm || precision !== "alta") return;

    const now = Date.now();
    const last = lastAutoSavedRef.current;
    const isSameValue = last ? Math.abs(last.value - pdMm) < 0.2 : false;
    const isTooSoon = last ? now - last.at < 6000 : false;
    if (isSameValue && isTooSoon) return;

    const item = `${new Date().toLocaleString("pt-BR")} - ${pdMm.toFixed(1)} mm (auto)`;
    const next = [item, ...history].slice(0, 8);
    setHistory(next);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    lastAutoSavedRef.current = { value: pdMm, at: now };
  }, [history, pdMm, precision]);

  return (
    <>
      <main
        className="min-h-screen bg-bg px-4 py-6 pb-40"
        style={{
          minHeight: "100vh",
          backgroundColor: "#09090b",
          color: "#e2e8f0",
          paddingBottom: "10rem"
        }}
      >
        <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
          <header className="text-center" style={{ textAlign: "center" }}>
            <h1
              className="text-3xl font-bold tracking-tight text-cyan-300"
              style={{ color: "#67e8f9", fontSize: "1.75rem", margin: "0 0 0.25rem 0" }}
            >
              Pupilometro Digital
            </h1>
            <p className="mt-1 text-sm text-slate-400" style={{ color: "#94a3b8", margin: 0 }}>
              Medicao local da distancia pupilar (PD)
            </p>
          </header>

          <section className="glass rounded-3xl p-2 sm:p-3" style={{ opacity: 1 }}>
            <Camera
              facing={cameraFacing}
              onFacingChange={setCameraFacing}
              onVideoReady={setVideo}
              eyeCenters={eyeCenters}
              guidanceText={status}
            />
          </section>

          {video && <FaceDetector video={video} onDetection={handleDetection} onStatus={setStatus} />}

          <Calibration pxPerMm={pxPerMm} onChange={setPxPerMm} />
          <ResultDisplay
            pdMm={pdMm}
            precision={precision}
            qualityMessage={qualityMessage}
            history={history}
            onSave={saveMeasurement}
          />

          <div className="rounded-2xl border border-slate-800 bg-soft p-3 text-xs text-slate-400">
            Processamento 100% local no navegador. Nenhuma imagem e enviada ou armazenada.
          </div>
        </div>
      </main>

    </>
  );
}
