# Sage 100 — Entity Structure & Master Data

**Source:** `source/sage-structure.xlsx` + Operation journal screenshot  
**Captured:** 20 Jun 2026  
**Related:** [sage-txt-format.md](./sage-txt-format.md)

---

## Overview

Intel HRC operates **8 Sage company files** (7 IOS entities + HQ). Each has its own:

- Chart of accounts (account digit length varies by entity)
- Supplier auxiliary codes (`FRxxxx` or `4011xxx`)
- Intercompany auxiliary codes (`INCxx`)
- Journal codes — **`PURC` at Intel HRC (HQ)**, **`ACH` at all IOS subsidiaries**

Tina imports `.txt` files into the matching folder under `g:\Sage\Companies\{FOLDER}`.

---

## Sage company folders (confirmed)

Full list from Tina — path: `g:\Sage\Companies\{FOLDER}`

| Entity | Sage folder name |
|--------|------------------|
| **INTEL HRC** (HQ) | `Intel 332021` |
| **IOS CMR** (Cameroon) | `IOS CAM3` |
| **IOS CIV** (Côte d'Ivoire) | `IOS_CDI_2023` |
| **IOS BF** (Burkina Faso) | `IOS BUKINA FASO` |
| **IOS SEN** (Senegal) | `IOS_SEN` |
| **IOS RDC** (Congo) | `IOS_RDC` |
| **IOS NIGER** (Niger) | `IOS NIGER` |
| **IOS MALI** (Mali) | `IOS MALI` |

Source: `source/sage-company-folders.txt`

---

## Entity map

| Entity | Sage folder | Purchase journal | Cash journal | General journal |
|--------|-------------|------------------|--------------|---------------|
| **INTEL HRC** (HQ) | `Intel 332021` | **`PURC`** | `CAS2` | `OPDC` |
| **IOS CMR** | `IOS CAM3` | **`ACH`** | — | `OPD` |
| **IOS CIV** | `IOS_CDI_2023` | **`ACH`** | `CAS` | `OD` |
| **IOS BF** | `IOS BUKINA FASO` | **`ACH`** | `CAI` | `OD` |
| **IOS SEN** | `IOS_SEN` | **`ACH`** | `CAIS` | `OD` |
| **IOS RDC** | `IOS_RDC` | **`ACH`** | `CAI` | `OPD` |
| **IOS NIGER** | `IOS NIGER` | **`ACH`** | `CAI` | `OD` |
| **IOS MALI** | `IOS MALI` | **`ACH`** | `CASH` | `OPD` |

**Rule:** Intel HRC = `PURC`; all IOS entities = `ACH` for purchase/AP imports.

---

## Intercompany codes (INTEL HRC master)

From `inter CO - INTEL HRC` sheet:

| Code | Entity |
|------|--------|
| INC01 | IOS CAM |
| INC02 | INTEL HRC CIV |
| INC03 | IOS CIV |
| INC04 | BURKINA |
| INC05 | MALI |
| INC06 | CONGO (RDC) |
| INC07 | SENEGAL |
| INC08 | IOS NIGER |
| INC09 | SCI SPELT |

Used on account **`4612000`** (intercompany current accounts) when splitting shared invoices.

---

## Supplier auxiliary format (varies by entity)

| Entity | Aux format | Example |
|--------|----------|---------|
| INTEL HRC | `FR0001`–`FR9999` | `FR0006` = CAD |
| IOS CMR | `FR0001`– | `FR0003` = SWIRE OS CONSULTANT |
| IOS CIV | `4011001`– | `4011014` = CABINET MARCOS, `FR0040` = FRAXBIT |
| IOS SEN | `FR001`– | `FR001` = AFRICA OUTSOURCING |
| IOS RDC | `401xxx` / named | `401DIVERS`, `401SONA` |
| IOS NIGER | `401111`– | `401114` = DIVERS FOURNISSEURS |
| IOS MALI | `FR0001`– | `FR0005` = ORANGE |
| IOS BF | `FR001`– | `FR001` = Fournisseurs divers |

**App must store:** `entity_id` + `supplier_aux_code` + `gl_account` per supplier.

---

## Key GL accounts (AP-relevant, from samples + charts)

| Account | Name | Use |
|---------|------|-----|
| `40100000` | Suppliers (HQ 8-digit) | Credit on supplier invoice — Orange sample |
| `4011000` | Suppliers — invoices received | Credit on supplier invoice (subsidiaries) |
| `4011xxx` | Supplier sub-accounts (CIV style) | With auxiliary |
| `62811100` | Telecom / communications (HQ) | Debit on goods+VAT invoice |
| `6324400` | Professional / consultancy fees | Debit on service invoice |
| `4472700` | Withholding tax (consultancy) | Debit on WHT line |
| `44520000` | Recoverable VAT (HQ 8-digit) | Debit on VAT line — Orange sample |
| `4451xx` / `445x` | Recoverable VAT (subsidiaries) | When VAT applies |
| `4612000` | Intercompany current accounts | Debit with `INCxx` aux on splits |
| `4761000` | Prepaid / suspense | Accrual pattern (OPD journal) |
| `5121` / bank | Bank | Payment entries |

Full SYSCOHADA reference: `source/revised-syscohada-accounting-plan.pdf`

---

## Chart of accounts digit length

Account numbers are **not uniform** across entities:

| Entity | Example accounts | Digits |
|--------|----------------|--------|
| INTEL HRC | `62811100`, `44520000`, `40100000` | 8 |
| IOS CMR | `1012000`, `6324400` | 7 |
| IOS CIV | `4011001`, `6324400` | 7 |
| IOS BF | `101000`, `244100` | 6 |
| IOS SEN | `10100000`, `12100000` | 8 |
| IOS MALI | `101000`, `244100` | 6 |

Generator must use **entity-specific account lookup** from imported SAGE STRUCTURE data.

---

## Data to load into Supabase (seed)

```
entities          → 8 rows from entity map
entity_journals   → journal codes per entity
entity_accounts  → chart of accounts per entity (from SAGE STRUCTURE)
suppliers         → supplier aux per entity (from supplier auxiliary sheets)
interco_codes    → INC01–INC09 mapping
```

---

## Import file naming (Tina's convention)

From Operation journal:

| Pattern | Example |
|---------|---------|
| `UPLOAD {desc} - {ENTITY}.txt` | `UPLOAD 4761000 - IOS CMR.txt` |
| `UPLOAD CONS CIV - MAY 26.txt` | Consultancy batch |
| `UPLOAD - FRAXBIT -CIV.txt` | Single supplier intercompany |
| `IMPORT PAYROLL …` | Payroll (separate workflow) |

App should auto-name: `UPLOAD {SUPPLIER}-{PERIOD} - {ENTITY}.txt`

---

## Open confirmation

| Item | Status |
|------|--------|
| All 8 Sage folder paths on `g:\Sage\Companies\` | **Received** — `source/sage-company-folders.txt` |
| When to use `PURC` vs `ACH` | **Confirmed** — Intel HRC = `PURC`, all IOS = `ACH` |
| VAT (`445x`) sample | **Received** — `source/sample-sage-export-vat-orange-hq.txt` |
