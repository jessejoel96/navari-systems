"use client";

import { useReducer, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AuditAnalysis, DynamicQuestion } from "@/lib/audit/types";
import { ConfirmScreen } from "./ConfirmScreen";
import { ResultScreen } from "./ResultScreen";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step =
  | "welcome"
  | "industry"
  | "subIndustry"
  | "primaryGoal"
  | "secondaryGoals"
  | "revenue"
  | "teamSize"
  | "workforce"
  | "departments"
  | "tools"
  | "loadingDynamic"
  | "dynamic1"
  | "dynamic2"
  | "loadingChallenges"
  | "challenges"
  | "urgency"
  | "painPoint"
  | "contact"
  | "loadingSubmit"
  | "confirm"
  | "loadingComplete"
  | "result";

type State = {
  step: Step;
  industry: string;
  subIndustry: string;
  primaryGoal: string;
  secondaryGoals: string[];
  revenue: string;
  teamSize: string;
  workforceType: string;
  departments: string[];
  tools: string[];
  dynamicQuestions: DynamicQuestion[];
  dynamicA1: string;
  dynamicA2: string;
  suggestedChallenges: string[];
  selectedChallenges: string[];
  urgency: string;
  painPoint: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  company: string;
  auditId: string | null;
  reflection: string;
  analysis: AuditAnalysis | null;
  emailSent: boolean;
  error: string;
  direction: 1 | -1;
};

type Action =
  | { type: "SET_STEP"; step: Step; direction?: 1 | -1 }
  | { type: "SET_FIELD"; key: keyof State; value: unknown }
  | { type: "TOGGLE_MULTI"; key: "departments" | "tools"; value: string }
  | { type: "TOGGLE_SECONDARY_GOAL"; value: string }
  | { type: "TOGGLE_CHALLENGE"; value: string }
  | { type: "SET_DYNAMIC"; questions: DynamicQuestion[] }
  | { type: "SET_CHALLENGES"; challenges: string[] }
  | { type: "SET_SUBMIT"; auditId: string | null; reflection: string }
  | { type: "SET_ANALYSIS"; analysis: AuditAnalysis; emailSent: boolean };

const initial: State = {
  step: "welcome",
  industry: "",
  subIndustry: "",
  primaryGoal: "",
  secondaryGoals: [],
  revenue: "",
  teamSize: "",
  workforceType: "",
  departments: [],
  tools: [],
  dynamicQuestions: [],
  dynamicA1: "",
  dynamicA2: "",
  suggestedChallenges: [],
  selectedChallenges: [],
  urgency: "",
  painPoint: "",
  firstName: "",
  lastName: "",
  email: "",
  phoneCountryCode: "+44",
  phoneNumber: "",
  company: "",
  auditId: null,
  reflection: "",
  analysis: null,
  emailSent: false,
  error: "",
  direction: 1,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.step, direction: action.direction ?? 1 };
    case "SET_FIELD":
      return { ...state, [action.key]: action.value };
    case "TOGGLE_MULTI": {
      const arr = state[action.key] as string[];
      const next = arr.includes(action.value)
        ? arr.filter((v) => v !== action.value)
        : [...arr, action.value];
      return { ...state, [action.key]: next };
    }
    case "TOGGLE_SECONDARY_GOAL": {
      if (action.value === state.primaryGoal) return state;
      const arr = state.secondaryGoals;
      if (arr.includes(action.value)) {
        return { ...state, secondaryGoals: arr.filter((v) => v !== action.value) };
      }
      if (arr.length >= 2) return state;
      return { ...state, secondaryGoals: [...arr, action.value] };
    }
    case "TOGGLE_CHALLENGE": {
      const arr = state.selectedChallenges;
      if (arr.includes(action.value)) {
        return { ...state, selectedChallenges: arr.filter((v) => v !== action.value) };
      }
      return { ...state, selectedChallenges: [...arr, action.value] };
    }
    case "SET_DYNAMIC":
      return { ...state, dynamicQuestions: action.questions };
    case "SET_CHALLENGES":
      return { ...state, suggestedChallenges: action.challenges };
    case "SET_SUBMIT":
      return { ...state, auditId: action.auditId, reflection: action.reflection };
    case "SET_ANALYSIS":
      return { ...state, analysis: action.analysis, emailSent: action.emailSent };
    default:
      return state;
  }
}

// ─── Step data ────────────────────────────────────────────────────────────────

const INDUSTRIES = [
  { value: "Real Estate", icon: "🏡", label: "Real Estate", desc: "Agencies, property management, rentals" },
  { value: "Online Education", icon: "🎓", label: "Online Education", desc: "Courses, coaching, training programmes" },
  { value: "Professional Services", icon: "⚖️", label: "Professional Services", desc: "Legal, accounting, consulting" },
  { value: "E-commerce", icon: "🛒", label: "E-commerce", desc: "Product sales, DTC, subscriptions" },
  { value: "Marketing Agency", icon: "📊", label: "Marketing Agency", desc: "Client campaigns, creative, reporting" },
  { value: "Healthcare / Wellness", icon: "🏥", label: "Healthcare / Wellness", desc: "Clinics, therapy, fitness, wellness" },
  { value: "Construction / Trades", icon: "🔧", label: "Construction / Trades", desc: "Contractors, trades, field services" },
  { value: "SaaS / Tech", icon: "💻", label: "SaaS / Tech", desc: "Software, apps, tech-enabled services" },
  { value: "Other Business", icon: "🏢", label: "Other Business", desc: "Service-based, B2B, local operations" },
];

