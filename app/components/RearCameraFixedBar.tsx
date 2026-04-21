"use client";

import type { FacingMode } from "./Camera";

type Props = {
  facing: FacingMode;
  onRear: () => void;
  onFront: () => void;
};

/**
 * Barra fixa no rodape com estilos INLINE — nao depende de Tailwind para aparecer.
 * Resolve casos em que botoes no fluxo da pagina nao aparecem (cache, CSS, etc.).
 */
export default function RearCameraFixedBar({ facing, onRear, onFront }: Props) {
  return (
    <div
      role="toolbar"
      aria-label="Selecao de camera"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2147483647,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: 14,
        paddingBottom: "max(14px, env(safe-area-inset-bottom, 14px))",
        backgroundColor: "rgba(2, 6, 23, 0.97)",
        borderTop: "4px solid #22d3ee",
        boxShadow: "0 -12px 40px rgba(0, 0, 0, 0.65)"
      }}
    >
      <p
        style={{
          margin: 0,
          textAlign: "center",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#a5f3fc"
        }}
      >
        Escolha a camera
      </p>
      <button
        type="button"
        onClick={onRear}
        style={{
          width: "100%",
          minHeight: 58,
          borderRadius: 14,
          border: facing === "environment" ? "3px solid #fef08a" : "2px solid #0891b2",
          backgroundColor: "#06b6d4",
          color: "#020617",
          fontSize: 18,
          fontWeight: 900,
          letterSpacing: 0.3,
          cursor: "pointer",
          WebkitTapHighlightColor: "transparent"
        }}
      >
        CAMERA TRASEIRA
      </button>
      <button
        type="button"
        onClick={onFront}
        style={{
          width: "100%",
          minHeight: 50,
          borderRadius: 12,
          border: facing === "user" ? "3px solid #fef08a" : "2px solid #475569",
          backgroundColor: "#1e293b",
          color: "#f8fafc",
          fontSize: 16,
          fontWeight: 700,
          cursor: "pointer",
          WebkitTapHighlightColor: "transparent"
        }}
      >
        Camera frontal (selfie)
      </button>
    </div>
  );
}
