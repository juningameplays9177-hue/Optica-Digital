"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as faceapi from "face-api.js";

export type FaceDetectorOutput = {
  left: { x: number; y: number };
  right: { x: number; y: number };
  pdPx: number;
  confidence: number;
};

type FaceDetectorProps = {
  video: HTMLVideoElement | null;
  onDetection: (result: FaceDetectorOutput | null) => void;
  onStatus: (status: string) => void;
};

const MODEL_URL = "https://justadudewhohacks.github.io/face-api.js/models";

export default function FaceDetector({ video, onDetection, onStatus }: FaceDetectorProps) {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const rafRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  const detectorOptions = useMemo(
    () =>
      new faceapi.TinyFaceDetectorOptions({
        inputSize: 416,
        scoreThreshold: 0.35
      }),
    []
  );

  useEffect(() => {
    isMountedRef.current = true;

    const load = async () => {
      onStatus("Carregando modelos de deteccao...");
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL)
      ]);
      if (!isMountedRef.current) return;
      setModelsLoaded(true);
      onStatus("Centralize seu rosto");
    };

    load().catch(() => onStatus("Falha ao carregar modelos de deteccao"));

    return () => {
      isMountedRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [onStatus]);

  useEffect(() => {
    if (!modelsLoaded || !video) return;

    const detect = async () => {
      if (video.readyState < 2) {
        rafRef.current = requestAnimationFrame(detect);
        return;
      }

      const detection = await faceapi
        .detectSingleFace(video, detectorOptions)
        .withFaceLandmarks(true);

      if (!detection) {
        onDetection(null);
        onStatus("Rosto nao detectado. Centralize seu rosto");
        rafRef.current = requestAnimationFrame(detect);
        return;
      }

      const leftEye = detection.landmarks.getLeftEye();
      const rightEye = detection.landmarks.getRightEye();

      if (!leftEye.length || !rightEye.length) {
        onDetection(null);
        onStatus("Olhos nao detectados");
        rafRef.current = requestAnimationFrame(detect);
        return;
      }

      const center = (points: faceapi.Point[]) => {
        const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
        return { x: sum.x / points.length, y: sum.y / points.length };
      };

      const left = center(leftEye);
      const right = center(rightEye);
      const pdPx = Math.hypot(right.x - left.x, right.y - left.y);

      onDetection({
        left,
        right,
        pdPx,
        confidence: detection.detection.score
      });
      onStatus("Rosto detectado. Mantenha-se estavel");
      rafRef.current = requestAnimationFrame(detect);
    };

    rafRef.current = requestAnimationFrame(detect);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [detectorOptions, modelsLoaded, onDetection, onStatus, video]);

  return null;
}
