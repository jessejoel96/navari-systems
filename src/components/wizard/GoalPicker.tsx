"use client";

import { useMemo, useState } from "react";
import { MultiCard } from "./MultiCard";
import {
  GOAL_GROUPS,
  visibleGoalOptions,
  type ProgressiveGroup,
} from "@/lib/discovery/option-groups";
import type { WizardTheme } from "./theme";

type Props = {
  selected: string[];
  onToggle: (value: string) => void;
  theme?: WizardTheme;
};

export function GoalPicker({ selected, onToggle, theme = "cyan" }: Props) {
  const [showAll, setShowAll] = useState(false);
  const { groups, showMoreHint } = useMemo(
    () => (showAll ? { groups: GOAL_GROUPS, showMoreHint: false } : visibleGoalOptions(selected)),
    [selected, showAll]
  );

  return (
    <div className="space-y-6">
      {groups.map((group: ProgressiveGroup) => (
        <div key={group.id}>
          <p className="text-xs font-mono uppercase tracking-widest text-cyan-400/70 mb-2.5">
            {group.label}
          </p>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {group.options.map((g) => (
              <MultiCard
                key={g}
                label={g}
                selected={selected.includes(g)}
                onClick={() => onToggle(g)}
                theme={theme}
              />
            ))}
          </div>
        </div>
      ))}
      {showMoreHint ? (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="w-full text-center text-sm text-cyan-400/90 hover:text-cyan-300 py-2.5 border border-dashed border-white/15 rounded-xl"
        >
          Show more goal categories
        </button>
      ) : null}
    </div>
  );
}
