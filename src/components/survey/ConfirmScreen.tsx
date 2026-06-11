"use client";

import { motion } from "framer-motion";

interface Props {
  name: string;
  industry: string;
  subIndustry?: string;
  reflection: string;
  onConfirm: () => void;
  onEdit: () => void;
}

export function ConfirmScreen({ name, industry, subIndustry, reflection, onConfirm, onEdit }: Props) {
  const paragraphs = reflection.split("\n\n").filter(Boolean);

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <span className="inline-block text-xs font-mono text-gold/70 tracking-widest uppercase mb-3">
          Preliminary Read
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
          Here is what we are seeing, {name.split(" ")[0]}
        </h2>
      </motion.div>

      {/* Industry badge */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="inline-flex items-center gap-2 text-xs font-mono text-white/60 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full mb-6"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-gold/60" />
        {industry}{subIndustry ? ` · ${subIndustry}` : ""}
      </motion.div>

      {/* Reflection */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white/6 border border-white/12 rounded-2xl p-6 mb-8 space-y-4"
      >
          {paragraphs.map((para, i) => (
          <p key={i} className="text-white/90 text-base leading-relaxed">
            {para}
          </p>
        ))}
      </motion.div>

      {/* Confirmation prompt */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        className="mb-4"
      >
        <p className="text-sm font-mono text-white/55 mb-4">
          Does this match what you are experiencing?
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <motion.button
            onClick={onConfirm}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 bg-gold text-navy font-bold py-4 rounded-xl text-base hover:bg-gold/90 transition-colors"
          >
            Yes — show me the numbers →
          </motion.button>
          <motion.button
            onClick={onEdit}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 sm:flex-none sm:w-auto border border-white/15 text-white/70 px-5 py-4 rounded-xl text-sm hover:border-white/30 hover:text-white transition-colors"
          >
            This is off — let me adjust
          </motion.button>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xs text-white/30 font-mono"
      >
        Confirming generates your full preliminary assessment with cost estimates.
      </motion.p>
    </div>
  );
}
