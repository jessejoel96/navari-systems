# Intel HRC — Discovery Responses (Tina-Randa)

**Respondent:** Tina-Randa (AP Accountant)  
**Email:** randa@inteloutsourcingservices.com  
**Captured:** 20 Jun 2026  
**Status:** Phase 1 discovery complete — sample files received

---

## Summary of answers

| # | Question area | Answer |
|---|---------------|--------|
| A1 | Sage import method | Upload `.txt` via Sage import screen |
| A2 | File format | Tab-separated, 8 columns (aux cols 3 & 5 used for supplier/interco refs) |
| A3 | Header row | No — data rows only |
| A4 | Journal codes used | 4–6 regularly |
| A5 | Invoice + VAT in `.txt` | Three lines (expense + VAT + supplier credit) |
| A6 | Import batching | Multiple invoices in one `.txt` file |
| A7 | Post-import feedback | On-screen confirmation only |
| A8 | Sample file | Yes — provided |
| B1 | Invoice arrival | Mix: email + WhatsApp + paper |
| B2 | Invoice format | Mix PDF and photo/scan |
| B3 | Volume | 10–30 invoices/week |
| B4 | Workflow | See workflow chain below |
| B5 | Stuck reasons | CFO approval wait, tax non-compliance, amount mismatch |
| B6 | Time per invoice | Under 15 minutes |
| C1 | CFO validation | Physical signing alongside payment sheet + SOA on Sage |
| C2 | CFO response | Signs physical document |
| C3 | CFO turnaround | 1–2 business days |
| C4 | No response | Call or visit in person |
| C5 | Approval tracking | No real tracking today |
| C6 | Preferred approval | Email link **and** web dashboard |
| C7 | First reminder | 1 week |
| D1 | Email | Personal: randa@inteloutsourcingservices.com |
| D2 | Forwarding setup | **Set up** — forwarding to intake address live |
| D3 | What to forward | Attachments only, or Tina manually forwards |
| D4 | Send approvals from | Tina's personal email |
| E1 | Sage companies | One Sage file per entity — **8 folders confirmed** (see `sage-company-folders.txt`) |
| E2 | Regional cash requests | Email with Excel attachment |
| E3 | Justifications | Same email as cash request; one person uploads to SharePoint |
| F1 | Payment sheet recipient | Head Tax, Payroll & AP (Christelle) first |
| F2 | Payment template | Yes — can share |
| F3 | Auto-generate Excel | Yes — exact same columns |
| G1 | Demo priority | All: intake + CFO tracking + Sage `.txt` + payment sheets |
| G2 | Demo entities | All 7 with sample data |
| G3 | Comfort with web app | Very comfortable |
| G4 | Demo users | Tina + CFO + Finance team |

---

## Confirmed workflow chain (B4)

```
Proforma sent to Supplier
    → AP creates PO and sends to Supplier to proceed
    → Supplier sends Invoice
    → Delivery note issued
    → AP matches Invoice with PO
    → AP prepares Supplier Payment Sheet
    → Physical sign-off (CFO) alongside SOA confirmation on Sage
    → Payment execution (bank monthly / Maviance daily-weekly)
```

---

## Sage environment (from sample + screenshot)

| Detail | Value |
|--------|-------|
| Product | **Sage 100 Comptabilité** (desktop) |
| API | **None** — manual `.txt` import only |
| Company paths | `g:\Sage\Companies\{ENTITY}` e.g. `IOS_CDI_2023`, `IOS NIGER`, `IOSCAM3` |
| Active profile (screenshot) | `INTEL332021` |
| Import log | Operation journal — confirms 0 errors on success |
| Sample journal code | `OPD` (Opérations Diverses) |
| Date format | `DD/MM/YYYY` |

### Sage `.txt` column layout (from sample file)

Tab-separated, **8 columns**, no header row:

| Col | Field | Example |
|-----|-------|---------|
| 1 | Journal code | `OPD` |
| 2 | Date | `01/01/2026` |
| 3 | Auxiliary (debit) | *(empty in sample)* |
| 4 | GL account | `6222100` |
| 5 | Auxiliary (credit) | *(empty in sample)* |
| 6 | Label / description | `SCI PLANET - Rent Yard Jan-26` |
| 7 | Debit amount | `1290000` |
| 8 | Credit amount | *(empty on debit lines)* |

Credit lines put amount in column 8, column 7 empty.

**Pair pattern (prepaid/accrual):** Each expense posts as Dr expense + Cr `4761000` (prepaid suspense) on same date/label.

**Supplier invoice pattern (A5):** Three lines expected — Dr expense, Dr VAT (445x), Cr supplier (4011).

See [sage-txt-format.md](./sage-txt-format.md) for full spec.

---

## Seven entities

From intercompany recons sheet and Sage paths:

| Entity | Sage folder (known) | Intercompany column |
|--------|---------------------|---------------------|
| INTEL HRC | INTEL332021 | C/E Intel HRC |
| IOS CMR | IOSCAM3 | C/E IOS CMR |
| IOS CIV | IOS_CDI_2023 | C/E IOS CIV |
| IOS BF | — | C/E IOS BF |
| IOS MALI | — | C/E IOS MALI |
| IOS DRC | — | C/E IOS DRC |
| IOS SEN | — | C/E IOS SEN |
| IOS NGR | IOS NIGER | C/E IOS NGR |

Each entity = **separate Sage company file**. App must generate **one `.txt` per entity** for intercompany splits.

---

## Two payment channels

