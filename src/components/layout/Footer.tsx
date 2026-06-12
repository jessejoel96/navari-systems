import Link from "next/link";
import { ConvergenceMark } from "@/components/ui/ConvergenceMark";
import { SITE } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-gold/10 bg-footer-bg px-5 py-12 md:px-10">
      <div className="mx-auto flex max-w-[1100px] flex-wrap justify-between gap-10">
        <div className="max-w-xs">
          <Link href="/" className="flex items-center gap-3">
            <ConvergenceMark />
            <div className="flex flex-col leading-none">
              <span className="font-display text-[15px] font-extrabold tracking-[0.18em] text-white">NAVARI</span>
              <span className="mt-0.5 font-display text-[11px] tracking-[0.18em] text-silver-dark-bg">SYSTEMS</span>
            </div>
          </Link>
          <p className="mt-3 text-base leading-relaxed text-silver-dark-bg">
            We find where your business loses time and money, build the automation that fixes
            it, and hand it over to your team. {SITE.tagline}
          </p>
        </div>

        <div>
          <h5 className="mb-4 font-display text-sm font-bold uppercase tracking-wide text-white">Services</h5>
          <ul className="flex flex-col gap-2.5 text-base text-silver-dark-bg">
            <li><Link href="/#services" className="hover:text-gold">The Navari Audit ($497)</Link></li>
            <li><Link href="/#services" className="hover:text-gold">The Navari Build (from $800)</Link></li>
            <li><Link href="/#services" className="hover:text-gold">Infrastructure Expansion (from $500/mo)</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="mb-4 font-display text-sm font-bold uppercase tracking-wide text-white">Industries</h5>
          <ul className="flex flex-col gap-2.5 text-base text-silver-dark-bg">
            <li><Link href="/#workflows" className="hover:text-gold">Real Estate</Link></li>
            <li><Link href="/#workflows" className="hover:text-gold">Online Education</Link></li>
            <li><Link href="/#workflows" className="hover:text-gold">Professional Services</Link></li>
            <li><Link href="/#workflows" className="hover:text-gold">Healthcare</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="mb-4 font-display text-sm font-bold uppercase tracking-wide text-white">Contact</h5>
          <ul className="flex flex-col gap-2.5 text-base text-silver-dark-bg">
            <li><a href={`mailto:${SITE.email}`} className="hover:text-gold">{SITE.email}</a></li>
            <li><a href={SITE.calendly} target="_blank" rel="noopener noreferrer" className="hover:text-gold">Free Operations Review</a></li>
            <li><a href={SITE.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-gold">LinkedIn</a></li>
            <li><a href={SITE.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-gold">YouTube</a></li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-[1100px] flex-wrap items-center justify-between gap-3 border-t border-white/6 pt-6">
        <span className="font-mono text-sm tracking-wide text-silver-dark-bg/80">© 2026 NAVARI SYSTEMS · navari.systems</span>
        <span className="font-mono text-sm tracking-wide text-silver-dark-bg/80">JESSE-JOEL NZUMAFOR · CIM LEVEL 6</span>
      </div>
    </footer>
  );
}
