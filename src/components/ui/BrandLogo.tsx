import Image from "next/image";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/constants";

type BrandLogoProps = {
  variant?: "transparent" | "full";
  className?: string;
  priority?: boolean;
};

export function BrandLogo({ variant = "full", className, priority = false }: BrandLogoProps) {
  const src = variant === "transparent" ? SITE.brand.logoTransparent : SITE.brand.logoFull;

  return (
    <Image
      src={src}
      alt={SITE.name}
      width={1024}
      height={432}
      className={cn("h-[6.75rem] w-auto", className)}
      priority={priority}
    />
  );
}
