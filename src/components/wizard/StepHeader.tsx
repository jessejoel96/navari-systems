"use client";

import type { WizardTheme } from "./theme";

const accent: Record<WizardTheme, string> = {
  gold: "text-gold/70",
  cyan: "text-cyan-400/80",
};

const bar: Record<WizardTheme, string> = {
  gold: "bg-gold",
  cyan: "bg-cyan-400",
};

type Props = {
  title: string;
  subtitle?: string;
  progress: number;
  minutesLeft?: number;
  theme?: WizardTheme;
};

export function StepHeader({ title, subtitle, progress, minutesLeft, theme = "gold" }: Props) {
  return (
    <header className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between gap-3">
        <span className={`text-[11px] sm:text-xs font-mono tracking-widest uppercase ${accent[theme]}`}>
          {minutesLeft != null ? `~${minutesLeft} min left` : "Consultation"}
        </span>
        <span className="text-[11px] sm:text-xs font-mono text-white/40 shrink-0">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full ${bar[theme]} transition-all duration-500`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="pt-1 sm:pt-2 space-y-2">
        <h2
          className="text-xl sm:text-3xl font-bold text-white leading-snug sm:leading-tight tracking-tight break-words"
          style={{ fontFamily: "var(--font-audiowide), var(--font-roboto), sans-serif" }}
        >
          {title}
        </h2>
        {subtitle ? (
          <p className="text-sm sm:text-base text-white/60 leading-relaxed max-w-prose">
            {subtitle}
          </p>
        ) : null}
      </div>
    </header>
  );
}
