"use client";

import { motion } from "framer-motion";
import { useEffect, useReducer, useRef, useState } from "react";

export type FacingMode = "user" | "environment";

type CameraProps = {
  onVideoReady: (video: HTMLVideoElement | null) => void;
  eyeCenters: { left: { x: number; y: number }; right: { x: number; y: number } } | null;
  guidanceText: string;
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

  // Câmera traseira: alguns aparelhos ignoram facingMode até termos deviceId
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
        /* segue com lista possivelmente sem label */
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

  // Frontal: último recurso sem facingMode (alguns desktops)
  return navigator.mediaDevices.getUserMedia({
    video: { ...VIDEO_OPTS },
    audio: false
  });
}

export default function Camera({ onVideoReady, eyeCenters, guidanceText }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [facing, setFacing] = useState<FacingMode>("user");
  /**
   * Muitos celulares já entregam a frontal já espelhada; espelhar de novo deixa invertido.
   * Começa desligado — o usuário usa "Espelhar" se precisar (ex.: webcam de notebook).
   */
  const [flipHorizontal, setFlipHorizontal] = useState(false);
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
  }, [bumpOverlay, facing, onVideoReady]);

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

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-black shadow-glow">
      <div ref={frameRef} className="relative h-[420px] w-full">
        <video
          ref={videoRef}
          muted
          playsInline
          className={`h-full w-full object-cover ${mirrorDisplay ? "scale-x-[-1]" : ""}`}
          onLoadedMetadata={bumpOverlay}
        />

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 gap-10">
            <div className="h-16 w-16 rounded-full border-2 border-cyan-300/70" />
            <div className="h-16 w-16 rounded-full border-2 border-cyan-300/70" />
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

      </div>

      {/* Controles sempre visíveis: mesma lógica de captura/detecção para frontal e traseira */}
      <div className="border-t border-slate-800 bg-panel/90 px-3 py-3">
        <p className="mb-2 text-center text-[11px] font-medium uppercase tracking-wide text-slate-500">
          Escolha a camera
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFacing("user")}
            className={`min-h-[48px] flex-1 rounded-2xl border-2 px-2 py-3 text-sm font-bold transition ${
              facing === "user"
                ? "border-cyan-400 bg-cyan-500/20 text-cyan-100 shadow-[0_0_0_1px_rgba(34,211,238,0.35)]"
                : "border-slate-700 bg-soft text-slate-300 hover:border-slate-500"
            }`}
          >
            Camera frontal
            <span className="mt-0.5 block text-[11px] font-normal text-slate-400">Selfie</span>
          </button>
          <button
            type="button"
            onClick={() => setFacing("environment")}
            className={`min-h-[48px] flex-1 rounded-2xl border-2 px-2 py-3 text-sm font-bold transition ${
              facing === "environment"
                ? "border-cyan-400 bg-cyan-500/20 text-cyan-100 shadow-[0_0_0_1px_rgba(34,211,238,0.35)]"
                : "border-slate-700 bg-soft text-slate-300 hover:border-slate-500"
            }`}
          >
            Camera traseira
            <span className="mt-0.5 block text-[11px] font-normal text-slate-400">Verso do celular</span>
          </button>
        </div>
        <button
          type="button"
          onClick={() => setFlipHorizontal((v) => !v)}
          className="mt-2 w-full rounded-xl border border-slate-600 bg-soft py-2.5 text-xs font-semibold text-slate-200 transition hover:border-slate-500"
        >
          {flipHorizontal ? "Desligar espelho da imagem" : "Espelhar imagem (opcional)"}
        </button>
      </div>

      <div className="glass rounded-b-3xl px-4 py-3 text-sm text-slate-200">
        {error ? error : isReady ? guidanceText : "Iniciando camera..."}
      </div>
    </div>
  );
}
