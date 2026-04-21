"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type CameraProps = {
  onVideoReady: (video: HTMLVideoElement | null) => void;
  eyeCenters: { left: { x: number; y: number }; right: { x: number; y: number } } | null;
  guidanceText: string;
};

export default function Camera({ onVideoReady, eyeCenters, guidanceText }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          onVideoReady(videoRef.current);
          setIsReady(true);
          setError(null);
        }
      } catch {
        setError("Nao foi possivel acessar a camera. Verifique as permissoes.");
      }
    };

    startCamera();

    return () => {
      onVideoReady(null);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [onVideoReady]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-black shadow-glow">
      <video ref={videoRef} muted playsInline className="h-[420px] w-full object-cover" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 gap-10">
          <div className="h-16 w-16 rounded-full border-2 border-cyan-300/70" />
          <div className="h-16 w-16 rounded-full border-2 border-cyan-300/70" />
        </div>

        {eyeCenters && (
          <>
            <motion.div
              className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime-300"
              style={{ left: `${eyeCenters.left.x}px`, top: `${eyeCenters.left.y}px` }}
              initial={{ scale: 0.6, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
            <motion.div
              className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime-300"
              style={{ left: `${eyeCenters.right.x}px`, top: `${eyeCenters.right.y}px` }}
              initial={{ scale: 0.6, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          </>
        )}
      </div>

      <div className="glass absolute bottom-3 left-3 right-3 rounded-xl px-4 py-3 text-sm text-slate-200">
        {error ? error : isReady ? guidanceText : "Iniciando camera..."}
      </div>
    </div>
  );
}