const SUB_INDUSTRIES: Record<string, { value: string; label: string }[]> = {
  "Real Estate": [
    { value: "Residential Sales", label: "Residential Sales" },
    { value: "Commercial Property", label: "Commercial Property" },
    { value: "Property Management", label: "Property Management" },
    { value: "Rentals & Lettings", label: "Rentals & Lettings" },
  ],
  "Online Education": [
    { value: "Online Courses", label: "Online Courses" },
    { value: "1:1 Coaching", label: "1:1 Coaching" },
    { value: "Cohorts / Group Programs", label: "Cohorts / Group Programs" },
    { value: "Corporate Training", label: "Corporate Training" },
  ],
  "Professional Services": [
    { value: "Legal", label: "Legal" },
    { value: "Accounting / Bookkeeping", label: "Accounting / Bookkeeping" },
    { value: "Consulting", label: "Consulting" },
    { value: "Recruitment", label: "Recruitment" },
  ],
  "E-commerce": [
    { value: "Physical Products", label: "Physical Products" },
    { value: "Digital Products", label: "Digital Products" },
    { value: "Subscriptions", label: "Subscriptions" },
    { value: "Wholesale / B2B", label: "Wholesale / B2B" },
  ],
  "Marketing Agency": [
    { value: "Performance Marketing", label: "Performance Marketing" },
    { value: "Creative / Brand", label: "Creative / Brand" },
    { value: "Full-Service Agency", label: "Full-Service Agency" },
    { value: "Freelance / Solo Agency", label: "Freelance / Solo Agency" },
  ],
  "Healthcare / Wellness": [
    { value: "Medical Clinic", label: "Medical Clinic" },
    { value: "Therapy / Counselling", label: "Therapy / Counselling" },
    { value: "Fitness / Personal Training", label: "Fitness / Personal Training" },
    { value: "Wellness / Holistic", label: "Wellness / Holistic" },
  ],
  "Construction / Trades": [
    { value: "General Contractor", label: "General Contractor" },
    { value: "Specialist Trade", label: "Specialist Trade" },
    { value: "Property Maintenance", label: "Property Maintenance" },
    { value: "Field Services", label: "Field Services" },
  ],
  "SaaS / Tech": [
    { value: "B2B SaaS", label: "B2B SaaS" },
    { value: "B2C App", label: "B2C App" },
    { value: "Agency / Dev Shop", label: "Agency / Dev Shop" },
    { value: "Tech-Enabled Service", label: "Tech-Enabled Service" },
  ],
  "Other Business": [
    { value: "General Service Business", label: "General Service Business" },
    { value: "B2B Services", label: "B2B Services" },
    { value: "Local Retail", label: "Local Retail" },
    { value: "Franchise / Multi-location", label: "Franchise / Multi-location" },
  ],
};

const PRIMARY_GOALS = [
  { value: "Recover time", icon: "⏱️", label: "Recover time", desc: "Less manual work for my team" },
  { value: "Increase revenue capacity", icon: "📈", label: "Increase revenue capacity", desc: "Handle more clients without hiring" },
  { value: "Fix operational errors", icon: "⚠️", label: "Fix operational errors", desc: "Things fall through the cracks too often" },
  { value: "Reduce costs", icon: "💸", label: "Reduce costs", desc: "Paying people to do what a system should" },
  { value: "Improve client experience", icon: "⭐", label: "Improve client experience", desc: "Delays and inconsistency hurt retention" },
  { value: "Document and standardise", icon: "📋", label: "Document and standardise", desc: "Get processes out of people's heads into SOPs" },
];

const WORKFORCE_TYPES = [
  { value: "Just me (owner doing everything)", label: "Just me", sub: "Owner doing everything" },
  { value: "VA or offshore team", label: "VA / Offshore", sub: "Remote support team" },
  { value: "Full-time in-house staff", label: "In-house staff", sub: "Full-time employees" },
  { value: "Mix of staff and contractors", label: "Mixed team", sub: "Staff + contractors" },
  { value: "Dedicated ops team", label: "Ops team", sub: "Dedicated operations staff" },
];

const URGENCY_OPTIONS = [
  { value: "Actively costing me now, need a solution this month", label: "Urgent", sub: "Costing me now, need this month" },
  { value: "Want to fix in the next 3 months", label: "Soon", sub: "Fix in the next 3 months" },
  { value: "Planning ahead, not urgent but important", label: "Planning", sub: "Important, not urgent" },
  { value: "Just exploring what's possible", label: "Exploring", sub: "Seeing what's possible" },
];

const REVENUES = [
  { value: "Under $10k/month", label: "Under $10k", sub: "per month" },
  { value: "$10k-$25k/month", label: "$10k-$25k", sub: "per month" },
  { value: "$25k-$50k/month", label: "$25k-$50k", sub: "per month" },
  { value: "$50k-$100k/month", label: "$50k-$100k", sub: "per month" },
  { value: "$100k+/month", label: "$100k+", sub: "per month" },
];

const TEAM_SIZES = [
  { value: "Solo (just me)", label: "Solo", sub: "Just me" },
  { value: "2-5 people", label: "2-5", sub: "people" },
  { value: "6-15 people", label: "6-15", sub: "people" },
  { value: "16-30 people", label: "16-30", sub: "people" },
  { value: "30+ people", label: "30+", sub: "people" },
];

const DEPARTMENTS = [
  { value: "Sales & Business Development", icon: "💼", label: "Sales & BD" },
  { value: "Operations", icon: "⚙️", label: "Operations" },
  { value: "Finance & Billing", icon: "💰", label: "Finance" },
  { value: "Customer Support", icon: "🎧", label: "Support" },
  { value: "Marketing", icon: "📣", label: "Marketing" },
  { value: "HR & Hiring", icon: "👥", label: "HR & Hiring" },
  { value: "Fulfilment & Delivery", icon: "📦", label: "Fulfilment" },
  { value: "Product & Development", icon: "🏗️", label: "Product" },
];

