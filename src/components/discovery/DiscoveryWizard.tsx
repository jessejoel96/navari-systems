"use client";

import { useReducer, useEffect, useRef, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChoiceCard } from "@/components/wizard/ChoiceCard";
import { StepHeader } from "@/components/wizard/StepHeader";
import { LoadingScreen } from "@/components/wizard/LoadingScreen";
import { ProgressiveChoiceGrid } from "@/components/wizard/ProgressiveChoiceGrid";
import { GoalPicker } from "@/components/wizard/GoalPicker";
import { DiscoverySummaryScreen } from "./DiscoverySummaryScreen";
import { GoogleCalendarButton } from "./GoogleCalendarButton";
import type { DiscoveryAnswers, DiscoverySummary, DynamicQuestion } from "@/lib/discovery/types";
import {
  AI_MATURITY,
  AUTHORITY_GOAL,
  AVERAGE_SALE,
  BRAND_RECOGNITION,
  BUDGET_RANGES,
  BUSINESS_STAGES,
  CLIENT_CHALLENGES,
  CONTENT_FREQUENCY,
  REVENUE_RANGES,
  SALES_CHANNELS,
  TEAM_SIZES,
  URGENCY,
} from "@/lib/discovery/options";
import {
  BUSINESS_TYPE_MORE,
  BUSINESS_TYPE_PRIMARY,
  PLATFORM_MORE,
  PLATFORM_PRIMARY,
  TIME_WASTER_MORE,
  TIME_WASTER_PRIMARY,
  TOOL_MORE,
  TOOL_PRIMARY,
  fieldsForBusinessType,
} from "@/lib/discovery/option-groups";

const THEME = "cyan" as const;

type Step =
  | "welcome"
  | "businessType"
  | "businessField"
  | "businessStage"
  | "teamSize"
  | "country"
  | "revenue"
  | "goals"
  | "clientChallenge"
  | "loadingDynamic"
  | "dynamic0"
  | "dynamic1"
  | "dynamic2"
  | "brandRecognition"
  | "contentFrequency"
  | "authorityGoal"
  | "platforms"
  | "salesChannel"
  | "averageSale"
  | "timeWasters"
  | "aiMaturity"
  | "tools"
  | "budget"
  | "urgency"
  | "contact"
  | "loadingComplete"
  | "summaryReview"
  | "additionalDetails"
  | "result";

type State = DiscoveryAnswers & {
  step: Step;
  direction: 1 | -1;
  recordId: string | null;
  sessionId: string | null;
  publicToken: string | null;
  dynamicIndex: number;
  summary: DiscoverySummary | null;
  error: string;
};

const emptyAnswers: DiscoveryAnswers = {
  businessType: "",
  businessField: "",
  businessStage: "",
  clientChallenge: "",
  teamSize: "",
  country: "",
  revenue: "",
  goals: [],
  dynamicQuestions: [],
  dynamicAnswers: [],
  brandRecognition: "",
  contentFrequency: "",
  authorityGoal: "",
  platforms: [],
  salesChannel: "",
  averageSale: "",
  timeWasters: [],
  aiMaturity: "",
  tools: [],
  budget: "",
  urgency: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
  additionalDetails: "",
  wantsProposal: false,
};

const initial: State = {
  ...emptyAnswers,
  step: "welcome",
  direction: 1,
  recordId: null,
  sessionId: null,
  publicToken: null,
  dynamicIndex: 0,
  summary: null,
  error: "",
};

