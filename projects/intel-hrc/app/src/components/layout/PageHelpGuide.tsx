"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, HelpCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PageGuide } from "@/lib/page-guides";

function storageKey(guideId: string) {
  return `intel-hrc-guide-dismissed:${guideId}`;
}

export function PageHelpGuide({ guide }: { guide: PageGuide }) {
  const [open, setOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const wasDismissed = sessionStorage.getItem(storageKey(guide.id)) === "1";
    setDismissed(wasDismissed);
    if (!wasDismissed) {
      const timer = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(timer);
    }
  }, [guide.id]);

  const dismiss = () => {
    sessionStorage.setItem(storageKey(guide.id), "1");
    setOpen(false);
    setDismissed(true);
  };

  const reopen = () => {
    setSlideIndex(0);
    setOpen(true);
  };

  const slide = guide.slides[slideIndex];
  const isLast = slideIndex >= guide.slides.length - 1;

  return (
    <>
      {dismissed && !open ? (
        <button
          type="button"
          onClick={reopen}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-brand-blue/20 bg-white px-4 py-2.5 text-sm font-medium text-brand-blue shadow-lg transition hover:bg-brand-blue-light"
          aria-label="Show page help"
        >
          <HelpCircle className="h-4 w-4" />
          Page help
        </button>
      ) : null}

      <AnimatePresence>
        {open && slide ? (
          <motion.div
            initial={{ opacity: 0, y: 48, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 left-1/2 z-50 w-[min(92vw,520px)] -translate-x-1/2"
            role="dialog"
            aria-labelledby="page-help-title"
            aria-describedby="page-help-body"
          >
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-blue/40 via-brand-blue/20 to-brand-green/40" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-blue/[0.04] via-transparent to-brand-green/[0.05]" />
              <div className="relative p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 text-brand-blue">
                    <HelpCircle className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Page guide · {slideIndex + 1} of {guide.slides.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={dismiss}
                    className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                    aria-label="Close page guide"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={slideIndex}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <h2 id="page-help-title" className="text-lg font-semibold text-gray-900">
                      {slide.title}
                    </h2>
                    <p id="page-help-body" className="mt-2 text-sm leading-relaxed text-gray-600">
                      {slide.body}
                    </p>
                  </motion.div>
                </AnimatePresence>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <div className="flex gap-1.5">
                    {guide.slides.map((_, index) => (
                      <span
                        key={index}
                        className={cn(
                          "h-1.5 rounded-full transition-all",
                          index === slideIndex
                            ? "w-6 bg-brand-blue"
                            : "w-1.5 bg-gray-200"
                        )}
                        aria-hidden
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={slideIndex === 0}
                      onClick={() => setSlideIndex((prev) => Math.max(0, prev - 1))}
                      className="rounded-lg border border-gray-200 p-2 text-gray-600 transition enabled:hover:bg-gray-50 disabled:opacity-40"
                      aria-label="Previous tip"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {isLast ? (
                      <button
                        type="button"
                        onClick={dismiss}
                        className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-blue-deep"
                      >
                        Got it
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setSlideIndex((prev) => Math.min(guide.slides.length - 1, prev + 1))
                        }
                        className="inline-flex items-center gap-1 rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-blue-deep"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