const TOOLS = [
  "Gmail / Outlook",
  "Google Sheets / Excel",
  "Notion",
  "Airtable",
  "HubSpot / Salesforce CRM",
  "Stripe / QuickBooks",
  "Slack",
  "Trello / Asana / ClickUp",
  "Zapier (already automating)",
  "Shopify",
  "Teachable / Kajabi",
  "GoHighLevel",
  "Xero / Wave",
  "None of these",
];

const VISIBLE_STEPS: Step[] = [
  "industry", "subIndustry", "primaryGoal", "secondaryGoals", "revenue", "teamSize", "workforce",
  "departments", "tools", "dynamic1", "dynamic2", "challenges", "urgency", "painPoint", "contact",
];

const PHASES: Record<string, string> = {
  industry: "Your Business",
  subIndustry: "Your Business",
  primaryGoal: "Your Goals",
  secondaryGoals: "Your Goals",
  revenue: "Your Business",
  teamSize: "Your Business",
  workforce: "Your Team",
  departments: "The Specifics",
  tools: "The Specifics",
  dynamic1: "Pinpointing Leaks",
  dynamic2: "Pinpointing Leaks",
  challenges: "Your Challenges",
  urgency: "Timeline",
  painPoint: "Your Story",
  contact: "Almost There",
};

function buildAnswersPayload(state: State) {
  return {
    firstName: state.firstName,
    lastName: state.lastName,
    email: state.email,
    phone: `${state.phoneCountryCode} ${state.phoneNumber}`.trim(),
    company: state.company,
    industry: state.industry,
    subIndustry: state.subIndustry,
    primaryGoal: state.primaryGoal,
    secondaryGoals: state.secondaryGoals,
    revenue: state.revenue,
    teamSize: state.teamSize,
    workforceType: state.workforceType,
    departments: state.departments,
    tools: state.tools,
    dynamicQ1: state.dynamicQuestions[0]?.question ?? "",
    dynamicA1: state.dynamicA1,
    dynamicQ2: state.dynamicQuestions[1]?.question ?? "",
    dynamicA2: state.dynamicA2,
    suggestedChallenges: state.suggestedChallenges,
    selectedChallenges: state.selectedChallenges,
    urgency: state.urgency,
    painPoint: state.painPoint,
  };
}

const LOADING_COPY: Record<string, { title: string; sub: string }> = {
  loadingDynamic: {
    title: "Mapping your operation…",
    sub: "Generating targeted questions based on your inputs",
  },
  loadingChallenges: {
    title: "Identifying likely problems…",
    sub: "Based on your industry, tools, and goals",
  },
  loadingSubmit: {
    title: "Analysing your inputs…",
    sub: "Cross-referencing with known patterns in your industry",
  },
  loadingComplete: {
    title: "Running the numbers…",
    sub: "Calculating cost of leaks and recovery potential",
  },
};

// ─── Shared card components ───────────────────────────────────────────────────