type Action =
  | { type: "SET_STEP"; step: Step; direction?: 1 | -1 }
  | { type: "SET_FIELD"; key: keyof DiscoveryAnswers; value: unknown }
  | { type: "TOGGLE_MULTI"; key: "goals" | "platforms" | "timeWasters" | "tools"; value: string }
  | { type: "SET_SESSION"; recordId: string; sessionId: string; publicToken: string }
  | { type: "SET_DYNAMIC"; questions: DynamicQuestion[] }
  | { type: "SET_DYNAMIC_ANSWER"; index: number; value: string }
  | { type: "SET_COMPLETE"; summary: DiscoverySummary }
  | { type: "SET_ERROR"; error: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.step, direction: action.direction ?? 1, error: "" };
    case "SET_FIELD":
      return { ...state, [action.key]: action.value };
    case "TOGGLE_MULTI": {
      const arr = state[action.key];
      const next = arr.includes(action.value)
        ? arr.filter((v) => v !== action.value)
        : [...arr, action.value];
      return { ...state, [action.key]: next };
    }
    case "SET_SESSION":
      return {
        ...state,
        recordId: action.recordId,
        sessionId: action.sessionId,
        publicToken: action.publicToken,
      };
    case "SET_DYNAMIC":
      return { ...state, dynamicQuestions: action.questions, dynamicAnswers: [] };
    case "SET_DYNAMIC_ANSWER": {
      const dynamicAnswers = [...state.dynamicAnswers];
      dynamicAnswers[action.index] = action.value;
      return { ...state, dynamicAnswers };
    }
    case "SET_COMPLETE":
      return { ...state, summary: action.summary };
    case "SET_ERROR":
      return { ...state, error: action.error };
    default:
      return state;
  }
}

const VISIBLE: Step[] = [
  "welcome",
  "businessType",
  "businessField",
  "businessStage",
  "teamSize",
  "country",
  "revenue",
  "goals",
  "clientChallenge",
  "dynamic0",
  "dynamic1",
  "dynamic2",
  "brandRecognition",
  "contentFrequency",
  "authorityGoal",
  "platforms",
  "salesChannel",
  "averageSale",
  "timeWasters",
  "aiMaturity",
  "tools",
  "budget",
  "urgency",
  "contact",
  "summaryReview",
  "result",
];

function isPreRevenue(answers: DiscoveryAnswers): boolean {
  return (
    answers.businessStage.startsWith("Pre-revenue") ||
    answers.revenue.startsWith("Pre-revenue") ||
    answers.goals.includes("Get my first clients") ||
    answers.goals.includes("Not sure what I need yet")
  );
}

function needsClientChallenge(answers: DiscoveryAnswers): boolean {
  return (
    isPreRevenue(answers) ||
    answers.goals.includes("Define my offer & positioning") ||
    answers.goals.includes("Build credibility online")
  );
}

function afterGoalsStep(answers: DiscoveryAnswers): Step {
  return needsClientChallenge(answers) ? "clientChallenge" : "loadingDynamic";
}

function afterPlatformsStep(answers: DiscoveryAnswers): Step {
  return isPreRevenue(answers) ? "timeWasters" : "salesChannel";
}

function buildPayload(state: State): DiscoveryAnswers {
  const {
    step,
    direction,
    recordId,
    sessionId,
    publicToken,
    dynamicIndex,
    summary,
    error,
    ...answers
  } = state;
  return answers;
}

