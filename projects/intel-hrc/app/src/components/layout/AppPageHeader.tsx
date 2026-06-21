import { cn } from "@/lib/utils";

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
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#063B63] via-[#1F6DB3] to-[#39B54A]/35 shadow-sm",
        compact ? "px-5 py-4" : "px-6 py-5",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_0%_0%,rgba(255,255,255,0.12),transparent)]" />
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-brand-green/20 blur-3xl" />
      <div className="relative flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1
            className={cn(
              "font-semibold text-white",
              compact ? "text-lg" : "text-xl lg:text-2xl"
            )}
          >
            {title}
          </h1>
          {description ? (
            <p className="mt-1 max-w-2xl text-sm text-blue-100/90">{description}</p>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
}
