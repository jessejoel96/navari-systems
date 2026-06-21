# Intel HRC — AP Automation Project

Navari Systems engagement to design and build an automated Accounts Payable workflow for **Intel HRC** (Payroll & Employment Services).

**Current stack:** Sage 100 Comptabilité (.txt import) · Excel · Outlook  
**App stack:** Next.js (Hostinger) · Supabase · Airtable · Qwen · Resend  
**Scope:** 7 Sage company files · 6 regional offices · SYSCOHADA / OHADA compliance  
**AP Accountant:** Tina-Randa (randa@inteloutsourcingservices.com)

---

## Folder structure

```
projects/intel-hrc/
├── README.md                          ← this file
├── docs/
│   ├── accounting-department.md       ← SOP-derived department reference & workflow blueprint
│   ├── ap-accountant-tasks.md         ← Tina-Randa's daily / weekly / monthly tasks
│   ├── discovery-questionnaire.md     ← 70 MCQ questions (sent to Tina)
│   ├── discovery-responses.md         ← Tina's answers + sample file analysis
│   ├── sage-txt-format.md             ← Sage .txt column spec (from real sample)
│   └── application-architecture.md    ← v2: Supabase + Airtable + Qwen + Hostinger
└── source/
    ├── intel-hrc-sops.pdf
    ├── monthly-tasks-ap-accountant.xlsx
    ├── sample-sage-import.txt           ← real Sage import sample (OPD journal)
    ├── supplier-payment-sheet-2026.xlsx ← monthly bank payment template
    ├── maviance-report.xlsx             ← daily/weekly mobile money tracker
    ├── cash-request-sheet-senegal-2026.xlsx
    ├── intercompany-recons-2026.csv     ← 7-entity cost split template
    └── sage-import-screen.png
```

---

## Documents

| File | Description |
|------|-------------|
| [accounting-department.md](./docs/accounting-department.md) | Full department reference: roles, GL mappings, procurement-to-payment workflow, DoA thresholds, 7-module automation blueprint |
| [ap-accountant-tasks.md](./docs/ap-accountant-tasks.md) | Tina-Randa's task register — daily (7), weekly (9), monthly (12) — with reviewers, time estimates, and automation mapping |
| [discovery-responses.md](./docs/discovery-responses.md) | Tina's MCQ answers, workflow chain, two payment channels, infrastructure decisions |
| [sage-entity-structure.md](./docs/sage-entity-structure.md) | 8 entities, journal codes, supplier aux, interco INC codes — from SAGE STRUCTURE.xlsx |
| [sage-txt-format.md](./docs/sage-txt-format.md) | `.txt` spec: ACH/WHT 3-line, intercompany split, OPD prepaid patterns |
| [application-architecture.md](./docs/application-architecture.md) | v2 architecture: Supabase + Airtable + Qwen + Hostinger demo |

---

## Key facts (quick reference)

| Item | Detail |
|------|--------|
| AP Accountant | Tina-Randa |
| Payment cut-off | Wednesday 12:00 |
| Payment execution | Friday (weekly run) |
| Entities | 7 (daily focus: INTEL HRC + IOS CMR) |
| Regional offices | 6 (cash requests + justifications) |
| Three-way match | PO + delivery note + invoice |
| Record retention | 10 years |
| Month-end AP tasks | ME+2 pre-close collection → ME+3 posting & recon |

---

## Next steps

1. **Phase 0 demo** — scaffold Next.js on Hostinger subdomain + Supabase
2. **Invoice upload + OCR** — including scanned paper invoices
3. **CFO approval emails** — Resend with 7-day reminder (per Tina's preference)
4. **Sage `.txt` generator** — 3-line supplier invoice pattern + intercompany zip
5. **Payment sheet generators** — bank (monthly) + Maviance (daily/weekly)
6. **Airtable sync** — dashboards + weekly report
7. **Qwen assistant** — AP status queries and follow-up drafts

---

*Prepared by Navari Systems · Not for external distribution without client approval*
