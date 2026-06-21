import { cn } from "@/lib/utils";

/** Shared brand gradient used for panel borders (matches AppPageHeader). */
export const gradientBorderHorizontal =
  "bg-gradient-to-r from-brand-blue via-[#2a7fc4] to-brand-green";

export const gradientBorderVertical =
  "bg-gradient-to-b from-brand-blue via-[#2a7fc4] to-brand-green";

export const gradientPanelWash =
  "bg-gradient-to-br from-brand-blue/[0.03] via-transparent to-brand-green/[0.04]";

export function GradientDivider({
  className,
  orientation = "horizontal",
}: {
  className?: string;
  orientation?: "horizontal" | "vertical";
}) {
  return (
    <div
      aria-hidden
      className={cn(
        orientation === "horizontal"
          ? cn("h-[1px] w-full shrink-0", gradientBorderHorizontal)
          : cn("w-[1px] shrink-0 self-stretch", gradientBorderVertical),
        className
      )}
    />
  );
}

type GradientBorderPanelProps = {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  borderDirection?: "horizontal" | "vertical";
  wash?: boolean;
};

/** Outer gradient ring + inner white panel (same structure as page headers). */
export function GradientBorderPanel({
  children,
  className,
  innerClassName,
  borderDirection = "horizontal",
  wash = true,
}: GradientBorderPanelProps) {
  const borderClass =
    borderDirection === "vertical" ? gradientBorderVertical : gradientBorderHorizontal;

  return (
    <div className={cn(borderClass, "p-px", className)}>
      <div className={cn("relative h-full w-full min-h-0 bg-white", innerClassName)}>
        {wash ? (
          <div
            className={cn(
              "pointer-events-none absolute inset-0",
              gradientPanelWash
            )}
          />
        ) : null}
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}
