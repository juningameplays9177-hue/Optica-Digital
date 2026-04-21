"use client";

import { motion } from "framer-motion";
import { useEffect, useReducer, useRef, useState } from "react";

export type FacingMode = "user" | "environment";

type CameraProps = {
  onVideoReady: (video: HTMLVideoElement | null) => void;
  eyeCenters: { left: { x: number; y: number }; right: { x: number; y: number } } | null;
  guidanceText: string;
  /** Controlado pela pagina para garantir botoes sempre visiveis fora do preview */
  facing: FacingMode;
  onFacingChange: (next: FacingMode) => void;
};

/**
 * Converte coordenadas do frame (face-api) para pixels na área exibida com object-fit: cover.
 * Quando o vídeo está espelhado (scaleX -1), aplica o mesmo espelhamento nas coordenadas X.
 */
function mapVideoPointToOverlay(
  video: HTMLVideoElement,
  vx: number,
  vy: number,
  mirrorForDisplay: boolean
): { x: number; y: number } {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) return { x: 0, y: 0 };

  const ew = video.clientWidth;
  const eh = video.clientHeight;
  const scale = Math.max(ew / vw, eh / vh);
  const displayedW = vw * scale;
  const displayedH = vh * scale;
  const offsetX = (ew - displayedW) / 2;
  const offsetY = (eh - displayedH) / 2;

  let x = offsetX + vx * scale;
  const y = offsetY + vy * scale;

  if (mirrorForDisplay) {
    x = ew - x;
  }

  return { x, y };
}

const VIDEO_OPTS = { width: { ideal: 1280 }, height: { ideal: 720 } };

async function openCameraStream(facing: FacingMode): Promise<MediaStream> {
  const attempts: MediaStreamConstraints[] = [
    { video: { ...VIDEO_OPTS, facingMode: { ideal: facing } }, audio: false },
    { video: { ...VIDEO_OPTS, facingMode: { exact: facing } }, audio: false }
  ];

  for (const c of attempts) {
    try {
      return await navigator.mediaDevices.getUserMedia(c);
    } catch {
      /* tenta próxima */
    }
  }

  if (facing === "environment") {
    let devices = await navigator.mediaDevices.enumerateDevices();
    let videos = devices.filter((d) => d.kind === "videoinput");

    if (videos.length && videos.every((d) => !d.label)) {
      try {
        const warm = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        warm.getTracks().forEach((t) => t.stop());
        devices = await navigator.mediaDevices.enumerateDevices();
        videos = devices.filter((d) => d.kind === "videoinput");
      } catch {
        /* segue */
      }
    }

    const ranked = [...videos].sort((a, b) => {
      const score = (id: MediaDeviceInfo) => {
        const L = id.label.toLowerCase();
        if (/back|rear|traseira|wide|environment|world/i.test(L)) return 2;
        if (id.label) return 0;
        return -1;
      };
      return score(b) - score(a);
    });

    for (const d of ranked) {
      try {
        return await navigator.mediaDevices.getUserMedia({
          video: { ...VIDEO_OPTS, deviceId: { exact: d.deviceId } },
          audio: false
        });
      } catch {
        /* próximo deviceId */
      }
    }
    throw new Error("Camera traseira indisponivel");
  }

  return navigator.mediaDevices.getUserMedia({
    video: { ...VIDEO_OPTS },
    audio: false
  });
}

const btnBase =
  "min-h-[52px] flex-1 rounded-xl px-2 py-2 text-center text-sm font-bold leading-tight transition active:scale-[0.98]";

