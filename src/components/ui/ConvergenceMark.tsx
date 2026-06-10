import { cn } from "@/lib/utils";

type ConvergenceMarkProps = {
  variant?: "nav" | "hero";
  className?: string;
};

export function ConvergenceMark({ variant = "nav", className }: ConvergenceMarkProps) {
  if (variant === "hero") {
    return (
      <div className={cn("hero-convergence mx-auto mb-9 h-[60px] w-[180px]", className)}>
        <svg viewBox="0 0 180 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
          <line className="line-top" x1="0" y1="8" x2="86" y2="30" stroke="#8A9BB0" strokeWidth="1.5" />
          <line className="line-mid" x1="0" y1="30" x2="86" y2="30" stroke="#8A9BB0" strokeWidth="2" />
          <line className="line-bot" x1="0" y1="52" x2="86" y2="30" stroke="#8A9BB0" strokeWidth="1.5" />
          <circle className="node-circle" cx="90" cy="30" r="5" fill="#C9A84C" />
          <line className="line-out" x1="95" y1="30" x2="180" y2="30" stroke="#C9A84C" strokeWidth="2.5" />
        </svg>
      </div>
    );
  }

  return (
    <svg
      className={cn("h-6 w-9 shrink-0", className)}
      viewBox="0 0 48 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <line x1="0" y1="4" x2="24" y2="16" stroke="#8A9BB0" strokeWidth="1.2" />
      <line x1="0" y1="16" x2="24" y2="16" stroke="#8A9BB0" strokeWidth="1.5" />
      <line x1="0" y1="28" x2="24" y2="16" stroke="#8A9BB0" strokeWidth="1.2" />
      <circle cx="24" cy="16" r="3" fill="#C9A84C" />
      <line x1="27" y1="16" x2="48" y2="16" stroke="#C9A84C" strokeWidth="2" />
    </svg>
  );
}
