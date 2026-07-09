"use client";

import type { WizardTheme } from "./theme";

const spinner: Record<WizardTheme, string> = {
  gold: "border-gold/20 border-t-gold",
  cyan: "border-cyan-400/20 border-t-cyan-400",
};

type Props = {
  title: string;
  sub: string;
  theme?: WizardTheme;
};

export function LoadingScreen({ title, sub, theme = "gold" }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className={`w-10 h-10 border-2 rounded-full animate-spin mb-6 ${spinner[theme]}`} />
      <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
      <p className="text-white/50 text-sm max-w-sm">{sub}</p>
    </div>
  );
}
