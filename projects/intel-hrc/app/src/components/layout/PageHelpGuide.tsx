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
            <div className="overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-[#063B63] via-[#1F6DB3] to-[#39B54A]/50 shadow-2xl">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_100%_0%,rgba(57,181,74,0.25),transparent)]" />
              <div className="relative p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 text-blue-100/90">
                    <HelpCircle className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Page guide · {slideIndex + 1} of {guide.slides.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={dismiss}
                    className="rounded-lg p-1.5 text-blue-100/80 transition hover:bg-white/10 hover:text-white"
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
                    <h2 id="page-help-title" className="text-lg font-semibold text-white">
                      {slide.title}
                    </h2>
                    <p id="page-help-body" className="mt-2 text-sm leading-relaxed text-blue-100/90">
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
                            ? "w-6 bg-white"
                            : "w-1.5 bg-white/35"
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
                      className="rounded-lg border border-white/20 p-2 text-white transition enabled:hover:bg-white/10 disabled:opacity-40"
                      aria-label="Previous tip"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {isLast ? (
                      <button
                        type="button"
                        onClick={dismiss}
                        className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-brand-blue-deep transition hover:bg-blue-50"
                      >
                        Got it
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setSlideIndex((prev) => Math.min(guide.slides.length - 1, prev + 1))
                        }
                        className="inline-flex items-center gap-1 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-brand-blue-deep transition hover:bg-blue-50"
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