export default function DiscoveryWizard() {
  const [state, dispatch] = useReducer(reducer, initial);
  const topRef = useRef<HTMLDivElement>(null);

  const stepIndex = VISIBLE.indexOf(state.step);
  const progress = stepIndex >= 0 ? ((stepIndex + 1) / VISIBLE.length) * 100 : 0;
  const minutesLeft =
    stepIndex >= 0 ? Math.max(1, Math.ceil((VISIBLE.length - stepIndex) * 0.35)) : 6;

  const fieldOptions = useMemo(
    () => fieldsForBusinessType(state.businessType),
    [state.businessType]
  );

  const scrollTop = useCallback(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const goTo = useCallback(
    (step: Step, direction: 1 | -1 = 1) => {
      dispatch({ type: "SET_STEP", step, direction });
      setTimeout(scrollTop, 50);
    },
    [scrollTop]
  );

  useEffect(() => {
    if (state.step !== "loadingDynamic") return;

    async function load() {
      if (!state.sessionId) {
        dispatch({ type: "SET_ERROR", error: "Session not started" });
        goTo("welcome");
        return;
      }
      try {
        const res = await fetch("/api/discovery/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: state.sessionId, answers: buildPayload(state) }),
        });
        const data = await res.json();
        const questions = (data.questions ?? []) as DynamicQuestion[];
        dispatch({ type: "SET_DYNAMIC", questions });
        if (questions.length === 0) {
          goTo("brandRecognition");
        } else {
          goTo("dynamic0");
        }
      } catch {
        goTo("brandRecognition");
      }
    }

    load();
  }, [state.step]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (state.step !== "loadingComplete") return;

    async function complete() {
      if (!state.recordId || !state.sessionId) {
        dispatch({ type: "SET_ERROR", error: "Session expired. Please start again." });
        goTo("welcome");
        return;
      }
      try {
        const res = await fetch("/api/discovery/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recordId: state.recordId,
            sessionId: state.sessionId,
            publicToken: state.publicToken ?? undefined,
            answers: buildPayload(state),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          dispatch({
            type: "SET_ERROR",
            error: data.error ?? "We couldn't save your answers. Try again.",
          });
          goTo("contact");
          return;
        }
        dispatch({ type: "SET_COMPLETE", summary: data.summary });
        goTo("summaryReview");
      } catch {
        dispatch({ type: "SET_ERROR", error: "Network error. Please try again." });
        goTo("contact");
      }
    }

    complete();
  }, [state.step]); // eslint-disable-line react-hooks/exhaustive-deps

  async function startSession() {
    try {
      const res = await fetch("/api/discovery/session", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        dispatch({ type: "SET_ERROR", error: data.error ?? "Something went wrong. Try again." });
        return;
      }
      dispatch({
        type: "SET_SESSION",
        recordId: data.recordId,
        sessionId: data.sessionId,
        publicToken: data.publicToken,
      });
      goTo("businessType");
    } catch {
      dispatch({ type: "SET_ERROR", error: "Could not connect. Please refresh and try again." });
    }
  }

  function nextDynamic(fromStep: Step) {
    const idx = fromStep === "dynamic0" ? 0 : fromStep === "dynamic1" ? 1 : 2;
    const qCount = state.dynamicQuestions.length;
    if (idx + 1 < qCount) {
      goTo(fromStep === "dynamic0" ? "dynamic1" : "dynamic2");
    } else {
      goTo("brandRecognition");
    }
  }

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 28 : -28, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -28 : 28, opacity: 0 }),
  };

  return (
    <div ref={topRef} className="min-h-dvh bg-[#060b14] text-white pt-[7.5rem]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(14,165,233,0.12)_0%,_transparent_50%)] pointer-events-none" />
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-20">
        <AnimatePresence mode="wait" custom={state.direction}>
          <motion.div
            key={state.step}
            custom={state.direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22 }}
            className="space-y-1"
          >
            {state.step === "welcome" && <Welcome onStart={startSession} error={state.error} />}

            {state.step === "businessType" && (
              <>
                <StepHeader
                  title="What best describes your business?"
                  progress={progress}
                  minutesLeft={minutesLeft}
                  theme={THEME}
                />
                <ProgressiveChoiceGrid
                  mode="single"
                  options={BUSINESS_TYPE_PRIMARY}
                  moreOptions={BUSINESS_TYPE_MORE}
                  selected={state.businessType}
                  onSelect={(t) => {
                    dispatch({ type: "SET_FIELD", key: "businessType", value: t });
                    dispatch({ type: "SET_FIELD", key: "businessField", value: "" });
                    goTo("businessField");
                  }}
                  theme={THEME}
                  showMoreLabel="Show more business types"
                />
              </>
            )}

            {state.step === "businessField" && (
              <>
                <StepHeader
                  title="What is your field or specialty?"
                  subtitle={
                    state.businessType === "Consultancy"
                      ? "Common fields for consultancies"
                      : "Based on your business type"
                  }
                  progress={progress}
                  minutesLeft={minutesLeft}
                  theme={THEME}
                />
                <ProgressiveChoiceGrid
                  mode="single"
                  options={fieldOptions.slice(0, 8)}
                  moreOptions={fieldOptions.slice(8)}
                  selected={state.businessField}
                  onSelect={(t) => {
                    dispatch({ type: "SET_FIELD", key: "businessField", value: t });
                    goTo("businessStage");
                  }}
                  theme={THEME}
                />
                <Back onClick={() => goTo("businessType", -1)} />
              </>
            )}

            {state.step === "businessStage" && (
              <>
                <StepHeader
                  title="Where is your business today?"
                  subtitle="Pick what fits — early-stage is fine"
                  progress={progress}
                  minutesLeft={minutesLeft}
                  theme={THEME}
                />
                <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
                  {BUSINESS_STAGES.map((t) => (
                    <ChoiceCard
                      key={t}
                      label={t}
                      selected={state.businessStage === t}
                      onClick={() => {
                        dispatch({ type: "SET_FIELD", key: "businessStage", value: t });
                        if (t.startsWith("Pre-revenue")) {
                          dispatch({
                            type: "SET_FIELD",
                            key: "revenue",
                            value: "Pre-revenue / no revenue yet",
                          });
                        }
                        goTo("teamSize");
                      }}
                      theme={THEME}
                    />
                  ))}
                </div>
                <Back onClick={() => goTo("businessField", -1)} />
              </>
            )}

            {state.step === "teamSize" && (
              <>
                <StepHeader
                  title="How many people on the team?"
                  progress={progress}
                  minutesLeft={minutesLeft}
                  theme={THEME}
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  {TEAM_SIZES.map((t) => (
                    <ChoiceCard
                      key={t}
                      label={t}
                      selected={state.teamSize === t}
                      onClick={() => {
                        dispatch({ type: "SET_FIELD", key: "teamSize", value: t });
                        goTo("country");
                      }}
                      theme={THEME}
                    />
                  ))}
                </div>
                <Back onClick={() => goTo("businessStage", -1)} />
              </>
            )}

            {state.step === "country" && (
              <>
                <StepHeader
                  title="What country do you operate in?"
                  progress={progress}
                  minutesLeft={minutesLeft}
                  theme={THEME}
                />
                <input
                  type="text"
                  value={state.country}
                  onChange={(e) =>
                    dispatch({ type: "SET_FIELD", key: "country", value: e.target.value })
                  }
                  placeholder="e.g. Cameroon, UK, United States"
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 sm:py-4 text-base text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-400/50"
                />
                <Continue disabled={!state.country.trim()} onClick={() => goTo("revenue")} />
                <Back onClick={() => goTo("teamSize", -1)} />
              </>
            )}

            {state.step === "revenue" && (
              <>
                <StepHeader
                  title="Annual revenue"
                  subtitle="Optional — skip if you're not sure yet"
                  progress={progress}
                  minutesLeft={minutesLeft}
                  theme={THEME}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  {REVENUE_RANGES.map((t) => (
                    <ChoiceCard
                      key={t}
                      label={t}
                      selected={state.revenue === t}
                      onClick={() => {
                        dispatch({ type: "SET_FIELD", key: "revenue", value: t });
                        goTo("goals");
                      }}
                      theme={THEME}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => goTo("goals")}
                  className="mt-4 text-sm text-white/40 hover:text-white"
                >
                  Skip →
                </button>
                <Back onClick={() => goTo("country", -1)} />
              </>
            )}

            {state.step === "goals" && (
              <>
                <StepHeader
                  title="What would you like to accomplish?"
                  subtitle="Pick one or more"
                  progress={progress}
                  minutesLeft={minutesLeft}
                  theme={THEME}
                />
                <GoalPicker
                  selected={state.goals}
                  onToggle={(g) => dispatch({ type: "TOGGLE_MULTI", key: "goals", value: g })}
                  theme={THEME}
                />
                <Continue
                  disabled={state.goals.length === 0}
                  onClick={() => goTo(afterGoalsStep(state))}
                />
                <Back onClick={() => goTo("revenue", -1)} />
              </>
            )}

            {state.step === "clientChallenge" && (
              <>
                <StepHeader
                  title="Biggest blocker to clients or revenue?"
                  subtitle="Helpful if you're still building pipeline"
                  progress={progress}
                  minutesLeft={minutesLeft}
                  theme={THEME}
                />
                <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
                  {CLIENT_CHALLENGES.map((t) => (
                    <ChoiceCard
                      key={t}
                      label={t}
                      selected={state.clientChallenge === t}
                      onClick={() => {
                        dispatch({ type: "SET_FIELD", key: "clientChallenge", value: t });
                        goTo("loadingDynamic");
                      }}
                      theme={THEME}
                    />
                  ))}
                </div>
                <Back onClick={() => goTo("goals", -1)} />
              </>
            )}

            {state.step === "loadingDynamic" && (
              <LoadingScreen
                title="One moment…"
                sub="Choosing a few follow-up questions"
                theme={THEME}
              />
            )}

            {(state.step === "dynamic0" ||
              state.step === "dynamic1" ||
              state.step === "dynamic2") &&
              (() => {
                const idx =
                  state.step === "dynamic0" ? 0 : state.step === "dynamic1" ? 1 : 2;
                const q = state.dynamicQuestions[idx];
                if (!q) return null;
                return (
                  <>
                    <StepHeader
                      title={q.question}
                      progress={progress}
                      minutesLeft={minutesLeft}
                      theme={THEME}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                      {q.options.map((opt) => (
                        <ChoiceCard
                          key={opt}
                          label={opt}
                          selected={state.dynamicAnswers[idx] === opt}
                          onClick={() => {
                            dispatch({ type: "SET_DYNAMIC_ANSWER", index: idx, value: opt });
                            nextDynamic(state.step);
                          }}
                          theme={THEME}
                        />
                      ))}
                    </div>
                  </>
                );
              })()}

            {state.step === "brandRecognition" && (
              <>
                <StepHeader
                  title="Do people know your company?"
                  progress={progress}
                  minutesLeft={minutesLeft}
                  theme={THEME}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  {BRAND_RECOGNITION.map((t) => (
                    <ChoiceCard
                      key={t}
                      label={t}
                      selected={state.brandRecognition === t}
                      onClick={() => {
                        dispatch({ type: "SET_FIELD", key: "brandRecognition", value: t });
                        goTo("contentFrequency");
                      }}
                      theme={THEME}
                    />
                  ))}
                </div>
              </>
            )}

            {state.step === "contentFrequency" && (
              <>
                <StepHeader
                  title="Do you create content?"
                  progress={progress}
                  minutesLeft={minutesLeft}
                  theme={THEME}
                />
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  {CONTENT_FREQUENCY.map((t) => (
                    <ChoiceCard
                      key={t}
                      label={t}
                      selected={state.contentFrequency === t}
                      onClick={() => {
                        dispatch({ type: "SET_FIELD", key: "contentFrequency", value: t });
                        goTo("authorityGoal");
                      }}
                      theme={THEME}
                    />
                  ))}
                </div>
              </>
            )}

            {state.step === "authorityGoal" && (
              <>
                <StepHeader
                  title="Trying to become an authority?"
                  progress={progress}
                  minutesLeft={minutesLeft}
                  theme={THEME}
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  {AUTHORITY_GOAL.map((t) => (
                    <ChoiceCard
                      key={t}
                      label={t}
                      selected={state.authorityGoal === t}
                      onClick={() => {
                        dispatch({ type: "SET_FIELD", key: "authorityGoal", value: t });
                        goTo("platforms");
                      }}
                      theme={THEME}
                    />
                  ))}
                </div>
              </>
            )}

            {state.step === "platforms" && (
              <>
                <StepHeader
                  title="Which platforms matter?"
                  subtitle="Select all that apply — more options unlock below"
                  progress={progress}
                  minutesLeft={minutesLeft}
                  theme={THEME}
                />
                <ProgressiveChoiceGrid
                  mode="multi"
                  options={PLATFORM_PRIMARY}
                  moreOptions={PLATFORM_MORE}
                  selected={state.platforms}
                  onToggle={(p) => dispatch({ type: "TOGGLE_MULTI", key: "platforms", value: p })}
                  theme={THEME}
                />
                <Continue
                  onClick={() => {
                    if (isPreRevenue(state)) {
                      dispatch({
                        type: "SET_FIELD",
                        key: "salesChannel",
                        value: "Not selling yet",
                      });
                      dispatch({
                        type: "SET_FIELD",
                        key: "averageSale",
                        value: "Not applicable yet",
                      });
                    }
                    goTo(afterPlatformsStep(state));
                  }}
                />
              </>
            )}

            {state.step === "salesChannel" && (
              <>
                <StepHeader
                  title="How do customers currently buy?"
                  progress={progress}
                  minutesLeft={minutesLeft}
                  theme={THEME}
                />
                <ProgressiveChoiceGrid
                  mode="single"
                  options={SALES_CHANNELS.slice(0, 6)}
                  moreOptions={SALES_CHANNELS.slice(6)}
                  selected={state.salesChannel}
                  onSelect={(t) => {
                    dispatch({ type: "SET_FIELD", key: "salesChannel", value: t });
                    goTo("averageSale");
                  }}
                  theme={THEME}
                />
                <Back onClick={() => goTo("platforms", -1)} />
              </>
            )}

            {state.step === "averageSale" && (
              <>
                <StepHeader
                  title="Average sale value?"
                  progress={progress}
                  minutesLeft={minutesLeft}
                  theme={THEME}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  {AVERAGE_SALE.map((t) => (
                    <ChoiceCard
                      key={t}
                      label={t}
                      selected={state.averageSale === t}
                      onClick={() => {
                        dispatch({ type: "SET_FIELD", key: "averageSale", value: t });
                        goTo("timeWasters");
                      }}
                      theme={THEME}
                    />
                  ))}
                </div>
                <Back onClick={() => goTo("salesChannel", -1)} />
              </>
            )}

            {state.step === "timeWasters" && (
              <>
                <StepHeader
                  title="What wastes the most time?"
                  subtitle="Select all that apply"
                  progress={progress}
                  minutesLeft={minutesLeft}
                  theme={THEME}
                />
                <ProgressiveChoiceGrid
                  mode="multi"
                  options={TIME_WASTER_PRIMARY}
                  moreOptions={TIME_WASTER_MORE}
                  selected={state.timeWasters}
                  onToggle={(t) =>
                    dispatch({ type: "TOGGLE_MULTI", key: "timeWasters", value: t })
                  }
                  theme={THEME}
                />
                <Continue
                  disabled={state.timeWasters.length === 0}
                  onClick={() => goTo("aiMaturity")}
                />
                <Back
                  onClick={() => goTo(isPreRevenue(state) ? "platforms" : "averageSale", -1)}
                />
              </>
            )}

            {state.step === "aiMaturity" && (
              <>
                <StepHeader
                  title="Where are you with tools and automation?"
                  progress={progress}
                  minutesLeft={minutesLeft}
                  theme={THEME}
                />
                <ProgressiveChoiceGrid
                  mode="single"
                  options={AI_MATURITY.slice(0, 4)}
                  moreOptions={AI_MATURITY.slice(4)}
                  selected={state.aiMaturity}
                  onSelect={(t) => {
                    dispatch({ type: "SET_FIELD", key: "aiMaturity", value: t });
                    goTo("tools");
                  }}
                  theme={THEME}
                />
              </>
            )}

            {state.step === "tools" && (
              <>
                <StepHeader
                  title="Which tools do you already use?"
                  subtitle="Select all that apply"
                  progress={progress}
                  minutesLeft={minutesLeft}
                  theme={THEME}
                />
                <ProgressiveChoiceGrid
                  mode="multi"
                  options={TOOL_PRIMARY}
                  moreOptions={TOOL_MORE}
                  selected={state.tools}
                  onToggle={(t) => dispatch({ type: "TOGGLE_MULTI", key: "tools", value: t })}
                  theme={THEME}
                />
                <Continue onClick={() => goTo("budget")} />
              </>
            )}

            {state.step === "budget" && (
              <>
                <StepHeader
                  title="Estimated investment range"
                  subtitle="Pick what feels right for your goals"
                  progress={progress}
                  minutesLeft={minutesLeft}
                  theme={THEME}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  {BUDGET_RANGES.map((t) => (
                    <ChoiceCard
                      key={t}
                      label={t}
                      selected={state.budget === t}
                      onClick={() => {
                        dispatch({ type: "SET_FIELD", key: "budget", value: t });
                        goTo("urgency");
                      }}
                      theme={THEME}
                    />
                  ))}
                </div>
              </>
            )}

            {state.step === "urgency" && (
              <>
                <StepHeader
                  title="How urgently do you need this?"
                  progress={progress}
                  minutesLeft={minutesLeft}
                  theme={THEME}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  {URGENCY.map((t) => (
                    <ChoiceCard
                      key={t}
                      label={t}
                      selected={state.urgency === t}
                      onClick={() => {
                        dispatch({ type: "SET_FIELD", key: "urgency", value: t });
                        goTo("contact");
                      }}
                      theme={THEME}
                    />
                  ))}
                </div>
              </>
            )}

            {state.step === "contact" && (
              <>
                <StepHeader
                  title="Almost done — how do we reach you?"
                  progress={progress}
                  minutesLeft={minutesLeft}
                  theme={THEME}
                />
                {state.error ? <p className="text-red-400 text-sm mb-4">{state.error}</p> : null}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field
                      label="First name"
                      value={state.firstName}
                      onChange={(v) => dispatch({ type: "SET_FIELD", key: "firstName", value: v })}
                    />
                    <Field
                      label="Last name"
                      value={state.lastName}
                      onChange={(v) => dispatch({ type: "SET_FIELD", key: "lastName", value: v })}
                    />
                  </div>
                  <Field
                    label="Work email"
                    value={state.email}
                    onChange={(v) => dispatch({ type: "SET_FIELD", key: "email", value: v })}
                    type="email"
                  />
                  <Field
                    label="Phone (optional)"
                    value={state.phone}
                    onChange={(v) => dispatch({ type: "SET_FIELD", key: "phone", value: v })}
                  />
                  <Field
                    label="Company"
                    value={state.company}
                    onChange={(v) => dispatch({ type: "SET_FIELD", key: "company", value: v })}
                  />
                  <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-white/15 bg-white/5 px-4 py-4 hover:border-cyan-400/30 transition-colors touch-manipulation">
                    <input
                      type="checkbox"
                      checked={state.wantsProposal}
                      onChange={(e) =>
                        dispatch({ type: "SET_FIELD", key: "wantsProposal", value: e.target.checked })
                      }
                      className="mt-1 h-4 w-4 rounded border-white/30 accent-cyan-400"
                    />
                    <span className="text-sm text-white/80 leading-relaxed">
                      <span className="block font-semibold text-white mb-0.5">
                        Send me a written proposal
                      </span>
                      Navari will send a written proposal within 48 hours.
                    </span>
                  </label>
                </div>
                <Continue
                  disabled={
                    !state.firstName ||
                    !state.lastName ||
                    !state.email.includes("@") ||
                    !state.company
                  }
                  onClick={() => goTo("loadingComplete")}
                  label="See my summary →"
                />
                <Back onClick={() => goTo("urgency", -1)} />
              </>
            )}

            {state.step === "loadingComplete" && (
              <LoadingScreen
                title="Almost done…"
                sub="Putting your summary together"
                theme={THEME}
              />
            )}

            {state.step === "summaryReview" && state.summary && (
              <DiscoverySummaryScreen
                summary={state.summary}
                name={`${state.firstName} ${state.lastName}`}
                onConfirm={() => goTo("result")}
                onAddDetails={() => goTo("additionalDetails")}
              />
            )}

            {state.step === "additionalDetails" && (
              <>
                <StepHeader
                  title="What should we adjust?"
                  progress={progress}
                  minutesLeft={minutesLeft}
                  theme={THEME}
                />
                <textarea
                  value={state.additionalDetails}
                  onChange={(e) =>
                    dispatch({ type: "SET_FIELD", key: "additionalDetails", value: e.target.value })
                  }
                  rows={5}
                  placeholder="Tell us what we missed or got wrong…"
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-400/50"
                />
                <Continue
                  disabled={!state.additionalDetails.trim()}
                  onClick={() => goTo("loadingComplete")}
                  label="Update summary →"
                />
              </>
            )}

            {state.step === "result" && state.summary && (
              <ResultView
                summary={state.summary}
                name={state.firstName}
                wantsProposal={state.wantsProposal}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

const WELCOME_FEATURES = [
  "For new and growing businesses",
  "Short summary of what you need",
  "Suggested services and timeline",
  "Optional written proposal in 48 hours",
] as const;

function Welcome({ onStart, error }: { onStart: () => void; error: string }) {
  return (
    <section className="mx-auto flex max-w-lg flex-col items-center px-2 pb-4 pt-8 text-center sm:pb-8 sm:pt-14">
      <p className="mb-4 font-mono text-xs uppercase tracking-[0.12em] text-gold/90 sm:mb-5 sm:text-sm">
        Navari Systems
      </p>
      <h1 className="font-display mb-5 text-[clamp(28px,5vw,40px)] font-extrabold leading-[1.15] tracking-tight text-white sm:mb-6 [text-wrap:balance]">
        Tell Navari about your business
      </h1>
      <p className="mb-8 max-w-md text-sm leading-relaxed text-silver-dark-bg sm:mb-10 sm:text-base [text-wrap:pretty]">
        A few quick questions so we know how we can help. Takes about 5 minutes.
      </p>
      <ul className="mb-10 inline-flex flex-col gap-3 text-left">
        {WELCOME_FEATURES.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm text-white/75">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/15 text-xs text-gold">
              ✓
            </span>
            <span className="leading-snug">{feature}</span>
          </li>
        ))}
      </ul>
      <div className="flex w-full max-w-sm flex-col items-center gap-4">
        {error ? <p className="w-full text-center text-sm text-red-400">{error}</p> : null}
        <button
          type="button"
          onClick={onStart}
          className="w-full rounded bg-gold px-10 py-4 font-display text-[15px] font-bold tracking-wide text-navy transition-all hover:-translate-y-px hover:bg-gold-light touch-manipulation"
        >
          Get started →
        </button>
      </div>
    </section>
  );
}

function ResultView({
  summary,
  name,
  wantsProposal,
}: {
  summary: DiscoverySummary;
  name: string;
  wantsProposal: boolean;
}) {
  return (
    <div className="text-center py-4 sm:py-6 px-1">
      <h2 className="font-display text-xl sm:text-2xl font-bold text-white mb-2 leading-snug">
        Thanks, {name}
      </h2>
      <p className="text-white/60 mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed">
        Here&apos;s what happens next — book a time if you&apos;d like to talk:
      </p>
      {wantsProposal ? (
        <p className="text-cyan-300/90 text-sm mb-6 bg-cyan-400/10 border border-cyan-400/20 rounded-xl px-4 py-3 leading-relaxed">
          We&apos;ll send you a written proposal within 48 hours at the email you provided.
        </p>
      ) : null}
      <div className="flex flex-col items-center gap-4 mb-8">
        <GoogleCalendarButton />
      </div>
      <p className="text-sm text-white/40 mt-6">
        Investment estimate: {summary.estimatedInvestment}
      </p>
    </div>
  );
}

function Continue({
  onClick,
  disabled,
  label = "Continue →",
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="mx-auto mt-6 block w-full max-w-md rounded bg-gold px-8 py-3.5 font-display text-[15px] font-bold tracking-wide text-navy transition-all hover:-translate-y-px hover:bg-gold-light disabled:opacity-40 touch-manipulation sm:mx-0 sm:mt-8 sm:w-auto sm:min-w-[12rem]"
    >
      {label}
    </button>
  );
}

function Back({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mx-auto mt-3 block py-2 text-sm text-white/40 transition-colors hover:text-white touch-manipulation sm:mx-0"
    >
      ← Back
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs text-white/50 uppercase tracking-wider">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-base text-white focus:outline-none focus:border-cyan-400/50"
      />
    </label>
  );
}