export default function Camera({
  onVideoReady,
  eyeCenters,
  guidanceText,
  facing,
  onFacingChange
}: CameraProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [, bumpOverlay] = useReducer((n: number) => n + 1, 0);

  const mirrorDisplay = flipHorizontal;

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        setIsReady(false);
        setError(null);

        stream = await openCameraStream(facing);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          onVideoReady(videoRef.current);
          setIsReady(true);
          bumpOverlay();
        }
      } catch {
        setError("Nao foi possivel acessar a camera. Verifique as permissoes.");
        setIsReady(false);
      }
    };

    startCamera();

    return () => {
      onVideoReady(null);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [bumpOverlay, facing, onVideoReady, retryKey]);

  useEffect(() => {
    const el = frameRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => bumpOverlay());
    ro.observe(el);
    return () => ro.disconnect();
  }, [bumpOverlay]);

  const video = videoRef.current;
  let leftDot: { x: number; y: number } | null = null;
  let rightDot: { x: number; y: number } | null = null;

  if (video && eyeCenters && video.videoWidth > 0) {
    leftDot = mapVideoPointToOverlay(video, eyeCenters.left.x, eyeCenters.left.y, mirrorDisplay);
    rightDot = mapVideoPointToOverlay(video, eyeCenters.right.x, eyeCenters.right.y, mirrorDisplay);
  }

  const activeRing = "border-2 border-cyan-400 bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.45)]";
  const idleRing = "border-2 border-slate-600 bg-slate-900/90 text-slate-100 hover:border-cyan-500/60";

  return (
    <div className="relative overflow-visible rounded-3xl border border-slate-800 bg-black shadow-glow">
      <div ref={frameRef} className="relative h-[min(55vh,420px)] min-h-[280px] w-full overflow-hidden rounded-t-3xl">
        <video
          ref={videoRef}
          muted
          playsInline
          className={`h-full w-full object-cover ${mirrorDisplay ? "scale-x-[-1]" : ""}`}
          onLoadedMetadata={bumpOverlay}
        />

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

          <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 gap-8 sm:gap-10">
            <div className="h-14 w-14 rounded-full border-2 border-cyan-400/80 sm:h-16 sm:w-16" />
            <div className="h-14 w-14 rounded-full border-2 border-cyan-400/80 sm:h-16 sm:w-16" />
          </div>

          {leftDot && rightDot && (
            <>
              <motion.div
                className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime-300"
                style={{ left: `${leftDot.x}px`, top: `${leftDot.y}px` }}
                initial={{ scale: 0.6, opacity: 0.6 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
              <motion.div
                className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime-300"
                style={{ left: `${rightDot.x}px`, top: `${rightDot.y}px` }}
                initial={{ scale: 0.6, opacity: 0.6 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
            </>
          )}
        </div>

        {/* Botões sobre o preview: sempre visíveis (mesmo com tela preta / erro de permissão) */}
        <div className="pointer-events-auto absolute bottom-0 left-0 right-0 z-[100] p-2 sm:p-3">
          <p className="mb-1.5 text-center text-[10px] font-bold uppercase tracking-wider text-cyan-200/90 drop-shadow">
            Escolha a camera para o exame
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              aria-pressed={facing === "user"}
              onClick={() => onFacingChange("user")}
              className={`${btnBase} ${facing === "user" ? activeRing : idleRing}`}
            >
              Frontal
              <span className="mt-0.5 block text-[10px] font-semibold opacity-90">Selfie</span>
            </button>
            <button
              type="button"
              aria-pressed={facing === "environment"}
              onClick={() => onFacingChange("environment")}
              className={`${btnBase} ${facing === "environment" ? activeRing : idleRing}`}
            >
              Traseira
              <span className="mt-0.5 block text-[10px] font-semibold opacity-90">Exame</span>
            </button>
          </div>
          <button
            type="button"
            onClick={() => setFlipHorizontal((v) => !v)}
            className="mt-2 w-full rounded-lg border border-slate-500/80 bg-black/55 py-2 text-[11px] font-semibold text-slate-100 backdrop-blur hover:bg-black/70"
          >
            {flipHorizontal ? "Desligar espelho" : "Espelhar imagem (opcional)"}
          </button>
        </div>
      </div>

      <div className="glass rounded-b-3xl border-t border-slate-800 px-3 py-3 text-sm text-slate-200">
        <p className="text-center">{error ? error : isReady ? guidanceText : "Iniciando camera..."}</p>
        {error && (
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => setRetryKey((k) => k + 1)}
              className="rounded-xl bg-cyan-500 px-4 py-2.5 text-center text-sm font-bold text-black hover:bg-cyan-400"
            >
              Tentar novamente
            </button>
            <button
              type="button"
              onClick={() => {
                onFacingChange("environment");
                setRetryKey((k) => k + 1);
              }}
              className="rounded-xl border-2 border-cyan-400 bg-transparent px-4 py-2.5 text-center text-sm font-bold text-cyan-200 hover:bg-cyan-500/10"
            >
              Usar camera traseira e tentar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
