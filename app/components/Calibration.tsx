"use client";

import { motion } from "framer-motion";
import { useState } from "react";

type CalibrationProps = {
  pxPerMm: number;
  onChange: (next: number) => void;
};

export default function Calibration({ pxPerMm, onChange }: CalibrationProps) {
  const [cardPixels, setCardPixels] = useState("300");

  const applyCardCalibration = () => {
    const px = Number(cardPixels);
    if (!Number.isFinite(px) || px <= 0) return;
    onChange(px / 85.6);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-4"
    >
      <h2 className="mb-2 text-lg font-semibold">Calibracao</h2>
      <p className="mb-3 text-sm text-slate-300">
        Insira a largura do cartao em pixels para melhorar a precisao. Valor real do cartao: 85.6 mm.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="number"
          value={cardPixels}
          onChange={(e) => setCardPixels(e.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-soft px-3 py-2 text-sm outline-none focus:border-cyan-400"
          placeholder="Largura do cartao em px"
        />
        <button
          onClick={applyCardCalibration}
          className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-cyan-400"
        >
          Aplicar Cartao
        </button>
      </div>
      <p className="mt-3 text-xs text-slate-400">Escala atual: {pxPerMm.toFixed(2)} px/mm</p>
    </motion.section>
  );
}
