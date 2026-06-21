import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  href?: string;
  className?: string;
  imageClassName?: string;
};

export function BrandLogo({
  href,
  className,
  imageClassName = "h-10 w-auto",
}: BrandLogoProps) {
  const logo = (
    <Image
      src="/intel-hrc-logo.png"
      alt="Intel HRC — Payroll & Employment Services"
      width={220}
      height={56}
      priority
      className={cn(imageClassName)}
    />
  );

  if (href) {
    return (
      <Link href={href} className={cn("inline-flex shrink-0", className)}>
        {logo}
      </Link>
    );
  }

  return <div className={cn("inline-flex shrink-0", className)}>{logo}</div>;
}
