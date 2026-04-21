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
 * Converte coordenadas do frame do vídeo (face-api) para pixels na área exibida
 * com object-fit: cover. Na frontal, espelha no eixo X para coincidir com scaleX(-1).
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

export default function Camera({ onVideoReady, eyeCenters, guidanceText }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [facing, setFacing] = useState<FacingMode>("user");
  const [, bumpOverlay] = useReducer((n: number) => n + 1, 0);

  const mirrorDisplay = facing === "user";

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        setIsReady(false);
        setError(null);

        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });

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

        <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setFacing((f) => (f === "user" ? "environment" : "user"))}
            className="pointer-events-auto rounded-xl border border-slate-600 bg-black/60 px-3 py-2 text-xs font-semibold text-slate-100 shadow-lg backdrop-blur transition hover:bg-black/80"
          >
            {facing === "user" ? "Camera traseira" : "Camera frontal"}
          </button>
        </div>
      </div>

      <div className="glass absolute bottom-3 left-3 right-3 rounded-xl px-4 py-3 text-sm text-slate-200">
        {error ? error : isReady ? guidanceText : "Iniciando camera..."}
      </div>
    </div>
  );
}
