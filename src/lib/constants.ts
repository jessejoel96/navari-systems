export const SITE = {
  name: "Navari Systems",
  tagline: "Automate what costs you the most.",
  description:
    "We find your three costliest manual processes and automate them. Fixed price. Fixed timeline. For owners doing $15k+/month.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://navari.systems",
  email: "jesse@navari.systems",
  calendly: "https://calendly.com/jesse-navari",
  founder: "Jesse-Joel Nzumafor",
  linkedin: "https://linkedin.com/in/jessejoel",
  youtube: "https://youtube.com/@jessejoel",
} as const;

export const NAV_LINKS = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Services", href: "/#services" },
  { label: "Industries", href: "/#industries" },
  { label: "Results", href: "/#results" },
  { label: "Blog", href: "/blog" },
  { label: "Insights", href: "/insights" },
] as const;

export const INDUSTRIES = [
  "All",
  "Real Estate",
  "Online Education",
  "Professional Services",
  "E-commerce",
  "Marketing Agencies",
] as const;

export type Industry = (typeof INDUSTRIES)[number];