| Channel | Sheet | Cadence | Approvers | Method |
|---------|-------|---------|-----------|--------|
| **Bank payments** | Supplier Payment Sheet 2026.xlsx | Monthly | Christelle (Head Tax/Payroll/AP) → CFO sign | Bank transfer |
| **Maviance (mobile money)** | MAVIANCE REPORT.xlsx | Daily / weekly | CFO + CEO columns | Mobile Money |

### Supplier Payment Sheet columns

`S/N`, `SUPPLIER`, `DATE DE FACTURATION`, `DUE DATE`, `INVOICE NUMBER`, `DESCRIPTION`, `WHT BASE`, `AMOUNT HT`, `VAT`, `WHT`, `ARREARS`, `ADVANCE/AVOIR` (+ entity/totals columns)

Monthly tabs per period (JAN 26, FEB 26, …). Multiple tabs per month possible (2nd badge, EBURY, VTIC).

### Maviance tracker columns

`S/N`, `DATE`, `DESCRIPTION/PURPOSE`, `BENEFICIARY`, `CATEGORY`, `AMOUNT REQUESTED (XAF)`, `CFO APPROVAL`, `CEO APPROVAL`, `AMOUNT RELEASED (XAF)`, `PAYMENT METHOD`, `RECEIPT/REF NO.`, `REMARKS`

Daily sheets + monthly summary (`JUNE 26`). Tracks wallet opening balance.

---

## Intercompany cost splitting

When one invoice spans multiple entities, Tina uses **AP INTERCOMPANY RECONS SHEET**:

| Column | Purpose |
|--------|---------|
| Contracting entity | Entity that received the invoice |
| Supplier / Invoice N° | Source document |
| T.A.I | Total invoice amount |
| C/E IOS CMR … C/E IOS NGR | Cost allocation per entity |
| *(check column)* | Must sum to T.A.I |

App must: split invoice → generate **one Sage `.txt` per entity** with allocated amounts.

---

## Regional offices

- Cash requests: **Excel via email** (sample: Senegal/Yaoundé sheets)
- Justifications: **same email**; uploaded to **SharePoint** by one person
- Cash request sheet includes: office rep, period, balance, amount requested/approved, line-item breakdown
- Some sheets include embedded `Sage_Import_June26` tab — regional offices already produce partial Sage imports

---

## Scanned / physical invoices

Tina needs to **upload scanned copies** (photos of paper invoices) into the system for **OCR data extraction** — same pipeline as PDF/email invoices.

Supported inputs: PDF, JPEG, PNG, scanned multi-page.

---

## Infrastructure decisions

| Layer | Choice |
|-------|--------|
| **Hosting** | Hostinger Node — subdomain (e.g. `ap.intelhrc.navari.systems`) |
| **Database** | Supabase (Postgres) — source of truth, auth, storage, API |
| **Operational UI** | Airtable — sortable tables, dashboards, weekly reports, portfolios |
| **AI assistant** | Qwen — suggestions, data queries, interacting with AP data |
| **Email outbound** | Resend from workflow address (Tina's personal send requires M365 — not available) |
| **Email inbound** | Forwarding to Navari intake address **live** + manual upload fallback |
| **Sage integration** | Generate `.txt` download → Tina imports manually |

---

## Open items still needed

| Item | Owner | Status |
|------|-------|--------|
| Full journal code list with meanings | Tina | **Partial** — see `sage-entity-structure.md` |
| Sample `.txt` with 401 supplier + WHT | Tina | **Received** — `sample-sage-import-cons-civ-may26.txt` |
| Intercompany `.txt` pattern | Tina | **Received** — `sample-sage-import-fraxbit-civ.txt` |
| Sage structure / chart / supplier aux | Tina | **Received** — `sage-structure.xlsx` |
| SYSCOHADA plan reference | Tina | **Received** — `revised-syscohada-accounting-plan.pdf` |
| Sample `.txt` with VAT (`445x`) | Tina | **Received** — `sample-sage-export-vat-orange-hq.txt` (Sage export; mapped to PURC import) |
| All 8 Sage folder paths on `g:\Sage\Companies\` | Tina | **Received** — `sage-company-folders.txt` |
| PURC vs ACH journal rule | Tina | **Confirmed** — Intel HRC = `PURC`, all IOS = `ACH` |
| Email forwarding to intake address | IT/Tina | **Set up** |
| SharePoint folder structure for justifications | Tina | Still needed |

---

## Source files received

| File | Location |
|------|----------|
| Sage import sample | `source/sample-sage-import.txt` |
| Supplier Payment Sheet | `source/supplier-payment-sheet-2026.xlsx` |
| Maviance Report | `source/maviance-report.xlsx` |
| Cash Request (Senegal) | `source/cash-request-sheet-senegal-2026.xlsx` |
| Intercompany recons | `source/intercompany-recons-2026.csv` |
| Sage import screen | `source/sage-import-screen.png` |
| Sage structure (all entities) | `source/sage-structure.xlsx` |
| SYSCOHADA accounting plan | `source/revised-syscohada-accounting-plan.pdf` |
| Sample ACH + WHT (401 supplier) | `source/sample-sage-import-cons-civ-may26.txt` |
| Sample intercompany split | `source/sample-sage-import-fraxbit-civ.txt` |
| Sample prepaid/accrual (OPD) | `source/sample-sage-import.txt` |
| Sample VAT invoice (HQ Orange) | `source/sample-sage-export-vat-orange-hq.txt` |
| Sage company folder names | `source/sage-company-folders.txt` |
