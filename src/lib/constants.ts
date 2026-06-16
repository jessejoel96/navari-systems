export const SITE = {
  name: "Navari Systems",
  slogan: "Precision enters where chaos was.",
  titleSuffix: "Business Process Automation",
  description:
    "Navari Systems maps your three costliest manual processes and automates them. Fixed price. Fixed timeline. For business owners doing $15k+ per month. Precision enters where chaos was.",
  shortDescription:
    "We map where your business loses time and money, build the automation that fixes it, and hand it over to your team.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://navari.systems",
  email: "jesse@navari.systems",
  calendly: "https://calendly.com/jesse-navari",
  founder: "Jesse-Joel S. Nzumafor",
  founderTitle: "AI Automation Specialist & Founder",
  founderSite: "https://jessejoel.navari.systems",
  linkedin: "https://linkedin.com/in/jessejoel",
  youtube: "https://youtube.com/@jessejoel",
  brand: {
    logoFull: "/brand/logo-full.png",
    logoTransparent: "/brand/logo-transparent.png",
    logoIcon: "/brand/logo-icon.png",
    ogImage: "/brand/og-image.png",
  },
  keywords: [
    "business process automation",
    "workflow automation",
    "operations automation",
    "manual process audit",
    "Make.com automation",
    "n8n automation",
    "real estate automation",
    "online education automation",
    "professional services automation",
    "Navari Systems",
  ],
} as const;

export const NAV_LINKS = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Services", href: "/#services" },
  { label: "Workflows", href: "/#workflows" },
  { label: "Results", href: "/#results" },
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
