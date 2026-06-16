import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { SITE } from "@/lib/constants";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const defaultTitle = `${SITE.name} | ${SITE.titleSuffix}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: defaultTitle,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [...SITE.keywords],
  authors: [{ name: SITE.founder, url: SITE.founderSite }],
  creator: SITE.founder,
  publisher: SITE.name,
  applicationName: SITE.name,
  category: "Business Services",
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: SITE.url,
    siteName: SITE.name,
    title: defaultTitle,
    description: SITE.description,
    images: [
      {
        url: SITE.brand.ogImage,
        width: 1200,
        height: 630,
        alt: `${SITE.name} — ${SITE.slogan}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: SITE.description,
    images: [SITE.brand.ogImage],
  },
  icons: {
    icon: SITE.brand.logoIcon,
    apple: SITE.brand.logoIcon,
    shortcut: SITE.brand.logoIcon,
  },
  alternates: { canonical: SITE.url },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.name,
  url: SITE.url,
  email: SITE.email,
  logo: `${SITE.url}${SITE.brand.logoIcon}`,
  slogan: SITE.slogan,
  description: SITE.description,
  founder: {
    "@type": "Person",
    name: SITE.founder,
    url: SITE.founderSite,
    jobTitle: SITE.founderTitle,
  },
  sameAs: [SITE.linkedin, SITE.youtube],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="flex min-h-full flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
