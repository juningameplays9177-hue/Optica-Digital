"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Calibration from "./components/Calibration";
import Camera from "./components/Camera";
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

export default function HomePage() {
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

  const saveMeasurement = () => {
    if (!pdMm) return;
    const item = `${new Date().toLocaleString("pt-BR")} - ${pdMm.toFixed(1)} mm`;
    const next = [item, ...history].slice(0, 8);
    setHistory(next);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  };

  return (
    <main className="min-h-screen bg-bg px-4 py-6">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
        <header className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-cyan-300">Pupilometro Digital</h1>
          <p className="mt-1 text-sm text-slate-400">Medicao local da distancia pupilar (PD)</p>
        </header>

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-3"
        >
          <Camera onVideoReady={setVideo} eyeCenters={eyeCenters} guidanceText={status} />
        </motion.section>

        {video && <FaceDetector video={video} onDetection={handleDetection} onStatus={setStatus} />}

        <Calibration pxPerMm={pxPerMm} onChange={setPxPerMm} />
        <ResultDisplay pdMm={pdMm} precision={precision} history={history} onSave={saveMeasurement} />

        <div className="rounded-2xl border border-slate-800 bg-soft p-3 text-xs text-slate-400">
          Processamento 100% local no navegador. Nenhuma imagem e enviada ou armazenada.
        </div>
      </div>
    </main>
  );
}
