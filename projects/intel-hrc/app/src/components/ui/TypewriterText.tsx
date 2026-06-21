"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const EASE_DRAMATIC = [0.08, 0.82, 0.17, 1] as const;
const EASE_SMOOTH = [0.16, 1, 0.3, 1] as const;

type TypewriterLine = {
  segments: readonly { text: string; className?: string }[];
};

type CharToken = {
  char: string;
  className?: string;
  lineIndex: number;
};

function flattenLines(lines: readonly TypewriterLine[]): CharToken[] {
  const tokens: CharToken[] = [];
  lines.forEach((line, lineIndex) => {
    line.segments.forEach((segment) => {
      segment.text.split("").forEach((char) => {
        tokens.push({ char, className: segment.className, lineIndex });
      });
    });
  });
  return tokens;
}

function flattenPlain(text: string): CharToken[] {
  return text.split("").map((char) => ({ char, lineIndex: 0 }));
}

function BlinkingCursor({ className }: { className?: string }) {
  return (
    <motion.span
      aria-hidden
      animate={{ opacity: [1, 1, 0, 0] }}
      transition={{
        duration: 0.75,
        repeat: Infinity,
        times: [0, 0.45, 0.5, 1],
        ease: "linear",
      }}
      className={cn(
        "ml-[1px] inline-block h-[0.82em] w-[3px] translate-y-[0.12em] rounded-full bg-current align-baseline",
        className
      )}
    />
  );
}

export function TypewriterText({
  lines,
  plainText,
  className,
  reduced,
  stagger,
  delayChildren,
  letterDuration,
  dramatic = false,
  showCursor = true,
  cursorClassName,
  as = "span",
  ariaLabel,
}: {
  lines?: readonly TypewriterLine[];
  plainText?: string;
  className?: string;
  reduced: boolean;
  stagger: number;
  delayChildren: number;
  letterDuration: number;
  dramatic?: boolean;
  showCursor?: boolean;
  cursorClassName?: string;
  as?: "h1" | "p" | "span";
  ariaLabel?: string;
}) {
  const tokens = useMemo(
    () => (lines ? flattenLines(lines) : flattenPlain(plainText ?? "")),
    [lines, plainText]
  );
  const total = tokens.length;
  const [visibleCount, setVisibleCount] = useState(reduced ? total : 0);
  const [typingDone, setTypingDone] = useState(reduced);
  const [cursorVisible, setCursorVisible] = useState(!reduced && showCursor);

  useEffect(() => {
    if (reduced) {
      setVisibleCount(total);
      setTypingDone(true);
      setCursorVisible(false);
      return;
    }

    setVisibleCount(0);
    setTypingDone(false);
    setCursorVisible(showCursor);

    let count = 0;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        count += 1;
        setVisibleCount(count);
        if (count >= total) {
          if (intervalId) clearInterval(intervalId);
          setTypingDone(true);
          setTimeout(() => setCursorVisible(false), 900);
        }
      }, stagger * 1000);
    }, delayChildren * 1000);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [reduced, stagger, delayChildren, total, showCursor]);

  const visibleTokens = tokens.slice(0, visibleCount);
  const activeLineIndex =
    visibleCount < total
      ? (tokens[visibleCount]?.lineIndex ?? tokens[visibleCount - 1]?.lineIndex ?? 0)
      : (tokens[total - 1]?.lineIndex ?? 0);

  const lineIndices = useMemo(() => {
    const set = new Set<number>();
    tokens.forEach((token) => set.add(token.lineIndex));
    return [...set].sort((a, b) => a - b);
  }, [tokens]);

  const renderLine = (lineIndex: number) => {
    const lineTokens = visibleTokens.filter((token) => token.lineIndex === lineIndex);
    const isActiveLine = cursorVisible && lineIndex === activeLineIndex && !typingDone;
    const showLineCursor =
      showCursor &&
      cursorVisible &&
      (isActiveLine || (typingDone && lineIndex === activeLineIndex && visibleCount >= total));

    return (
      <span key={`line-${lineIndex}`} className={lineIndex > 0 ? "mt-1 block" : "block"}>
        {lineTokens.map((token, index) => (
          <motion.span
            key={`${lineIndex}-${index}-${token.char}`}
            initial={
              dramatic
                ? { opacity: 0, scale: 1.45, filter: "blur(10px)", y: -10, x: -4 }
                : { opacity: 0, y: 10, filter: "blur(3px)" }
            }
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)", y: 0, x: 0 }}
            transition={{
              duration: letterDuration,
              ease: dramatic ? EASE_DRAMATIC : EASE_SMOOTH,
            }}
            className={cn("inline-block origin-left", token.className)}
            aria-hidden
          >
            {token.char === " " ? "\u00A0" : token.char}
          </motion.span>
        ))}
        {showLineCursor ? <BlinkingCursor className={cursorClassName} /> : null}
      </span>
    );
  };

  const content =
    lines && lineIndices.length > 1
      ? lineIndices.map((lineIndex) => renderLine(lineIndex))
      : renderLine(lineIndices[0] ?? 0);

  const sharedProps = { className };

  if (as === "h1") {
    return (
      <h1 {...sharedProps} aria-label={ariaLabel}>
        {content}
      </h1>
    );
  }

  if (as === "p") {
    return (
      <p {...sharedProps} aria-label={ariaLabel ?? plainText}>
        {content}
      </p>
    );
  }

  return <span {...sharedProps}>{content}</span>;
}
