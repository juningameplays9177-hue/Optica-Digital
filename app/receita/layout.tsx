import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Receituário — Pupilômetro Digital",
  description: "Ficha de receita com DNP sugerido a partir da distância pupilar medida localmente."
};

export default function ReceitaLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen font-sans antialiased">{children}</div>;
}
