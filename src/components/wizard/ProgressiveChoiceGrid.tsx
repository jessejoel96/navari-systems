"use client";

import { useState } from "react";
import { ChoiceCard } from "./ChoiceCard";
import { MultiCard } from "./MultiCard";
import type { WizardTheme } from "./theme";

type SingleProps = {
  mode: "single";
  options: readonly string[];
  moreOptions?: readonly string[];
  selected: string;
  onSelect: (value: string) => void;
  theme?: WizardTheme;
  /** Auto-advance after select (parent handles navigation). */
  showMoreLabel?: string;
};

type MultiProps = {
  mode: "multi";
  options: readonly string[];
  moreOptions?: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
  theme?: WizardTheme;
  showMoreLabel?: string;
  /** Force expanded when a selected value is in moreOptions */
  forceExpand?: boolean;
};

type Props = SingleProps | MultiProps;

function shouldStartExpanded(
  moreOptions: readonly string[] | undefined,
  selected: string | string[]
): boolean {
  if (!moreOptions?.length) return false;
  if (Array.isArray(selected)) {
    return selected.some((s) => moreOptions.includes(s));
  }
  return moreOptions.includes(selected);
}

export function ProgressiveChoiceGrid(props: Props) {
  const moreOptions = props.moreOptions ?? [];
  const [expanded, setExpanded] = useState(() =>
    shouldStartExpanded(moreOptions, props.mode === "single" ? props.selected : props.selected)
  );

  const visible = expanded ? [...props.options, ...moreOptions] : [...props.options];
  const showToggle = moreOptions.length > 0 && !expanded;
  const label = props.showMoreLabel ?? `Show ${moreOptions.length} more options`;

  return (
    <div className="space-y-4">
      <div
        className={
          props.mode === "multi"
            ? "grid grid-cols-2 gap-2.5 sm:gap-3"
            : "grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3"
        }
      >
        {props.mode === "single"
          ? visible.map((opt) => (
              <ChoiceCard
                key={opt}
                label={opt}
                selected={props.selected === opt}
                onClick={() => props.onSelect(opt)}
                theme={props.theme}
              />
            ))
          : visible.map((opt) => (
              <MultiCard
                key={opt}
                label={opt}
                selected={props.selected.includes(opt)}
                onClick={() => props.onToggle(opt)}
                theme={props.theme}
              />
            ))}
      </div>
      {showToggle ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="w-full text-center text-sm text-cyan-400/90 hover:text-cyan-300 py-2 border border-dashed border-white/15 rounded-xl"
        >
          {label}
        </button>
      ) : null}
    </div>
  );
}