function ChoiceCard({
  icon,
  label,
  sub,
  desc,
  selected,
  onClick,
}: {
  icon?: string;
  label: string;
  sub?: string;
  desc?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative w-full text-left rounded-xl border p-5 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 ${
        selected
          ? "border-gold bg-gold/10 ring-1 ring-gold/40"
          : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/8"
      }`}
    >
      {selected && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3 w-5 h-5 rounded-full bg-gold flex items-center justify-center"
        >
          <svg className="w-3 h-3 text-navy" fill="none" viewBox="0 0 12 12">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.span>
      )}
      {icon && <div className="text-2xl mb-2">{icon}</div>}
      <div className="font-semibold text-white text-base">{label}</div>
      {sub && <div className="text-xs text-white/50 mt-0.5 font-mono">{sub}</div>}
      {desc && <div className="text-sm text-white/60 mt-1">{desc}</div>}
    </motion.button>
  );
}

function MultiCard({
  icon,
  label,
  selected,
  onClick,
}: {
  icon: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className={`relative w-full text-left rounded-xl border p-4 transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 ${
        selected
          ? "border-gold bg-gold/10 ring-1 ring-gold/40"
          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
      }`}
    >
      {selected && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2.5 right-2.5 w-4 h-4 rounded bg-gold flex items-center justify-center"
        >
          <svg className="w-2.5 h-2.5 text-navy" fill="none" viewBox="0 0 12 12">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.span>
      )}
      <div className="text-xl mb-1">{icon}</div>
      <div className="text-sm font-semibold text-white">{label}</div>
    </motion.button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AuditWizard() {
  const [state, dispatch] = useReducer(reducer, initial);
  const topRef = useRef<HTMLDivElement>(null);

  const stepIndex = VISIBLE_STEPS.indexOf(state.step);
  const progress = stepIndex >= 0 ? ((stepIndex + 1) / VISIBLE_STEPS.length) * 100 : 0;
  const minutesLeft = stepIndex >= 0 ? Math.max(1, Math.ceil((VISIBLE_STEPS.length - stepIndex) * 0.35)) : 0;

  function scrollTop() {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function goTo(step: Step, direction: 1 | -1 = 1) {
    dispatch({ type: "SET_STEP", step, direction });
    setTimeout(scrollTop, 50);
  }

  // When entering loadingDynamic, fetch dynamic questions
  useEffect(() => {
    if (state.step !== "loadingDynamic") return;

    async function fetchQuestions() {
      try {
        const res = await fetch("/api/audit/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildAnswersPayload(state)),
        });
        const data = await res.json();
        dispatch({ type: "SET_DYNAMIC", questions: data.questions ?? [] });
        goTo("dynamic1");
      } catch {
        goTo("urgency"); // skip dynamic if network fails
      }
    }

    fetchQuestions();
  }, [state.step]); // eslint-disable-line react-hooks/exhaustive-deps

  // When entering loadingChallenges, fetch AI-suggested problems
  useEffect(() => {
    if (state.step !== "loadingChallenges") return;

    async function fetchChallenges() {
      try {
        const res = await fetch("/api/audit/challenges", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildAnswersPayload(state)),
        });
        const data = await res.json();
        dispatch({ type: "SET_CHALLENGES", challenges: data.challenges ?? [] });
        goTo("challenges");
      } catch {
        goTo("urgency");
      }
    }

    fetchChallenges();
  }, [state.step]); // eslint-disable-line react-hooks/exhaustive-deps

  // When entering loadingSubmit, save contact + get reflection
  useEffect(() => {
    if (state.step !== "loadingSubmit") return;

    async function submit() {
      try {
        const res = await fetch("/api/audit/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildAnswersPayload(state)),
        });
        const data = await res.json();
        dispatch({ type: "SET_SUBMIT", auditId: data.auditId, reflection: data.reflection });
        goTo("confirm");
      } catch {
        // Fallback: skip confirm, go straight to analysis
        goTo("loadingComplete");
      }
    }

    submit();
  }, [state.step]); // eslint-disable-line react-hooks/exhaustive-deps

  // When entering loadingComplete, run analysis
  useEffect(() => {
    if (state.step !== "loadingComplete") return;

    async function complete() {
      try {
        const res = await fetch("/api/audit/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            auditId: state.auditId,
            answers: buildAnswersPayload(state),
          }),
        });
        const data = await res.json();
        dispatch({ type: "SET_ANALYSIS", analysis: data.analysis, emailSent: data.emailSent ?? false });
        goTo("result");
      } catch {
        dispatch({ type: "SET_FIELD", key: "error", value: "Analysis failed. Please refresh and try again." });
      }
    }

    complete();
  }, [state.step]); // eslint-disable-line react-hooks/exhaustive-deps

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
  };

  const transition = { duration: 0.28, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] };

  return (
    <div ref={topRef} className="min-h-screen bg-footer-bg flex flex-col pt-[4.25rem]">
      {/* Progress bar + step counter — sits below the nav */}
      {stepIndex >= 0 && (
        <div className="sticky top-[4.25rem] z-40 bg-footer-bg/95 backdrop-blur-sm border-b border-white/8">
          <div className="max-w-2xl mx-auto px-5 pt-3 pb-2 flex items-center justify-between">
            <span className="text-xs font-mono text-white/40 tracking-widest uppercase">
              {PHASES[state.step] ?? ""}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-white/30 hidden sm:inline">
                ~{minutesLeft} min left
              </span>
              <span className="text-xs font-mono text-gold bg-gold/10 px-2.5 py-1 rounded-full">
                {stepIndex + 1} / {VISIBLE_STEPS.length}
              </span>
            </div>
          </div>
          <div className="max-w-2xl mx-auto px-5 pb-3">
            <div className="h-0.5 w-full bg-white/8 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gold rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait" custom={state.direction}>
            {/* ── Welcome ────────────────────────────────────────────── */}
            {state.step === "welcome" && (
              <motion.div
                key="welcome"
                variants={variants}
                custom={state.direction}
                initial="enter"
                animate="center"
                exit="exit"
                transition={transition}
                className="text-center"
              >
          <div className="inline-flex items-center gap-2 text-xs font-mono text-gold bg-gold/10 border border-gold/20 px-3 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            FREE · NO CARD REQUIRED
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-5">
            Operations Audit Tool
          </h1>
          <p className="text-lg text-white/70 max-w-md mx-auto leading-relaxed mb-4">
            In about 4 minutes, we map where your business loses the most time and money, and show you what an automated fix looks like.
          </p>
          <p className="text-sm font-mono text-white/40 mb-10">
            15 steps. ~5 minutes. No obligation.
          </p>
                <motion.button
                  onClick={() => goTo("industry")}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-gold text-navy font-bold px-8 py-4 rounded-xl text-base hover:bg-gold/90 transition-colors"
                >
                  Start the Audit →
                </motion.button>
          <p className="mt-6 text-xs text-white/30 font-mono">
            Your email is collected before the results. We do not share it.
          </p>
              </motion.div>
            )}

            {/* ── Industry ───────────────────────────────────────────── */}
            {state.step === "industry" && (
              <motion.div key="industry" variants={variants} custom={state.direction} initial="enter" animate="center" exit="exit" transition={transition}>
                <StepHeader
                  phase={PHASES.industry}
                  question="What kind of business do you run?"
                  hint="Select the one that best describes your primary revenue source"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {INDUSTRIES.map((item) => (
                    <ChoiceCard
                      key={item.value}
                      icon={item.icon}
                      label={item.label}
                      desc={item.desc}
                      selected={state.industry === item.value}
                      onClick={() => {
                        dispatch({ type: "SET_FIELD", key: "industry", value: item.value });
                        dispatch({ type: "SET_FIELD", key: "subIndustry", value: "" });
                        setTimeout(() => goTo("subIndustry"), 300);
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Sub-industry ───────────────────────────────────────── */}
            {state.step === "subIndustry" && (
              <motion.div key="subIndustry" variants={variants} custom={state.direction} initial="enter" animate="center" exit="exit" transition={transition}>
                <StepHeader
                  phase={PHASES.subIndustry}
                  question="Which area best describes your business?"
                  hint="This sharpens the diagnosis to your specific model"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(SUB_INDUSTRIES[state.industry] ?? SUB_INDUSTRIES["Other Business"]).map((item) => (
                    <ChoiceCard
                      key={item.value}
                      label={item.label}
                      selected={state.subIndustry === item.value}
                      onClick={() => {
                        dispatch({ type: "SET_FIELD", key: "subIndustry", value: item.value });
                        setTimeout(() => goTo("primaryGoal"), 300);
                      }}
                    />
                  ))}
                </div>
                <BackButton onClick={() => goTo("industry", -1)} />
              </motion.div>
            )}

            {/* ── Primary goal ───────────────────────────────────────── */}
            {state.step === "primaryGoal" && (
              <motion.div key="primaryGoal" variants={variants} custom={state.direction} initial="enter" animate="center" exit="exit" transition={transition}>
                <StepHeader
                  phase={PHASES.primaryGoal}
                  question="What is the most important outcome for you right now?"
                  hint="This shapes how we frame your assessment and recommendations"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PRIMARY_GOALS.map((item) => (
                    <ChoiceCard
                      key={item.value}
                      icon={item.icon}
                      label={item.label}
                      desc={item.desc}
                      selected={state.primaryGoal === item.value}
                      onClick={() => {
                        dispatch({ type: "SET_FIELD", key: "primaryGoal", value: item.value });
                        dispatch({ type: "SET_FIELD", key: "secondaryGoals", value: [] });
                        setTimeout(() => goTo("secondaryGoals"), 300);
                      }}
                    />
                  ))}
                </div>
                <BackButton onClick={() => goTo("subIndustry", -1)} />
              </motion.div>
            )}

            {/* ── Secondary goals ────────────────────────────────────── */}
            {state.step === "secondaryGoals" && (
              <motion.div key="secondaryGoals" variants={variants} custom={state.direction} initial="enter" animate="center" exit="exit" transition={transition}>
                <StepHeader
                  phase={PHASES.secondaryGoals}
                  question="Any other outcomes that matter? (up to 2)"
                  hint="Optional. Select secondary priorities besides your main goal."
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {PRIMARY_GOALS.filter((g) => g.value !== state.primaryGoal).map((item) => (
                    <ChoiceCard
                      key={item.value}
                      icon={item.icon}
                      label={item.label}
                      desc={item.desc}
                      selected={state.secondaryGoals.includes(item.value)}
                      onClick={() => dispatch({ type: "TOGGLE_SECONDARY_GOAL", value: item.value })}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <BackButton onClick={() => goTo("primaryGoal", -1)} />
                  <motion.button
                    onClick={() => goTo("revenue")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gold text-navy font-semibold px-6 py-3 rounded-xl text-sm"
                  >
                    {state.secondaryGoals.length > 0 ? "Continue →" : "Skip, just my main goal →"}
                  </motion.button>
                </div>
                {state.secondaryGoals.length > 0 && (
                  <p className="text-xs text-gold/70 font-mono mt-3 text-right">
                    {state.secondaryGoals.length}/2 selected
                  </p>
                )}
              </motion.div>
            )}

            {/* ── Revenue ────────────────────────────────────────────── */}
            {state.step === "revenue" && (
              <motion.div key="revenue" variants={variants} custom={state.direction} initial="enter" animate="center" exit="exit" transition={transition}>
                <StepHeader
                  phase={PHASES.revenue}
                  question="What is your current monthly revenue?"
                  hint="Approximate is fine. This calibrates the cost estimates."
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {REVENUES.map((item) => (
                    <ChoiceCard
                      key={item.value}
                      label={item.label}
                      sub={item.sub}
                      selected={state.revenue === item.value}
                      onClick={() => {
                        dispatch({ type: "SET_FIELD", key: "revenue", value: item.value });
                        setTimeout(() => goTo("teamSize"), 300);
                      }}
                    />
                  ))}
                </div>
                <BackButton onClick={() => goTo("secondaryGoals", -1)} />
              </motion.div>
            )}

            {/* ── Team size ──────────────────────────────────────────── */}
            {state.step === "teamSize" && (
              <motion.div key="teamSize" variants={variants} custom={state.direction} initial="enter" animate="center" exit="exit" transition={transition}>
                <StepHeader
                  phase={PHASES.teamSize}
                  question="How many people work in this business?"
                  hint="Full-time, part-time, and regular contractors count"
                />
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {TEAM_SIZES.map((item) => (
                    <ChoiceCard
                      key={item.value}
                      label={item.label}
                      sub={item.sub}
                      selected={state.teamSize === item.value}
                      onClick={() => {
                        dispatch({ type: "SET_FIELD", key: "teamSize", value: item.value });
                        setTimeout(() => goTo("workforce"), 300);
                      }}
                    />
                  ))}
                </div>
                <BackButton onClick={() => goTo("revenue", -1)} />
              </motion.div>
            )}

            {/* ── Workforce ──────────────────────────────────────────── */}
            {state.step === "workforce" && (
              <motion.div key="workforce" variants={variants} custom={state.direction} initial="enter" animate="center" exit="exit" transition={transition}>
                <StepHeader
                  phase={PHASES.workforce}
                  question="Who primarily does the manual work you're thinking about?"
                  hint="This calibrates labour cost estimates in your assessment"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {WORKFORCE_TYPES.map((item) => (
                    <ChoiceCard
                      key={item.value}
                      label={item.label}
                      sub={item.sub}
                      selected={state.workforceType === item.value}
                      onClick={() => {
                        dispatch({ type: "SET_FIELD", key: "workforceType", value: item.value });
                        setTimeout(() => goTo("departments"), 300);
                      }}
                    />
                  ))}
                </div>
                <BackButton onClick={() => goTo("teamSize", -1)} />
              </motion.div>
            )}

            {/* ── Departments ────────────────────────────────────────── */}
            {state.step === "departments" && (
              <motion.div key="departments" variants={variants} custom={state.direction} initial="enter" animate="center" exit="exit" transition={transition}>
                <StepHeader
                  phase={PHASES.departments}
                  question="Which departments still run on manual work?"
                  hint="Select all that apply. These are where we look first."
                />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {DEPARTMENTS.map((item) => (
                    <MultiCard
                      key={item.value}
                      icon={item.icon}
                      label={item.label}
                      selected={state.departments.includes(item.value)}
                      onClick={() => dispatch({ type: "TOGGLE_MULTI", key: "departments", value: item.value })}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <BackButton onClick={() => goTo("workforce", -1)} />
                  <motion.button
                    onClick={() => goTo("tools")}
                    disabled={state.departments.length === 0}
                    whileHover={{ scale: state.departments.length > 0 ? 1.02 : 1 }}
                    whileTap={{ scale: state.departments.length > 0 ? 0.98 : 1 }}
                    className="bg-gold text-navy font-semibold px-6 py-3 rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                  >
                    Continue →
                  </motion.button>
                </div>
                {state.departments.length > 0 && (
                  <p className="text-xs text-gold/70 font-mono mt-3 text-right">
                    {state.departments.length} selected
                  </p>
                )}
              </motion.div>
            )}

            {/* ── Tools ──────────────────────────────────────────────── */}
            {state.step === "tools" && (
              <motion.div key="tools" variants={variants} custom={state.direction} initial="enter" animate="center" exit="exit" transition={transition}>
                <StepHeader
                  phase={PHASES.tools}
                  question="Which tools does your team use day-to-day?"
                  hint="Select everything that gets opened at least weekly"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
                  {TOOLS.map((tool) => (
                    <motion.button
                      key={tool}
                      type="button"
                      onClick={() => dispatch({ type: "TOGGLE_MULTI", key: "tools", value: tool })}
                      whileTap={{ scale: 0.97 }}
                      className={`relative text-left rounded-lg border px-4 py-3 text-sm font-medium transition-all duration-150 cursor-pointer focus:outline-none ${
                        state.tools.includes(tool)
                          ? "border-gold bg-gold/10 text-white ring-1 ring-gold/40"
                          : "border-white/10 bg-white/5 text-white/65 hover:border-white/25 hover:text-white"
                      }`}
                    >
                      {state.tools.includes(tool) && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2.5 right-3 text-gold text-xs"
                        >
                          ✓
                        </motion.span>
                      )}
                      {tool}
                    </motion.button>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <BackButton onClick={() => goTo("departments", -1)} />
                  <motion.button
                    onClick={() => goTo("loadingDynamic")}
                    disabled={state.tools.length === 0}
                    whileHover={{ scale: state.tools.length > 0 ? 1.02 : 1 }}
                    className="bg-gold text-navy font-semibold px-6 py-3 rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Continue →
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ── Loading: dynamic questions ──────────────────────────── */}
            {state.step === "loadingDynamic" && (
              <LoadingScreen key="loadingDynamic" {...LOADING_COPY.loadingDynamic} />
            )}

            {/* ── Dynamic Q1 ─────────────────────────────────────────── */}
            {state.step === "dynamic1" && state.dynamicQuestions[0] && (
              <motion.div key="dynamic1" variants={variants} custom={state.direction} initial="enter" animate="center" exit="exit" transition={transition}>
                <StepHeader
                  phase={PHASES.dynamic1}
                  question={state.dynamicQuestions[0].question}
                  hint="Based on what you told us. This narrows the diagnosis."
                />
                <div className="grid grid-cols-1 gap-3">
                  {state.dynamicQuestions[0].options.map((opt) => (
                    <ChoiceCard
                      key={opt}
                      label={opt}
                      selected={state.dynamicA1 === opt}
                      onClick={() => {
                        dispatch({ type: "SET_FIELD", key: "dynamicA1", value: opt });
                        setTimeout(() => goTo("dynamic2"), 300);
                      }}
                    />
                  ))}
                </div>
                <BackButton onClick={() => goTo("tools", -1)} />
              </motion.div>
            )}

            {/* ── Dynamic Q2 ─────────────────────────────────────────── */}
            {state.step === "dynamic2" && state.dynamicQuestions[1] && (
              <motion.div key="dynamic2" variants={variants} custom={state.direction} initial="enter" animate="center" exit="exit" transition={transition}>
                <StepHeader
                  phase={PHASES.dynamic2}
                  question={state.dynamicQuestions[1].question}
                  hint="One more. This completes the picture."
                />
                <div className="grid grid-cols-1 gap-3">
                  {state.dynamicQuestions[1].options.map((opt) => (
                    <ChoiceCard
                      key={opt}
                      label={opt}
                      selected={state.dynamicA2 === opt}
                      onClick={() => {
                        dispatch({ type: "SET_FIELD", key: "dynamicA2", value: opt });
                        setTimeout(() => goTo("loadingChallenges"), 300);
                      }}
                    />
                  ))}
                </div>
                <BackButton onClick={() => goTo("dynamic1", -1)} />
              </motion.div>
            )}

            {/* ── Loading: challenges ─────────────────────────────────── */}
            {state.step === "loadingChallenges" && (
              <LoadingScreen key="loadingChallenges" {...LOADING_COPY.loadingChallenges} />
            )}

            {/* ── Challenges (multi-select) ───────────────────────────── */}
            {state.step === "challenges" && (
              <motion.div key="challenges" variants={variants} custom={state.direction} initial="enter" animate="center" exit="exit" transition={transition}>
                <StepHeader
                  phase={PHASES.challenges}
                  question="Which of these sound like your business?"
                  hint="Select every challenge you recognise. The more you pick, the sharper the audit."
                />
                <div className="grid grid-cols-1 gap-2.5 mb-6">
                  {state.suggestedChallenges.map((challenge) => (
                    <motion.button
                      key={challenge}
                      type="button"
                      onClick={() => dispatch({ type: "TOGGLE_CHALLENGE", value: challenge })}
                      whileTap={{ scale: 0.98 }}
                      className={`relative text-left rounded-xl border px-4 py-3.5 text-sm leading-relaxed transition-all duration-150 cursor-pointer focus:outline-none ${
                        state.selectedChallenges.includes(challenge)
                          ? "border-gold bg-gold/10 text-white ring-1 ring-gold/40"
                          : "border-white/10 bg-white/5 text-white/75 hover:border-white/25 hover:text-white"
                      }`}
                    >
                      {state.selectedChallenges.includes(challenge) && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-3.5 right-3 text-gold text-xs font-bold"
                        >
                          ✓
                        </motion.span>
                      )}
                      {challenge}
                    </motion.button>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <BackButton onClick={() => goTo("dynamic2", -1)} />
                  <motion.button
                    onClick={() => goTo("urgency")}
                    disabled={state.selectedChallenges.length === 0}
                    whileHover={{ scale: state.selectedChallenges.length > 0 ? 1.02 : 1 }}
                    className="bg-gold text-navy font-semibold px-6 py-3 rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Continue →
                  </motion.button>
                </div>
                {state.selectedChallenges.length > 0 && (
                  <p className="text-xs text-gold/70 font-mono mt-3 text-right">
                    {state.selectedChallenges.length} selected
                  </p>
                )}
              </motion.div>
            )}

            {/* ── Urgency ────────────────────────────────────────────── */}
            {state.step === "urgency" && (
              <motion.div key="urgency" variants={variants} custom={state.direction} initial="enter" animate="center" exit="exit" transition={transition}>
                <StepHeader
                  phase={PHASES.urgency}
                  question="How urgently do you need this fixed?"
                  hint="Helps us calibrate the recommendation and next steps"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {URGENCY_OPTIONS.map((item) => (
                    <ChoiceCard
                      key={item.value}
                      label={item.label}
                      sub={item.sub}
                      selected={state.urgency === item.value}
                      onClick={() => {
                        dispatch({ type: "SET_FIELD", key: "urgency", value: item.value });
                        setTimeout(() => goTo("painPoint"), 300);
                      }}
                    />
                  ))}
                </div>
                <BackButton onClick={() => goTo("challenges", -1)} />
              </motion.div>
            )}

            {/* ── Pain point ─────────────────────────────────────────── */}
            {state.step === "painPoint" && (
              <motion.div key="painPoint" variants={variants} custom={state.direction} initial="enter" animate="center" exit="exit" transition={transition}>
                <StepHeader
                  phase={PHASES.painPoint}
                  question="In one sentence, what slows your business down most?"
                  hint="Optional, but this makes your assessment more specific."
                />
                <PainPointForm
                  value={state.painPoint}
                  onChange={(v) => dispatch({ type: "SET_FIELD", key: "painPoint", value: v })}
                  onSubmit={() => goTo("contact")}
                  onSkip={() => {
                    dispatch({ type: "SET_FIELD", key: "painPoint", value: "" });
                    goTo("contact");
                  }}
                />
                <BackButton onClick={() => goTo("urgency", -1)} />
              </motion.div>
            )}

            {/* ── Contact ────────────────────────────────────────────── */}
            {state.step === "contact" && (
              <motion.div key="contact" variants={variants} custom={state.direction} initial="enter" animate="center" exit="exit" transition={transition}>
                <StepHeader
                  phase={PHASES.contact}
                  question="Where should we send your assessment?"
                  hint="Your results and a full breakdown are emailed to you"
                />
                <ContactForm
                  firstName={state.firstName}
                  lastName={state.lastName}
                  email={state.email}
                  phoneCountryCode={state.phoneCountryCode}
                  phoneNumber={state.phoneNumber}
                  company={state.company}
                  onChange={(k, v) => dispatch({ type: "SET_FIELD", key: k as keyof State, value: v })}
                  onSubmit={() => goTo("loadingSubmit")}
                />
                <BackButton onClick={() => goTo("painPoint", -1)} />
              </motion.div>
            )}

            {/* ── Loading: reflection ─────────────────────────────────── */}
            {state.step === "loadingSubmit" && (
              <LoadingScreen key="loadingSubmit" {...LOADING_COPY.loadingSubmit} />
            )}

            {/* ── Confirm ────────────────────────────────────────────── */}
            {state.step === "confirm" && (
              <motion.div key="confirm" variants={variants} custom={state.direction} initial="enter" animate="center" exit="exit" transition={transition}>
                <ConfirmScreen
                  name={[state.firstName, state.lastName].filter(Boolean).join(" ")}
                  industry={state.industry}
                  subIndustry={state.subIndustry}
                  reflection={state.reflection}
                  onConfirm={() => goTo("loadingComplete")}
                  onEdit={() => goTo("contact", -1)}
                />
              </motion.div>
            )}

            {/* ── Loading: analysis ───────────────────────────────────── */}
            {state.step === "loadingComplete" && (
              <LoadingScreen key="loadingComplete" {...LOADING_COPY.loadingComplete} />
            )}

            {/* ── Result ─────────────────────────────────────────────── */}
            {state.step === "result" && state.analysis && (
              <motion.div key="result" variants={variants} custom={state.direction} initial="enter" animate="center" exit="exit" transition={transition}>
                <ResultScreen
                  name={[state.firstName, state.lastName].filter(Boolean).join(" ")}
                  email={state.email}
                  industry={state.industry}
                  revenue={state.revenue}
                  analysis={state.analysis}
                  emailSent={state.emailSent}
                />
              </motion.div>
            )}

            {/* ── Error fallback ──────────────────────────────────────── */}
            {state.error && (
              <motion.div key="error" className="text-center py-20">
                <p className="text-slate mb-4">{state.error}</p>
                <button
                  onClick={() => dispatch({ type: "SET_STEP", step: "contact" })}
                  className="text-gold underline text-sm"
                >
                  Start over
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepHeader({ phase, question, hint }: { phase: string; question: string; hint: string }) {
  return (
    <div className="mb-8">
      <span className="inline-block text-xs font-mono text-gold/70 tracking-widest uppercase mb-3">
        {phase}
      </span>
      <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-2">
        {question}
      </h2>
      <p className="text-sm text-white/50 font-mono">{hint}</p>
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-6 flex items-center gap-1.5 text-xs font-mono text-white/35 hover:text-white/60 transition-colors"
    >
      ← Back
    </button>
  );
}

function LoadingScreen({ title, sub }: { title: string; sub: string }) {
  return (
    <motion.div
      key="loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="relative w-16 h-16 mb-8">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-gold/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border-t-2 border-gold"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-white/45 font-mono">{sub}</p>
    </motion.div>
  );
}

const COUNTRY_CODES = [
  { code: "+1", label: "US/CA +1" },
  { code: "+44", label: "UK +44" },
  { code: "+353", label: "IE +353" },
  { code: "+61", label: "AU +61" },
  { code: "+49", label: "DE +49" },
  { code: "+33", label: "FR +33" },
  { code: "+234", label: "NG +234" },
  { code: "+27", label: "ZA +27" },
  { code: "+971", label: "AE +971" },
  { code: "+91", label: "IN +91" },
];

const inputClass =
  "w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3.5 text-white placeholder-white/25 focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/30 transition-all text-base";

function ContactForm({
  firstName,
  lastName,
  email,
  phoneCountryCode,
  phoneNumber,
  company,
  onChange,
  onSubmit,
}: {
  firstName: string;
  lastName: string;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  company: string;
  onChange: (key: string, value: string) => void;
  onSubmit: () => void;
}) {
  const valid =
    firstName.trim() &&
    lastName.trim() &&
    email.includes("@") &&
    phoneNumber.replace(/\D/g, "").length >= 7 &&
    company.trim();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono text-white/50 mb-1.5 uppercase tracking-widest">
            First name
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => onChange("firstName", e.target.value)}
            placeholder="Alex"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-white/50 mb-1.5 uppercase tracking-widest">
            Last name
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => onChange("lastName", e.target.value)}
            placeholder="Morgan"
            required
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-mono text-white/50 mb-1.5 uppercase tracking-widest">
          Work email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => onChange("email", e.target.value)}
          placeholder="you@company.com"
          required
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-xs font-mono text-white/50 mb-1.5 uppercase tracking-widest">
          Phone
        </label>
        <div className="flex gap-2">
          <select
            value={phoneCountryCode}
            onChange={(e) => onChange("phoneCountryCode", e.target.value)}
            className="w-[130px] shrink-0 bg-white/8 border border-white/15 rounded-xl px-3 py-3.5 text-white focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/30 text-sm"
          >
            {COUNTRY_CODES.map((c) => (
              <option key={c.code} value={c.code} className="bg-navy text-white">
                {c.label}
              </option>
            ))}
          </select>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => onChange("phoneNumber", e.target.value)}
            placeholder="7700 900123"
            required
            className={`flex-1 ${inputClass}`}
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-mono text-white/50 mb-1.5 uppercase tracking-widest">
          Company / business name
        </label>
        <input
          type="text"
          value={company}
          onChange={(e) => onChange("company", e.target.value)}
          placeholder="Acme Operations Ltd"
          required
          className={inputClass}
        />
      </div>
      <motion.button
        type="submit"
        disabled={!valid}
        whileHover={{ scale: valid ? 1.02 : 1 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-gold text-navy font-bold py-4 rounded-xl text-base mt-2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gold/90 transition-colors"
      >
        Send me my assessment →
      </motion.button>
      <p className="text-xs text-white/30 font-mono text-center">
        Your details are saved before AI processing. We never share them.
      </p>
    </form>
  );
}

function PainPointForm({
  value,
  onChange,
  onSubmit,
  onSkip,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onSkip: () => void;
}) {
  const trimmed = value.trim();
  const atLimit = value.length >= 200;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!trimmed) return;
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, 200))}
          placeholder='e.g. "Every new client requires me to manually set up 6 different tools"'
          rows={4}
          className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3.5 text-white placeholder-white/25 focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/30 transition-all text-base resize-none leading-relaxed"
        />
        <p className="mt-2 text-xs font-mono text-white/30 text-right">
          {value.length}/200
        </p>
      </div>
      <motion.button
        type="submit"
        disabled={!trimmed}
        whileHover={{ scale: trimmed ? 1.02 : 1 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-gold text-navy font-bold py-4 rounded-xl text-base disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gold/90 transition-colors"
      >
        Continue →
      </motion.button>
      <button
        type="button"
        onClick={onSkip}
        className="w-full text-sm font-mono text-white/40 hover:text-white/60 transition-colors py-2"
      >
        Skip, I&apos;ll keep it general
      </button>
      {atLimit && (
        <p className="text-xs font-mono text-gold/60 text-center">Character limit reached</p>
      )}
    </form>
  );
}
