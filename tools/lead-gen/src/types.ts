import { z } from "zod";

export const icpSchema = z.object({
  name: z.string().default("custom"),
  description: z.string().optional(),
  discovery_provider: z.enum(["web", "exa", "hybrid", "apollo"]).default("hybrid"),
  /** Apollo free plan: search is free; enrichment costs credits (~50/mo on free). */
  apollo_plan: z.enum(["free", "paid"]).default("free"),
  /** Max Apollo enrich credits per fetch run (free plan: keep ≤10 to preserve monthly budget). */
  apollo_enrich_limit: z.number().int().min(0).max(50).default(10),
  person_titles: z.array(z.string()).default([]),
  person_seniorities: z.array(z.string()).default([]),
  organization_industries: z.array(z.string()).default([]),
  organization_num_employees_ranges: z.array(z.string()).default([]),
  person_locations: z.array(z.string()).default([]),
  q_organization_keyword_tags: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  /** Buyer persona label — see projects/outbound-lead-gen/BUYER-PERSONAS.md */
  persona: z.string().optional(),
  /** What to look for during 15-min observation research */
  observation_focus: z.string().optional(),
  per_page: z.number().int().min(1).max(100).default(25),
  max_pages: z.number().int().min(1).max(10).default(1),
});

export type IcpConfig = z.infer<typeof icpSchema>;

export const prospectSchema = z.object({
  external_id: z.string().optional(),
  apollo_id: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  full_name: z.string().optional(),
  title: z.string().optional(),
  email: z.string().email().optional(),
  email_status: z.string().optional(),
  linkedin_url: z.string().optional(),
  company_name: z.string().optional(),
  company_domain: z.string().optional(),
  company_industry: z.string().optional(),
  company_size: z.string().optional(),
  location: z.string().optional(),
  icp_score: z.number().min(0).max(100).default(0),
  icp_tier: z.enum(["hot", "warm", "cold"]).default("cold"),
  source: z.string().default("web"),
  /** Layer One observation — required before touch 1 (see OUTREACH-METHOD.md) */
  persona: z.string().optional(),
  observation: z.string().optional(),
  observation_source: z.string().optional(),
  raw: z.record(z.unknown()).optional(),
});

export type Prospect = z.infer<typeof prospectSchema>;

export type FetchRunSummary = {
  run_id: string;
  icp_name: string;
  provider: string;
  searched: number;
  enriched: number;
  verified: number;
  saved: number;
  hot: number;
  warm: number;
  cold: number;
  apollo_credits_used?: number;
};

export type OutreachSummary = {
  sequence: string;
  sent: number;
  dry_run: boolean;
};
