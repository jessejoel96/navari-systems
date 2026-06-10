export const SITE = {
  name: "Navari Systems",
  tagline: "Precision enters where chaos was.",
  description:
    "AI Automation & Workflow Systems for small and mid-sized businesses. I find the three processes costing you the most time and money, then build AI systems that eliminate them permanently.",
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
