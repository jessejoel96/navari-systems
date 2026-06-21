import { cn } from "@/lib/utils";
import { GradientBorderPanel } from "@/components/layout/gradient-border";

type AppPageHeaderProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  compact?: boolean;
};

export function AppPageHeader({
  title,
  description,
  children,
  className,
  compact = false,
}: AppPageHeaderProps) {
  return (
    <GradientBorderPanel
      className={cn("rounded-2xl shadow-sm", className)}
      innerClassName={cn(
        "overflow-hidden rounded-[calc(1rem-1px)]",
        compact ? "px-5 py-4" : "px-6 py-5"
      )}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1
            className={cn(
              "font-semibold text-gray-900",
              compact ? "text-lg" : "text-xl lg:text-2xl"
            )}
          >
            {title}
          </h1>
          {description ? (
            <p className="mt-1 max-w-2xl text-sm text-gray-500">{description}</p>
          ) : null}
        </div>
        {children}
      </div>
    </GradientBorderPanel>
  );
}
