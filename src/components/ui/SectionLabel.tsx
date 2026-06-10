import { cn } from "@/lib/utils";

type SectionLabelProps = {
  children: React.ReactNode;
  className?: string;
};

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <div
      className={cn(
        "mb-4 flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-gold",
        className
      )}
    >
      {children}
      <span className="h-px max-w-10 flex-1 bg-gold" />
    </div>
  );
}
